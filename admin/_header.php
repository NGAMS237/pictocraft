<?php require_once __DIR__ . '/_bootstrap.php'; require_login(); ?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title><?= h($title ?? 'Admin') ?> — Pictocraft</title>
<meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body>
<header class="adm-top">
  <div class="adm-top-inner">
    <a href="dashboard.php" class="adm-brand">⚙ Admin Pictocraft</a>
    <nav class="adm-nav">
      <a href="dashboard.php" <?= basename($_SERVER['PHP_SELF']) === 'dashboard.php' ? 'class="active"' : '' ?>>📊 Tableau de bord</a>
      <a href="products.php" <?= basename($_SERVER['PHP_SELF']) === 'products.php' ? 'class="active"' : '' ?>>🛍️ Produits</a>
      <a href="services.php" <?= basename($_SERVER['PHP_SELF']) === 'services.php' ? 'class="active"' : '' ?>>🎯 Services</a>
      <a href="realisations.php" <?= basename($_SERVER['PHP_SELF']) === 'realisations.php' ? 'class="active"' : '' ?>>🖼️ Réalisations</a>
      <a href="images.php" <?= basename($_SERVER['PHP_SELF']) === 'images.php' ? 'class="active"' : '' ?>>🖼️ Images</a>
      <a href="settings.php" <?= basename($_SERVER['PHP_SELF']) === 'settings.php' ? 'class="active"' : '' ?>>⚙ Paramètres</a>
      <a href="backup.php" <?= basename($_SERVER['PHP_SELF']) === 'backup.php' ? 'class="active"' : '' ?>>💾 Sauvegarde</a>
    </nav>
    <a href="logout.php" class="adm-logout">Déconnexion</a>
  </div>
</header>
<main class="adm-main">
<?php $f = get_flash(); if ($f): ?>
  <div class="adm-flash adm-flash-<?= h($f['type']) ?>"><?= h($f['msg']) ?></div>
<?php endif; ?>
