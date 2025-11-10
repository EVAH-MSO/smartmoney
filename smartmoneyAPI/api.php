<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

// -------------------- SESSION CONFIG --------------------
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax'); 
ini_set('session.cookie_secure', false);

session_save_path(__DIR__ . '/sessions');
if (!is_dir(__DIR__ . '/sessions')) mkdir(__DIR__ . '/sessions', 0777, true);
session_start();

// -------------------- CORS CONFIG --------------------
if (isset($_SERVER['HTTP_ORIGIN'])) {
    if (preg_match('/^http:\/\/localhost(:\d+)?$/', $_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    } else {
        header("Access-Control-Allow-Origin: https://yourdomain.com");
    }
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -------------------- DATABASE --------------------
require_once "db.php";

// -------------------- DATA FILE --------------------
$dataFile = "data.json";
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT));
}
$data = json_decode(file_get_contents($dataFile), true);

// -------------------- ACTION --------------------
$action = $_GET['action'] ?? '';

// -------------------- LOGIN --------------------
if ($action === 'login') {
    $json = json_decode(file_get_contents("php://input"), true);
    $email = trim($json['email'] ?? '');
    $password = $json['password'] ?? '';

    if (!$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'Email and password required']);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, name, email, password ,theme FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['name'] = $user['name'];

            if (!isset($data[$user['email']])) {
                $data[$user['email']] = ['income' => [], 'expenses' => []];
                file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
            }

            echo json_encode([
                'success' => true,
                'email' => $user['email'],
                'name' => $user['name'],
                'theme' => $user['theme'],
                'message' => 'Login successful'
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Email not found']);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// -------------------- REGISTER --------------------
if ($action === 'register') {
    $json = json_decode(file_get_contents("php://input"), true);
    $name = trim($json['name'] ?? '');
    $email = trim($json['email'] ?? '');
    $passwordRaw = $json['password'] ?? '';

    if (!$name || !$email || !$passwordRaw) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit;
    }

    $password = password_hash($passwordRaw, PASSWORD_BCRYPT);

    $stmtCheck = $conn->prepare("SELECT id FROM users WHERE email=?");
    $stmtCheck->bind_param("s", $email);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();
    if ($resultCheck->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already exists"]);
        $stmtCheck->close();
        $conn->close();
        exit;
    }
    $stmtCheck->close();

    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $password);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User registered successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Registration failed"]);
    }
    $stmt->close();
    $conn->close();
    exit;
}

// -------------------- LOGOUT --------------------
if ($action === 'logout') {
    session_unset();
    session_destroy();
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"], $params["secure"], $params["httponly"]
        );
    }
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    exit;
}

// -------------------- CHECK SESSION --------------------
if ($action === 'checkSession') {
    if (isset($_SESSION['email'])) {
        $stmt = $conn->prepare("SELECT theme FROM users WHERE email=?");
        $stmt->bind_param("s", $_SESSION['email']);
        $stmt->execute();
        $result = $stmt->get_result();
        $theme = 'light';
        if ($result && $result->num_rows > 0) {
            $theme = $result->fetch_assoc()['theme'];
        }
        $stmt->close();

        echo json_encode([
            'success' => true,
            'email' => $_SESSION['email'],
            'name' => $_SESSION['name'],
            'theme' => $theme
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No active session']);
    }
    exit;
}


// -------------------- AUTH REQUIRED --------------------
if (!isset($_SESSION['email'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userEmail = $_SESSION['email'];
$userName = $_SESSION['name'];

// -------------------- DASHBOARD --------------------
if ($action === 'getDashboard') {
    $income = $data[$userEmail]['income'] ?? [];
    $expenses = $data[$userEmail]['expenses'] ?? [];

    $totalIncome = array_sum(array_column($income, 'actual'));
    $totalExpense = array_sum(array_column($expenses, 'actual'));
    $incomePercent = $totalIncome > 0 ? round(($totalIncome / max(array_sum(array_column($income, 'budget')), 1)) * 100) : 0;
    $expensePercent = $totalExpense > 0 ? round(($totalExpense / max(array_sum(array_column($expenses, 'budget')), 1)) * 100) : 0;

    echo json_encode([
        'success' => true,
        'name' => $userName,
        'email' => $userEmail,
        'income' => $income,
        'expenses' => $expenses,
        'totalIncome' => $totalIncome,
        'totalExpense' => $totalExpense,
        'incomePercent' => $incomePercent,
        'expensePercent' => $expensePercent
    ]);
    exit;
}

// -------------------- UPDATE PROFILE --------------------

if ($action === 'updateProfile') {
    $name = $_POST['name'] ?? '';
    $theme = $_POST['theme'] ?? '';
    $password = $_POST['password'] ?? null;

    // Get existing profilePic from DB
    $stmtGet = $conn->prepare("SELECT profilePic FROM users WHERE email=?");
    $stmtGet->bind_param("s", $userEmail);
    $stmtGet->execute();
    $resultGet = $stmtGet->get_result();
    $existingProfilePic = '';
    if ($resultGet && $resultGet->num_rows > 0) {
        $existingProfilePic = $resultGet->fetch_assoc()['profilePic'];
    }
    $stmtGet->close();

    $profilePic = $existingProfilePic; // Default to existing

    // Handle new profile picture upload
    if (isset($_FILES['profilePic']) && $_FILES['profilePic']['error'] === 0) {
        $uploadsDir = __DIR__ . '/uploads';
        if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0777, true);

        $ext = pathinfo($_FILES['profilePic']['name'], PATHINFO_EXTENSION);
        $newFileName = uniqid() . '.' . $ext;
        $destination = $uploadsDir . '/' . $newFileName;

        if (move_uploaded_file($_FILES['profilePic']['tmp_name'], $destination)) {
            $profilePic = 'uploads/' . $newFileName; // Relative URL for frontend
        } else {
            echo json_encode(['success' => false, 'message' => 'Upload failed', 'error' => $_FILES['profilePic']['error']]);
            exit;
        }
    }

    // Build dynamic SQL
    $fields = [];
    $params = [];
    $types = '';

    if ($name) { $fields[] = 'name=?'; $params[] = $name; $types .= 's'; }
    if ($theme) { $fields[] = 'theme=?'; $params[] = $theme; $types .= 's'; }
    if ($password) { $fields[] = 'password=?'; $params[] = password_hash($password, PASSWORD_BCRYPT); $types .= 's'; }
    if ($profilePic) { $fields[] = 'profilePic=?'; $params[] = $profilePic; $types .= 's'; }

    if (empty($fields)) {
        echo json_encode(['success' => false, 'message' => 'No changes detected']);
        exit;
    }

    $sql = "UPDATE users SET " . implode(',', $fields) . " WHERE email=?";
    $params[] = $userEmail;
    $types .= 's';
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated',
        'profilePic' => $profilePic
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Update failed']);
}

    $stmt->close();
    exit;
}


// -------------------- ADD INCOME --------------------
if ($action === 'addIncome') {
    $json = json_decode(file_get_contents("php://input"), true);
    $data[$userEmail]['income'][] = [
        'category' => $json['category'] ?? 'New Income',
        'budget' => (float)($json['budget'] ?? 0),
        'actual' => (float)($json['actual'] ?? 0)
    ];
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'message' => 'Income added successfully']);
    exit;
}

// -------------------- ADD EXPENSE --------------------
if ($action === 'addExpense') {
    $json = json_decode(file_get_contents("php://input"), true);
    $data[$userEmail]['expenses'][] = [
        'category' => $json['category'] ?? 'New Expense',
        'budget' => (float)($json['budget'] ?? 0),
        'actual' => (float)($json['actual'] ?? 0)
    ];
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'message' => 'Expense added successfully']);
    exit;
}

// -------------------- DELETE INCOME --------------------
if ($action === 'deleteIncome') {
    $json = json_decode(file_get_contents("php://input"), true);
    $index = $json['index'] ?? null;
    if ($index !== null && isset($data[$userEmail]['income'][$index])) {
        array_splice($data[$userEmail]['income'], $index, 1);
        file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => 'Income deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Income not found']);
    }
    exit;
}

// -------------------- DELETE EXPENSE --------------------
if ($action === 'deleteExpense') {
    $json = json_decode(file_get_contents("php://input"), true);
    $index = $json['index'] ?? null;
    if ($index !== null && isset($data[$userEmail]['expenses'][$index])) {
        array_splice($data[$userEmail]['expenses'], $index, 1);
        file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => 'Expense deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Expense not found']);
    }
    exit;
}

// -------------------- FALLBACK --------------------
echo json_encode(['success' => false, 'message' => 'Invalid action']);
$conn->close();
?>
