<?php

namespace App\Http\Controllers\Api\Public;

use App\Enums\MessageStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Support\IpHash;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        // A robot gets the same answer, but nothing is stored.
        if (! $request->isFromRobot()) {
            ContactMessage::create([
                ...$request->safe()->except('website'),
                'status' => MessageStatus::New,
                'ip_hash' => IpHash::of($request->ip()),
            ]);
        }

        return response()->json(['message' => 'Votre message a bien été transmis à l\'école.'], 201);
    }
}
