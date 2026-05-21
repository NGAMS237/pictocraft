/* ===========================================================
   PICTOCRAFT — Avis clients (Supabase)
   Connecte le formulaire d'avis et affiche les avis approuvés.
   La clé publique est sécurisée (Row Level Security activé).
   =========================================================== */

(function(){
  'use strict';

  const SUPABASE_URL = 'https://dfdmasejsoibxrvubegu.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_FUNJl2eCG1rDiEZOUJsQdA_GQIl2YZM';
  const TABLE = 'pictocraft_reviews';

  // ====== Soumission ======
  async function submitReview(data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error('Erreur ' + r.status + ' : ' + t);
    }
    return true;
  }

  // ====== Lecture des avis approuvés ======
  async function loadReviews(limit = 6) {
    const url = `${SUPABASE_URL}/rest/v1/${TABLE}?select=nom,entreprise,note,avis,created_at&approuve=eq.true&order=created_at.desc&limit=${limit}`;
    const r = await fetch(url, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    if (!r.ok) return [];
    return await r.json();
  }

  // ====== Rendu d'une carte d'avis ======
  function renderReviewCard(r) {
    const stars = '★'.repeat(r.note) + '☆'.repeat(5 - r.note);
    const initials = (r.nom || 'A').trim().split(/\s+/).map(s => s[0]).join('').slice(0,2).toUpperCase();
    const date = new Date(r.created_at);
    const days = Math.max(1, Math.round((Date.now() - date.getTime()) / 86400000));
    const dateLabel = days < 30 ? `Il y a ${days} j` : date.toLocaleDateString('fr-FR', { month:'short', year:'numeric' });
    const sub = r.entreprise ? `${r.entreprise} · ${dateLabel}` : `Avis vérifié · ${dateLabel}`;
    const safe = s => String(s||'').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
    return `
      <div class="review-card">
        <span class="stars">${stars}</span>
        <blockquote>${safe(r.avis)}</blockquote>
        <div class="author">
          <div class="avatar">${safe(initials)}</div>
          <div class="author-info"><strong>${safe(r.nom)}</strong><span>${safe(sub)}</span></div>
        </div>
      </div>
    `;
  }

  // ====== Charger les avis approuvés sur la page ======
  async function hydrateReviewsGrid() {
    const grid = document.querySelector('[data-reviews-grid]');
    if (!grid) return;
    try {
      const reviews = await loadReviews(6);
      if (!reviews.length) return; // on garde les avis hardcodés en fallback
      grid.innerHTML = reviews.map(renderReviewCard).join('');
    } catch (err) {
      // Silencieux : on garde les avis hardcodés
      console.warn('Avis Supabase indisponibles, fallback statique', err);
    }
  }

  // ====== Formulaire avis ======
  function bindReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return;

    // Gestion des étoiles cliquables
    let currentRating = 5;
    const starsEl = form.querySelector('.rating-input');
    if (starsEl) {
      const draw = (n) => {
        starsEl.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
          const s = document.createElement('button');
          s.type = 'button';
          s.className = 'star-btn ' + (i <= n ? 'active' : '');
          s.dataset.value = i;
          s.textContent = i <= n ? '★' : '☆';
          s.addEventListener('click', () => { currentRating = i; draw(i); });
          s.addEventListener('mouseover', () => draw(i));
          starsEl.appendChild(s);
        }
        starsEl.addEventListener('mouseleave', () => draw(currentRating), { once: true });
      };
      draw(currentRating);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type=submit]');
      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Envoi en cours…';

      const data = {
        nom: form.querySelector('[name=nom]').value.trim(),
        entreprise: form.querySelector('[name=entreprise]').value.trim() || null,
        email: form.querySelector('[name=email]').value.trim() || null,
        note: currentRating,
        avis: form.querySelector('[name=avis]').value.trim()
      };

      if (!data.nom || data.nom.length < 2) {
        alert('Veuillez saisir votre nom.');
        submitBtn.disabled = false; submitBtn.innerHTML = original; return;
      }
      if (!data.avis || data.avis.length < 10) {
        alert('Merci de rédiger un avis d\'au moins 10 caractères.');
        submitBtn.disabled = false; submitBtn.innerHTML = original; return;
      }

      try {
        await submitReview(data);
        form.reset();
        const success = document.createElement('div');
        success.className = 'review-success';
        success.innerHTML = '✓ Merci ! Votre avis a été envoyé et sera publié après modération.';
        form.parentNode.replaceChild(success, form);
      } catch (err) {
        alert('Erreur lors de l\'envoi : ' + err.message + '\nRéessayez ou contactez-nous directement.');
        submitBtn.disabled = false; submitBtn.innerHTML = original;
      }
    });
  }

  // ====== INIT ======
  function init() {
    bindReviewForm();
    hydrateReviewsGrid();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
