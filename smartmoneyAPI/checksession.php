<?php
ini_set('session.cookie_samesite', 'Lax'); // ✅ required for cross-origin cookies
ini_set('session.cookie_secure', false); //
session_start();

// Allow Angular frontend (handle any localhost port)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('/^http:\/\/localhost(:[0-9]+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true"); // very important
}
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Check session
if (isset($_SESSION['user'])) {
    echo json_encode([
        'loggedIn' => true,
        'user' => $_SESSION['user']
        
    ]);
} else {
    echo json_encode([
        'loggedIn' => false,
        'user' => null
    ]);
}
?>
