<?php

namespace Tests\Unit;

use App\Models\SchoolFee;
use PHPUnit\Framework\TestCase;

class SchoolFeeTest extends TestCase
{
    public function test_the_total_is_the_sum_of_both_installments(): void
    {
        $fee = new SchoolFee(['first_installment' => 70_000, 'second_installment' => 40_000]);

        $this->assertSame(110_000, $fee->total());
    }
}
