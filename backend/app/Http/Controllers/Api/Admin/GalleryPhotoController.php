<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminGalleryPhotoResource;
use App\Models\GalleryCategory;
use App\Models\GalleryPhoto;
use App\Services\ImageProcessor;
use App\Support\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class GalleryPhotoController extends Controller
{
    private const RELATIONS = ['media', 'uploader'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'category' => ['nullable', 'integer'],
            'visibility' => ['nullable', 'in:visible,hidden'],
            'trashed' => ['nullable', 'boolean'],
        ]);
        if ($request->boolean('trashed')) {
            Gate::authorize('restore', new GalleryPhoto);
        }

        $photos = GalleryPhoto::query()
            ->with(self::RELATIONS)
            ->when($request->boolean('trashed'), fn (Builder $query) => $query->onlyTrashed())
            ->when($request->filled('category'), fn (Builder $query) => $query->where('category_id', $request->integer('category')))
            ->when($request->input('visibility') === 'visible', fn (Builder $query) => $query->where('is_visible', true))
            ->when($request->input('visibility') === 'hidden', fn (Builder $query) => $query->where('is_visible', false))
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate(48)
            ->withQueryString();

        return AdminGalleryPhotoResource::collection($photos);
    }

    /** Uploads one photo into an album; it is added at the end of the album. */
    public function store(Request $request, ImageProcessor $images): JsonResponse
    {
        $data = $request->validate([
            'file' => ImageProcessor::rules(),
            'category_id' => ['required', 'integer', Rule::exists('gallery_categories', 'id')],
            'caption_fr' => ['nullable', 'string', 'max:255'],
            'caption_en' => ['nullable', 'string', 'max:255'],
            'alt_fr' => ['nullable', 'string', 'max:255'],
            'alt_en' => ['nullable', 'string', 'max:255'],
        ], ImageProcessor::messages('file'), ['category_id' => 'album']);

        $category = GalleryCategory::query()->findOrFail($data['category_id']);
        $media = $images->storeUpload($request->file('file'), 'file', $request->user());

        $photo = GalleryPhoto::create([
            'media_id' => $media->id,
            'category_id' => $category->id,
            'caption_fr' => $data['caption_fr'] ?? null,
            'caption_en' => $data['caption_en'] ?? null,
            // A neutral description until staff write a better one; never an invented one.
            'alt_fr' => $data['alt_fr'] ?? "Photo – {$category->name_fr}",
            'alt_en' => $data['alt_en'] ?? ($category->name_en ? "Photo – {$category->name_en}" : null),
            'sort_order' => (int) GalleryPhoto::query()->where('category_id', $category->id)->max('sort_order') + 1,
            'is_visible' => true,
            'uploaded_by' => $request->user()->id,
        ]);
        ActivityLogger::record('gallery.photo_added', $photo, ['album' => $category->name_fr]);

        return AdminGalleryPhotoResource::make($photo->load(self::RELATIONS))->response()->setStatusCode(201);
    }

    public function update(Request $request, GalleryPhoto $galleryPhoto): AdminGalleryPhotoResource
    {
        $data = $request->validate([
            'caption_fr' => ['sometimes', 'nullable', 'string', 'max:255'],
            'caption_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'alt_fr' => ['sometimes', 'required', 'string', 'max:255'],
            'alt_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_visible' => ['sometimes', 'boolean'],
            'category_id' => ['sometimes', 'integer', Rule::exists('gallery_categories', 'id')],
        ], [], ['alt_fr' => 'description (français)', 'category_id' => 'album']);

        $movesAlbum = isset($data['category_id']) && $data['category_id'] !== $galleryPhoto->category_id;
        DB::transaction(function () use ($galleryPhoto, $data, $movesAlbum) {
            if ($movesAlbum) {
                $this->forgetAsCover($galleryPhoto);
                $data['sort_order'] = (int) GalleryPhoto::query()->where('category_id', $data['category_id'])->max('sort_order') + 1;
            }
            $galleryPhoto->fill($data)->save();
        });

        $changed = array_keys(collect($galleryPhoto->getChanges())->except('updated_at')->all());
        if ($changed !== []) {
            ActivityLogger::record('gallery.photo_updated', $galleryPhoto, ['fields' => $changed]);
        }

        return AdminGalleryPhotoResource::make($galleryPhoto->load(self::RELATIONS));
    }

    /** New order of an album's photos: the ids from first to last. */
    public function order(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'category_id' => ['required', 'integer', Rule::exists('gallery_categories', 'id')],
            'ids' => ['required', 'array'],
            'ids.*' => [
                'integer', 'distinct',
                Rule::exists('gallery_photos', 'id')->where('category_id', $request->integer('category_id'))->whereNull('deleted_at'),
            ],
        ], ['ids.*.exists' => 'Une des photos ne fait pas partie de cet album.']);

        DB::transaction(function () use ($data) {
            foreach ($data['ids'] as $index => $id) {
                GalleryPhoto::query()->whereKey($id)->update(['sort_order' => $index + 1]);
            }
        });

        return AdminGalleryPhotoResource::collection(
            GalleryPhoto::query()->with(self::RELATIONS)->whereIn('id', $data['ids'])->orderBy('sort_order')->get(),
        );
    }

    /**
     * Moves a photo one place before or after its neighbour. The whole album
     * is renumbered, so this works whatever page of the list is shown.
     */
    public function move(Request $request, GalleryPhoto $galleryPhoto): AdminGalleryPhotoResource
    {
        $direction = $request->validate(['direction' => ['required', 'in:before,after']])['direction'];

        DB::transaction(function () use ($galleryPhoto, $direction) {
            $ids = GalleryPhoto::query()
                ->where('category_id', $galleryPhoto->category_id)
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->lockForUpdate()
                ->pluck('id')
                ->all();
            $from = array_search($galleryPhoto->id, $ids, true);
            $to = $direction === 'before' ? $from - 1 : $from + 1;
            if (! isset($ids[$to])) {
                return;
            }

            [$ids[$from], $ids[$to]] = [$ids[$to], $ids[$from]];
            foreach ($ids as $index => $id) {
                GalleryPhoto::query()->whereKey($id)->update(['sort_order' => $index + 1]);
            }
        });

        return AdminGalleryPhotoResource::make($galleryPhoto->refresh()->load(self::RELATIONS));
    }

    /** Moves the photo to the bin; the director can restore it. */
    public function destroy(GalleryPhoto $galleryPhoto): Response
    {
        Gate::authorize('delete', $galleryPhoto);

        $this->forgetAsCover($galleryPhoto);
        $galleryPhoto->delete();
        ActivityLogger::record('gallery.photo_deleted', $galleryPhoto);

        return response()->noContent();
    }

    public function restore(GalleryPhoto $galleryPhoto): AdminGalleryPhotoResource
    {
        Gate::authorize('restore', $galleryPhoto);

        $galleryPhoto->restore();
        ActivityLogger::record('gallery.photo_restored', $galleryPhoto);

        return AdminGalleryPhotoResource::make($galleryPhoto->load(self::RELATIONS));
    }

    /** An album never keeps as cover a photo that left it. */
    private function forgetAsCover(GalleryPhoto $photo): void
    {
        GalleryCategory::query()
            ->whereKey($photo->category_id)
            ->where('cover_media_id', $photo->media_id)
            ->update(['cover_media_id' => null]);
    }
}
