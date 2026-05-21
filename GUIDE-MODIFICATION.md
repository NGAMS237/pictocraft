# Guide de modification — Site Pictocraft

Ce guide vous explique comment modifier facilement votre site web sans connaissances en code.

---

## 🚀 Méthode rapide : le back-office

**Le moyen le plus simple de tout modifier sans toucher au code.**

### Étape 1 : Ouvrir le back-office

1. Ouvrez le dossier de votre site
2. Double-cliquez sur le fichier `admin.html`
3. Le panneau d'administration s'ouvre dans votre navigateur

### Étape 2 : Modifier ce que vous voulez

Le menu de gauche contient 6 sections :

| Section | Permet de modifier |
|---------|-------------------|
| 🏢 **Entreprise** | Nom, slogan, tagline, année de fondation, fondateur |
| 📞 **Contacts** | Téléphones, emails, adresses, horaires, réseaux sociaux |
| 🛍️ **Produits & Prix** | Ajouter / supprimer / modifier les produits affichés |
| 💰 **Tarifs flyers** | Grille tarifaire du configurateur de devis |
| 💾 **Export / Import** | Sauvegarder vos modifications |
| ❓ **Aide** | Documentation intégrée |

### Étape 3 : Sauvegarder

1. Allez dans **💾 Export / Import**
2. Cliquez sur **« Télécharger config.js »**
3. Le fichier `config.js` est téléchargé
4. **Glissez ce fichier dans le dossier `assets/js/` de votre site** (écrasez l'ancien)
5. Actualisez votre site dans le navigateur — les modifications sont visibles

> ⚠️ **Important** : Le fichier `admin.html` ne doit **jamais** être mis en ligne publiquement. Utilisez-le uniquement sur votre ordinateur.

---

## 🖼️ Changer une image produit

**Sans toucher au code, juste un drag-and-drop.**

1. Préparez votre nouvelle image :
   - Format : JPG ou PNG
   - Dimensions : au moins 800 × 600 pixels (idéalement 1200 × 900)
   - Poids : moins de 500 Ko pour rester rapide

2. Renommez votre image avec **exactement le même nom** que l'ancienne. Voici la liste :

| Produit | Nom du fichier |
|---------|----------------|
| Flyers | `flyers.jpg` |
| Cartes de visite | `cartes-visite.jpg` |
| Brochures | `brochures.jpg` |
| Affiches | `affiche.jpg` |
| Calendriers | `maquette.jpg` |
| Roll-ups | `rollup-echo.jpg` |
| Sérigraphie textile | `textile.jpg` |
| Bâches | `billboard.jpg` |
| Magazines | `magazines.jpg` |
| Emballages | `emballage.jpg` |
| Posters | `poster.jpg` |
| Chevalets | `chevalet.jpg` |
| Bureau | `bureau.jpg` |
| CV | `cv.jpg` |

3. **Glissez votre image renommée dans le dossier `assets/images/products/`** en remplaçant l'ancienne

4. Actualisez votre site

---

## 🎨 Changer le logo

1. Préparez votre logo officiel :
   - Format **PNG** (fond transparent) ou **SVG** (vectoriel — recommandé)
   - Largeur : au moins 600 pixels

2. Renommez le fichier en `logo.png` ou `logo.svg`

3. Placez le fichier dans `assets/images/logo/`

4. Le site utilisera automatiquement le nouveau logo

> Si vous ne fournissez pas de logo, le site affiche une version texte stylée avec les couleurs officielles.

---

## 📝 Changer un texte directement dans une page

Si vous voulez modifier un texte précis (par exemple, le titre d'une section) :

1. Ouvrez le fichier HTML concerné avec **Notepad++** (Windows) ou **VS Code** (recommandé, gratuit)

2. Utilisez **Ctrl + F** pour rechercher la phrase que vous voulez modifier

3. Modifiez-la directement, puis sauvegardez avec **Ctrl + S**

### Fichiers et leur rôle

| Fichier | Contenu |
|---------|---------|
| `index.html` | Page d'accueil |
| `produits.html` | Catalogue complet |
| `produit-flyers.html` | Page produit flyers + configurateur |
| `a-propos.html` | Histoire et engagements |
| `contact.html` | Formulaire de contact |
| `faq.html` | Questions fréquentes |
| `admin.html` | Back-office (à ne pas mettre en ligne) |

---

## 💰 Modifier la grille de prix du configurateur

**Méthode recommandée : via admin.html → onglet « Tarifs flyers »**

Le configurateur calcule un prix selon cette formule :

```
Prix = (prix_base × multiplicateur_papier × multiplicateur_impression × (1 + finition)) 
       × (1 - remise_volume) × quantité 
       + frais_livraison
```

### Exemple

Pour 500 flyers A5, papier standard, recto, pelliculage, livraison express :

- Prix de base A5 : **75 FCFA**
- Multiplicateur papier standard : **× 1.0**
- Multiplicateur recto : **× 1.0**
- Finition pelliculage : **+ 18 %** → × 1.18
- Remise volume (500 ex.) : **− 22 %** → × 0.78

```
Prix unitaire = 75 × 1.0 × 1.0 × 1.18 × 0.78 = 69 FCFA
Sous-total = 69 × 500 = 34 500 FCFA
+ Frais livraison express = 5 000 FCFA
─────────────────────────
TOTAL = 39 500 FCFA
```

---

## 🌐 Mettre votre site en ligne

### Option 1 : Via Hostinger (votre hébergeur actuel)

1. Connectez-vous à votre espace Hostinger
2. Accédez au gestionnaire de fichiers (File Manager)
3. Allez dans `public_html/`
4. **Supprimez** les anciens fichiers
5. **Uploadez** tous les fichiers du dossier `pictograft/` :
   - ⚠️ Sauf `admin.html` (à garder localement, pas en ligne)
   - ⚠️ Sauf `GUIDE-MODIFICATION.md` (à garder localement)

### Option 2 : Via GitHub Pages

1. Créez un dépôt GitHub `pictocraft`
2. Uploadez tous les fichiers (sauf `admin.html` et `GUIDE-MODIFICATION.md`)
3. Activez GitHub Pages dans Settings → Pages
4. Configurez votre domaine `pictocraftcmr.com` pour pointer vers GitHub Pages

---

## ⚠️ Avant de mettre en ligne — checklist

- [ ] Le fichier `admin.html` n'est **PAS** uploadé sur le serveur
- [ ] Le fichier `GUIDE-MODIFICATION.md` n'est **PAS** uploadé sur le serveur
- [ ] Le vrai logo `logo.png` ou `logo.svg` est placé dans `assets/images/logo/`
- [ ] Toutes les vraies images produits sont en place dans `assets/images/products/`
- [ ] Les liens vers Facebook / Instagram / LinkedIn / WhatsApp ont vos vrais profils (à compléter dans admin.html → Contacts → Réseaux sociaux)
- [ ] Le SEO est activé (`<meta name="robots" content="index,follow">` — déjà fait sur toutes les pages)
- [ ] Vous avez testé la navigation entre toutes les pages

---

## 🆘 Problèmes fréquents

### Mon nouveau logo ne s'affiche pas

- Vérifiez que le fichier s'appelle bien `logo.png` (tout en minuscules)
- Vérifiez qu'il est dans `assets/images/logo/`
- Faites **Ctrl + F5** pour rafraîchir sans cache

### Mes modifications dans admin.html ne sont pas visibles sur le site

- Avez-vous bien téléchargé le fichier `config.js` ?
- Avez-vous bien remplacé l'ancien `assets/js/config.js` ?
- Faites **Ctrl + F5** pour vider le cache navigateur

### Une image produit n'apparaît pas

- Vérifiez que le nom du fichier est exactement le même (sensible à la casse : `flyers.jpg` ≠ `Flyers.JPG`)
- Vérifiez que l'image n'est pas corrompue (essayez de l'ouvrir directement)

### Le configurateur affiche des erreurs

- Les nombres dans admin.html → Tarifs doivent être des nombres entiers ou décimaux (utilisez `.` pas `,`)
- Les remises sont en décimal : 22% = `0.22` (pas `22`)

---

## 📞 Support

Pour toute question technique, contactez votre développeur web.

---

**Document généré pour Pictocraft SARL**
*« l'énergie créative au service de vos projets. »*
