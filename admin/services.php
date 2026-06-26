<?php $title = 'Services'; require_once __DIR__ . '/_header.php';
define('SERVICES_FILE', DATA_DIR . '/services.json');
$data = read_json(SERVICES_FILE, ['services' => []]);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!check_csrf()) { flash('Session expirée.', 'error'); header('Location: services.php'); exit; }
    $id = $_POST['id'] ?? '';
    $isNew = empty($id) || $id === 'new';

    $item = [
        'id'               => $isNew ? preg_replace('/[^a-z0-9-]/', '-', strtolower(trim($_POST['title'] ?? '') . '-' . time())) : $id,
        'anchor'           => trim($_POST['anchor'] ?? '') ?: ($isNew ? '' : $id),
        'title'            => trim($_POST['title'] ?? ''),
        'shortDescription' => trim($_POST['shortDescription'] ?? ''),
        'fullDescription'  => trim($_POST['fullDescription'] ?? ''),
        'icon'             => trim($_POST['icon'] ?? 'printer'),
        'image'            => trim($_POST['image'] ?? ''),
        'examples'         => array_filter(array_map('trim', explode("\n", $_POST['examples'] ?? ''))),
        'active'           => !empty($_POST['active']),
        'sortOrder'        => (int)($_POST['sortOrder'] ?? 999),
        'primaryCta'       => [
            'label' => trim($_POST['ctaLabel'] ?? 'Configurer un devis'),
            'href'  => trim($_POST['ctaHref']  ?? 'devis.html')
        ]
    ];

    // Upload image
    if (!empty($_FILES['imageFile']['tmp_name']) && $_FILES['imageFile']['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($_FILES['imageFile']['name'], PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg','jpeg','png','webp']) && $_FILES['imageFile']['size'] <= 5*1024*1024) {
            $sDir = ROOT . '/assets/images/services'; @mkdir($sDir, 0755, true);
            $fname = preg_replace('/[^a-z0-9-]/', '-', strtolower($item['id'])) . '-' . time() . '.' . $ext;
            if (move_uploaded_file($_FILES['imageFile']['tmp_name'], $sDir . '/' . $fname)) {
                $item['image'] = 'assets/images/services/' . $fname;
            }
        }
    }

    if ($isNew) { $data['services'][] = $item; }
    else { foreach ($data['services'] as &$s) { if ($s['id'] === $id) { $s = $item; break; } } unset($s); }
    write_json(SERVICES_FILE, $data);
    flash($isNew ? 'Service ajouté.' : 'Service modifié.', 'success');
    header('Location: services.php'); exit;
}

if (($_GET['action'] ?? '') === 'toggle' && !empty($_GET['id'])) {
    foreach ($data['services'] as &$s) { if ($s['id'] === $_GET['id']) { $s['active'] = !($s['active'] ?? true); break; } }
    unset($s);
    write_json(SERVICES_FILE, $data);
    header('Location: services.php'); exit;
}

$edit = null;
if (!empty($_GET['edit'])) {
    if ($_GET['edit'] === 'new') $edit = ['id'=>'new','anchor'=>'','title'=>'','shortDescription'=>'','fullDescription'=>'','icon'=>'printer','image'=>'','examples'=>[],'active'=>true,'sortOrder'=>999,'primaryCta'=>['label'=>'Configurer un devis','href'=>'devis.html']];
    else $edit = current(array_filter($data['services'], fn($s) => $s['id'] === $_GET['edit'])) ?: null;
}

usort($data['services'], fn($a,$b) => ($a['sortOrder']??999) - ($b['sortOrder']??999));
?>
<div class="adm-page-head">
  <h1>🎯 Services</h1>
  <a href="?edit=new" class="adm-btn adm-btn-pri">+ Nouveau service</a>
</div>

<?php if ($edit): ?>
<div class="adm-card">
  <h2><?= $edit['id'] === 'new' ? '+ Nouveau service' : 'Modifier : ' . h($edit['title']) ?></h2>
  <form method="POST" enctype="multipart/form-data">
    <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
    <input type="hidden" name="id" value="<?= h($edit['id']) ?>">
    <div class="adm-grid-2">
      <div class="adm-field"><label>Titre *</label><input type="text" name="title" required value="<?= h($edit['title']) ?>"></div>
      <div class="adm-field"><label>Ancre URL (#)</label><input type="text" name="anchor" value="<?= h($edit['anchor']) ?>" placeholder="ex: imprimerie"></div>
    </div>
    <div class="adm-field"><label>Description courte</label><textarea name="shortDescription" rows="2" maxlength="200"><?= h($edit['shortDescription']) ?></textarea></div>
    <div class="adm-field"><label>Description complète</label><textarea name="fullDescription" rows="5"><?= h($edit['fullDescription']) ?></textarea></div>
    <div class="adm-field"><label>Exemples (1 par ligne)</label><textarea name="examples" rows="5"><?= h(implode("\n", $edit['examples'] ?? [])) ?></textarea></div>
    <div class="adm-grid-3">
      <div class="adm-field"><label>Icône (clé)</label>
        <select name="icon">
          <?php foreach (['printer','palette','monitor','event','shirt','package'] as $i): ?>
          <option <?= $edit['icon']===$i?'selected':'' ?>><?= $i ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="adm-field"><label>Texte du bouton</label><input type="text" name="ctaLabel" value="<?= h($edit['primaryCta']['label'] ?? '') ?>"></div>
      <div class="adm-field"><label>Lien du bouton</label><input type="text" name="ctaHref" value="<?= h($edit['primaryCta']['href'] ?? 'devis.html') ?>"></div>
    </div>
    <?php if (!empty($edit['image'])): ?><div style="margin:10px 0"><img src="../<?= h($edit['image']) ?>" style="max-width:200px;border-radius:8px;border:1px solid #ddd"></div><?php endif; ?>
    <div class="adm-grid-2">
      <div class="adm-field"><label>Image (chemin)</label><input type="text" name="image" value="<?= h($edit['image']) ?>"></div>
      <div class="adm-field"><label>Ou uploader (max 5 Mo)</label><input type="file" name="imageFile" accept=".jpg,.jpeg,.png,.webp"></div>
    </div>
    <div class="adm-grid-2">
      <div class="adm-field"><label><input type="checkbox" name="active" <?= ($edit['active']??true)?'checked':'' ?>> ✓ Service visible</label></div>
      <div class="adm-field"><label>Ordre d'affichage</label><input type="number" name="sortOrder" value="<?= h($edit['sortOrder']) ?>"></div>
    </div>
    <div class="adm-actions">
      <button type="submit" class="adm-btn adm-btn-pri">💾 Enregistrer</button>
      <a href="services.php" class="adm-btn adm-btn-ghost">Annuler</a>
    </div>
  </form>
</div>
<?php endif; ?>

<div class="adm-card">
  <table class="adm-table">
    <thead><tr><th>Ordre</th><th>Titre</th><th>Description courte</th><th>Visible</th><th>Action</th></tr></thead>
    <tbody>
      <?php foreach ($data['services'] as $s): ?>
      <tr class="<?= ($s['active']??true) ? '' : 'adm-row-off' ?>">
        <td><b><?= h($s['sortOrder'] ?? '') ?></b></td>
        <td><b><?= h($s['title']) ?></b><br><small><?= h($s['id']) ?> (#<?= h($s['anchor']) ?>)</small></td>
        <td><?= h($s['shortDescription'] ?? '') ?></td>
        <td><a href="?action=toggle&id=<?= h($s['id']) ?>" class="adm-toggle"><?= ($s['active']??true) ? '✓ Visible' : '✗ Masqué' ?></a></td>
        <td><a href="?edit=<?= h($s['id']) ?>" class="adm-btn adm-btn-sec adm-btn-sm">Modifier</a></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require_once __DIR__ . '/_footer.php';
