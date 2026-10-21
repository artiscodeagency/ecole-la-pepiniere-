<?php

namespace Tests\Feature\Admin;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolSettingsTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, mixed> */
    private function payload(array $overrides = []): array
    {
        return array_replace_recursive([
            'contact' => [
                'phones' => ['694 090 919', '678 010 480'],
                'whatsapp' => ['694 090 919'],
                'whatsapp_primary' => '694 090 919',
                'email' => 'gsbpepiniere92@gmail.com',
            ],
            'location' => [
                'address_fr' => 'BP 319, Bertoua Mokolo I (Sembé)',
                'address_en' => null,
                'city' => 'Bertoua',
            ],
            'hours' => [
                'kindergarten' => ['mon_thu' => ['start' => '07:30', 'end' => '13:30'], 'friday' => ['start' => '07:30', 'end' => '12:00']],
                'primary' => ['mon_thu' => ['start' => null, 'end' => null], 'friday' => ['start' => null, 'end' => null]],
            ],
            'social' => ['facebook' => null, 'instagram' => null],
            'admissions' => ['academic_year' => '2026-2027'],
        ], $overrides);
    }

    public function test_only_the_director_manages_the_school_information(): void
    {
        $this->getJson('/api/admin/school-info/settings')->assertUnauthorized();

        $this->actingAs(User::factory()->create())->getJson('/api/admin/school-info/settings')->assertForbidden();
        $this->putJson('/api/admin/school-info/settings', $this->payload())->assertForbidden();
        $this->assertDatabaseCount('settings', 0);
    }

    public function test_an_empty_school_starts_with_empty_values(): void
    {
        $this->actingAs(User::factory()->director()->create())
            ->getJson('/api/admin/school-info/settings')
            ->assertOk()
            ->assertJsonPath('data.values.contact.email', null)
            ->assertJsonPath('data.values.hours.primary', null)
            ->assertJsonPath('data.updated_at', null);
    }

    public function test_the_director_saves_the_values_and_the_site_reads_them(): void
    {
        $director = User::factory()->director()->create(['name' => 'Directeur']);

        $this->actingAs($director)
            ->putJson('/api/admin/school-info/settings', $this->payload())
            ->assertOk()
            ->assertJsonPath('data.values.contact.phones', ['694 090 919', '678 010 480'])
            ->assertJsonPath('data.values.hours.kindergarten.friday', ['start' => '07:30', 'end' => '12:00'])
            // A section without hours is not stored.
            ->assertJsonPath('data.values.hours.primary', null)
            ->assertJsonPath('data.updated_by', 'Directeur');

        $this->assertNull(Setting::query()->where('key', 'location.address_en')->first());

        $settings = $this->getJson('/api/public/school-info')->json('data.settings');
        $this->assertSame('gsbpepiniere92@gmail.com', $settings['contact.email']);
        $this->assertSame('2026-2027', $settings['admissions.academic_year']);
    }

    public function test_emptying_a_field_removes_it_and_saving_twice_changes_nothing(): void
    {
        $this->actingAs(User::factory()->director()->create());
        $this->putJson('/api/admin/school-info/settings', $this->payload())->assertOk();
        $logs = \App\Models\ActivityLog::query()->count();

        $this->putJson('/api/admin/school-info/settings', $this->payload())->assertOk();
        $this->assertSame($logs, \App\Models\ActivityLog::query()->count());

        $this->putJson('/api/admin/school-info/settings', $this->payload(['contact' => ['email' => '']]))->assertOk();
        $this->assertNull(Setting::get('contact.email'));
    }

    public function test_the_values_are_checked(): void
    {
        $this->actingAs(User::factory()->director()->create());

        $response = $this->putJson('/api/admin/school-info/settings', $this->payload([
            'contact' => ['phones' => ['abc'], 'whatsapp_primary' => '600 000 000', 'email' => 'pas-un-email'],
            'hours' => ['kindergarten' => ['friday' => ['start' => '12:00', 'end' => '07:30']], 'primary' => ['mon_thu' => ['start' => '07:30']]],
            'social' => ['facebook' => 'http://facebook.com/ecole'],
            'admissions' => ['academic_year' => '2026-2028'],
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'contact.phones.0', 'contact.whatsapp_primary', 'contact.email',
                'hours.kindergarten.friday.end', 'hours.primary.mon_thu.end',
                'social.facebook', 'admissions.academic_year',
            ]);
        $this->assertSame('L\'heure de sortie doit être après l\'heure d\'arrivée.', $response->json('errors')['hours.kindergarten.friday.end'][0]);

        $this->assertDatabaseCount('settings', 0);
    }
}
