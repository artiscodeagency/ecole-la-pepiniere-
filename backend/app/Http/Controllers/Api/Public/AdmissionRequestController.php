<?php

namespace App\Http\Controllers\Api\Public;

use App\Enums\AdmissionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreAdmissionRequestRequest;
use App\Models\AdmissionRequest;
use App\Models\Setting;
use App\Support\IpHash;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AdmissionRequestController extends Controller
{
    public function store(StoreAdmissionRequestRequest $request): JsonResponse
    {
        // A robot gets the same answer, but nothing is stored.
        if (! $request->isFromRobot()) {
            AdmissionRequest::create([
                ...$request->safe()->except('website'),
                'academic_year' => Setting::get('admissions.academic_year'),
                'status' => AdmissionStatus::New,
                'ip_hash' => IpHash::of($request->ip()),
            ]);
        } else {
            // Kept in the log: a real visitor wrongly taken for a robot must not go unnoticed.
            Log::notice('Public admission form ignored as a robot (trap field filled).', ['ip_hash' => IpHash::of($request->ip())]);
        }

        return response()->json(['message' => 'Votre demande d\'inscription a bien été transmise à l\'école.'], 201);
    }
}
