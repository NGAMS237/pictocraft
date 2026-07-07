/* ===========================================================
   PICTOCRAFT — Loader Produits & Settings
   Récupère /data/products.json et /data/settings.json
   Cache les résultats dans window pour éviter les fetch multiples.
   =========================================================== */
(function(global){
  'use strict';

  let _productsCache = null;
  let _settingsCache = null;

  const SUPABASE_URL = 'https://dfdmasejsoibxrvubegu.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_FUNJl2eCG1rDiEZOUJsQdA_GQIl2YZM';

  async function loadProducts() {
    if (_productsCache) return _productsCache;
    // 1. Essai Supabase : config active (admin)
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/pictocraft_products_config?active=eq.true&order=created_at.desc&limit=1&_=` + Date.now(), {
        headers: { 'apikey': SUPABASE_KEY, 'Cache-Control': 'no-cache' },
        cache: 'no-store'
      });
      if (r.ok) {
        const arr = await r.json();
        if (arr && arr.length && arr[0].config && arr[0].config.products) {
          _productsCache = arr[0].config;
          return _productsCache;
        }
      }
    } catch(e) { /* silencieux : fallback statique */ }
    // 2. Fallback : products.json statique
    const r = await fetch('data/products.json?v=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('Erreur chargement produits : ' + r.status);
    _productsCache = await r.json();
    return _productsCache;
  }

  async function loadSettings() {
    if (_settingsCache) return _settingsCache;
    const r = await fetch('data/settings.json?v=' + Date.now());
    if (!r.ok) throw new Error('Erreur chargement settings : ' + r.status);
    _settingsCache = await r.json();
    return _settingsCache;
  }

  async function loadAll() {
    const [products, settings] = await Promise.all([loadProducts(), loadSettings()]);
    return { products: products, settings: settings };
  }

  function findProduct(productsData, slug) {
    if (!productsData || !productsData.products) return null;
    return productsData.products.find(p => p.slug === slug && p.active !== false);
  }

  function findCategory(productsData, slug) {
    if (!productsData || !productsData.categories) return null;
    return productsData.categories.find(c => c.slug === slug);
  }

  global.PictocraftProducts = {
    loadProducts: loadProducts,
    loadSettings: loadSettings,
    loadAll: loadAll,
    findProduct: findProduct,
    findCategory: findCategory
  };
})(typeof window !== 'undefined' ? window : globalThis);
