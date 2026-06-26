/* ===========================================================
   PICTOCRAFT — Loader Produits & Settings
   Récupère /data/products.json et /data/settings.json
   Cache les résultats dans window pour éviter les fetch multiples.
   =========================================================== */
(function(global){
  'use strict';

  let _productsCache = null;
  let _settingsCache = null;

  async function loadProducts() {
    if (_productsCache) return _productsCache;
    const r = await fetch('data/products.json?v=' + Date.now());
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
