<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Apply the user's preferred locale (stored in the session) to the app.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supported = array_keys(config('locale.supported'));
        $locale = $request->session()->get('locale', config('locale.default'));

        if (!in_array($locale, $supported)) {
            $locale = config('locale.default');
        }

        App::setLocale($locale);

        return $next($request);
    }
}