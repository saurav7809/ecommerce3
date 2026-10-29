<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Supported Locales
    |--------------------------------------------------------------------------
    |
    | The locales available on the storefront. Each entry provides the
    | human-friendly name, its native name, and a flag emoji used in the
    | language switcher dropdown.
    |
    */
    'supported' => [
        'en'  => ['name' => 'English',  'native' => 'English',       'flag' => '🇬🇧'],
        'ne'  => ['name' => 'Nepali',  'native' => 'नेपाली',     'flag' => '🇳🇵'],
        'mai' => ['name' => 'Maithili', 'native' => 'मैथिली',       'flag' => '🇳🇵'],
        'hi'  => ['name' => 'Hindi',    'native' => 'हिन्दी',        'flag' => '🇮🇳'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Locale    |--------------------------------------------------------------------------
    */
    'default' => env('APP_LOCALE', 'en'),

];