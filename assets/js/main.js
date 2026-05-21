/* ===========================================================
   PICTO CRAFT — Main JS
   Animations, carrousel, scroll reveal, mobile menu
   =========================================================== */

(function(){
  'use strict';

  // ===== HEADER SCROLL EFFECT =====
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 30) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ===== HERO CAROUSEL =====
  const slides = document.querySelectorAll('.hero .slide');
  const dots = document.querySelectorAll('.hero-dots button');
  const prevBtn = document.querySelector('.hero-arrow.prev');
  const nextBtn = document.querySelector('.hero-arrow.next');

  if (slides.length > 1) {
    let current = 0;
    let timer = null;

    const go = (i) => {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
      // Restart entry animations
      const animEls = slides[current].querySelectorAll('.eyebrow, h1, h2, p, .slide-cta');
      animEls.forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = '';
      });
    };
    const next = () => go(current + 1);
    const prev = () => go(current - 1);
    const startTimer = () => { stopTimer(); timer = setInterval(next, 6500); };
    const stopTimer = () => { if (timer) clearInterval(timer); };

    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); startTimer(); }));
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startTimer(); });

    // Pause on hover
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.addEventListener('mouseenter', stopTimer);
      heroEl.addEventListener('mouseleave', startTimer);
    }

    // Touch swipe
    let touchStartX = 0;
    if (heroEl) {
      heroEl.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
      heroEl.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) { dx > 0 ? prev() : next(); startTimer(); }
      }, { passive: true });
    }

    startTimer();
  }

  // ===== REVEAL ON SCROLL (intersection observer) =====
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback : tout afficher
    revealEls.forEach(el => el.classList.add('in'));
  }

  // ===== COUNTER ANIMATION (stat numbers) =====
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const duration = 1800;
      const start = performance.now();
      const initial = 0;
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        // ease out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(initial + (target - initial) * eased);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => countObs.observe(c));
  }

  // ===== MOBILE MENU =====
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const menuClose = document.querySelector('.mobile-menu .close-btn');

  const openMenu = () => {
    if (mobileMenu) mobileMenu.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  // ===== FAQ ACCORDION =====
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-question');
    if (q) q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      // Close all
      faqItems.forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ===== FAQ CATEGORY FILTERING =====
  const faqCats = document.querySelectorAll('.faq-cat');
  faqCats.forEach(cat => cat.addEventListener('click', () => {
    faqCats.forEach(c => c.classList.remove('active'));
    cat.classList.add('active');
    const target = cat.dataset.cat;
    document.querySelectorAll('.faq-item').forEach(item => {
      if (target === 'all' || item.dataset.cat === target) item.style.display = '';
      else item.style.display = 'none';
    });
  }));

  // ===== CATALOGUE FILTER =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    document.querySelectorAll('.product-card[data-cat]').forEach(card => {
      if (cat === 'all' || card.dataset.cat === cat) {
        card.style.display = '';
        setTimeout(() => card.style.opacity = '1', 10);
      } else {
        card.style.opacity = '0';
        setTimeout(() => card.style.display = 'none', 200);
      }
    });
  }));

  // ===== SMOOTH SCROLL FOR ANCHORS =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const tgt = document.querySelector(id);
        if (tgt) {
          e.preventDefault();
          tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
          closeMenu();
        }
      }
    });
  });

  // ===== NEWSLETTER FORM =====
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type=email]');
      const btn = form.querySelector('button');
      const original = btn.textContent;
      btn.textContent = '✓ Inscrit !';
      btn.style.background = 'var(--success)';
      input.value = '';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
      }, 2800);
    });
  });

  // ===== CONTACT FORM (sample handler) =====
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type=submit]');
      const original = btn.innerHTML;
      btn.innerHTML = '✓ Message envoyé';
      btn.style.background = 'var(--success)';
      contactForm.reset();
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
      }, 3200);
    });
  }

  // ===== TILT EFFECT (product cards subtle 3D) =====
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (y - 0.5) * -8;
        const ry = (x - 0.5) * 8;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ===== PARALLAX (light) =====
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    const onParallax = () => {
      const sy = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const r = el.getBoundingClientRect();
        const visible = r.top < window.innerHeight && r.bottom > 0;
        if (visible) {
          const offset = (r.top - window.innerHeight) * speed;
          el.style.transform = `translateY(${offset * -0.3}px)`;
        }
      });
    };
    window.addEventListener('scroll', onParallax, { passive: true });
    onParallax();
  }

})();
