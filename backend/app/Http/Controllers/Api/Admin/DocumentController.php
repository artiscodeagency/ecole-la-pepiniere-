<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DocumentType;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminDocumentResource;
use App\Models\Document;
use App\Services\DocumentStorage;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Throwable;

/** PDF documents shown on the public site: internal rules, school calendar... */
class DocumentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $trashed = $request->boolean('trashed');
        if ($trashed) {
            Gate::authorize('restore', new Document);
        }

        $documents = Document::query()
            ->with('media')
            ->when($trashed, fn ($query) => $query->onlyTrashed())
            ->latest()
            ->get();

        return AdminDocumentResource::collection($documents);
    }

    public function store(Request $request, DocumentStorage $storage): JsonResponse
    {
        $data = $this->validated($request, fileRequired: true);

        $media = $storage->store($request->file('file'), 'file', $request->user());
        try {
            $document = Document::create([...$data, 'media_id' => $media->id]);
        } catch (Throwable $e) {
            // No file left behind without its document.
            $storage->delete($media);

            throw $e;
        }
        ActivityLogger::record('documents.created', $document, ['type' => $document->type->value]);

        return AdminDocumentResource::make($document->load('media'))->response()->setStatusCode(201);
    }

    /** Sent as multipart (POST with _method=PUT) when the file is replaced. */
    public function update(Request $request, Document $document, DocumentStorage $storage): AdminDocumentResource
    {
        $data = $this->validated($request, fileRequired: false);
        $previous = null;
        $replacement = null;

        if ($request->hasFile('file')) {
            $previous = $document->media;
            $replacement = $storage->store($request->file('file'), 'file', $request->user());
            $data['media_id'] = $replacement->id;
        }
        try {
            $document->fill($data)->save();
        } catch (Throwable $e) {
            if ($replacement !== null) {
                $storage->delete($replacement);
            }

            throw $e;
        }

        // The old file goes once nothing points to it any more.
        if ($previous !== null) {
            $storage->delete($previous);
        }

        $changed = array_keys(collect($document->getChanges())->except('updated_at')->all());
        if ($changed !== []) {
            ActivityLogger::record('documents.updated', $document, ['fields' => $changed]);
        }

        return AdminDocumentResource::make($document->load('media'));
    }

    /** Removed from the site and kept, so the director can restore it. */
    public function destroy(Document $document): Response
    {
        Gate::authorize('delete', $document);

        $document->delete();
        ActivityLogger::record('documents.deleted', $document);

        return response()->noContent();
    }

    public function restore(Document $document): AdminDocumentResource
    {
        Gate::authorize('restore', $document);

        $document->restore();
        ActivityLogger::record('documents.restored', $document);

        return AdminDocumentResource::make($document->load('media'));
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, bool $fileRequired): array
    {
        $data = $request->validate([
            'title_fr' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'description_fr' => ['nullable', 'string', 'max:1000'],
            'description_en' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', Rule::enum(DocumentType::class)],
            'is_public' => ['required', 'boolean'],
            'file' => DocumentStorage::rules($fileRequired),
        ], DocumentStorage::messages('file'), [
            'title_fr' => 'titre',
            'title_en' => 'titre en anglais',
            'description_fr' => 'description',
            'description_en' => 'description en anglais',
            'type' => 'type de document',
        ]);
        unset($data['file']);

        return $data;
    }
}
