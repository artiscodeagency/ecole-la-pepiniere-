<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveNewsRequest;
use App\Http\Resources\Admin\AdminNewsResource;
use App\Models\News;
use App\Support\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class NewsController extends Controller
{
    private const RELATIONS = ['category', 'cover', 'author'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', 'in:draft,published,scheduled,archived,trashed'],
            'category' => ['nullable', 'integer'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);
        $status = $request->input('status');
        if ($status === 'trashed') {
            Gate::authorize('restore', new News);
        }

        $news = News::query()
            ->with(self::RELATIONS)
            ->when($status === 'trashed', fn (Builder $query) => $query->onlyTrashed())
            ->when($status === 'draft', fn (Builder $query) => $query->where('status', ContentStatus::Draft))
            ->when($status === 'archived', fn (Builder $query) => $query->where('status', ContentStatus::Archived))
            ->when($status === 'published', fn (Builder $query) => $query->published())
            ->when($status === 'scheduled', fn (Builder $query) => $query
                ->where('status', ContentStatus::Published)
                ->where('published_at', '>', now()))
            ->when($request->filled('category'), fn (Builder $query) => $query->where('category_id', $request->integer('category')))
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $term = '%'.str_replace(['%', '_'], ['\%', '\_'], $request->string('q')->trim()).'%';
                $query->where(fn (Builder $query) => $query->where('title_fr', 'like', $term)->orWhere('title_en', 'like', $term));
            })
            ->orderByDesc('updated_at')
            ->paginate(15)
            ->withQueryString();

        return AdminNewsResource::collection($news);
    }

    public function show(News $news): AdminNewsResource
    {
        return AdminNewsResource::make($news->load(self::RELATIONS));
    }

    public function store(SaveNewsRequest $request): JsonResponse
    {
        $news = new News($request->newsData());
        $news->slug = $request->filled('slug') ? $request->string('slug')->value() : $this->uniqueSlug($news->title_fr);
        $news->author()->associate($request->user());
        $news->save();

        ActivityLogger::record('news.created', $news, ['title' => $news->title_fr, 'status' => $news->status->value]);

        return AdminNewsResource::make($news->load(self::RELATIONS))->response()->setStatusCode(201);
    }

    public function update(SaveNewsRequest $request, News $news): AdminNewsResource
    {
        $news->fill($request->newsData());

        if ($request->filled('slug') && $request->input('slug') !== $news->slug) {
            if (Gate::denies('changeSlug', $news)) {
                throw ValidationException::withMessages([
                    'slug' => 'Cette actualité a déjà été publiée : seul le Directeur peut changer son adresse.',
                ]);
            }
            $news->slug = $request->string('slug')->value();
        }

        $news->save();

        // Field names only: the texts themselves can be long.
        $changed = array_keys(collect($news->getChanges())->except('updated_at')->all());
        if ($changed !== []) {
            ActivityLogger::record('news.updated', $news, ['fields' => $changed, 'status' => $news->status->value]);
        }

        return AdminNewsResource::make($news->load(self::RELATIONS));
    }

    /** Moves the article to the bin; the director can restore it. */
    public function destroy(News $news): Response
    {
        Gate::authorize('delete', $news);

        $news->delete();
        ActivityLogger::record('news.deleted', $news, ['title' => $news->title_fr]);

        return response()->noContent();
    }

    public function restore(News $news): AdminNewsResource
    {
        Gate::authorize('restore', $news);

        $news->restore();
        ActivityLogger::record('news.restored', $news, ['title' => $news->title_fr]);

        return AdminNewsResource::make($news->load(self::RELATIONS));
    }

    /** "rentree-2026", then "rentree-2026-2"... including deleted articles. */
    private function uniqueSlug(string $title): string
    {
        $base = Str::limit(Str::slug($title), 200, '') ?: 'actualite';
        $slug = $base;
        for ($i = 2; News::withTrashed()->where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
