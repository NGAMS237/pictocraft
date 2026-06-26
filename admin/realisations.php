<?php $title = 'Réalisations'; require_once __DIR__ . '/_header.php';
define('REALISATIONS_FILE', DATA_DIR . '/realisations.json');
$data = read_json(REALISATIONS_FILE, ['categories' => [], 'realisations' => []]);

// Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!check_csrf()) { flash('Session expirée.', 'error'); header('Location: realisations.php'); exit; }
    $id = $_POST['id'] ?? '';
    $isNew = empty($id) || $id === 'new';

    $item = [
        'id'          => $isNew ? preg_replace('/[^a-z0-9-]/', '-', strtolower(trim($_POST['title'] ?? '') . '-' . time())) : $id,
        'title'       => trim($_POST['title'] ?? ''),
        'category'    => trim($_POST['category'] ?? ''),
        'client'      => trim($_POST['client'] ?? ''),
        'description' => trim($_POST['description'] ?? ''),
        'image'       => trim($_POST['image'] ?? ''),
        'active'      => !empty($_POST['active']),
        'sortOrder'   => (int)($_POST['sortOrder'] ?? 999)
    ];

    // Upload image (optionnel)
    if (!empty($_FILES['imageFile']['tmp_name']) && $_FILES['imageFile']['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($_FILES['imageFile']['name'], PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg','jpeg','png','webp']) && $_FILES['imageFile']['size'] <= 5*1024*1024) {
            $rDir = ROOT . '/assets/images/realisations'; @mkdir($rDir, 0755, true);
            $fname = preg_replace('/[^a-z0-9-]/', '-', strtolower($item['id'])) . '-' . time() . '.' . $ext;
            if (move_uploaded_file($_FILES['imageFile']['tmp_name'], $rDir . '/' . $fname)) {
                $item['image'] = 'assets/images/realisations/' . $fname;
            }
        }
    }

    if ($isNew) { $data['realisations'][] = $item; }
    else { foreach ($data['realisations'] as &$r) { if ($r['id'] === $id) { $r = $item; break; } } unset($r); }
    write_json(REALISATIONS_FILE, $data);
    flash($isNew ? 'Réalisation ajoutée.' : 'Réalisation modifiée.', 'success');
    header('Location: realisations.php'); exit;
}

if (($_GET['action'] ?? '') === 'delete' && !empty($_GET['id'])) {
    $data['realisations'] = array_values(array_filter($data['realisations'], fn($r) => $r['id'] !== $_GET['id']));
    write_json(REALISATIONS_FILE, $data);
    flash('Réalisation supprimée.', 'success');
    header('Location: realisations.php'); exit;
}
if (($_GET['action'] ?? '') === 'toggle' && !empty($_GET['id'])) {
    foreach ($data['realisations'] as &$r) { if ($r['id'] === $_GET['id']) { $r['active'] = !($r['active'] ?? true); break; } }
    unset($r);
    write_json(REALISATIONS_FILE, $data);
    header('Location: realisations.php'); exit;
}

$edit = null;
if (!empty($_GET['edit'])) {
    if ($_GET['edit'] === 'new') $edit = ['id'=>'new','title'=>'','category'=>'','client'=>'','description'=>'','image'=>'','active'=>true,'sortOrder'=>999];
    else $edit = current(array_filter($data['realisations'], fn($r) => $r['id'] === $_GET['edit'])) ?: null;
}

usort($data['realisations'], fn($a,$b) => ($a['sortOrder']??999) - ($b['sortOrder']??999));
?>
<div class="adm-page-head">
  <h1>🖼️ Réalisations</h1>
  <a href="?edit=new" class="adm-btn adm-btn-pri">+ Nouvelle réalisation</a>
</div>

<?php if ($edit): ?>
<div class="adm-card">
  <h2><?= $edit['id'] === 'new' ? '+ Nouvelle réalisation' : 'Modifier : ' . h($edit['title']) ?></h2>
  <form method="POST" enctype="multipart/form-data">
    <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
    <input type="hidden" name="id" value="<?= h($edit['id']) ?>">
    <div class="adm-grid-2">
      <div class="adm-field"><label>Titre *</label><input type="text" name="title" required value="<?= h($edit['title']) ?>"></div>
      <div class="adm-field"><label>Client</label><input type="text" name="client" value="<?= h($edit['client']) ?>"></div>
    </div>
    <div class="adm-grid-2">
      <div class="adm-field"><label>Catégorie</label>
        <select name="category">
          <?php foreach ($data['categories'] as $c): if ($c['slug']==='tous') continue; ?>
          <option value="<?= h($c['slug']) ?>" <?= $edit['category']===$c['slug']?'selected':'' ?>><?= h($c['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="adm-field"><label>Ordre d'affichage</label><input type="number" name="sortOrder" value="<?= h($edit['sortOrder']) ?>"></div>
    </div>
    <div class="adm-field"><label>Description</label><textarea name="description" rows="2"><?= h($edit['description']) ?></textarea></div>
    <?php if (!empty($edit['image'])): ?><div style="margin:10px 0"><img src="../<?= h($edit['image']) ?>" style="max-width:200px;border-radius:8px;border:1px solid #ddd"></div><?php endif; ?>
    <div class="adm-grid-2">
      <div class="adm-field"><label>Image (URL/chemin)</label><input type="text" name="image" value="<?= h($edit['image']) ?>"></div>
      <div class="adm-field"><label>Ou uploader (max 5 Mo)</label><input type="file" name="imageFile" accept=".jpg,.jpeg,.png,.webp"></div>
    </div>
    <div class="adm-field"><label><input type="checkbox" name="active" <?= ($edit['active']??true)?'checked':'' ?>> ✓ Visible sur le site</label></div>
    <div class="adm-actions">
      <button type="submit" class="adm-btn adm-btn-pri">💾 Enregistrer</button>
      <a href="realisations.php" class="adm-btn adm-btn-ghost">Annuler</a>
    </div>
  </form>
</div>
<?php endif; ?>

<div class="adm-card">
  <table class="adm-table">
    <thead><tr><th>Ordre</th><th>Image</th><th>Titre</th><th>Catégorie</th><th>Client</th><th>Visible</th><th>Action</th></tr></thead>
    <tbody>
      <?php foreach ($data['realisations'] as $r): $cat = current(array_filter($data['categories'], fn($c) => $c['slug'] === $r['category'])) ?: null; ?>
      <tr class="<?= ($r['active']??true) ? '' : 'adm-row-off' ?>">
        <td><b><?= h($r['sortOrder'] ?? '') ?></b></td>
        <td><?php if (!empty($r['image'])): ?><img src="../<?= h($r['image']) ?>" class="adm-thumb"><?php endif; ?></td>
        <td><b><?= h($r['title']) ?></b><br><small><?= h($r['description']) ?></small></td>
        <td><?= $cat ? h($cat['name']) : '-' ?></td>
        <td><?= h($r['client']) ?></td>
        <td><a href="?action=toggle&id=<?= h($r['id']) ?>" class="adm-toggle"><?= ($r['active']??true) ? '✓ Visible' : '✗ Masquée' ?></a></td>
        <td>
          <a href="?edit=<?= h($r['id']) ?>" class="adm-btn adm-btn-sec adm-btn-sm">Modifier</a>
          <a href="?action=delete&id=<?= h($r['id']) ?>" class="adm-btn adm-btn-danger adm-btn-sm" onclick="return confirm('Supprimer « <?= h($r['title']) ?> » ?')">🗑</a>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require_once __DIR__ . '/_footer.php';
