<?php

namespace App\Enums;

/** Status of a contact message. */
enum MessageStatus: string
{
    case New = 'new';
    case Read = 'read';
    case Handled = 'handled';
}
