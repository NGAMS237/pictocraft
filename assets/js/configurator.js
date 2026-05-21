/* ===========================================================
   PICTO CRAFT — Configurateur de devis (Flyers exemple)
   Tarifs estimatifs en FCFA (à ajuster par l'équipe)
   =========================================================== */

(function(){
  'use strict';

  // Si un config.js est présent (via admin.html), on l'utilise.
  // Sinon, valeurs par défaut codées en dur ci-dessous.
  const CFG = (window.PICTOCRAFT_CONFIG && window.PICTOCRAFT_CONFIG.tarifs_flyers) || null;

  const PRICING = {
    formats: {
      'A6':   { base: CFG ? CFG.formats.A6 : 50,  label: 'A6 (105×148mm)' },
      'A5':   { base: CFG ? CFG.formats.A5 : 75,  label: 'A5 (148×210mm)' },
      'A4':   { base: CFG ? CFG.formats.A4 : 120, label: 'A4 (210×297mm)' },
      'A3':   { base: CFG ? CFG.formats.A3 : 240, label: 'A3 (297×420mm)' },
    },
    papers: {
      'std-135': { mult: CFG ? CFG.papiers.std  : 1.0,  label: 'Standard 135g brillant' },
      'mat-170': { mult: CFG ? CFG.papiers.mat  : 1.18, label: 'Mat 170g' },
      'lux-300': { mult: CFG ? CFG.papiers.lux  : 1.45, label: 'Luxe 300g' },
      'recy':    { mult: CFG ? CFG.papiers.recy : 1.22, label: 'Recyclé 250g' },
    },
    sides: {
      'recto':       { mult: 1.0, label: 'Recto seul' },
      'recto-verso': { mult: CFG ? CFG.impression.rv : 1.55, label: 'Recto/Verso' },
    },
    finitions: {
      'aucune':    { add: 0, label: 'Aucune' },
      'pellicule': { add: CFG ? CFG.finitions.pelli   : 0.18, label: 'Pelliculage' },
      'vernis':    { add: CFG ? CFG.finitions.vernis  : 0.25, label: 'Vernis sélectif' },
      'arrondi':   { add: CFG ? CFG.finitions.arrondi : 0.12, label: 'Coins arrondis' },
    },
    quantityTiers: [
      { qty: 100,    discount: 0,                              express: false },
      { qty: 250,    discount: CFG ? CFG.remises.q250   : 0.12, express: false },
      { qty: 500,    discount: CFG ? CFG.remises.q500   : 0.22, express: true  },
      { qty: 1000,   discount: CFG ? CFG.remises.q1000  : 0.34, express: true  },
      { qty: 2500,   discount: CFG ? CFG.remises.q2500  : 0.46, express: true  },
      { qty: 5000,   discount: CFG ? CFG.remises.q5000  : 0.55, express: true  },
      { qty: 10000,  discount: CFG ? CFG.remises.q10000 : 0.64, express: true  },
    ],
    delivery: {
      'standard': { add: CFG ? CFG.livraison.std : 0,     days: 5, label: 'Standard 3-5 j' },
      'express':  { add: CFG ? CFG.livraison.exp : 5000,  days: 2, label: 'Express 24-48h' },
      'urgent':   { add: CFG ? CFG.livraison.urg : 12000, days: 1, label: 'Urgent jour même' },
    }
  };

  const state = {
    format: 'A5',
    paper: 'std-135',
    sides: 'recto',
    finitions: 'aucune',
    quantity: 500,
    delivery: 'standard',
  };

  function calcDiscount(qty) {
    let best = 0;
    PRICING.quantityTiers.forEach(t => {
      if (qty >= t.qty) best = t.discount;
    });
    return best;
  }

  function compute() {
    const f = PRICING.formats[state.format];
    const p = PRICING.papers[state.paper];
    const s = PRICING.sides[state.sides];
    const fin = PRICING.finitions[state.finitions];
    const d = PRICING.delivery[state.delivery];

    let unit = f.base * p.mult * s.mult;
    unit = unit * (1 + fin.add);

    const discount = calcDiscount(state.quantity);
    unit = unit * (1 - discount);

    const subtotal = unit * state.quantity;
    const total = Math.round(subtotal + d.add);
    const unitFinal = Math.round(unit);

    return { unit: unitFinal, total, discount, deliveryDays: d.days, deliveryFee: d.add };
  }

  function fmt(n) {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  function render() {
    const out = compute();
    const $ = (s) => document.querySelector(s);
    if ($('#sum-format')) $('#sum-format').textContent = PRICING.formats[state.format].label;
    if ($('#sum-paper')) $('#sum-paper').textContent = PRICING.papers[state.paper].label;
    if ($('#sum-sides')) $('#sum-sides').textContent = PRICING.sides[state.sides].label;
    if ($('#sum-finitions')) $('#sum-finitions').textContent = PRICING.finitions[state.finitions].label;
    if ($('#sum-quantity')) $('#sum-quantity').textContent = state.quantity.toLocaleString('fr-FR') + ' ex.';
    if ($('#sum-delivery')) $('#sum-delivery').textContent = PRICING.delivery[state.delivery].label;
    if ($('#sum-unit')) $('#sum-unit').textContent = fmt(out.unit);
    if ($('#sum-total')) $('#sum-total').textContent = out.total.toLocaleString('fr-FR');
    if ($('#sum-days')) $('#sum-days').textContent = out.deliveryDays + ' jours';
    if ($('#sum-discount')) {
      if (out.discount > 0) {
        $('#sum-discount').style.display = '';
        $('#sum-discount').textContent = '-' + Math.round(out.discount * 100) + '%';
      } else {
        $('#sum-discount').style.display = 'none';
      }
    }
  }

  function bind() {
    document.querySelectorAll('.opt-btn[data-group]').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const value = btn.dataset.value;
        state[group] = value;
        document.querySelectorAll(`.opt-btn[data-group="${group}"]`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        render();
      });
    });

    const qtyInput = document.querySelector('#qty-input');
    if (qtyInput) {
      qtyInput.addEventListener('input', () => {
        const v = parseInt(qtyInput.value, 10);
        if (!isNaN(v) && v > 0) {
          state.quantity = v;
          document.querySelectorAll('.qty-quick button').forEach(b => b.classList.remove('selected'));
          render();
        }
      });
    }

    document.querySelectorAll('.qty-quick button').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = parseInt(btn.dataset.qty, 10);
        state.quantity = v;
        if (qtyInput) qtyInput.value = v;
        document.querySelectorAll('.qty-quick button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        render();
      });
    });

    const submitBtn = document.querySelector('#config-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const out = compute();
        const summary = `
Devis Picto Craft (estimation)
────────────────────────�