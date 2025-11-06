<?php
// Database connection
$host = "localhost";
$user = "root"; // default for XAMPP
$pass = "";
$dbname = "smartmoneyDB";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
  die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}
?>
