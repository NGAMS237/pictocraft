<?php $title = 'Sauvegarde'; require_once __DIR__ . '/_header.php';

// Téléchargement ZIP
if (($_GET['action'] ?? '') === 'download') {
    $zip = new ZipArchive();
    $zipName = sys_get_temp_dir() . '/pictocraft-backup-' . date('Ymd-His') . '.zip';
    if ($zip->open($zipName, ZipArchive::CREATE) === TRUE) {
        if (file_exists(PRODUCTS_FILE)) $zip->addFile(PRODUCTS_FILE, 'products.json');
        if (file_exists(SETTINGS_FILE)) $zip->addFile(SETTINGS_FILE, 'settings.json');
        $zip->close();
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="pictocraft-backup-' . date('Ymd-His') . '.zip"');
        header('Content-Length: ' . filesize($zipName));
        readfile($zipName);
        unlink($zipName); exit;
    }
}

// Import
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_FILES['restoreFile']['tmp_name'])) {
    if (!check_csrf()) flash('Session expirée.', 'error');
    else {
        $ext = strtolower(pathinfo($_FILES['restoreFile']['name'], PATHINFO_EXTENSION));
        if ($ext === 'json') {
            $name = strtolower($_FILES['restoreFile']['name']);
            if (str_contains($name, 'product')) write_json(PRODUCTS_FILE, json_decode(file_get_contents($_FILES['restoreFile']['tmp_name']), true));
            elseif (str_contains($name, 'setting')) write_json(SETTINGS_FILE, json_decode(file_get_contents($_FILES['restoreFile']['tmp_name']), true));
            flash('Fichier importé.', 'success');
        } elseif ($ext === 'zip') {
            $zip = new ZipArchive();
            $tmpDir = sys_get_temp_dir() . '/pc-restore-' . uniqid();
            mkdir($tmpDir);
            if ($zip->open($_FILES['restoreFile']['tmp_name']) === TRUE) {
                $zip->extractTo($tmpDir); $zip->close();
                if (file_exists($tmpDir . '/products.json')) copy($tmpDir . '/products.json', PRODUCTS_FILE);
                if (file_exists($tmpDir . '/settings.json')) copy($tmpDir . '/settings.json', SETTINGS_FILE);
                flash('Sauvegarde ZIP restaurée.', 'success');
            } else flash('Erreur ouverture ZIP.', 'error');
        } else flash('Format non supporté (JSON ou ZIP uniquement).', 'error');
        header('Location: backup.php'); exit;
    }
}

$backups = glob(BACKUPS_DIR . '/*.json') ?: [];
rsort($backups);
?>
<h1>💾 Sauvegarde</h1>
<div class="adm-card">
  <h2>Télécharger une sauvegarde</h2>
  <p>Récupère un fichier ZIP contenant products.json et settings.json.</p>
  <a href="?action=download" class="adm-btn adm-btn-pri">⬇ Télécharger ZIP</a>
</div>
<div class="adm-card">
  <h2>Restaurer une sauvegarde</h2>
  <form method="POST" enctype="multipart/form-data" class="adm-upload-form">
    <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
    <input type="file" name="restoreFile" accept=".json,.zip" required>
    <button type="submit" class="adm-btn adm-btn-sec" onclick="return confirm('Cette action va remplacer les données actuelles. Continuer ?')">⬆ Restaurer</button>
  </form>
</div>
<div class="adm-card">
  <h2>Sauvegardes automatiques (<?= count($backups) ?>)</h2>
  <p style="color:#666;font-size:.88rem">Une sauvegarde est créée automatiquement avant chaque modification (dossier <code>backups/</code>).</p>
  <ul style="list-style:none;padding:0;font-family:monospace;font-size:.85rem">
    <?php foreach (array_slice($backups, 0, 30) as $b): ?>
      <li style="padding:4px 0;border-bottom:1px dashed #ddd"><?= h(basename($b)) ?> <small>(<?= date('d/m/Y H:i', filemtime($b)) ?>)</small></li>
    <?php endforeach; ?>
  </ul>
</div>
<?php require_once __DIR__ . '/_footer.php';
