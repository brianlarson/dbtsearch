<?php

return [
    '*' => [
        'enabled' => true,
        'enableDangerousTools' => true,
        'disabledTools' => ['tinker'],
    ],
    'production' => [
        'enabled' => false,
        'enableDangerousTools' => false,
    ],
];
