<?php

// Front controller for Hostinger: the document root (public_html) holds the
// built React site; Laravel lives outside it, in ../app/current.
//
// app/current is a symlink switched at each deploy. The web PHP processes are
// long-lived (LiteSpeed): their realpath cache and OPcache would keep running
// the previous release behind the unchanged ".../app/current/..." paths. So the
// link is read on every request (readlink() is not cached) and Laravel is
// loaded from the release's own path: a new release takes effect at once.

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$link = __DIR__.'/../app/current';
$target = readlink($link);
if ($target === false) {
    http_response_code(503);
    exit('Service unavailable.');
}
$base = str_starts_with($target, '/') ? $target : dirname($link).'/'.$target;

if (file_exists($maintenance = $base.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $base.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $base.'/bootstrap/app.php';
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
