<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DocumentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $documents = Document::query()
            ->where('is_public', true)
            ->with('media')
            ->orderBy('sort_order')
            ->get();

        return DocumentResource::collection($documents);
    }
}
