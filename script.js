(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Configuration (Update VALID_PASSWORDS before deploying)
     ------------------------------------------------------------------------ */
  const VALID_PASSWORDS = ['carriemah2026', 'portfolio', 'nda'];
  const STORAGE_KEY = 'carriemah_portfolio_unlocked';
  const XL_DECK_QUERY = '(min-width: 1440px) and (min-height: 1080px)';

  function isHorizontalDeckMode() {
    return window.matchMedia(XL_DECK_QUERY).matches;
  }

  /* ------------------------------------------------------------------------
     2. Image Placeholder Graceful Reveal (Zero Broken Icons)
     ------------------------------------------------------------------------ */
  const mediaImages = document.querySelectorAll('.media-frame__img');
  mediaImages.forEach((img) => {
    const frame = img.closest('.media-frame');
    if (!frame) return;

    const markLoaded = () => {
      if (img.naturalWidth > 0) {
        frame.classList.add('is-loaded');
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', () => {
        frame.classList.remove('is-loaded');
      }, { once: true });
    }
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mediaVideos = document.querySelectorAll('.media-frame__video');
  mediaVideos.forEach((video) => {
    const frame = video.closest('.media-frame');
    if (!frame) return;

    const markLoaded = () => {
      frame.classList.add('is-loaded');
      if (prefersReducedMotion) {
        video.pause();
      }
    };

    if (video.readyState >= 2) {
      markLoaded();
    } else {
      video.addEventListener('loadeddata', markLoaded, { once: true });
      video.addEventListener('canplay', markLoaded, { once: true });
      video.addEventListener('error', () => {
        frame.classList.remove('is-loaded');
      }, { once: true });
    }
  });

  if (prefersReducedMotion) {
    document.querySelectorAll('.product-media__video').forEach((video) => {
      video.pause();
    });
  }

  /* ------------------------------------------------------------------------
     3. Mobile Navigation Toggle
     ------------------------------------------------------------------------ */
  const menuToggle = document.getElementById('menu-toggle') || document.querySelector('.menu-toggle');
  const primaryNav = document.getElementById('primary-nav');

  function closeMobileMenu() {
    if (!primaryNav || !menuToggle) return;
    primaryNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        closeMobileMenu();
        menuToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Contact Form Mailto Submission (contact.html)
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const contactError = document.getElementById('contact-error');
    const contactFeedback = document.getElementById('contact-feedback');
    const fallbackMailtoLink = document.getElementById('contact-fallback-link');

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const messageVal = messageInput ? messageInput.value.trim() : '';
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

      if (!nameVal || !emailVal || !emailValid || !messageVal) {
        if (contactError) {
          contactError.hidden = false;
        }
        if (!nameVal && nameInput) nameInput.focus();
        else if ((!emailVal || !emailValid) && emailInput) emailInput.focus();
        else if (!messageVal && messageInput) messageInput.focus();
        return;
      }

      if (contactError) {
        contactError.hidden = true;
      }

      const subject = 'New message from carriemdesigns.com';
      const body = `From: ${emailVal} (${nameVal})\n\n${messageVal}`;
      const mailtoHref = `mailto:contact@carriemah.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (fallbackMailtoLink) {
        fallbackMailtoLink.href = mailtoHref;
      }
      if (contactFeedback) {
        contactFeedback.hidden = false;
      }

      window.location.href = mailtoHref;
    });

    [nameInput, emailInput, messageInput].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => {
        if (contactError && !contactError.hidden) {
          contactError.hidden = true;
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. Portfolio Password Gate & Presentation Deck (portfolio.html)
     ------------------------------------------------------------------------ */
  const gateView = document.getElementById('gate-view');
  const gatedView = document.getElementById('gated-view');
  if (!gateView || !gatedView) return;

  const mainContent = document.getElementById('main-content');
  const gateForm = document.getElementById('password-gate-form');
  const passwordInput = document.getElementById('portfolio-password');
  const gateError = document.getElementById('gate-error');

  const presentations = Array.from(document.querySelectorAll('.gated-presentation'));
  const deckTabs = Array.from(document.querySelectorAll('.deck-tab[data-deck-jump]'));
  const deckScrubber = document.getElementById('deck-scrubber');
  const slidePrev = document.getElementById('slide-prev');
  const slideNext = document.getElementById('slide-next');
  const printPdfBtn = document.getElementById('print-pdf-btn');

  let activePresentationIndex = 0;
  let activeSlideIndex = 0;
  let wheelLock = false;

  function setDeckUnlockedState(isUnlocked) {
    gateView.hidden = isUnlocked;
    gatedView.hidden = !isUnlocked;
    document.documentElement.classList.toggle('is-deck-unlocked', isUnlocked);
    document.body.classList.toggle('is-deck-unlocked', isUnlocked);
    closeMobileMenu();

    if (isUnlocked) {
      showPresentation(activePresentationIndex);
      if (mainContent) {
        requestAnimationFrame(() => mainContent.focus());
      }
    } else if (passwordInput) {
      requestAnimationFrame(() => passwordInput.focus());
    }
  }

  /* Password Verification */
  if (gateForm && passwordInput) {
    gateForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const entered = passwordInput.value.trim().toLowerCase();
      const isValid = VALID_PASSWORDS.some((pwd) => pwd.toLowerCase() === entered);

      if (isValid) {
        if (gateError) gateError.hidden = true;
        passwordInput.removeAttribute('aria-invalid');
        sessionStorage.setItem(STORAGE_KEY, 'true');
        activePresentationIndex = 0;
        setDeckUnlockedState(true);
      } else {
        if (gateError) gateError.hidden = false;
        passwordInput.setAttribute('aria-invalid', 'true');
        passwordInput.focus();
      }
    });

    passwordInput.addEventListener('input', () => {
      if (gateError && !gateError.hidden) {
        gateError.hidden = true;
        passwordInput.removeAttribute('aria-invalid');
      }
    });
  }

  /* Slide Track Helpers */
  function getActiveTrack() {
    const activeDeck = presentations[activePresentationIndex];
    return activeDeck ? activeDeck.querySelector('.slide-track') : null;
  }

  function getActiveSlides() {
    const track = getActiveTrack();
    return track ? Array.from(track.querySelectorAll('.deck-slide')) : [];
  }

  function updateSlideUI(index) {
    const slides = getActiveSlides();
    const total = slides.length;
    if (!total) return;

    activeSlideIndex = Math.max(0, Math.min(index, total - 1));

    if (deckScrubber) {
      const dots = deckScrubber.querySelectorAll('.scrubber-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === activeSlideIndex);
        dot.setAttribute('aria-current', idx === activeSlideIndex ? 'step' : 'false');
      });
    }

    if (slidePrev) slidePrev.disabled = activeSlideIndex === 0;
    if (slideNext) slideNext.disabled = activeSlideIndex === total - 1;
  }

  function goToSlide(index, behavior = 'smooth') {
    const track = getActiveTrack();
    const slides = getActiveSlides();
    if (!track || !slides.length) return;

    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    updateSlideUI(clamped);

    if (isHorizontalDeckMode()) {
      track.scrollTo({
        left: slides[clamped].offsetLeft,
        behavior
      });
    } else if (behavior !== 'instant') {
      slides[clamped].scrollIntoView({ behavior, block: 'start' });
    }
  }

  function buildScrubber() {
    if (!deckScrubber) return;
    const slides = getActiveSlides();
    deckScrubber.innerHTML = '';

    slides.forEach((slide, idx) => {
      const slideNumber = String(idx).padStart(2, '0');
      const fullLabel = slide.getAttribute('data-slide-label') || `Slide ${slideNumber}`;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scrubber-dot' + (idx === 0 ? ' is-active' : '');
      btn.textContent = slideNumber;
      btn.title = fullLabel;
      btn.setAttribute('aria-label', `Go to slide ${slideNumber}: ${fullLabel}`);
      btn.setAttribute('aria-current', idx === 0 ? 'step' : 'false');
      btn.addEventListener('click', () => goToSlide(idx));
      deckScrubber.appendChild(btn);
    });
  }

  function showPresentation(index) {
    const total = presentations.length;
    if (!total) return;
    activePresentationIndex = ((index % total) + total) % total;

    presentations.forEach((article, idx) => {
      article.hidden = idx !== activePresentationIndex;
    });

    deckTabs.forEach((tab) => {
      const tabDeckIdx = Number(tab.getAttribute('data-deck-jump'));
      const isCurrent = tabDeckIdx === activePresentationIndex;
      tab.classList.toggle('is-active', isCurrent);
      if (isCurrent) {
        tab.setAttribute('aria-current', 'true');
      } else {
        tab.removeAttribute('aria-current');
      }
    });

    buildScrubber();
    goToSlide(0, 'instant');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /* Case Study Switcher Buttons (Top Header + Closing Slide Tertiary Links) */
  document.querySelectorAll('[data-deck-jump]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetDeck = Number(btn.getAttribute('data-deck-jump'));
      showPresentation(targetDeck);
    });
  });

  if (slidePrev) {
    slidePrev.addEventListener('click', () => goToSlide(activeSlideIndex - 1));
  }
  if (slideNext) {
    slideNext.addEventListener('click', () => goToSlide(activeSlideIndex + 1));
  }

  /* Sync Active Slide on Trackpad Horizontal Swipe (Desktop >= 900px) */
  presentations.forEach((article, deckIdx) => {
    const track = article.querySelector('.slide-track');
    if (!track) return;

    let scrollTimer = null;
    track.addEventListener('scroll', () => {
      if (deckIdx !== activePresentationIndex || !isHorizontalDeckMode()) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const slideWidth = track.clientWidth || window.innerWidth;
        const nearest = Math.round(track.scrollLeft / slideWidth);
        updateSlideUI(nearest);
      }, 80);
    }, { passive: true });
  });

  /* Re-align Slide Position on Window Resize */
  window.addEventListener('resize', () => {
    if (gatedView.hidden || !isHorizontalDeckMode()) return;
    goToSlide(activeSlideIndex, 'instant');
  });

  /* Vertical Mouse Wheel -> Horizontal Slide Track (XL Desktop only) */
  window.addEventListener('wheel', (event) => {
    if (gatedView.hidden || !isHorizontalDeckMode()) return;

    const scrollableBox = event.target.closest('.slide-card, .slide-narrative, .slide-stage');
    if (scrollableBox && scrollableBox.scrollHeight > scrollableBox.clientHeight) {
      const atTop = scrollableBox.scrollTop <= 0 && event.deltaY < 0;
      const atBottom = Math.ceil(scrollableBox.scrollTop + scrollableBox.clientHeight) >= scrollableBox.scrollHeight && event.deltaY > 0;
      if (!atTop && !atBottom) return;
    }

    event.preventDefault();

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && Math.abs(event.deltaY) > 10) {
      if (wheelLock) return;
      wheelLock = true;

      if (event.deltaY > 0) {
        goToSlide(activeSlideIndex + 1);
      } else {
        goToSlide(activeSlideIndex - 1);
      }

      setTimeout(() => {
        wheelLock = false;
      }, 340);
    }
  }, { passive: false });

  /* Keyboard Slide Navigation (XL Desktop only) */
  document.addEventListener('keydown', (event) => {
    if (gatedView.hidden || !isHorizontalDeckMode()) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault();
      goToSlide(activeSlideIndex + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      goToSlide(activeSlideIndex - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goToSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goToSlide(getActiveSlides().length - 1);
    }
  });

  /* Progressive Disclosure ("More +" / "Less −") */
  gatedView.addEventListener('click', (event) => {
    const toggle = event.target.closest('.more-toggle');
    if (!toggle) return;

    const container = toggle.closest('.more-block');
    const drawer = container ? container.querySelector('.more-drawer') : toggle.nextElementSibling;
    if (!drawer) return;

    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    toggle.textContent = isExpanded ? 'More +' : 'Less −';
    drawer.hidden = isExpanded;
  });

  /* Print / Save as PDF */
  if (printPdfBtn) {
    printPdfBtn.addEventListener('click', () => window.print());
  }
  document.querySelectorAll('[data-trigger-print]').forEach((btn) => {
    btn.addEventListener('click', () => window.print());
  });

  /* Restore Session Unlock State */
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
    setDeckUnlockedState(true);
  } else {
    setDeckUnlockedState(false);
  }
})();