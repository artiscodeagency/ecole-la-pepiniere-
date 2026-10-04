<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryCategoryResource;
use App\Http\Resources\GalleryPhotoResource;
use App\Models\GalleryCategory;
use App\Models\GalleryPhoto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GalleryController extends Controller
{
    /** Visible categories that contain at least one visible photo. */
    public function categories(): AnonymousResourceCollection
    {
        $visiblePhotos = fn (Builder|HasMany $query) => $query->where('is_visible', true);

        $categories = GalleryCategory::query()
            ->where('is_visible', true)
            ->whereHas('photos', $visiblePhotos)
            ->withCount(['photos' => $visiblePhotos])
            ->with([
                'cover',
                'photos' => fn (HasMany $query) => $visiblePhotos($query)->orderBy('sort_order')->limit(1)->with('media'),
            ])
            ->orderBy('sort_order')
            ->get();

        return GalleryCategoryResource::collection($categories);
    }

    public function photos(Request $request): AnonymousResourceCollection
    {
        $request->validate(['category' => ['nullable', 'string', 'max:100']]);

        $photos = GalleryPhoto::query()
            ->visible()
            ->with(['media', 'category'])
            ->when($request->filled('category'), fn (Builder $query) => $query
                ->whereHas('category', fn (Builder $query) => $query->where('slug', $request->string('category'))))
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate(24)
            ->withQueryString();

        return GalleryPhotoResource::collection($photos);
    }
}
