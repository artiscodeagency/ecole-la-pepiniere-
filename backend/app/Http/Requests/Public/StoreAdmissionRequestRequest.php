<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdmissionRequestRequest extends FormRequest
{
    /**
     * Same fields as the public admission form; "website" is a hidden trap for robots.
     * The level is a free label until the school supplies the official level list.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'parent_name' => ['required', 'string', 'max:120'],
            'child_name' => ['required', 'string', 'max:120'],
            'child_birth_date' => ['required', 'date', 'before:today', 'after:-20 years'],
            'level_id' => ['nullable', 'required_without:level_label', Rule::exists('school_levels', 'id')->where('is_active', true)],
            'level_label' => ['nullable', 'required_without:level_id', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+().\s-]{6,30}$/'],
            'email' => ['required', 'string', 'email', 'max:190'],
            'message' => ['nullable', 'string', 'max:5000'],
            'website' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function isFromRobot(): bool
    {
        return $this->filled('website');
    }
}
