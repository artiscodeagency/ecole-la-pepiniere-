<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveEventRequest;
use App\Http\Resources\Admin\AdminEventResource;
use App\Models\SchoolEvent;
use App\Support\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class EventController extends Controller
{
    private const RELATIONS = ['section', 'category', 'image', 'author'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', 'in:upcoming,past,draft,cancelled,archived,trashed'],
            'section' => ['nullable', 'string', 'max:100'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);
        $status = $request->input('status');
        if ($status === 'trashed') {
            Gate::authorize('restore', new SchoolEvent);
        }
        $published = fn (Builder $query) => $query->where('status', EventStatus::Published);

        $events = SchoolEvent::query()
            ->with(self::RELATIONS)
            ->when($status === 'trashed', fn (Builder $query) => $query->onlyTrashed())
            ->when($status === 'upcoming', fn (Builder $query) => $published($query)->upcoming())
            ->when($status === 'past', fn (Builder $query) => $published($query)->past())
            ->when(in_array($status, ['draft', 'cancelled', 'archived'], true), fn (Builder $query) => $query->where('status', $status))
            ->when($request->input('section') === 'ecole', fn (Builder $query) => $query->whereNull('section_id'))
            ->when($request->filled('section') && $request->input('section') !== 'ecole', fn (Builder $query) => $query
                ->whereHas('section', fn (Builder $query) => $query->where('slug', $request->string('section'))))
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $term = '%'.str_replace(['%', '_'], ['\%', '\_'], $request->string('q')->trim()).'%';
                $query->where(fn (Builder $query) => $query->where('title_fr', 'like', $term)->orWhere('title_en', 'like', $term));
            })
            // The next event first for "upcoming", the most recent first otherwise.
            ->orderBy('event_date', $status === 'upcoming' ? 'asc' : 'desc')
            ->orderBy('start_time')
            ->paginate(15)
            ->withQueryString();

        return AdminEventResource::collection($events);
    }

    public function show(SchoolEvent $event): AdminEventResource
    {
        return AdminEventResource::make($event->load(self::RELATIONS));
    }

    public function store(SaveEventRequest $request): JsonResponse
    {
        $event = new SchoolEvent($request->eventData());
        $event->author()->associate($request->user());
        $event->save();

        ActivityLogger::record('events.created', $event, ['title' => $event->title_fr, 'status' => $event->status->value]);

        return AdminEventResource::make($event->load(self::RELATIONS))->response()->setStatusCode(201);
    }

    public function update(SaveEventRequest $request, SchoolEvent $event): AdminEventResource
    {
        $event->fill($request->eventData())->save();

        $changed = array_keys(collect($event->getChanges())->except('updated_at')->all());
        if ($changed !== []) {
            ActivityLogger::record('events.updated', $event, ['fields' => $changed, 'status' => $event->status->value]);
        }

        return AdminEventResource::make($event->load(self::RELATIONS));
    }

    public function destroy(SchoolEvent $event): Response
    {
        Gate::authorize('delete', $event);

        $event->delete();
        ActivityLogger::record('events.deleted', $event, ['title' => $event->title_fr]);

        return response()->noContent();
    }

    public function restore(SchoolEvent $event): AdminEventResource
    {
        Gate::authorize('restore', $event);

        $event->restore();
        ActivityLogger::record('events.restored', $event, ['title' => $event->title_fr]);

        return AdminEventResource::make($event->load(self::RELATIONS));
    }
}
