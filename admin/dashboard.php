<?php $title = 'Tableau de bord'; require_once __DIR__ . '/_header.php';
$products = read_json(PRODUCTS_FILE)['products'] ?? [];
$activeCount = count(array_filter($products, fn($p) => ($p['active'] ?? true) !== false));
$inactiveCount = count($products) - $activeCount;
$configurable = count(array_filter($products, fn($p) => ($p['configurable'] ?? true) !== false));
$lastModified = file_exists(PRODUCTS_FILE) ? date('d/m/Y H:i', filemtime(PRODUCTS_FILE)) : '-';
?>
<h1>📊 Tableau de bord</h1>
<div class="adm-stats">
  <div class="adm-stat"><div class="v"><?= count($products) ?></div><div class="l">Produits total</div></div>
  <div class="adm-stat"><div class="v" style="color:#2E7D5F"><?= $activeCount ?></div><div class="l">Produits visibles</div></div>
  <div class="adm-stat"><div class="v" style="color:#960F2D"><?= $configurable ?></div><div class="l">Devis en ligne</div></div>
  <div class="adm-stat"><div class="v" style="color:#003C78;font-size:1.2rem;font-weight:600"><?= h($lastModified) ?></div><div class="l">Dernière modif</div></div>
</div>
<div class="adm-card">
  <h2>Actions rapides</h2>
  <div class="adm-actions">
    <a href="products.php" class="adm-btn adm-btn-pri">🛍️ Gérer les produits</a>
    <a href="images.php" class="adm-btn adm-btn-sec">🖼️ Gérer les images</a>
    <a href="settings.php" class="adm-btn adm-btn-ghost">⚙ Paramètres généraux</a>
    <a href="backup.php" class="adm-btn adm-btn-ghost">💾 Sauvegarder</a>
  </div>
</div>
<div class="adm-card">
  <h2>Aide rapide</h2>
  <ul class="adm-help">
    <li><b>Modifier un prix</b> → Produits → clic sur le produit → modifie "Prix à partir de" → Enregistrer</li>
    <li><b>Changer une image</b> → Produits → clic sur le produit → Choisir un fichier → Enregistrer</li>
    <li><b>Masquer un produit</b> → Produits → clic sur le produit → décoche "Produit visible sur le site"</li>
    <li><b>Ajouter un produit</b> → Produits → bouton "+ Nouveau produit"</li>
    <li><b>Changer le mot de passe</b> → Paramètres → Nouveau mot de passe</li>
    <li><b>Sauvegarde des données</b> → Sauvegarde → Télécharger</li>
  </ul>
</div>
<?php require_once __DIR__ . '/_footer.php';
