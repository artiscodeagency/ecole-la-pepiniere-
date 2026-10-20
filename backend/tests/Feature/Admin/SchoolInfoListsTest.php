<?php

namespace Tests\Feature\Admin;

use App\Models\AdmissionFee;
use App\Models\SchoolFee;
use App\Models\Section;
use App\Models\Setting;
use App\Models\TransportTariff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolInfoListsTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_the_director_edits_the_lists(): void
    {
        $this->getJson('/api/admin/school-info/lists')->assertUnauthorized();

        $this->actingAs(User::factory()->create());
        $this->getJson('/api/admin/school-info/lists')->assertForbidden();
        $this->putJson('/api/admin/school-info/lists/transport-tariffs', ['items' => [['amount' => 7000]]])->assertForbidden();
        $this->assertDatabaseCount('transport_tariffs', 0);
    }

    public function test_an_unknown_list_does_not_exist(): void
    {
        $this->actingAs(User::factory()->director()->create())
            ->putJson('/api/admin/school-info/lists/users', ['items' => []])
            ->assertNotFound();
    }

    public function test_the_school_fees_are_saved_in_order_with_their_due_dates(): void
    {
        $section = Section::query()->create(['slug' => 'maternelle', 'name_fr' => 'Maternelle', 'sort_order' => 1]);

        $this->actingAs(User::factory()->director()->create())
            ->putJson('/api/admin/school-info/lists/school-fees', [
                'items' => [
                    ['label_fr' => 'Maternelle', 'section_id' => $section->id, 'first_installment' => 50000, 'second_installment' => 40000],
                    ['label_fr' => 'Pré-maternelle', 'section_id' => $section->id, 'first_installment' => 70000, 'second_installment' => 40000],
                ],
                'due_dates' => ['first' => '2026-09-04', 'second' => '2026-11-01'],
            ])
            ->assertOk()
            ->assertJsonPath('data.items.1.label_fr', 'Pré-maternelle')
            ->assertJsonPath('data.due_dates', ['first' => '2026-09-04', 'second' => '2026-11-01']);

        // The public site gets the total computed from the installments.
        $this->getJson('/api/public/school-info')
            ->assertJsonPath('data.school_fees.1.total', 110000)
            ->assertJsonPath('data.school_fees.1.section', 'maternelle');
        $this->assertSame('2026-09-04', Setting::get('fees.first_due_date'));
    }

    public function test_rows_are_kept_by_id_reordered_and_removed(): void
    {
        $first = TransportTariff::query()->create(['amount' => 7000, 'sort_order' => 1]);
        $second = TransportTariff::query()->create(['amount' => 9000, 'sort_order' => 2]);
        TransportTariff::query()->create(['amount' => 12000, 'sort_order' => 3]);

        $this->actingAs(User::factory()->director()->create())
            ->putJson('/api/admin/school-info/lists/transport-tariffs', ['items' => [
                ['id' => $second->id, 'amount' => 9500],
                ['id' => $first->id, 'amount' => 7000, 'label_fr' => 'Moins de 2 km'],
            ]])
            ->assertOk()
            ->assertJsonCount(2, 'data.items')
            ->assertJsonPath('data.items.0.id', $second->id)
            ->assertJsonPath('data.items.0.amount', 9500)
            ->assertJsonPath('data.items.1.label_fr', 'Moins de 2 km');

        $this->assertDatabaseCount('transport_tariffs', 2);
    }

    public function test_a_registration_item_is_an_amount_or_a_text(): void
    {
        $this->actingAs(User::factory()->director()->create());

        $this->putJson('/api/admin/school-info/lists/admission-fees', ['items' => [
            ['label_fr' => 'Inscription', 'amount' => 10000],
            ['label_fr' => 'Papier hygiénique', 'amount_text_fr' => 'Deux (02) rouleaux'],
        ]])->assertOk();
        $this->assertSame(2, AdmissionFee::query()->count());

        $this->putJson('/api/admin/school-info/lists/admission-fees', ['items' => [
            ['label_fr' => 'Rien'],
            ['label_fr' => 'Les deux', 'amount' => 1500, 'amount_text_fr' => 'Un carnet'],
        ]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.amount', 'items.1.amount']);
        $this->assertSame(2, AdmissionFee::query()->count());
    }

    public function test_the_values_are_checked_and_nothing_is_saved_on_error(): void
    {
        SchoolFee::query()->create(['label_fr' => 'Primaire', 'first_installment' => 50000, 'second_installment' => 30000]);

        $this->actingAs(User::factory()->director()->create())
            ->putJson('/api/admin/school-info/lists/school-fees', [
                'items' => [['label_fr' => '', 'first_installment' => -5, 'second_installment' => 999999999, 'section_id' => 999]],
                'due_dates' => ['first' => '2026-11-01', 'second' => '2026-09-04'],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'items.0.label_fr', 'items.0.first_installment', 'items.0.second_installment', 'items.0.section_id', 'due_dates.second',
            ]);

        $this->assertSame('Primaire', SchoolFee::query()->sole()->label_fr);
    }
}
