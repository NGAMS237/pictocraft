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
