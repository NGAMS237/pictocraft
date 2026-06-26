<?php require_once __DIR__ . '/_bootstrap.php';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!check_csrf()) { $error = 'Session expirée, recharge la page.'; }
    else {
        $hash = get_password_hash();
        // Premier login : si pas de hash, on accepte le mot de passe de bootstrap "Pictocraft2026!"
        if (empty($hash)) {
            if ($_POST['password'] === 'Pictocraft2026!') {
                set_password('Pictocraft2026!');
                $_SESSION['pc_admin'] = ['email' => 'admin', 'login_at' => time()];
                flash('Bienvenue ! Pense à changer ton mot de passe dans Paramètres.', 'success');
                header('Location: dashboard.php'); exit;
            } else { $error = 'Mot de passe incorrect.'; }
        } elseif (password_verify($_POST['password'] ?? '', $hash)) {
            $_SESSION['pc_admin'] = ['email' => 'admin', 'login_at' => time()];
            header('Location: dashboard.php'); exit;
        } else { $error = 'Mot de passe incorrect.'; }
    }
}
?><!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Connexion — Admin Pictocraft</title><meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Manrope:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/admin.css">
</head><body>
<div class="adm-login">
  <div class="adm-login-card">
    <h1>🔐 Administration Pictocraft</h1>
    <p class="adm-sub">Connexion réservée au personnel autorisé</p>
    <?php if ($error): ?><div class="adm-error"><?= h($error) ?></div><?php endif; ?>
    <form method="POST">
      <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
      <label>Mot de passe ou NIP</label>
      <input type="password" name="password" required autofocus autocomplete="current-password">
      <button type="submit">Se connecter →</button>
    </form>
    <p class="adm-hint">Premier login : mot de passe par défaut <code>Pictocraft2026!</code> — à changer immédiatement après connexion.</p>
  </div>
</div></body></html>
