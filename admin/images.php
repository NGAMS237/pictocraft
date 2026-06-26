<?php $title = 'Images'; require_once __DIR__ . '/_header.php';
$imgDir = ROOT . '/assets/images/products';
$uplDir = UPLOADS_DIR;

// Upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_FILES['imageFile']['tmp_name'])) {
    if (!check_csrf()) flash('Session expirée.', 'error');
    else {
        $allowed = ['jpg','jpeg','png','webp'];
        $ext = strtolower(pathinfo($_FILES['imageFile']['name'], PATHINFO_EXTENSION));
        $mime = mime_content_type($_FILES['imageFile']['tmp_name']);
        if (!in_array($ext, $allowed)) flash('Format non autorisé.', 'error');
        elseif ($_FILES['imageFile']['size'] > 2*1024*1024) flash('Image > 2 Mo.', 'error');
        elseif (!str_starts_with($mime, 'image/')) flash('Fichier non-image.', 'error');
        else {
            $clean = preg_replace('/[^a-z0-9.-]/', '-', strtolower($_FILES['imageFile']['name']));
            $clean = time() . '-' . $clean;
            if (move_uploaded_file($_FILES['imageFile']['tmp_name'], $uplDir . '/' . $clean)) {
                flash('Image uploadée : ' . $clean, 'success');
            } else flash('Erreur upload.', 'error');
        }
        header('Location: images.php'); exit;
    }
}

// Delete
if (($_GET['action'] ?? '') === 'delete' && !empty($_GET['file'])) {
    $file = basename($_GET['file']); // sécurité : pas de traversée
    $path = $uplDir . '/' . $file;
    if (file_exists($path)) { unlink($path); flash('Image supprimée.', 'success'); }
    header('Location: images.php'); exit;
}

$imgsProducts = glob($imgDir . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE) ?: [];
$imgsUploads = glob($uplDir . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE) ?: [];
?>
<h1>🖼️ Bibliothèque d'images</h1>
<div class="adm-card">
  <h2>Uploader une nouvelle image</h2>
  <form method="POST" enctype="multipart/form-data" class="adm-upload-form">
    <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
    <input type="file" name="imageFile" accept=".jpg,.jpeg,.png,.webp" required>
    <button type="submit" class="adm-btn adm-btn-pri">⬆ Uploader</button>
    <small>JPG/PNG/WEBP — max 2 Mo. Stocké dans <code>assets/images/uploads/</code></small>
  </form>
</div>
<div class="adm-card">
  <h2>Images uploadées (<?= count($imgsUploads) ?>)</h2>
  <div class="adm-img-grid">
    <?php foreach ($imgsUploads as $img): $name = basename($img); $rel = 'assets/images/uploads/' . $name; ?>
      <div class="adm-img-card">
        <img src="../<?= h($rel) ?>" alt="">
        <div class="adm-img-name" title="<?= h($name) ?>"><?= h($name) ?></div>
        <button class="adm-btn adm-btn-ghost adm-btn-sm" onclick="navigator.clipboard.writeText('<?= h($rel) ?>');this.textContent='✓ Copié'">📋 Copier le chemin</button>
        <a href="?action=delete&file=<?= h($name) ?>" class="adm-btn adm-btn-danger adm-btn-sm" onclick="return confirm('Supprimer <?= h($name) ?> ?')">🗑</a>
      </div>
    <?php endforeach; ?>
  </div>
</div>
<div class="adm-card">
  <h2>Images livrées avec le site (<?= count($imgsProducts) ?>)</h2>
  <p style="color:#666;font-size:.88rem">Ces images font partie du site et ne peuvent pas être supprimées depuis l'admin. Pour les remplacer, upload une nouvelle image et associe-la au produit.</p>
  <div class="adm-img-grid">
    <?php foreach ($imgsProducts as $img): $name = basename($img); $rel = 'assets/images/products/' . $name; ?>
      <div class="adm-img-card">
        <img src="../<?= h($rel) ?>" alt="">
        <div class="adm-img-name" title="<?= h($name) ?>"><?= h($name) ?></div>
        <button class="adm-btn adm-btn-ghost adm-btn-sm" onclick="navigator.clipboard.writeText('<?= h($rel) ?>');this.textContent='✓ Copié'">📋 Copier le chemin</button>
      </div>
    <?php endforeach; ?>
  </div>
</div>
<?php require_once __DIR__ . '/_footer.php';
