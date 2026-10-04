<?php

namespace App\Enums;

enum AnnouncementImportance: string
{
    case Info = 'info';
    case Important = 'important';
    case Urgent = 'urgent';
}
