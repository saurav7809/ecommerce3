<?php
// Convenience redirect: Apache serves the Laravel application from /public.
// Visiting the project root forwards the visitor to the app entry point.
header('Location: public/');
exit;