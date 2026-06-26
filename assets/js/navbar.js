/* ===========================================================
   PICTOCRAFT — Navbar partagée
   Injecte le même header dans toutes les pages.
   Usage : <div id="pc-navbar" data-active="accueil"></div>
   =========================================================== */
(function(){
  'use strict';

  const SVG = {
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>',
    services:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>',
    gallery:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
    whatsapp:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.9-1.5-4-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5 0 1.5 1.1 2.9 1.2 3.1.1.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zm-5.5 7.6c-1.8 0-3.5-.5-5-1.4l-3.5 1.1 1.1-3.4c-1-1.6-1.6-3.5-1.6-5.5 0-5.6 4.5-10.1 10-10.1 5.6 0 10.1 4.5 10.1 10.1S17.5 22 12 22z"/></svg>',
    phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mailIcon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    burger:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  // Menus principaux
  const MENU = [
    { key:'accueil',     label:'Accueil',          href:'index.html',         icon: SVG.home },
    { key:'devis',       label:'Produits & Devis', href:'devis.html',         icon: SVG.box },
    { key:'services',    label:'Services',         href:'services.html',      icon: SVG.services },
    { key:'realisations',label:'Réalisations',     href:'realisations.html',  icon: SVG.gallery },
    { key:'apropos',     label:'À propos',         href:'a-propos.html',      icon: SVG.info },
    { key:'faq',         label:'FAQ',              href:'faq.html',           icon: SVG.help },
    { key:'contact',     label:'Contact',          href:'contact.html',       icon: SVG.mail }
  ];

  function buildHTML(activeKey) {
    const navItems = MENU.map(m => {
      const cls = m.key === activeKey ? ' class="active"' : '';
      return `<a href="${m.href}"${cls}>${m.icon}${m.label}</a>`;
    }).join('\n      ');

    const mobileItems = MENU.map(m => {
      const cls = m.key === activeKey ? ' class="active"' : '';
      return `<a href="${m.href}"${cls}>${m.label}</a>`;
    }).join('\n    ');

    return `
<!-- BANDE SLOGAN OFFICIEL -->
<div data-bind-slogan-bar style="background:#960F2D;color:#fff;text-align:center;padding:6px 16px;font-size:.78rem;font-weight:600;letter-spacing:.04em">
  Travaux d'imprimerie · Commerce général · Prestations diverses · <em style="font-weight:500;opacity:.9">« l'énergie créative au service de vos projets »</em>
</div>

<!-- UTILITY BAR -->
<div class="utility-bar">
  <div class="container">
    <div class="utility-left">
      <span class="util-item">${SVG.phone}<a href="tel:+237675140843" data-bind-tel1>+237 6 75 14 08 43</a> <span style="opacity:.6">·</span> <a href="tel:+237694930804" data-bind-tel2>+237 6 94 93 08 04</a></span>
      <span class="util-item">${SVG.mailIcon}<a href="mailto:info@pictocraftcmr.com" data-bind-email1>info@pictocraftcmr.com</a></span>
      <span class="util-item">${SVG.clock}Lun–Ven : 8h – 17h</span>
    </div>
    <div class="utility-right">
      <a href="faq.html">Aide & FAQ</a>
      <span>🇨🇲 Yaoundé · FR</span>
    </div>
  </div>
</div>

<!-- HEADER PILL FLOTTANT MODERNE -->
<header class="site-header">
  <div class="container header-inner">
    <a href="index.html" class="logo" aria-label="Pictocraft" data-logo-host>
      <span class="p">P</span><span class="name">ictocraft</span><span class="sarl">SARL</span>
    </a>
    <nav class="main-nav">
      ${navItems}
    </nav>
    <div class="header-actions">
      <a href="https://wa.me/237675140843" data-bind-whatsapp class="icon-btn" aria-label="WhatsApp" title="WhatsApp" style="color:#25D366">${SVG.whatsapp}</a>
      <a href="devis.html" class="btn-primary"><span class="long">Devis gratuit</span><span>→</span></a>
      <button class="icon-btn menu-toggle" aria-label="Menu" onclick="document.getElementById('pc-mobile-menu').classList.add('open');document.getElementById('pc-mobile-overlay').classList.add('open');document.body.style.overflow='hidden'">${SVG.burger}</button>
    </div>
  </div>
</header>

<!-- MOBILE MENU -->
<div id="pc-mobile-overlay" class="mobile-overlay" onclick="document.getElementById('pc-mobile-menu').classList.remove('open');this.classList.remove('open');document.body.style.overflow=''"></div>
<aside id="pc-mobile-menu" class="mobile-menu">
  <button class="close-btn" onclick="document.getElementById('pc-mobile-menu').classList.remove('open');document.getElementById('pc-mobile-overlay').classList.remove('open');document.body.style.overflow=''">${SVG.close}</button>
  <a href="index.html" class="logo" style="font-size:1.4rem"><span class="p">P</span><span class="name">ictocraft</span></a>
  <nav>
    ${mobileItems}
    <a href="https://wa.me/237675140843" style="color:#25D366">💬 WhatsApp</a>
  </nav>
  <div style="margin-top:30px">
    <a href="devis.html" class="btn-primary" style="width:100%;justify-content:center">Devis gratuit →</a>
  </div>
</aside>
`;
  }

  function inject() {
    const host = document.getElementById('pc-navbar');
    if (!host) return;
    const active = host.dataset.active || '';
    host.outerHTML = buildHTML(active);

    // Sticky header scroll effect
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
