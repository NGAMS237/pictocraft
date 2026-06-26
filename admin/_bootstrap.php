<?php
// Pictocraft Admin — bootstrap commun (sessions, auth, helpers)
session_start();

// Chemins
define('ROOT', dirname(__DIR__));
define('DATA_DIR', ROOT . '/data');
define('UPLOADS_DIR', ROOT . '/assets/images/uploads');
define('BACKUPS_DIR', ROOT . '/backups');
define('SETTINGS_FILE', DATA_DIR . '/settings.json');
define('PRODUCTS_FILE', DATA_DIR . '/products.json');

// Crée les dossiers manquants
@mkdir(UPLOADS_DIR, 0755, true);
@mkdir(BACKUPS_DIR, 0755, true);

// Helpers
function read_json($path, $default = []) {
    if (!file_exists($path)) return $default;
    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    return $data ?: $default;
}

function write_json($path, $data) {
    // Sauvegarde automatique avant écriture
    if (file_exists($path)) {
        $backupName = basename($path, '.json') . '_' . date('Ymd_His') . '.json';
        @copy($path, BACKUPS_DIR . '/' . $backupName);
    }
    return file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function is_logged_in() {
    return !empty($_SESSION['pc_admin']);
}

function require_login() {
    if (!is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function get_password_hash() {
    $settings = read_json(SETTINGS_FILE);
    return $settings['admin']['passwordHash'] ?? '';
}

function set_password($new_password) {
    $settings = read_json(SETTINGS_FILE);
    if (!isset($settings['admin'])) $settings['admin'] = [];
    $settings['admin']['passwordHash'] = password_hash($new_password, PASSWORD_BCRYPT);
    write_json(SETTINGS_FILE, $settings);
}

function csrf_token() {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['csrf'];
}

function check_csrf() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') return true;
    return !empty($_POST['csrf']) && hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf']);
}

function flash($msg, $type = 'success') {
    $_SESSION['flash'] = ['msg' => $msg, 'type' => $type];
}

function get_flash() {
    if (empty($_SESSION['flash'])) return null;
    $f = $_SESSION['flash'];
    unset($_SESSION['flash']);
    return $f;
}

function h($s) { return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8'); }
