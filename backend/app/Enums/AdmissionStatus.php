<?php

namespace App\Enums;

/** Status of an admission request. */
enum AdmissionStatus: string
{
    case New = 'new';
    case InProgress = 'in_progress';
    case Handled = 'handled';
}
