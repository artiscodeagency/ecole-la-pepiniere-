<?php

namespace App\Enums;

/** Status of news and announcements. */
enum ContentStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}
