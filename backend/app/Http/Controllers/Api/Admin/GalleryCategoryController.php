<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminGalleryCategoryResource;
use App\Models\GalleryCategory;
use App\Models\GalleryPhoto;
use App\Support\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** Albums of the gallery, seeded with the official categories. */
class GalleryCategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return AdminGalleryCategoryResource::collection($this->albums()->get());
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', GalleryCategory::class);
        $data = $request->validate($this->rules(), [], $this->attributes());

        $category = GalleryCategory::create([
            ...$data,
            'slug' => $this->uniqueSlug($data['name_fr']),
            'sort_order' => (int) GalleryCategory::query()->max('sort_order') + 1,
            'is_visible' => $request->boolean('is_visible', true),
        ]);
        ActivityLogger::record('gallery.album_created', $category, ['name' => $category->name_fr]);

        return AdminGalleryCategoryResource::make($this->albums()->findOrFail($category->id))->response()->setStatusCode(201);
    }

    public function update(Request $request, GalleryCategory $galleryCategory): AdminGalleryCategoryResource
    {
        $data = $request->validate([
            ...array_map(fn (array $rules) => ['sometimes', ...$rules], $this->rules()),
            'is_visible' => ['sometimes', 'boolean'],
            // The cover is one of the album's own photos.
            'cover_media_id' => [
                'sometimes', 'nullable', 'integer',
                Rule::exists('gallery_photos', 'media_id')->where('category_id', $galleryCategory->id)->whereNull('deleted_at'),
            ],
        ], ['cover_media_id.exists' => 'La couverture doit être une photo de cet album.'], $this->attributes());

        $galleryCategory->fill($data)->save();
        $changed = array_keys(collect($galleryCategory->getChanges())->except('updated_at')->all());
        if ($changed !== []) {
            ActivityLogger::record('gallery.album_updated', $galleryCategory, ['fields' => $changed]);
        }

        return AdminGalleryCategoryResource::make($this->albums()->findOrFail($galleryCategory->id));
    }

    /** New order of all albums: the ids from first to last. */
    public function order(Request $request): AnonymousResourceCollection
    {
        $ids = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'distinct', Rule::exists('gallery_categories', 'id')],
        ])['ids'];

        DB::transaction(function () use ($ids) {
            foreach ($ids as $index => $id) {
                GalleryCategory::query()->whereKey($id)->update(['sort_order' => $index + 1]);
            }
        });

        return $this->index();
    }

    public function destroy(GalleryCategory $galleryCategory): Response
    {
        Gate::authorize('delete', $galleryCategory);

        if (GalleryPhoto::withTrashed()->where('category_id', $galleryCategory->id)->exists()) {
            throw ValidationException::withMessages([
                'album' => 'Cet album contient des photos, y compris dans la corbeille : déplacez-les d\'abord, ou masquez l\'album.',
            ]);
        }

        $galleryCategory->delete();
        ActivityLogger::record('gallery.album_deleted', $galleryCategory, ['name' => $galleryCategory->name_fr]);

        return response()->noContent();
    }

    /** Albums with their photo counts (bin excluded) and cover. */
    private function albums(): Builder
    {
        return GalleryCategory::query()
            ->withCount(['photos', 'photos as visible_photos_count' => fn (Builder $query) => $query->where('is_visible', true)])
            ->with('cover')
            ->orderBy('sort_order');
    }

    /**
     * @return array<string, list<mixed>>
     */
    private function rules(): array
    {
        return [
            'name_fr' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function attributes(): array
    {
        return ['name_fr' => 'nom (français)', 'name_en' => 'nom (anglais)', 'cover_media_id' => 'couverture'];
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::limit(Str::slug($name), 200, '') ?: 'album';
        $slug = $base;
        for ($i = 2; GalleryCategory::query()->where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
