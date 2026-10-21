<?php

use Illuminate\Support\Facades\Schedule;

// Run by a cron job on the server: `php artisan schedule:run` every minute.
Schedule::command('pepiniere:prune-media')->dailyAt('03:00')->timezone(config('pepiniere.timezone'));
