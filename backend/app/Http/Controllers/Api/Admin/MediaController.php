<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Services\ImageProcessor;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Exceptions\DecoderException;

class MediaController extends Controller
{
    /** Uploads an image; the stored versions are returned to be attached to a content. */
    public function store(Request $request, ImageProcessor $images): JsonResponse
    {
        $request->validate([
            // The MIME type is read from the file content, not from its name.
            'file' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp', 'max:15360'],
            'alt_fr' => ['nullable', 'string', 'max:255'],
            'alt_en' => ['nullable', 'string', 'max:255'],
        ], [
            'file.mimetypes' => 'Format non pris en charge : envoyez une photo JPEG, PNG ou WebP.',
            'file.max' => 'Cette photo dépasse 15 Mo.',
        ]);

        $file = $request->file('file');
        $size = @getimagesize($file->getRealPath());
        if ($size === false) {
            throw ValidationException::withMessages(['file' => "Cette image n'a pas pu être lue."]);
        }
        if ($size[0] * $size[1] > ImageProcessor::MAX_PIXELS) {
            throw ValidationException::withMessages(['file' => 'Cette image est trop grande (40 millions de pixels au maximum).']);
        }

        try {
            $media = $images->store($file, $request->user(), $request->input('alt_fr'), $request->input('alt_en'));
        } catch (DecoderException) {
            throw ValidationException::withMessages(['file' => "Cette image n'a pas pu être lue."]);
        }

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
