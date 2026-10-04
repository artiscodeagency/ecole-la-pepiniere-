<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Requests come from the admin on the same domain, as in production,
        // so Sanctum starts a session for them.
        $this->withHeaders(['Referer' => 'http://localhost/admin']);
    }
}
