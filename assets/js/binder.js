/* ===========================================================
   PICTOCRAFT — Binder & Logo Loader v2
   Synchronise les modifications de admin.html dans toutes les pages.

   Approche : recherche TEXTUELLE + remplacement.
   Toutes les valeurs hardcodées dans les HTML sont écrasées par celles
   de window.PICTOCRAFT_CONFIG si elles sont présentes.
   =========================================================== */

(function(){
  'use strict';

  // ========== 1. LOGO AUTO-LOAD ==========
  function loadLogo() {
    const hosts = document.querySelectorAll('.logo');
    if (!hosts.length) return;
    const candidates = ['assets/images/logo/logo.png', 'assets/images/logo/logo.svg'];

    function tryLoad(idx) {
      if (idx >= candidates.length) return;
      const url = candidates[idx];
      const img = new Image();
      img.onload = () => {
        hosts.forEach(host => {
          if (host.querySelector('.logo-img')) return;
          host.innerHTML = `<img src="${url}" alt="Pictocraft SARL" class="logo-img">`;
        });
      };
      img.onerror = () => tryLoad(idx + 1);
      img.src = url;
    }
    tryLoad(0);
  }

  // ========== 2. APPLY CONFIG GLOBALEMENT ==========
  function applyConfig() {
    const cfg = window.PICTOCRAFT_CONFIG;
    if (!cfg) return;
    const c = cfg.contact || {};
    const e = cfg.entreprise || {};

    // --- Valeurs par défaut codées dans les HTML originaux ---
    // On les remplace par les valeurs actuelles du config.
    const DEFAULTS = {
      tel1:    '+237 6 75 14 08 43',
      tel1bis: '+237675140843',
      tel2:    '+237 6 94 93 08 04',
      tel2bis: '+237694930804',
      tel2short:'6 94 93 08 04',
      email1:  'info@pictocraftcmr.com',
      email2:  'pictocraft@outlook.fr',
      whatsapp:'237675140843',
      slogan:  "Travaux d'imprimerie, Commerce général et prestation diverses",
      tagline: "l'énergie créative au service de vos projets.",
      adresse: "Tsinga, face à l'École de Police",
      ville:   "Yaoundé, Cameroun",
      siteUrl: "pictocraftcmr.com",
    };

    // 2a. Données à remplacer (de DEFAULTS → cfg)
    const subs = [];

    if (c.tel1 && c.tel1 !== DEFAULTS.tel1) {
      const newCompact = c.tel1.replace(/\s+/g, '').replace(/^\+/, '+');
      subs.push([DEFAULTS.tel1, c.tel1]);
      subs.push([DEFAULTS.tel1bis, newCompact]);
    }
    if (c.tel2 && c.tel2 !== DEFAULTS.tel2) {
      const newCompact = c.tel2.replace(/\s+/g, '').replace(/^\+/, '+');
      subs.push([DEFAULTS.tel2, c.tel2]);
      subs.push([DEFAULTS.tel2bis, newCompact]);
      // Version courte sans +237
      const short = c.tel2.replace(/\+237\s*/, '');
      if (short !== c.tel2) subs.push([DEFAULTS.tel2short, short]);
    }
    if (c.email1 && c.email1 !== DEFAULTS.email1) subs.push([DEFAULTS.email1, c.email1]);
    if (c.email2 && c.email2 !== DEFAULTS.email2) subs.push([DEFAULTS.email2, c.email2]);
    if (c.whatsapp && c.whatsapp !== DEFAULTS.whatsapp) subs.push([DEFAULTS.whatsapp, c.whatsapp]);
    if (e.slogan && e.slogan !== DEFAULTS.slogan) subs.push([DEFAULTS.slogan, e.slogan]);
    if (e.tagline && e.tagline !== DEFAULTS.tagline) subs.push([DEFAULTS.tagline, e.tagline]);
    if (c.adresse && c.adresse.siege && c.adresse.siege !== DEFAULTS.adresse) {
      subs.push([DEFAULTS.adresse, c.adresse.siege]);
    }

    // 2b. Application : parcourir tous les nodes texte et liens
    if (subs.length === 0) return; // Rien à faire

    function walkText(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        let t = node.nodeValue;
        let changed = false;
        for (const [oldV, newV] of subs) {
          if (t.includes(oldV)) {
            t = t.split(oldV).join(newV);
            changed = true;
          }
        }
        if (changed) node.nodeValue = t;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Mettre à jour les attributs href des tel: / mailto: / wa.me
        if (node.tagName === 'A') {
          const h = node.getAttribute('href');
          if (h) {
            let nh = h;
            for (const [oldV, newV] of subs) nh = nh.split(oldV).join(newV);
            if (nh !== h) node.setAttribute('href', nh);
          }
        }
        // Récursion
        for (const child of node.childNodes) walkText(child);
      }
    }
    walkText(document.body);

    // 2c. Bande slogan : rendu spécifique (slogan + tagline combinés)
    if (e.slogan && e.tagline) {
      document.querySelectorAll('[data-bind-slogan-bar]').forEach(el => {
        const parts = e.slogan.split(/[,·]/).map(s => s.trim()).filter(Boolean);
        el.innerHTML = parts.join(' · ') + ' · <em style="font-weight:500;opacity:.9">« ' + e.tagline + ' »</em>';
      });
    }

    // 2d. Produits : si une liste produits existe dans config, on met à jour
    // les cards correspondantes par leur attribut data-product-id
    if (Array.isArray(cfg.produits