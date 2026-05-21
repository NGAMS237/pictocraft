# Pictocraft — Site web

Site web officiel de **Pictocraft SARL** — Imprimerie, infographie, sérigraphie, web et événementiel à Yaoundé, Cameroun.

🌐 **Site en production** : https://www.pictocraftcmr.com
📞 **Contact** : +237 6 75 14 08 43 · info@pictocraftcmr.com
📍 **Adresse** : Tsinga, face à l'École de Police · Yaoundé, Cameroun

> *« L'énergie créative au service de vos projets. »*

## Structure du projet

```
pictocraft/
├── index.html              Accueil avec hero + catalogue + avis
├── produits.html           Catalogue complet (24 produits)
├── produit-flyers.html     Page produit + configurateur de devis
├── a-propos.html           Histoire & engagements
├── contact.html            Contact & adresses
├── faq.html                Questions fréquentes
├── admin.html              Back-office (NE PAS publier en ligne)
├── GUIDE-MODIFICATION.md   Guide utilisateur en français
└── assets/
    ├── css/style.css       Design system complet
    ├── js/
    │   ├── config.js       Données éditables (généré par admin.html)
    │   ├── binder.js       Inject config dans le DOM
    │   ├── main.js         Animations, carrousel, scroll reveal
    │   ├── configurator.js Configurateur de devis flyers
    │   └── reviews.js      Système d'avis (Supabase)
    └── images/             Logo, produits, galerie
```

## Fonctionnalités

- ✅ **Site multi-pages responsive** avec animations modernes
- ✅ **Configurateur de devis** flyers en temps réel (4 formats × 4 papiers × finitions × remises volume)
- ✅ **Système d'avis clients** connecté à Supabase avec modération
- ✅ **Back-office privé** (admin.html) pour modifier prix, textes, images sans code
- ✅ **Upload d'images produits** par drag-and-drop dans le back-office
- ✅ **Logo auto-load** : déposez votre PNG/SVG dans `assets/images/logo/`
- ✅ **SEO optimisé** : robots index, meta, OG tags
- ✅ **Paiements locaux** : Orange Money, MTN MoMo, virement

## Comment modifier le site

Voir **[GUIDE-MODIFICATION.md](GUIDE-MODIFICATION.md)** pour les instructions complètes.

### En résumé :

1. **Ouvrir `admin.html` dans un navigateur** (en local)
2. Modifier les champs : entreprise, contacts, produits, prix, tarifs
3. Cliquer sur **"Télécharger config.js"**
4. Remplacer `assets/js/config.js` par le fichier téléchargé
5. Le site est mis à jour automatiquement

### Pour changer une image produit :

Renommer votre nouvelle image avec le nom existant (ex: `flyers.jpg`) et la déposer dans `assets/images/products/`. **OU** utiliser le bouton "📷 Changer" dans le back-office.

## Sécurité

⚠️ **Ne JAMAIS publier en ligne** :
- `admin.html` (back-office privé)
- `GUIDE-MODIFICATION.md` (documentation interne)
- Tout fichier `token*.txt` ou `.env*`

## Stack technique

- **Frontend** : HTML5, CSS3, JavaScript vanilla (zéro dépendance)
- **Base de données** : Supabase (avis clients + modération)
- **Fonts** : Bricolage Grotesque, Manrope, Pacifico (Google Fonts)
- **Hébergement** : compatible Hostinger, GitHub Pages, Netlify, Vercel

---

© 2026 Pictocraft SARL · Tous droits réservés
