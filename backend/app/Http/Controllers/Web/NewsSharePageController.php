<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * /actualites/{slug}: the public site's index.html, with the article's own
 * title, description and image for the apps that read them without running
 * JavaScript (WhatsApp, Facebook, search engines). React then shows the page.
 */
class NewsSharePageController extends Controller
{
    /** Tags of index.html replaced by the article's own. */
    private const REPLACED = '~\s*(<title>.*?</title>|<meta\s+(?:name="description"|property="og:(?:type|title|description|image|url)")[^>]*>)~is';

    public function __invoke(string $slug): Response
    {
        $path = config('pepiniere.spa_index');
        $html = is_file($path) ? file_get_contents($path) : false;
        if ($html === false) {
            Log::error('The public site index.html cannot be read: run the build or set SPA_INDEX_PATH.', ['path' => $path]);
            abort(503);
        }

        $news = News::query()->published()->with(['cover', 'ogImage'])->where('slug', $slug)->first();
        // An unknown article still gets the site, which shows its own "not found" page.
        if ($news === null) {
            return response($html, 404)->header('Content-Type', 'text/html; charset=UTF-8');
        }

        return response($this->withArticleTags($html, $news))->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function withArticleTags(string $html, News $news): string
    {
        $title = $news->seo_title_fr ?: $news->title_fr;
        $description = Str::limit(trim(preg_replace('/\s+/', ' ', $news->seo_description_fr ?: (string) $news->excerpt_fr)), 300);
        $image = ($news->ogImage ?? $news->cover)?->url('og');
        $url = config('pepiniere.frontend_url').'/actualites/'.$news->slug;
        $e = fn (string $value) => htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        $tags = [
            '<title>'.$e($title.' | La Pépinière').'</title>',
            '<meta name="description" content="'.$e($description).'" />',
            '<meta property="og:type" content="article" />',
            '<meta property="og:title" content="'.$e($title).'" />',
            '<meta property="og:description" content="'.$e($description).'" />',
            '<meta property="og:url" content="'.$e($url).'" />',
        ];
        if ($image !== null) {
            $tags[] = '<meta property="og:image" content="'.$e($image).'" />';
            $tags[] = '<meta property="og:image:width" content="1200" />';
            $tags[] = '<meta property="og:image:height" content="630" />';
            $tags[] = '<meta name="twitter:card" content="summary_large_image" />';
        }

        $html = preg_replace(self::REPLACED, '', $html);

        return preg_replace('~</head>~i', '    '.implode("\n    ", $tags)."\n  </head>", $html, 1);
    }
}
