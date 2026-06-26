<?php $title = 'Éditer produit'; require_once __DIR__ . '/_header.php';
$data = read_json(PRODUCTS_FILE, ['categories' => [], 'products' => []]);
$id = $_GET['id'] ?? 'new';
$isNew = ($id === 'new');
$product = $isNew ? [
    'id' => '', 'slug' => '', 'name' => '', 'category' => '',
    'description' => '', 'image' => '', 'priceFrom' => 0,
    'priceLabel' => 'dès', 'currency' => 'FCFA', 'badge' => '',
    'active' => true, 'configurable' => false, 'buttonLabel' => 'Devis sur mesure',
    'sortOrder' => 999
] : (current(array_filter($data['products'], fn($p) => $p['id'] === $id)) ?: null);

if (!$product) { flash('Produit introuvable.', 'error'); header('Location: products.php'); exit; }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!check_csrf()) { flash('Session expirée.', 'error'); }
    else {
        $product['name']        = trim($_POST['name'] ?? '');
        $product['id']          = $isNew ? preg_replace('/[^a-z0-9-]/', '-', strtolower(trim($_POST['name'] ?? ''))) : $product['id'];
        $product['slug']        = $product['id'];
        $product['category']    = trim($_POST['category'] ?? '');
        $product['description'] = trim($_POST['description'] ?? '');
        $product['priceFrom']   = (int)($_POST['priceFrom'] ?? 0);
        $product['priceLabel']  = trim($_POST['priceLabel'] ?? 'dès');
        $product['currency']    = trim($_POST['currency'] ?? 'FCFA');
        $product['badge']       = trim($_POST['badge'] ?? '');
        $product['buttonLabel'] = trim($_POST['buttonLabel'] ?? 'Configurer');
        $product['active']      = !empty($_POST['active']);
        $product['configurable']= !empty($_POST['configurable']);
        $product['sortOrder']   = (int)($_POST['sortOrder'] ?? 999);

        // Upload image
        if (!empty($_FILES['imageFile']['tmp_name'])) {
            $allowed = ['jpg','jpeg','png','webp'];
            $ext = strtolower(pathinfo($_FILES['imageFile']['name'], PATHINFO_EXTENSION));
            $size = $_FILES['imageFile']['size'];
            $mime = mime_content_type($_FILES['imageFile']['tmp_name']);
            if (!in_array($ext, $allowed)) { flash('Format non autorisé.', 'error'); }
            elseif ($size > 2 * 1024 * 1024) { flash('Image > 2 Mo.', 'error'); }
            elseif (!str_starts_with($mime, 'image/')) { flash('Fichier non-image refusé.', 'error'); }
            else {
                $clean = preg_replace('/[^a-z0-9-]/', '-', strtolower($product['slug'])) . '-' . time() . '.' . $ext;
                $dest = UPLOADS_DIR . '/' . $clean;
                if (move_uploaded_file($_FILES['imageFile']['tmp_name'], $dest)) {
                    $product['image'] = 'assets/images/uploads/' . $clean;
                }
            }
        } elseif (!empty($_POST['imageUrl'])) {
            $product['image'] = $_POST['imageUrl'];
        }

        // Save
        if ($isNew) { $data['products'][] = $product; }
        else { foreach ($data['products'] as &$p) { if ($p['id'] === $id) { $p = $product; break; } } unset($p); }
        write_json(PRODUCTS_FILE, $data);
        flash('Produit enregistré.', 'success');
        header('Location: products.php'); exit;
    }
}
?>
<h1><?= $isNew ? '+ Nouveau produit' : 'Modifier : ' . h($product['name']) ?></h1>
<div class="adm-card">
<form method="POST" enctype="multipart/form-data">
  <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
  <div class="adm-grid-2">
    <div class="adm-field"><label>Nom du produit *</label><input type="text" name="name" value="<?= h($product['name']) ?>" required></div>
    <div class="adm-field"><label>Catégorie</label>
      <select name="category">
        <option value="">— Aucune —</option>
        <?php foreach (($data['categories'] ?? []) as $c): ?>
          <option value="<?= h($c['slug']) ?>" <?= $product['category'] === $c['slug'] ? 'selected' : '' ?>><?= h($c['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
  </div>
  <div class="adm-field"><label>Description courte</label><textarea name="description" rows="3"><?= h($product['description']) ?></textarea></div>
  <div class="adm-grid-3">
    <div class="adm-field"><label>Prix à partir de</label><input type="number" name="priceFrom" value="<?= h($product['priceFrom']) ?>" min="0"></div>
    <div class="adm-field"><label>Texte avant prix</label><input type="text" name="priceLabel" value="<?= h($product['priceLabel'] ?? 'dès') ?>"></div>
    <div class="adm-field"><label>Devise</label><input type="text" name="currency" value="<?= h($product['currency'] ?? 'FCFA') ?>"></div>
  </div>
  <div class="adm-grid-3">
    <div class="adm-field"><label>Badge (BEST, NOUVEAU…)</label><input type="text" name="badge" value="<?= h($product['badge']) ?>" placeholder="vide ou ex: NOUVEAU"></div>
    <div class="adm-field"><label>Texte du bouton</label><input type="text" name="buttonLabel" value="<?= h($product['buttonLabel']) ?>"></div>
    <div class="adm-field"><label>Ordre d'affichage</label><input type="number" name="sortOrder" value="<?= h($product['sortOrder']) ?>"></div>
  </div>
  <div class="adm-grid-2">
    <div class="adm-field">
      <label><input type="checkbox" name="active" <?= ($product['active'] ?? true) ? 'checked' : '' ?>> Produit visible sur le site</label>
    </div>
    <div class="adm-field">
      <label><input type="checkbox" name="configurable" <?= ($product['configurable'] ?? false) ? 'checked' : '' ?>> Devis en ligne disponible</label>
    </div>
  </div>
  <h3 style="margin-top:24px">Image</h3>
  <?php if (!empty($product['image'])): ?>
    <div style="margin:10px 0"><img src="../<?= h($product['image']) ?>" style="max-width:220px;border-radius:8px;border:1px solid #ddd"></div>
  <?php endif; ?>
  <div class="adm-grid-2">
    <div class="adm-field"><label>Uploader une nouvelle image (jpg/png/webp, max 2 Mo)</label><input type="file" name="imageFile" accept=".jpg,.jpeg,.png,.webp"></div>
    <div class="adm-field"><label>Ou URL d'image existante</label><input type="text" name="imageUrl" placeholder="assets/images/products/..."></div>
  </div>
  <div class="adm-actions" style="margin-top:24px">
    <button type="submit" class="adm-btn adm-btn-pri">💾 Enregistrer</button>
    <a href="products.php" class="adm-btn adm-btn-ghost">Annuler</a>
  </div>
</form>
</div>
<?php require_once __DIR__ . '/_footer.php';
