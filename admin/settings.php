<?php $title = 'Paramètres'; require_once __DIR__ . '/_header.php';
$s = read_json(SETTINGS_FILE);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!check_csrf()) flash('Session expirée.', 'error');
    else {
        $s['company']['name']    = $_POST['companyName'] ?? '';
        $s['company']['slogan']  = $_POST['slogan'] ?? '';
        $s['company']['tagline'] = $_POST['tagline'] ?? '';
        $s['company']['address'] = $_POST['address'] ?? '';
        $s['contact']['phone1']  = $_POST['phone1'] ?? '';
        $s['contact']['phone2']  = $_POST['phone2'] ?? '';
        $s['contact']['email1']  = $_POST['email1'] ?? '';
        $s['contact']['email2']  = $_POST['email2'] ?? '';
        $s['contact']['whatsapp']= preg_replace('/\D/', '', $_POST['whatsapp'] ?? '');
        $s['legalNotice']        = $_POST['legalNotice'] ?? '';
        $s['currency']['code']   = $_POST['currency'] ?? 'FCFA';
        $s['currency']['symbol'] = $_POST['currency'] ?? 'FCFA';
        // Mot de passe admin
        if (!empty($_POST['newPassword'])) {
            if (strlen($_POST['newPassword']) < 4) flash('Mot de passe trop court (min 4 caractères).', 'error');
            else { set_password($_POST['newPassword']); flash('Mot de passe modifié + paramètres enregistrés.', 'success'); write_json(SETTINGS_FILE, $s); header('Location: settings.php'); exit; }
        }
        write_json(SETTINGS_FILE, $s);
        flash('Paramètres enregistrés.', 'success');
        header('Location: settings.php'); exit;
    }
}
?>
<h1>⚙ Paramètres généraux</h1>
<div class="adm-card">
<form method="POST">
  <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
  <h2>Entreprise</h2>
  <div class="adm-field"><label>Nom de l'entreprise</label><input type="text" name="companyName" value="<?= h($s['company']['name'] ?? '') ?>"></div>
  <div class="adm-field"><label>Slogan officiel</label><input type="text" name="slogan" value="<?= h($s['company']['slogan'] ?? '') ?>"></div>
  <div class="adm-field"><label>Tagline (sous-titre)</label><input type="text" name="tagline" value="<?= h($s['company']['tagline'] ?? '') ?>"></div>
  <div class="adm-field"><label>Adresse</label><input type="text" name="address" value="<?= h($s['company']['address'] ?? '') ?>"></div>

  <h2 style="margin-top:24px">Contacts</h2>
  <div class="adm-grid-2">
    <div class="adm-field"><label>Téléphone principal</label><input type="tel" name="phone1" value="<?= h($s['contact']['phone1'] ?? '') ?>"></div>
    <div class="adm-field"><label>Téléphone secondaire</label><input type="tel" name="phone2" value="<?= h($s['contact']['phone2'] ?? '') ?>"></div>
  </div>
  <div class="adm-grid-2">
    <div class="adm-field"><label>Email principal</label><input type="email" name="email1" value="<?= h($s['contact']['email1'] ?? '') ?>"></div>
    <div class="adm-field"><label>Email secondaire</label><input type="email" name="email2" value="<?= h($s['contact']['email2'] ?? '') ?>"></div>
  </div>
  <div class="adm-field"><label>Numéro WhatsApp <small>(format international sans + ni espaces, ex: 237675140843)</small></label><input type="text" name="whatsapp" value="<?= h($s['contact']['whatsapp'] ?? '') ?>"></div>

  <h2 style="margin-top:24px">Devise & légal</h2>
  <div class="adm-grid-2">
    <div class="adm-field"><label>Devise</label><input type="text" name="currency" value="<?= h($s['currency']['code'] ?? 'FCFA') ?>"></div>
    <div class="adm-field"></div>
  </div>
  <div class="adm-field"><label>Texte légal devis</label><textarea name="legalNotice" rows="2"><?= h($s['legalNotice'] ?? '') ?></textarea></div>

  <h2 style="margin-top:24px">Sécurité</h2>
  <div class="adm-field"><label>Nouveau mot de passe admin <small>(laisse vide pour ne pas changer)</small></label><input type="password" name="newPassword" autocomplete="new-password"></div>

  <div class="adm-actions" style="margin-top:20px">
    <button type="submit" class="adm-btn adm-btn-pri">💾 Enregistrer</button>
  </div>
</form>
</div>
<?php require_once __DIR__ . '/_footer.php';
