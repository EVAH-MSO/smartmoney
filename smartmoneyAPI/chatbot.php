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

// ✅ Read input
$data = json_decode(file_get_contents("php://input"), true);
$userMessage = $data["message"] ?? "";

// ✅ Gemini API key
$apiKey = "AIzaSyDG1WRY4aNbZrJpnXpUEWZV-ohpnkxF4Z0"; // replace with your real Gemini key

// ✅ Prepare request payload
$payload = [
    "contents" => [
        ["parts" => [["text" => $userMessage]]]
    ]
];

// ✅ Send request
$url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=" . $apiKey;



$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

// ✅ Write debug log
file_put_contents("gemini_debug.txt", "Response:\n" . $response . "\nError:\n" . $error);

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
