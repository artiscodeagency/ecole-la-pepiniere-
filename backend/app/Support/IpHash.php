<?php

namespace App\Support;

/** Keyed hash of a visitor IP: lets staff spot repeated abuse without storing the IP itself. */
final class IpHash
{
    public static function of(?string $ip): ?string
    {
        return $ip === null ? null : hash_hmac('sha256', $ip, (string) config('app.key'));
    }
}
