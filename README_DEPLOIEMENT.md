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
