<?php
// API Upload images Pictocraft
// Sécurisé : auth admin requise, validation type + taille + magic bytes
require_once __DIR__ . '/../admin/_bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

function out($ok, $msg, $extra = []) {
    echo json_encode(array_merge(['ok' => $ok, 'message' => $msg], $extra));
    exit;
}

if (!is_logged_in()) out(false, "Non authentifié. Connecte-toi à l'admin.");
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, "Méthode HTTP non autorisée.");
if (empty($_FILES['image'])) out(false, "Aucun fichier reçu (champ 'image' manquant).");

$f = $_FILES['image'];
if ($f['error'] !== UPLOAD_ERR_OK) {
    $errMsg = [
        UPLOAD_ERR_INI_SIZE   => "Fichier dépasse upload_max_filesize PHP",
        UPLOAD_ERR_FORM_SIZE  => "Fichier dépasse MAX_FILE_SIZE du formulaire",
        UPLOAD_ERR_PARTIAL    => "Fichier reçu partiellement",
        UPLOAD_ERR_NO_FILE    => "Aucun fichier envoyé",
        UPLOAD_ERR_NO_TMP_DIR => "Dossier temporaire manquant côté serveur",
        UPLOAD_ERR_CANT_WRITE => "Impossible d'écrire le fichier sur disque",
        UPLOAD_ERR_EXTENSION  => "Upload bloqué par une extension PHP"
    ][$f['error']] ?? "Erreur upload code " . $f['error'];
    out(false, $errMsg);
}

// Limites
$maxSize = 5 * 1024 * 1024; // 5 Mo
if ($f['size'] > $maxSize) out(false, "Image trop volumineuse (max 5 Mo).");
if ($f['size'] < 100) out(false, "Fichier vide ou corrompu.");

// Validation extension
$allowedExts = ['jpg','jpeg','png','webp','svg'];
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExts)) {
    out(false, "Format non autorisé. Accepté : " . implode(', ', $allowedExts));
}

// Validation MIME réel (pas seulement l'extension)
$mime = function_exists('mime_content_type') ? mime_content_type($f['tmp_name']) : ($f['type'] ?? '');
$allowedMimes = ['image/jpeg','image/jpg','image/png','image/webp','image/svg+xml'];
if (!in_array($mime, $allowedMimes)) {
    out(false, "Type MIME non autorisé : " . $mime);
}

// Anti contre-attaque : refuser les images "PHP cachée"
$head = file_get_contents($f['tmp_name'], false, null, 0, 100);
if (stripos($head, '<?php') !== false || stripos($head, '<script') !== false) {
    out(false, "Fichier suspect détecté (contenu PHP/script interdit).");
}

// Destination
$dest = isset($_POST['dest']) && $_POST['dest'] === 'uploads'
        ? ROOT . '/assets/images/uploads'
        : ROOT . '/assets/images/products';
@mkdir($dest, 0755, true);
if (!is_dir($dest) || !is_writable($dest)) {
    out(false, "Dossier de destination non accessible en écriture : " . str_replace(ROOT,'',$dest) . ". Vérifie les permissions (755).");
}

// Nom propre : préfixe optionnel + timestamp
$prefix = preg_replace('/[^a-z0-9-]/i', '-', $_POST['prefix'] ?? 'img');
$prefix = strtolower(trim($prefix, '-')) ?: 'img';
$finalName = $prefix . '-' . time() . '-' . substr(md5($f['name']), 0, 6) . '.' . $ext;
$finalPath = $dest . '/' . $finalName;

if (!move_uploaded_file($f['tmp_name'], $finalPath)) {
    out(false, "Impossible d'écrire le fichier final dans " . str_replace(ROOT,'',$dest));
}
@chmod($finalPath, 0644);

// Chemin relatif depuis la racine du site
$relativePath = str_replace(ROOT . '/', '', $finalPath);

// Si un produit est associé, on met à jour products.json
if (!empty($_POST['productId'])) {
    $data = read_json(PRODUCTS_FILE, ['products' => []]);
    foreach ($data['products'] as &$p) {
        if (($p['id'] ?? $p['slug'] ?? '') === $_POST['productId']) {
            $p['image'] = $relativePath;
            break;
        }
    }
    unset($p);
    write_json(PRODUCTS_FILE, $data);
}

out(true, "Image uploadée avec succès.", [
    'path' => $relativePath,
    'url'  => $relativePath,
    'size' => $f['size'],
    'name' => $finalName
]);
