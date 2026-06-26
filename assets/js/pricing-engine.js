/* ===========================================================
   PICTOCRAFT — Moteur de calcul des devis
   Pure function : calculateQuote(product, selections, settings)
   
   Modes de calcul supportés (product.calcMode) :
   - "unit_multipliers" : prix = basePrice × tous les multiplicateurs (flyers, cartes, posters...)
   - "surface"          : prix = basePrice × surface_m² (bâches)
   - "edition"          : prix = (basePrice × mult format) + (pages × pricePerPage) + couverture + reliure (brochures)
   - "textile"          : prix = basePrice + addUnits (technique + couleurs + faces)
   =========================================================== */

(function(global){
  'use strict';

  /**
   * Arrondit un montant FCFA au pas défini (par défaut 25 FCFA).
   */
  function roundFcfa(amount, step) {
    step = step || 25;
    return Math.round(amount / step) * step;
  }

  /**
   * Récupère une option par sa value dans un field.
   */
  function findOption(field, value) {
    if (!field || !field.options) return null;
    return field.options.find(o => String(o.value) === String(value)) || null;
  }

  /**
   * Récupère la remise volume applicable.
   */
  function findDiscount(quantityDiscounts, qty) {
    if (!quantityDiscounts || !quantityDiscounts.length) return 0;
    let best = 0;
    for (const d of quantityDiscounts) {
      if (qty >= d.min && d.discount > best) best = d.discount;
    }
    return best;
  }

  /**
   * Calcule le prix unitaire selon le mode du produit.
   * Retourne { unitPrice, breakdown[] } où breakdown détaille chaque ligne.
   */
  function computeUnitPrice(product, selections) {
    const breakdown = [];
    let unit = 0;

    if (product.calcMode === 'unit_multipliers' || !product.calcMode) {
      // FLYERS, CARTES, AFFICHES, ROLLUPS, STICKERS, CALENDRIERS...
      unit = product.basePrice;
      breakdown.push({ label: 'Prix de base', amount: unit });
      (product.fields || []).forEach(field => {
        const opt = findOption(field, selections[field.key]);
        if (opt && opt.multiplier && opt.multiplier !== 1) {
          const before = unit;
          unit = unit * opt.multiplier;
          breakdown.push({ label: field.label + ' : ' + opt.label, mult: opt.multiplier, amount: Math.round(unit - before) });
        }
      });
    }
    else if (product.calcMode === 'surface') {
      // BÂCHES : prix au m²
      const w = parseFloat(selections._width || 100);
      const h = parseFloat(selections._height || 100);
      const surface = (w * h) / 10000; // cm² → m²
      let pricePerM2 = product.basePrice;
      breakdown.push({ label: 'Prix de base par m²', amount: pricePerM2 });

      // Multiplicateurs (type, usage)
      (product.fields || []).forEach(field => {
        const opt = findOption(field, selections[field.key]);
        if (opt && opt.multiplier && opt.multiplier !== 1) {
          const before = pricePerM2;
          pricePerM2 = pricePerM2 * opt.multiplier;
          breakdown.push({ label: field.label + ' : ' + opt.label, mult: opt.multiplier, amount: Math.round(pricePerM2 - before) });
        }
      });

      unit = pricePerM2 * surface;
      breakdown.push({ label: 'Dimensions ' + w + '×' + h + 'cm = ' + surface.toFixed(2) + ' m²', amount: Math.round(unit - pricePerM2) });

      // Finitions additives par m²
      (product.fields || []).forEach(field => {
        const opt = findOption(field, selections[field.key]);
        if (opt && opt.addPerM2 && opt.addPerM2 > 0) {
          const add = opt.addPerM2 * surface;
          unit += add;
          breakdown.push({ label: field.label + ' : ' + opt.label, amount: Math.round(add) });
        }
      });
    }
    else if (product.calcMode === 'edition') {
      // BROCHURES, MAGAZINES : pages + reliure + couverture
      let formatMult = 1;
      const formatField = (product.fields || []).find(f => f.key === 'format');
      if (formatField) {
        const opt = findOption(formatField, selections.format);
        if (opt && opt.multiplier) formatMult = opt.multiplier;
      }
      unit = product.basePrice * formatMult;
      breakdown.push({ label: 'Prix de base (format)', amount: Math.round(unit) });

      // Pages
      const pagesField = (product.fields || []).find(f => f.key === 'pages');
      if (pagesField) {
        const opt = findOption(pagesField, selections.pages);
        if (opt && opt.pageCount && pagesField.pricePerPage) {
          const pagesCost = opt.pageCount * pagesField.pricePerPage * formatMult;
          unit += pagesCost;
          breakdown.push({ label: opt.pageCount + ' pages × ' + pagesField.pricePerPage + ' FCFA', amount: Math.round(pagesCost) });
        }
      }

      // Multiplicateur papier intérieur
      const paperField = (product.fields || []).find(f => f.key === 'paperInside');
      if (paperField) {
        const opt = findOption(paperField, selections.paperInside);
        if (opt && opt.multiplier && opt.multiplier !== 1) {
          const before = unit;
          unit = unit * opt.multiplier;
          breakdown.push({ label: paperField.label + ' : ' + opt.label, mult: opt.multiplier, amount: Math.round(unit - before) });
        }
      }

      // Couverture (addUnit)
      const coverField = (product.fields || []).find(f => f.key === 'paperCover');
      if (coverField) {
        const opt = findOption(coverField, selections.paperCover);
        if (opt && opt.addUnit) {
          unit += opt.addUnit;
          breakdown.push({ label: coverField.label + ' : ' + opt.label, amount: opt.addUnit });
        }
      }

      // Reliure (addUnit)
      const bindField = (product.fields || []).find(f => f.key === 'binding');
      if (bindField) {
        const opt = findOption(bindField, selections.binding);
        if (opt && opt.addUnit) {
          unit += opt.addUnit;
          breakdown.push({ label: bindField.label + ' : ' + opt.label, amount: opt.addUnit });
        }
      }

      // Finition couverture (multiplicateur)
      const finField = (product.fields || []).find(f => f.key === 'finition');
      if (finField) {
        const opt = findOption(finField, selections.finition);
        if (opt && opt.multiplier && opt.multiplier !== 1) {
          const before = unit;
          unit = unit * opt.multiplier;
          breakdown.push({ label: finField.label + ' : ' + opt.label, mult: opt.multiplier, amount: Math.round(unit - before) });
        }
      }
    }
    else if (product.calcMode === 'textile') {
      // T-SHIRTS, POLOS : prix support + addUnits (technique, couleurs, faces)
      unit = product.basePrice;
      breakdown.push({ label: 'Prix de base support', amount: unit });
      (product.fields || []).forEach(field => {
        const opt = findOption(field, selections[field.key]);
        if (opt && opt.addUnit) {
          unit += opt.addUnit;
          breakdown.push({ label: field.label + ' : ' + opt.label, amount: opt.addUnit });
        }
      });
    }

    return { unitPrice: unit, breakdown: breakdown };
  }

  /**
   * Fonction principale : calcule un devis complet.
   * @param {Object} product       - définition produit depuis products.json
   * @param {Object} selections    - choix utilisateur { format, paper, sides, ..., _width, _height, _quantity }
   * @param {Object} settings      - fichier settings.json
   * @returns {Object} devis détaillé
   */
  function calculateQuote(product, selections, settings) {
    settings = settings || {};
    const currency = (settings.currency && settings.currency.code) || 'FCFA';
    const rounding = (settings.currency && settings.currency.rounding) || 25;

    if (!product) {
      return { error: 'Produit introuvable', total: 0, currency: currency };
    }

    const quantity = parseInt(selections._quantity, 10) || product.minimumOrder || 1;
    if (quantity < (product.minimumOrder || 1)) {
      return { error: 'Quantité minimum : ' + product.minimumOrder, total: 0, currency: currency };
    }

    // 1. Prix unitaire
    const unitCalc = computeUnitPrice(product, selections);
    const unitPrice = unitCalc.unitPrice;
    const breakdown = unitCalc.breakdown;

    // 2. Sous-total = unitaire × quantité
    let subtotal = unitPrice * quantity;

    // 3. Remise volume
    const discountRate = findDiscount(product.quantityDiscounts || [], quantity);
    const discountAmount = subtotal * discountRate;
    subtotal = subtotal - discountAmount;

    // 4. Délai (multiplicateur global)
    let delayMult = 1;
    let delayLabel = '';
    if (selections._delay && settings.deliveryDelays && settings.deliveryDelays[selections._delay]) {
      const d = settings.deliveryDelays[selections._delay];
      delayMult = d.multiplier || 1;
      delayLabel = d.label || '';
    }
    const delayExtra = subtotal * (delayMult - 1);
    subtotal = subtotal + delayExtra;

    // 5. Frais de conception graphique
    let designFee = 0;
    let designLabel = '';
    if (selections._design && settings.designFees && settings.designFees[selections._design]) {
      designFee = settings.designFees[selections._design].fee || 0;
      designLabel = settings.designFees[selections._design].label || '';
    }

    // 6. Frais de livraison
    let deliveryFee = 0;
    let deliveryLabel = '';
    if (selections._delivery && settings.deliveryFees && settings.deliveryFees[selections._delivery]) {
      deliveryFee = settings.deliveryFees[selections._delivery].fee || 0;
      deliveryLabel = settings.deliveryFees[selections._delivery].label || '';
    }

    // 7. Total HT
    let total = subtotal + designFee + deliveryFee;

    // 8. TVA si activée
    let tax = 0;
    let taxLabel = '';
    if (settings.tax && settings.tax.enabled) {
      tax = total * (settings.tax.rate || 0);
      taxLabel = settings.tax.label || 'TVA';
      total = total + tax;
    }

    // 9. Arrondi final
    total = roundFcfa(total, rounding);

    // 10. Lignes du devis pour affichage
    const lines = [];
    lines.push({ label: 'Prix unitaire', amount: roundFcfa(unitPrice, rounding), kind: 'unit' });
    lines.push({ label: 'Quantité', amount: quantity, kind: 'qty' });
    lines.push({ label: 'Sous-total', amount: roundFcfa(unitPrice * quantity, rounding), kind: 'subtotal' });
    if (discountRate > 0) {
      lines.push({ label: 'Remise volume (' + Math.round(discountRate * 100) + '%)', amount: -roundFcfa(discountAmount, rounding), kind: 'discount' });
    }
    if (delayMult !== 1) {
      lines.push({ label: 'Supplément délai ' + delayLabel, amount: roundFcfa(delayExtra, rounding), kind: 'delay' });
    }
    if (designFee > 0) {
      lines.push({ label: designLabel || 'Conception graphique', amount: designFee, kind: 'design' });
    }
    if (deliveryFee >= 0) {
      lines.push({ label: deliveryLabel || 'Livraison', amount: deliveryFee, kind: 'delivery' });
    }
    if (tax > 0) {
      lines.push({ label: taxLabel, amount: roundFcfa(tax, rounding), kind: 'tax' });
    }
    lines.push({ label: 'Total', amount: total, kind: 'total' });

    return {
      product: product.slug,
      productName: product.name,
      quantity: quantity,
      unitPrice: roundFcfa(unitPrice, rounding),
      subtotal: roundFcfa(unitPrice * quantity, rounding),
      discountRate: discountRate,
      discountAmount: roundFcfa(discountAmount, rounding),
      delayExtra: roundFcfa(delayExtra, rounding),
      designFee: designFee,
      deliveryFee: deliveryFee,
      tax: roundFcfa(tax, rounding),
      total: total,
      currency: currency,
      breakdown: breakdown,
      lines: lines,
      selections: selections
    };
  }

  /**
   * Génère un message WhatsApp prérempli à partir d'un devis.
   */
  function buildWhatsappMessage(quote, product, selections, client, settings) {
    settings = settings || {};
    const fmt = n => Number(n).toLocaleString('fr-FR') + ' ' + (quote.currency || 'FCFA');
    let msg = '*Demande de devis Pictocraft*\n';
    msg += '\n*Produit :* ' + (quote.productName || product.name);
    msg += '\n*Quantité :* ' + quote.quantity + ' ' + (product.unit || '');

    // Options sélectionnées
    (product.fields || []).forEach(field => {
      const v = selections[field.key];
      if (!v) return;
      const opt = (field.options || []).find(o => String(o.value) === String(v));
      if (opt) msg += '\n*' + field.label + ' :* ' + opt.label;
    });

    if (selections._width && selections._height) {
      msg += '\n*Dimensions :* ' + selections._width + '×' + selections._height + ' cm';
    }
    if (selections._delay && settings.deliveryDelays && settings.deliveryDelays[selections._delay]) {
      msg += '\n*Délai :* ' + settings.deliveryDelays[selections._delay].label;
    }
    if (selections._delivery && settings.deliveryFees && settings.deliveryFees[selections._delivery]) {
      msg += '\n*Livraison :* ' + settings.deliveryFees[selections._delivery].label;
    }
    if (selections._design && settings.designFees && settings.designFees[selections._design]) {
      msg += '\n*Conception :* ' + settings.designFees[selections._design].label;
    }

    msg += '\n\n*TOTAL estimé : ' + fmt(quote.total) + '*';

    if (client) {
      msg += '\n\n*Mes coordonnées :*';
      if (client.nom) msg += '\nNom : ' + client.nom;
      if (client.entreprise) msg += '\nEntreprise : ' + client.entreprise;
      if (client.telephone) msg += '\nTéléphone : ' + client.telephone;
      if (client.email) msg += '\nEmail : ' + client.email;
      if (client.ville) msg += '\nVille : ' + client.ville;
      if (client.commentaire) msg += '\n\nCommentaire :\n' + client.commentaire;
    }
    msg += '\n\n_(Prix estimatif, validation finale après vérification.)_';
    return msg;
  }

  // Export pour navigateur et Node (tests)
  const api = { calculateQuote: calculateQuote, buildWhatsappMessage: buildWhatsappMessage, roundFcfa: roundFcfa };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.PictocraftPricing = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
