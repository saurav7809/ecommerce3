<?php

return [
    'zones' => [
        'within_kathmandu' => [
            'name' => 'Within Kathmandu',
            'charge' => 80,
            'free_threshold' => 500,
        ],
        'outside_kathmandu' => [
            'name' => 'Outside Kathmandu',
            'charge' => 150,
            'free_threshold' => 1000,
        ],
        'remote_areas' => [
            'name' => 'Remote Areas',
            'charge' => 300,
            'free_threshold' => 2000,
        ],
    ],
    'default' => [
        'charge' => 100,
        'free_threshold' => 1000,
    ],
];