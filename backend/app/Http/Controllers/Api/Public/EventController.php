<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\SchoolEvent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EventController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'period' => ['nullable', 'in:upcoming,past'],
            'section' => ['nullable', 'string', 'max:100'],
        ]);
        $past = $request->input('period') === 'past';

        $events = SchoolEvent::query()
            ->publiclyVisible()
            ->when($past, fn (Builder $query) => $query->past(), fn (Builder $query) => $query->upcoming())
            ->with(['section', 'category', 'image'])
            ->when($request->filled('section'), fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->whereNull('section_id')
                ->orWhereHas('section', fn (Builder $query) => $query->where('slug', $request->string('section')))))
            ->orderBy('event_date', $past ? 'desc' : 'asc')
            ->orderBy('start_time')
            ->paginate(12)
            ->withQueryString();

        return EventResource::collection($events);
    }
}
