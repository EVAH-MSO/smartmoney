<?php
// Try to read environment variables (Vercel or .env)
$host = getenv('DB_HOST') ?: 'localhost';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$dbname = getenv('DB_NAME') ?: 'smartmoneyDB';

// If running locally, optionally read from .env file
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = parse_ini_file(__DIR__ . '/.env');
    $host = $dotenv['DB_HOST'] ?? $host;
    $user = $dotenv['DB_USER'] ?? $user;
    $pass = $dotenv['DB_PASS'] ?? $pass;
    $dbname = $dotenv['DB_NAME'] ?? $dbname;
}

// Connect to MySQL
$conn = new mysqli($host, $user, $pass, $dbname);

// Handle connection failure
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}
?>
