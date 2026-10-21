<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AnnouncementController extends Controller
{
    /** Active announcements: pinned first, then urgent, important, information. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['section' => ['nullable', 'string', 'max:100']]);

        $announcements = Announcement::query()
            ->active()
            ->with('section')
            // A section page also shows the announcements for the whole school.
            ->when($request->filled('section'), fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->whereNull('section_id')
                ->orWhereHas('section', fn (Builder $query) => $query->where('slug', $request->string('section')))))
            ->orderByDesc('is_pinned')
            ->orderByRaw("case importance when 'urgent' then 0 when 'important' then 1 else 2 end")
            ->orderByDesc('starts_at')
            ->limit(20)
            ->get();

        return AnnouncementResource::collection($announcements);
    }
}
