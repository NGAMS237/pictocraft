# Guide de déploiement — Pictocraft

## 1. Tester en local

```bash
cd pictocraft
python3 -m http.server 8000
# Ouvrir http://localhost:8000
```

Pages clés :
- `http://localhost:8000/` — Accueil
- `http://localhost:8000/devis.html` — Catalogue devis
- `http://localhost:8000/devis-produit.html?produit=flyers` — Configurateur flyers
- `http://localhost:8000/test-pricing.html` — Tests du moteur de calcul
- `http://localhost:8000/admin.html` — Back-office produits/textes

## 2. Modifier un prix

**Méthode A — Fichier JSON direct :**
1. Ouvrir `data/products.json` avec Notepad++ ou VS Code
2. Modifier la valeur du champ `basePrice`, `multiplier`, ou `addUnit`
3. Sauvegarder et uploader sur le serveur

**Méthode B — Via admin.html :**
1. Ouvrir `admin.html` dans un navigateur
2. Onglet "Tarifs flyers" pour les flyers, "Produits" pour les autres
3. Modifier puis "Télécharger config.js" et remplacer

## 3. Ajouter un nouveau produit

Éditer `data/products.json`, dans `products[]` ajouter :

```json
{
  "slug": "menus-restaurant",
  "name": "Menus de restaurant",
  "category": "impression-commerciale",
  "description": "Menus plastifiés pour restaurants…",
  "image": "assets/images/products/menus.jpg",
  "active": true,
  "calcMode": "unit_multipliers",
  "basePrice": 1500,
  "unit": "menu",
  "minimumOrder": 25,
  "fields": [
    { "key": "format", "label": "Format", "type": "choice", "required": true,
      "options": [
        { "label": "A5", "value": "A5", "multiplier": 1.0 },
        { "label": "A4", "value": "A4", "multiplier": 1.6 }
      ]
    }
  ],
  "quantities": [25, 50, 100, 250, 500],
  "quantityDiscounts": [
    { "min": 25, "discount": 0 },
    { "min": 100, "discount": 0.15 },
    { "min": 500, "discount": 0.30 }
  ]
}
```

Ajouter l'image dans `assets/images/products/menus.jpg`.

## 4. Changer une image produit

Glisser-déposer une nouvelle image dans `assets/images/products/` en gardant le **même nom de fichier** que celui défini dans `image` du JSON. Par exemple `flyers.jpg`.

Format recommandé : JPG, 800×600 px minimum, < 500 Ko.

## 5. Tester le calcul

Ouvrir `test-pricing.html` dans un navigateur. 6 scénarios sont validés automatiquement :
- Flyers A5 standard 500 ex → **29 250 FCFA**
- Flyers A5 luxe r/v pelliculage 1000 ex
- Bâche 300×100cm œillets
- Brochure A4 32 pages
- Cartes de visite r/v 350g 500
- T-shirts sérigraphie 2 couleurs face avant 50

## 6. Accéder à l'admin

**Admin local (modifier prix/textes) :** ouvrir `admin.html` dans un navigateur sur sa machine.

**Admin Supabase (voir les demandes de devis reçues) :**
- URL : https://supabase.com/dashboard/project/dfdmasejsoibxrvubegu
- Table `pictocraft_quotes` : toutes les demandes envoyées via le configurateur
- Table `pictocraft_reviews` : avis clients en attente de modération

## 7. Déployer sur Hostinger

1. Connecte-toi sur ton compte Hostinger
2. Va dans **Gestionnaire de fichiers** → dossier `public_html/`
3. Supprime les anciens fichiers
4. Upload tout le contenu de `pictocraft/` **sauf** :
   - `admin.html` (à conserver uniquement en local)
   - `README_DEPLOIEMENT.md`
   - `GUIDE-MODIFICATION.md`
   - `test-pricing.html` (à supprimer en prod ou laisser pour debug)
5. Connecte le domaine `pictocraftcmr.com` dans **Domaines** → DNS → CNAME vers `ngams237.github.io`
   OU directement hébergé sur Hostinger (A record vers ton IP Hostinger)

## 8. Sauvegarde

**Sauvegarder les données :**
- Télécharger une copie de `data/products.json` et `data/settings.json` localement
- Sauvegarder le repo GitHub (`git pull` régulièrement)

**Restaurer :**
- Remplacer le fichier JSON par la sauvegarde
- Re-uploader sur le serveur

## 9. Limites actuelles

- Les modifications de produits dans `admin.html` génèrent un nouveau `config.js` à uploader manuellement (pas de backend qui sauve directement)
- Les demandes de devis sont stockées dans Supabase (sécurisé) ; nécessite une connexion internet pour fonctionner
- Pas d'authentification utilisateur côté front (admin protégé par fait qu'il n'est pas en ligne)

## 10. Améliorations futures

- Authentification Supabase Auth pour vrai espace admin en ligne
- Stockage des images produits dans Supabase Storage (pour upload depuis n'importe où)
- Notification email automatique à chaque nouveau devis (Edge Function Supabase + Resend)
- Génération PDF du devis pour téléchargement
- Espace client pour suivre les commandes
- Multilingue (anglais, fulfulde)

---

**Repo GitHub :** https://github.com/NGAMS237/pictocraft  
**Site en ligne :** https://ngams237.github.io/pictocraft/  
**Supabase :** https://supabase.com/dashboard/project/dfdmasejsoibxrvubegu

---

## 11. Notifications email (Phase 3)

Une **Edge Function Supabase** `notify-new-quote` est déployée. Elle envoie un email à `afterworkquebec2025@gmail.com` à chaque nouveau devis OU avis client reçu.

### Activer les emails (gratuit)

1. Crée un compte gratuit sur **[resend.com](https://resend.com)** (100 emails/jour gratuits)
2. Récupère ta clé API (commence par `re_...`)
3. Va dans le Dashboard Supabase :
   - https://supabase.com/dashboard/project/dfdmasejsoibxrvubegu/settings/functions
   - Onglet **Secrets** → **Add new secret**
   - Ajoute 3 secrets :
     - `RESEND_API_KEY` = `re_xxx` (ta clé)
     - `NOTIFY_EMAIL` = `afterworkquebec2025@gmail.com`
     - `FROM_EMAIL` = `onboarding@resend.dev` (par défaut Resend, ou ton propre domaine vérifié)
4. C'est tout — la prochaine soumission de devis déclenche l'email automatiquement

### Tester l'Edge Function

```bash
curl -X POST https://dfdmasejsoibxrvubegu.supabase.co/functions/v1/notify-new-quote \
  -H "Content-Type: application/json" \
  -d '{"kind":"devis","quote":{"produit_nom":"Flyers test","quantite":500,"total":29250,"client_nom":"Test","client_telephone":"+237 6 75 14 08 43","commentaire":"Test"}}'
```

Si RESEND_API_KEY n'est pas configurée, la fonction renvoie un statut "simulated" mais ne plante pas.

## 12. Upload d'images via admin Supabase

Le bucket Storage **`pictocraft-images`** est public en lecture, écriture protégée par auth admin.

### Pour uploader une image
1. Connecte-toi à `/admin-pro.html`
2. Onglet **🖼️ Images** → bouton **⬆ Uploader une image**
3. Une fois uploadée, clique sur **📋 Copier l'URL**
4. Va dans **Produits** → télécharge `products.json`, colle l'URL dans le champ `image` du produit voulu, re-uploade le JSON

### URL publique des images
Format : `https://dfdmasejsoibxrvubegu.supabase.co/storage/v1/object/public/pictocraft-images/<nom-fichier>`

---

## 13. Module Admin PHP (Phase 4 — Hostinger)

### Structure créée
```
admin/
├── _bootstrap.php       Configuration commune (sessions, helpers, auth)
├── _header.php          Header HTML admin
├── _footer.php          Footer HTML admin
├── login.php            Page de connexion
├── logout.php           Déconnexion (détruit session)
├── dashboard.php        Tableau de bord (stats produits)
├── products.php         Liste/Suppression/Masquage des produits
├── product-edit.php     Création/Modification d'un produit + upload image
├── images.php           Bibliothèque d'images, upload, copie chemin
├── settings.php         Paramètres entreprise, contacts, mot de passe
├── backup.php           Sauvegarde ZIP + restauration JSON/ZIP
└── .htaccess            Bloque accès direct aux JSON

api/                     (réservé pour endpoints futurs)
backups/                 Sauvegardes automatiques avant chaque modif
└── .htaccess            Bloque accès public direct
data/uploads/            (réservé)
assets/images/uploads/   Images uploadées via l'admin
```

### Première connexion

1. Déploie tous les fichiers sur Hostinger via FTP ou Gestionnaire de fichiers
2. Vérifie que **PHP 8.0+** est activé (Hostinger : Panel → PHP Configuration)
3. Vérifie les permissions :
   - `data/` : 755 (lecture/écriture)
   - `backups/` : 755 (lecture/écriture)
   - `assets/images/uploads/` : 755 (lecture/écriture)
4. Va sur : `https://tondomaine.com/admin/login.php`
5. Mot de passe initial : **`Pictocraft2026!`**
6. **IMMÉDIATEMENT** : va dans Paramètres → change le mot de passe

### Comment modifier un produit
1. Admin → 🛍️ Produits
2. Clic sur "Modifier" pour le produit voulu
3. Modifie nom, description, catégorie, prix, badge, etc.
4. Pour l'image : "Uploader une nouvelle image" (max 2 Mo, jpg/png/webp)
5. Coche/décoche "Produit visible sur le site"
6. Coche/décoche "Devis en ligne disponible"
7. Enregistrer

### Comment masquer un produit sans le supprimer
- Admin → Produits → clic sur "✓ Visible" → bascule à "✗ Masqué"

### Comment changer le NIP/mot de passe admin
- Admin → ⚙ Paramètres → champ "Nouveau mot de passe admin" → Enregistrer

### Comment publier sur Hostinger
1. **Compresse** tout le dossier `pictocraft/` en ZIP (sauf `token github.txt` et `.git/`)
2. Connecte-toi à ton compte Hostinger
3. Va dans **Gestionnaire de fichiers** → dossier `public_html/`
4. Upload le ZIP, extrais-le
5. Vérifie que PHP est activé (PHP 8.0+ requis)
6. Dans **Paramètres** → **PHP Configuration** : assure-toi que les extensions `zip`, `mbstring`, `fileinfo` sont actives
7. Va sur `https://tondomaine.com/admin/login.php` et connecte-toi

### Connecter le nom de domaine
- Hostinger → Domaines → ton domaine → DNS → A record vers ton IP Hostinger (déjà fait si c'est ton hébergeur principal)

### ⚠️ Ce qui ne fonctionnera PAS sur GitHub Pages
- Toute la partie `/admin/*.php` (GitHub Pages ne supporte pas PHP)
- L'upload d'images via `admin/product-edit.php` ou `admin/images.php`
- La sauvegarde ZIP `admin/backup.php`

Sur GitHub Pages, utilise plutôt :
- `/admin-pro.html` (back-office Supabase Auth) qui marche partout
- L'édition de `data/products.json` directement via le repo

### Prochaines étapes recommandées
1. **Tester sur Hostinger** : upload, vérifier PHP, créer un produit test
2. **Activer l'email automatique** : configurer Resend (voir section 11)
3. **Ajouter d'autres produits configurables** (étiquettes, menus, etc. avec calcMode adapté)
4. **Migrer le domaine** `pictocraftcmr.com` vers Hostinger si pas déjà fait
5. **Ajouter `services.json` et `realisations.json`** pour éditer ces 2 pages depuis l'admin aussi
