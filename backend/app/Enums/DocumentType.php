<?php

namespace App\Enums;

enum DocumentType: string
{
    case InternalRules = 'internal_rules';
    case SchoolCalendar = 'school_calendar';
    case SuppliesList = 'supplies_list';
    case Other = 'other';
}
