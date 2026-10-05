<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Section;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** The school sections (maternelle, primaire francophone, primaire anglophone). */
class SectionController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        return CategoryResource::collection(Section::query()->orderBy('sort_order')->get());
    }
}
