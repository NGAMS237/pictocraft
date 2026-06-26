/* ===========================================================
   PICTOCRAFT — Configurateur de devis dynamique
   Rend les options d'un produit, gère les sélections et met
   à jour le résumé en temps réel via le moteur de calcul.
   Génère le message WhatsApp et enregistre dans Supabase.
   =========================================================== */
(function(global){
  'use strict';

  const FCFA = n => Math.round(n).toLocaleString('fr-FR') + ' FCFA';

  /**
   * Initialise le configurateur sur la page produit.
   * @param {Object} opts {
   *   product, settings,
   *   optionsContainer  : HTMLElement
   *   summaryContainer  : HTMLElement
   *   formContainer     : HTMLElement (formulaire client)
   *   submitBtn         : HTMLElement (Valider devis)
   *   whatsappBtn       : HTMLElement (Envoyer WhatsApp)
   * }
   */
  function initConfigurator(opts) {
    const { product, settings, optionsContainer, summaryContainer, formContainer, submitBtn, whatsappBtn } = opts;
    if (!product) {
      optionsContainer.innerHTML = '<div class="error">Produit introuvable.</div>';
      return;
    }

    // Sélections par défaut : premier option de chaque field requis
    const selections = {};
    (product.fields || []).forEach(field => {
      if (field.options && field.options.length) {
        selections[field.key] = field.options[0].value;
      }
    });
    // Quantité par défaut = première quantité ou minimumOrder
    selections._quantity = (product.quantities && product.quantities[0]) || product.minimumOrder || 1;
    // Délai / livraison / conception
    selections._delay = 'standard';
    selections._delivery = 'retrait';
    selections._design = 'none';
    // Dimensions par défaut pour le mode surface
    if (product.calcMode === 'surface') {
      selections._width = 100;
      selections._height = 100;
    }

    // ===== RENDER OPTIONS =====
    function renderOptions() {
      let html = '';

      // Champs spécifiques au produit
      (product.fields || []).forEach(field => {
        html += `<div class="cfg-group" data-field="${field.key}">`;
        html += `<label class="cfg-label">${escapeHtml(field.label)}${field.required ? ' *' : ''}</label>`;
        html += `<div class="cfg-options" role="radiogroup" aria-label="${escapeHtml(field.label)}">`;
        (field.options || []).forEach(opt => {
          const isSel = selections[field.key] === opt.value;
          html += `<button type="button" class="cfg-opt ${isSel ? 'selected' : ''}" data-field="${field.key}" data-value="${escapeHtml(opt.value)}" aria-pressed="${isSel}">${escapeHtml(opt.label)}</button>`;
        });
        html += `</div></div>`;
      });

      // Dimensions personnalisées pour les bâches
      if (product.calcMode === 'surface' && product.dimensions) {
        const d = product.dimensions;
        html += `
        <div class="cfg-group">
          <label class="cfg-label">Dimensions (cm)</label>
          <div class="cfg-dims">
            <div class="cfg-dim-field">
              <label>Largeur</label>
              <input type="number" id="cfg-width" min="${d.minWidth}" max="${d.maxWidth}" step="${d.step}" value="${selections._width}">
              <small>${d.minWidth}–${d.maxWidth} cm</small>
            </div>
            <span class="cfg-dim-x">×</span>
            <div class="cfg-dim-field">
              <label>Hauteur</label>
              <input type="number" id="cfg-height" min="${d.minHeight}" max="${d.maxHeight}" step="${d.step}" value="${selections._height}">
              <small>${d.minHeight}–${d.maxHeight} cm</small>
            </div>
          </div>
        </div>`;
      }

      // Quantité
      html += `<div class="cfg-group"><label class="cfg-label">Quantité</label><div class="cfg-options">`;
      (product.quantities || [product.minimumOrder || 1]).forEach(q => {
        const isSel = selections._quantity == q;
        html += `<button type="button" class="cfg-opt cfg-qty ${isSel ? 'selected' : ''}" data-qty="${q}" aria-pressed="${isSel}">${q.toLocaleString('fr-FR')}</button>`;
      });
      html += `<input type="number" id="cfg-qty-custom" class="cfg-qty-input" min="${product.minimumOrder || 1}" placeholder="Autre…" aria-label="Quantité personnalisée">`;
      html += `</div></div>`;

      // Délai
      if (settings.deliveryDelays) {
        html += `<div class="cfg-group"><label class="cfg-label">Délai</label><div class="cfg-options">`;
        Object.keys(settings.deliveryDelays).forEach(k => {
          const d = settings.deliveryDelays[k];
          const isSel = selections._delay === k;
          html += `<button type="button" class="cfg-opt ${isSel ? 'selected' : ''}" data-delay="${k}" aria-pressed="${isSel}">${escapeHtml(d.label)}</button>`;
        });
        html += `</div></div>`;
      }

      // Livraison
      if (settings.deliveryFees) {
        html += `<div class="cfg-group"><label class="cfg-label">Livraison</label><div class="cfg-options">`;
        Object.keys(settings.deliveryFees).forEach(k => {
          const d = settings.deliveryFees[k];
          const isSel = selections._delivery === k;
          const feeTxt = d.fee > 0 ? ` (+${FCFA(d.fee)})` : ' (gratuit)';
          html += `<button type="button" class="cfg-opt ${isSel ? 'selected' : ''}" data-delivery="${k}" aria-pressed="${isSel}">${escapeHtml(d.label)}${feeTxt}</button>`;
        });
        html += `</div></div>`;
      }

      // Conception graphique
      if (settings.designFees) {
        html += `<div class="cfg-group"><label class="cfg-label">Avez-vous un fichier prêt ?</label><div class="cfg-options">`;
        Object.keys(settings.designFees).forEach(k => {
          const d = settings.designFees[k];
          const isSel = selections._design === k;
          const feeTxt = d.fee > 0 ? ` (+${FCFA(d.fee)})` : '';
          html += `<button type="button" class="cfg-opt ${isSel ? 'selected' : ''}" data-design="${k}" aria-pressed="${isSel}">${escapeHtml(d.label)}${feeTxt}</button>`;
        });
        html += `</div></div>`;
      }

      optionsContainer.innerHTML = html;
      bindOptionEvents();
    }

    function bindOptionEvents() {
      // Boutons d'option produit
      optionsContainer.querySelectorAll('.cfg-opt[data-field]').forEach(btn => {
        btn.addEventListener('click', () => {
          const f = btn.dataset.field;
          selections[f] = btn.dataset.value;
          renderOptions(); renderSummary();
        });
      });
      // Boutons quantité
      optionsContainer.querySelectorAll('.cfg-opt[data-qty]').forEach(btn => {
        btn.addEventListener('click', () => {
          selections._quantity = parseInt(btn.dataset.qty, 10);
          const input = document.getElementById('cfg-qty-custom');
          if (input) input.value = '';
          renderOptions(); renderSummary();
        });
      });
      // Quantité personnalisée
      const qtyInput = document.getElementById('cfg-qty-custom');
      if (qtyInput) {
        qtyInput.addEventListener('input', () => {
          const v = parseInt(qtyInput.value, 10);
          if (!isNaN(v) && v >= (product.minimumOrder || 1)) {
            selections._quantity = v;
            optionsContainer.querySelectorAll('.cfg-opt[data-qty]').forEach(b => b.classList.remove('selected'));
            renderSummary();
          }
        });
      }
      // Délai / livraison / conception
      optionsContainer.querySelectorAll('.cfg-opt[data-delay]').forEach(btn => {
        btn.addEventListener('click', () => { selections._delay = btn.dataset.delay; renderOptions(); renderSummary(); });
      });
      optionsContainer.querySelectorAll('.cfg-opt[data-delivery]').forEach(btn => {
        btn.addEventListener('click', () => { selections._delivery = btn.dataset.delivery; renderOptions(); renderSummary(); });
      });
      optionsContainer.querySelectorAll('.cfg-opt[data-design]').forEach(btn => {
        btn.addEventListener('click', () => { selections._design = btn.dataset.design; renderOptions(); renderSummary(); });
      });
      // Dimensions
      const w = document.getElementById('cfg-width');
      const h = document.getElementById('cfg-height');
      if (w) w.addEventListener('input', () => { selections._width = parseFloat(w.value) || 100; renderSummary(); });
      if (h) h.addEventListener('input', () => { selections._height = parseFloat(h.value) || 100; renderSummary(); });
    }

    // ===== RENDER SUMMARY =====
    function renderSummary() {
      const quote = PictocraftPricing.calculateQuote(product, selections, settings);

      if (quote.error) {
        summaryContainer.innerHTML = `<div class="sum-error">⚠ ${escapeHtml(quote.error)}</div>`;
        return;
      }

      let html = '';
      html += `<h3 class="sum-title">Votre devis</h3>`;
      html += `<div class="sum-product"><strong>${escapeHtml(product.name)}</strong></div>`;
      html += `<ul class="sum-options">`;

      // Liste les choix
      (product.fields || []).forEach(field => {
        const v = selections[field.key];
        const opt = (field.options || []).find(o => String(o.value) === String(v));
        if (opt) html += `<li><span>${escapeHtml(field.label)}</span><b>${escapeHtml(opt.label)}</b></li>`;
      });
      if (selections._width && selections._height) {
        html += `<li><span>Dimensions</span><b>${selections._width}×${selections._height} cm</b></li>`;
      }
      html += `<li><span>Quantité</span><b>${selections._quantity.toLocaleString('fr-FR')} ${escapeHtml(product.unit || '')}</b></li>`;
      html += `</ul>`;

      // Détail prix
      html += `<div class="sum-lines">`;
      quote.lines.forEach(line => {
        const cls = line.kind === 'total' ? 'sum-line sum-total' :
                    line.kind === 'discount' ? 'sum-line sum-discount' :
                    line.kind === 'qty' ? 'sum-line sum-light' : 'sum-line';
        const val = line.kind === 'qty' ? Number(line.amount).toLocaleString('fr-FR') : FCFA(line.amount);
        html += `<div class="${cls}"><span>${escapeHtml(line.label)}</span><b>${val}</b></div>`;
      });
      html += `</div>`;

      html += `<p class="sum-legal">${escapeHtml(settings.legalNotice || 'Prix estimatif, validation finale après vérification.')}</p>`;

      summaryContainer.innerHTML = html;

      // Memorise le devis courant pour les boutons d'action
      summaryContainer._currentQuote = quote;
    }

    // ===== ACTIONS =====
    function getClientData() {
      const f = formContainer;
      return {
        nom:         f.querySelector('[name=nom]') ? f.querySelector('[name=nom]').value.trim() : '',
        entreprise:  f.querySelector('[name=entreprise]') ? f.querySelector('[name=entreprise]').value.trim() : '',
        telephone:   f.querySelector('[name=telephone]') ? f.querySelector('[name=telephone]').value.trim() : '',
        email:       f.querySelector('[name=email]') ? f.querySelector('[name=email]').value.trim() : '',
        ville:       f.querySelector('[name=ville]') ? f.querySelector('[name=ville]').value.trim() : '',
        commentaire: f.querySelector('[name=commentaire]') ? f.querySelector('[name=commentaire]').value.trim() : '',
        fichierPret: f.querySelector('[name=fichierPret]:checked') ? f.querySelector('[name=fichierPret]:checked').value : ''
      };
    }

    function sendWhatsapp() {
      const quote = summaryContainer._currentQuote;
      if (!quote) return;
      const client = getClientData();
      const msg = PictocraftPricing.buildWhatsappMessage(quote, product, selections, client, settings);
      const wa = (settings.contact && settings.contact.whatsapp) || '237675140843';
      const url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg);
      window.open(url, '_blank');
    }

    async function submitQuote() {
      const quote = summaryContainer._currentQuote;
      if (!quote) return;
      const client = getClientData();
      if (!client.nom || !client.telephone) {
        alert("Merci d'indiquer au moins votre nom et votre téléphone pour qu'on puisse vous contacter.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.dataset.original = submitBtn.innerHTML;
      submitBtn.innerHTML = '⏳ Envoi…';

      // Envoie à Supabase si configuré
      if (settings.admin && settings.admin.supabaseEnabled && settings.admin.supabaseUrl && settings.admin.supabaseAnonKey) {
        try {
          const r = await fetch(`${settings.admin.supabaseUrl}/rest/v1/pictocraft_quotes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': settings.admin.supabaseAnonKey,
              'Authorization': 'Bearer ' + settings.admin.supabaseAnonKey,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              produit: product.slug,
              produit_nom: product.name,
              quantite: selections._quantity,
              configuration: selections,
              total: quote.total,
              client_nom: client.nom,
              client_entreprise: client.entreprise || null,
              client_email: client.email || null,
              client_telephone: client.telephone,
              client_ville: client.ville || null,
              commentaire: client.commentaire || null,
              fichier_pret: client.fichierPret === 'oui'
            })
          });
          if (!r.ok) throw new Error('Erreur ' + r.status);
        } catch (err) {
          console.warn('Supabase quotes indisponible, fallback WhatsApp', err);
        }
      }

      // Ouvre WhatsApp avec le message
      sendWhatsapp();

      submitBtn.disabled = false;
      submitBtn.innerHTML = '✓ Demande envoyée';
      setTimeout(() => { submitBtn.innerHTML = submitBtn.dataset.original; }, 3000);
    }

    if (whatsappBtn) whatsappBtn.addEventListener('click', sendWhatsapp);
    if (submitBtn)   submitBtn.addEventListener('click', submitQuote);

    // INIT
    renderOptions();
    renderSummary();
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
  }

  global.PictocraftConfigurator = { init: initConfigurator };
})(typeof window !== 'undefined' ? window : globalThis);
