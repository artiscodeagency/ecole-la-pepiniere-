<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Response;

/**
 * /robots.txt and /sitemap.xml, built from FRONTEND_URL so no domain is
 * hardcoded. The sitemap lists the public pages and every published article.
 */
class SeoFilesController extends Controller
{
    /** Public pages of the React site (src/App.tsx). */
    private const PAGES = ['/', '/notre-ecole', '/maternelle', '/primaire', '/vie-scolaire', '/galerie', '/actualites', '/admissions', '/contact'];

    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /api/',
            '',
            'Sitemap: '.config('pepiniere.frontend_url').'/sitemap.xml',
        ];

        return response(implode("\n", $lines)."\n")->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    public function sitemap(): Response
    {
        $base = config('pepiniere.frontend_url');
        $e = fn (string $value) => htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');

        $urls = array_map(fn (string $path) => '  <url><loc>'.$e($base.($path === '/' ? '/' : $path)).'</loc></url>', self::PAGES);

        News::query()->published()->orderByDesc('published_at')->get(['slug', 'updated_at'])
            ->each(function (News $news) use (&$urls, $base, $e) {
                $urls[] = '  <url><loc>'.$e($base.'/actualites/'.$news->slug).'</loc><lastmod>'.$news->updated_at->toDateString().'</lastmod></url>';
            });

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
            .implode("\n", $urls)."\n"
            .'</urlset>'."\n";

        return response($xml)->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
