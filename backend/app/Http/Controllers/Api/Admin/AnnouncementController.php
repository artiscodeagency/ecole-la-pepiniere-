<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveAnnouncementRequest;
use App\Http\Resources\Admin\AdminAnnouncementResource;
use App\Models\Announcement;
use App\Support\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class AnnouncementController extends Controller
{
    private const RELATIONS = ['section', 'author'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', 'in:draft,active,scheduled,expired,archived,trashed'],
            'section' => ['nullable', 'string', 'max:100'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);
        $status = $request->input('status');
        if ($status === 'trashed') {
            Gate::authorize('restore', new Announcement);
        }
        $published = fn (Builder $query) => $query->where('status', ContentStatus::Published);

        $announcements = Announcement::query()
            ->with(self::RELATIONS)
            ->when($status === 'trashed', fn (Builder $query) => $query->onlyTrashed())
            ->when($status === 'draft', fn (Builder $query) => $query->where('status', ContentStatus::Draft))
            ->when($status === 'archived', fn (Builder $query) => $query->where('status', ContentStatus::Archived))
            ->when($status === 'active', fn (Builder $query) => $query->active())
            ->when($status === 'scheduled', fn (Builder $query) => $published($query)->where('starts_at', '>', now()))
            ->when($status === 'expired', fn (Builder $query) => $published($query)->where('ends_at', '<=', now()))
            ->when($request->input('section') === 'ecole', fn (Builder $query) => $query->whereNull('section_id'))
            ->when($request->filled('section') && $request->input('section') !== 'ecole', fn (Builder $query) => $query
                ->whereHas('section', fn (Builder $query) => $query->where('slug', $request->string('section'))))
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $term = '%'.str_replace(['%', '_'], ['\%', '\_'], $request->string('q')->trim()).'%';
                $query->where(fn (Builder $query) => $query->where('title_fr', 'like', $term)->orWhere('title_en', 'like', $term));
            })
            ->orderByDesc('updated_at')
            ->paginate(15)
            ->withQueryString();

        return AdminAnnouncementResource::collection($announcements);
    }

    public function show(Announcement $announcement): AdminAnnouncementResource
    {
        return AdminAnnouncementResource::make($announcement->load(self::RELATIONS));
    }

    public function store(SaveAnnouncementRequest $request): JsonResponse
    {
        $announcement = new Announcement($request->announcementData());
        $announcement->author()->associate($request->user());
        $announcement->save();

        ActivityLogger::record('announcements.created', $announcement, [
            'title' => $announcement->title_fr,
            'status' => $announcement->status->value,
        ]);

        return AdminAnnouncementResource::make($announcement->load(self::RELATIONS))->response()->setStatusCode(201);
    }

    public function update(SaveAnnouncementRequest $request, Announcement $announcement): AdminAnnouncementResource
    {
        $announcement->fill($request->announcementData())->save();

        $changed = array_keys(collect($announcement->getChanges())->except('updated_at')->all());
        if ($changed !== []) {
            ActivityLogger::record('announcements.updated', $announcement, [
                'fields' => $changed,
                'status' => $announcement->status->value,
            ]);
        }

        return AdminAnnouncementResource::make($announcement->load(self::RELATIONS));
    }

    public function destroy(Announcement $announcement): Response
    {
        Gate::authorize('delete', $announcement);

        $announcement->delete();
        ActivityLogger::record('announcements.deleted', $announcement, ['title' => $announcement->title_fr]);

        return response()->noContent();
    }

    public function restore(Announcement $announcement): AdminAnnouncementResource
    {
        Gate::authorize('restore', $announcement);

        $announcement->restore();
        ActivityLogger::record('announcements.restored', $announcement, ['title' => $announcement->title_fr]);

        return AdminAnnouncementResource::make($announcement->load(self::RELATIONS));
    }
}
