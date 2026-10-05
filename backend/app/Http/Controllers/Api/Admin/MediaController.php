<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Services\ImageProcessor;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    /** Uploads an image; the stored versions are returned to be attached to a content. */
    public function store(Request $request, ImageProcessor $images): JsonResponse
    {
        $request->validate([
            'file' => ImageProcessor::rules(),
            'alt_fr' => ['nullable', 'string', 'max:255'],
            'alt_en' => ['nullable', 'string', 'max:255'],
        ], ImageProcessor::messages('file'));

        $media = $images->storeUpload($request->file('file'), 'file', $request->user(), $request->input('alt_fr'), $request->input('alt_en'));
        ActivityLogger::record('media.uploaded', $media, ['original_name' => $media->original_name]);

        return MediaResource::make($media)->response()->setStatusCode(201);
    }

    /** Updates the description read by screen readers. */
    public function update(Request $request, Media $media): MediaResource
    {
        $data = $request->validate([
            'alt_fr' => ['nullable', 'string', 'max:255'],
            'alt_en' => ['nullable', 'string', 'max:255'],
        ]);

        $media->fill($data)->save();

        return MediaResource::make($media);
    }
}
