<?php $title = 'Produits'; require_once __DIR__ . '/_header.php';
$data = read_json(PRODUCTS_FILE, ['categories' => [], 'products' => []]);
$products = $data['products'] ?? [];
$categories = $data['categories'] ?? [];

// Suppression
if (($_GET['action'] ?? '') === 'delete' && !empty($_GET['id'])) {
    $data['products'] = array_values(array_filter($products, fn($p) => $p['id'] !== $_GET['id']));
    write_json(PRODUCTS_FILE, $data);
    flash('Produit supprimé.', 'success');
    header('Location: products.php'); exit;
}

// Toggle actif
if (($_GET['action'] ?? '') === 'toggle' && !empty($_GET['id'])) {
    foreach ($data['products'] as &$p) {
        if ($p['id'] === $_GET['id']) {
            $p['active'] = !($p['active'] ?? true);
            break;
        }
    }
    unset($p);
    write_json(PRODUCTS_FILE, $data);
    header('Location: products.php'); exit;
}

usort($products, fn($a, $b) => ($a['sortOrder'] ?? 999) - ($b['sortOrder'] ?? 999));
?>
<div class="adm-page-head">
  <h1>🛍️ Produits</h1>
  <a href="product-edit.php?id=new" class="adm-btn adm-btn-pri">+ Nouveau produit</a>
</div>

<div class="adm-card">
  <table class="adm-table">
    <thead><tr><th>Ordre</th><th>Image</th><th>Nom</th><th>Catégorie</th><th>Prix dès</th><th>Badge</th><th>Devis</th><th>Visible</th><th>Action</th></tr></thead>
    <tbody>
      <?php foreach ($products as $p):
        $cat = current(array_filter($categories, fn($c) => $c['slug'] === ($p['category'] ?? ''))) ?: null;
      ?>
      <tr class="<?= ($p['active'] ?? true) ? '' : 'adm-row-off' ?>">
        <td><b><?= h($p['sortOrder'] ?? '') ?></b></td>
        <td><img src="../<?= h($p['image'] ?? '') ?>" alt="" class="adm-thumb"></td>
        <td><b><?= h($p['name'] ?? '') ?></b><br><small><?= h($p['id'] ?? '') ?></small></td>
        <td><?= $cat ? h($cat['name']) : '<i style="color:#888">aucune</i>' ?></td>
        <td><?= !empty($p['priceFrom']) ? number_format($p['priceFrom'], 0, ',', ' ') . ' ' . h($p['currency'] ?? 'FCFA') : '-' ?></td>
        <td><?= !empty($p['badge']) ? '<span class="adm-badge">' . h($p['badge']) . '</span>' : '-' ?></td>
        <td><?= ($p['configurable'] ?? true) ? '✓ En ligne' : 'Sur mesure' ?></td>
        <td>
          <a href="?action=toggle&id=<?= h($p['id']) ?>" class="adm-toggle">
            <?= ($p['active'] ?? true) ? '✓ Visible' : '✗ Masqué' ?>
          </a>
        </td>
        <td>
          <a href="product-edit.php?id=<?= h($p['id']) ?>" class="adm-btn adm-btn-sec adm-btn-sm">Modifier</a>
          <a href="?action=delete&id=<?= h($p['id']) ?>" class="adm-btn adm-btn-danger adm-btn-sm" onclick="return confirm('Supprimer définitivement « <?= h($p['name']) ?> » ?')">🗑</a>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require_once __DIR__ . '/_footer.php';
