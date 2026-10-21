<?php

namespace App\Models;

use App\Enums\AnnouncementImportance;
use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'title_fr', 'title_en', 'message_fr', 'message_en', 'importance', 'section_id',
    'starts_at', 'ends_at', 'status', 'is_pinned', 'author_id',
])]
class Announcement extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'importance' => AnnouncementImportance::class,
            'status' => ContentStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_pinned' => 'boolean',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** Published and within its display period: an expired announcement is never shown. */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('status', ContentStatus::Published)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>', now());
    }
}
