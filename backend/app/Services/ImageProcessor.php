<?php

namespace App\Services;

use App\Enums\MediaKind;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\Exceptions\DecoderException;
use Intervention\Image\ImageManager;
use Throwable;

/**
 * Turns an uploaded photo (often straight from a phone) into light versions
 * for the site. The photo is decoded and re-encoded: its orientation is
 * applied and its metadata, including GPS position, is removed. The original
 * file is not kept.
 */
final class ImageProcessor
{
    /** Longest side of each stored WebP version, in pixels. */
    public const VARIANTS = ['thumb' => 400, 'medium' => 1024, 'large' => 1920];

    /** Share image for WhatsApp and Facebook. */
    private const OG_WIDTH = 1200;

    private const OG_HEIGHT = 630;

    /** Larger images are refused before decoding, to protect the server memory. */
    public const MAX_PIXELS = 40_000_000;

    /** A decoded photo takes about 4 bytes per pixel: 160 MB at the maximum size. */
    private const MEMORY_LIMIT = '512M';

    /**
     * Validation rules of an uploaded photo. The type is read from the file
     * content, not from its name.
     *
     * @return list<string>
     */
    public static function rules(): array
    {
        return ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp', 'max:15360'];
    }

    /**
     * @return array<string, string>
     */
    public static function messages(string $field): array
    {
        return [
            "{$field}.mimetypes" => 'Format non pris en charge : envoyez une photo JPEG, PNG ou WebP.',
            "{$field}.max" => 'Cette photo dépasse 15 Mo.',
        ];
    }

    /**
     * Stores a validated upload. An image that cannot be decoded, or that is
     * too large to decode safely, becomes a validation error on $field.
     *
     * @throws ValidationException
     */
    public function storeUpload(UploadedFile $file, string $field, ?User $uploader, ?string $altFr = null, ?string $altEn = null): Media
    {
        $size = @getimagesize($file->getRealPath());
        if ($size === false) {
            throw ValidationException::withMessages([$field => "Cette image n'a pas pu être lue."]);
        }
        if ($size[0] * $size[1] > self::MAX_PIXELS) {
            throw ValidationException::withMessages([$field => 'Cette image est trop grande (40 millions de pixels au maximum).']);
        }

        try {
            return $this->store($file, $uploader, $altFr, $altEn);
        } catch (DecoderException) {
            throw ValidationException::withMessages([$field => "Cette image n'a pas pu être lue."]);
        }
    }

    public function store(UploadedFile $file, ?User $uploader, ?string $altFr = null, ?string $altEn = null): Media
    {
        $this->ensureEnoughMemory();

        $manager = new ImageManager(GdDriver::class, autoOrientation: true, decodeAnimation: false, strip: true);
        // Reduced in place first, so the full-size photo leaves memory before any copy.
        $large = $manager->decodePath($file->getRealPath())->scaleDown(self::VARIANTS['large'], self::VARIANTS['large']);

        $disk = Storage::disk('media');
        $uuid = (string) Str::uuid();
        $directory = now()->format('Y/m');
        $variants = [];

        try {
            foreach (self::VARIANTS as $name => $size) {
                $version = $name === 'large' ? $large : (clone $large)->scaleDown($size, $size);
                $variants[$name] = "{$directory}/{$uuid}-{$size}.webp";
                $disk->put($variants[$name], (string) $version->encode(new WebpEncoder(quality: 80)));
            }

            $share = (clone $large)->cover(self::OG_WIDTH, self::OG_HEIGHT);
            $variants['og'] = "{$directory}/{$uuid}-og.jpg";
            $disk->put($variants['og'], (string) $share->encode(new JpegEncoder(quality: 82)));
        } catch (Throwable $e) {
            $disk->delete(array_values($variants));

            throw $e;
        }

        return Media::create([
            'uuid' => $uuid,
            'kind' => MediaKind::Image,
            'path' => $variants['large'],
            'variants' => $variants,
            'original_name' => Str::limit(basename($file->getClientOriginalName()), 250, ''),
            'mime_type' => 'image/webp',
            'size_bytes' => $disk->size($variants['large']),
            'width' => $large->width(),
            'height' => $large->height(),
            'alt_fr' => $altFr,
            'alt_en' => $altEn,
            'uploaded_by' => $uploader?->getKey(),
        ]);
    }

    /** Raises the PHP memory limit for this request only, never lowers it. */
    private function ensureEnoughMemory(): void
    {
        $current = ini_parse_quantity((string) ini_get('memory_limit'));
        if ($current !== -1 && $current < ini_parse_quantity(self::MEMORY_LIMIT)) {
            ini_set('memory_limit', self::MEMORY_LIMIT);
        }
    }
}
