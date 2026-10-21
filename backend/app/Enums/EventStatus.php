<?php

namespace App\Enums;

enum EventStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    /** Still shown publicly, flagged as cancelled, so families are informed. */
    case Cancelled = 'cancelled';
    case Archived = 'archived';
}
