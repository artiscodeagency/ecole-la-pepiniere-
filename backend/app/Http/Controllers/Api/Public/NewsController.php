<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\NewsDetailResource;
use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Models\NewsCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NewsController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'category' => ['nullable', 'string', 'max:100'],
            'featured' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $news = News::query()
            ->published()
            ->with(['category', 'cover'])
            ->when($request->filled('category'), fn (Builder $query) => $query
                ->whereHas('category', fn (Builder $query) => $query->where('slug', $request->string('category'))))
            ->when($request->boolean('featured'), fn (Builder $query) => $query->where('is_featured', true))
            ->orderByDesc('published_at')
            ->paginate($request->integer('per_page', 9))
            ->withQueryString();

        return NewsResource::collection($news);
    }

    public function show(string $slug): NewsDetailResource
    {
        $news = News::query()
            ->published()
            ->with(['category', 'cover', 'ogImage'])
            ->where('slug', $slug)
            ->firstOrFail();

        return NewsDetailResource::make($news);
    }

    public function categories(): AnonymousResourceCollection
    {
        return CategoryResource::collection(NewsCategory::query()->orderBy('sort_order')->get());
    }
}
