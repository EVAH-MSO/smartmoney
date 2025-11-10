<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// ✅ Handle preflight (OPTIONS)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// ✅ Read input JSON
$data = json_decode(file_get_contents("php://input"), true);
$userMessage = $data["message"] ?? "";

// ✅ Load API key (from environment or .env)
$apiKey = getenv("GEMINI_API_KEY");

if (!$apiKey && file_exists(__DIR__ . "/.env")) {
    $env = parse_ini_file(__DIR__ . "/.env");
    $apiKey = $env["GEMINI_API_KEY"] ?? null;
}

if (!$apiKey) {
    echo json_encode(["reply" => "Error: Missing Gemini API key."]);
    exit;
}

// ✅ Prepare request payload
$payload = [
    "contents" => [
        ["parts" => [["text" => $userMessage]]]
    ]
];

// ✅ API endpoint
$url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=" . $apiKey;

// ✅ Send request
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

// ✅ Log (only for local testing, optional)
if (file_exists(__DIR__ . "/gemini_debug.txt") || !getenv("VERCEL")) {
    file_put_contents("gemini_debug.txt", "Response:\n" . $response . "\nError:\n" . $error);
}

// ✅ Handle result
if ($error) {
    echo json_encode(["reply" => "cURL error: $error"]);
    exit;
}

if (!$response) {
    echo json_encode(["reply" => "No response from Gemini API"]);
    exit;
}

$result = json_decode($response, true);

if (isset($result["candidates"][0]["content"]["parts"][0]["text"])) {
    echo json_encode(["reply" => $result["candidates"][0]["content"]["parts"][0]["text"]]);
} else {
    echo json_encode(["reply" => "Gemini returned an unexpected format", "raw" => $result]);
}
?>
