<?php

namespace App\Services;

use App\Enums\MediaKind;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * PDF documents (internal rules, school calendar...) kept as they are, on
 * the persistent "media" disk, next to the photos.
 */
final class DocumentStorage
{
    /** 20 MB: a scanned document of a few pages fits. */
    public const MAX_KILOBYTES = 20480;

    /**
     * @return list<string>
     */
    public static function rules(bool $required = true): array
    {
        return [$required ? 'required' : 'nullable', 'file', 'mimetypes:application/pdf', 'max:'.self::MAX_KILOBYTES];
    }

    /**
     * @return array<string, string>
     */
    public static function messages(string $field): array
    {
        return [
            "{$field}.required" => 'Choisissez le fichier PDF du document.',
            "{$field}.mimetypes" => 'Format non pris en charge : envoyez un fichier PDF.',
            "{$field}.max" => 'Ce fichier est trop lourd (20 Mo au maximum).',
            "{$field}.uploaded" => 'Le fichier n\'a pas pu être envoyé. Il est peut-être trop lourd (20 Mo au maximum).',
        ];
    }

    /**
     * Stores a validated upload. A file that does not start like a PDF
     * becomes a validation error on $field, whatever its name or type.
     *
     * @throws ValidationException
     */
    public function store(UploadedFile $file, string $field, ?User $uploader): Media
    {
        $handle = fopen($file->getRealPath(), 'rb');
        $header = $handle ? fread($handle, 5) : false;
        if ($handle) {
            fclose($handle);
        }
        if ($header !== '%PDF-') {
            throw ValidationException::withMessages([$field => 'Ce fichier n\'est pas un PDF valide.']);
        }

        $uuid = (string) Str::uuid();
        $directory = now()->format('Y/m');
        $disk = Storage::disk('media');
        $path = $disk->putFileAs($directory, $file, "{$uuid}.pdf");

        return Media::create([
            'uuid' => $uuid,
            'kind' => MediaKind::Document,
            'path' => $path,
            'original_name' => Str::limit(basename($file->getClientOriginalName()), 250, ''),
            'mime_type' => 'application/pdf',
            'size_bytes' => $disk->size($path),
            'uploaded_by' => $uploader?->getKey(),
        ]);
    }

    /** Removes a document file that nothing uses any more. */
    public function delete(Media $media): void
    {
        Storage::disk('media')->delete($media->path);
        $media->delete();
    }
}
