<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\MessageStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminContactMessageResource;
use App\Models\ContactMessage;
use App\Support\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/** Messages sent from the public contact form. */
class ContactMessageController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(MessageStatus::class)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $messages = ContactMessage::query()
            ->with('handler')
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->input('status')))
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $term = '%'.str_replace(['%', '_'], ['\%', '\_'], $request->string('q')->trim()).'%';
                $query->where(fn (Builder $query) => $query
                    ->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('subject', 'like', $term)
                    ->orWhere('message', 'like', $term));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return AdminContactMessageResource::collection($messages)->additional(['counts' => $this->counts()]);
    }

    /** Opening a new message marks it as read. */
    public function show(Request $request, ContactMessage $contactMessage): AdminContactMessageResource
    {
        if ($contactMessage->status === MessageStatus::New) {
            $contactMessage->forceFill(['status' => MessageStatus::Read, 'read_at' => now()])->save();
        }

        return AdminContactMessageResource::make($contactMessage->load('handler'));
    }

    public function update(Request $request, ContactMessage $contactMessage): AdminContactMessageResource
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::enum(MessageStatus::class)],
            'internal_note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ], [], ['internal_note' => 'note interne']);

        $contactMessage->fill($data);
        if (isset($data['status'])) {
            $status = MessageStatus::from($data['status']);
            $contactMessage->read_at = $status === MessageStatus::New ? null : ($contactMessage->read_at ?? now());
            // Who handled it, and when, is kept only while it is "handled".
            $handled = $status === MessageStatus::Handled;
            $contactMessage->handled_by = $handled ? ($contactMessage->handled_by ?? $request->user()->id) : null;
            $contactMessage->handled_at = $handled ? ($contactMessage->handled_at ?? now()) : null;
        }
        $contactMessage->save();

        $changed = array_keys(collect($contactMessage->getChanges())->except('updated_at')->all());
        if ($changed !== []) {
            ActivityLogger::record('messages.updated', $contactMessage, ['fields' => $changed, 'status' => $contactMessage->status->value]);
        }

        return AdminContactMessageResource::make($contactMessage->load('handler'));
    }

    public function destroy(ContactMessage $contactMessage): Response
    {
        Gate::authorize('delete', $contactMessage);

        $contactMessage->delete();
        // No personal data in the log: the message is gone.
        ActivityLogger::record('messages.deleted', $contactMessage);

        return response()->noContent();
    }

    /**
     * @return array<string, int>
     */
    private function counts(): array
    {
        $counts = ContactMessage::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return collect(MessageStatus::cases())
            ->mapWithKeys(fn (MessageStatus $status) => [$status->value => (int) ($counts[$status->value] ?? 0)])
            ->all();
    }
}
