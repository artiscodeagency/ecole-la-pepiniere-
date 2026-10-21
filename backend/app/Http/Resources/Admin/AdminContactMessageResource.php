<?php

namespace App\Http\Resources\Admin;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

/**
 * A message sent from the public contact form.
 *
 * @mixin ContactMessage
 */
class AdminContactMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $detailed = ! $request->routeIs('admin.contact-messages.index');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'subject' => $this->subject,
            // The list only needs the beginning of the message.
            'message' => $detailed ? $this->message : null,
            'excerpt' => Str::limit(preg_replace('/\s+/', ' ', $this->message), 140),
            'status' => $this->status,
            'read_at' => $this->read_at?->toIso8601String(),
            'handled_at' => $this->handled_at?->toIso8601String(),
            'handled_by' => $this->whenLoaded('handler', fn () => $this->handler?->name),
            'internal_note' => $this->when($detailed, $this->internal_note),
            'created_at' => $this->created_at?->toIso8601String(),
            'can' => ['delete' => Gate::forUser($request->user())->allows('delete', $this->resource)],
        ];
    }
}
