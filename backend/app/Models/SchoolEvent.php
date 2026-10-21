<?php

namespace App\Models;

use App\Enums\EventStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('events')]
#[Fillable([
    'title_fr', 'title_en', 'description_fr', 'description_en', 'event_date', 'end_date',
    'start_time', 'end_time', 'location_fr', 'location_en', 'section_id', 'category_id',
    'image_media_id', 'status', 'author_id',
])]
class SchoolEvent extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => EventStatus::class,
            'event_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(NewsCategory::class, 'category_id');
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'image_media_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** Published or cancelled: a cancelled event stays visible so families know. */
    #[Scope]
    protected function publiclyVisible(Builder $query): void
    {
        $query->whereIn('status', [EventStatus::Published, EventStatus::Cancelled]);
    }

    /** Not finished yet, in the school's timezone. */
    #[Scope]
    protected function upcoming(Builder $query): void
    {
        $today = self::today();
        $query->where(fn (Builder $query) => $query
            ->where('end_date', '>=', $today)
            ->orWhere(fn (Builder $query) => $query->whereNull('end_date')->where('event_date', '>=', $today)));
    }

    #[Scope]
    protected function past(Builder $query): void
    {
        $today = self::today();
        $query->where(fn (Builder $query) => $query
            ->where('end_date', '<', $today)
            ->orWhere(fn (Builder $query) => $query->whereNull('end_date')->where('event_date', '<', $today)));
    }

    private static function today(): string
    {
        return now(config('pepiniere.timezone'))->toDateString();
    }
}
