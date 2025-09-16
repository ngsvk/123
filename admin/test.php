<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'message' => 'PHP is working!',
    'timestamp' => time(),
    'php_version' => phpversion()
]);
?>
