/* ========================================
   HAN Dienstleister GmbH – Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Theme Toggle (Dark/Light Mode) --- */
  const html = document.documentElement;
  const themeSwitchBtns = document.querySelectorAll('.theme-switch');
  
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcons(currentTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    html.setAttribute('data-theme', initialTheme);
    updateThemeIcons(initialTheme);
  }

  themeSwitchBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const theme = html.getAttribute('data-theme');
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcons(newTheme);
    });
  });

  function updateThemeIcons(theme) {
    themeSwitchBtns.forEach(function(btn) {
      const icon = btn.querySelector('i');
      if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        btn.setAttribute('aria-label', 'Zum hellen Modus wechseln');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        btn.setAttribute('aria-label', 'Zum dunklen Modus wechseln');
      }
    });
  }

  /* --- Mobile Navigation --- */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  function openMobileNav() {
    hamburger.classList.add('active');
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (mobileNav.classList.contains('open')) closeMobileNav();
      else openMobileNav();
    });
  }

  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);
  mobileLinks.forEach(function (link) { link.addEventListener('click', closeMobileNav); });

  /* --- Header Scroll Effect --- */
  const header = document.querySelector('.header');

  function handleScroll() {
    var scrollY = window.pageYOffset;
    if (header) {
      if (scrollY > 60) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      if (scrollY > 500) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* --- Back to Top --- */
  var backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Scroll Reveal --- */
  var revealElements = document.querySelectorAll('.reveal');

  function checkReveal() {
    var windowHeight = window.innerHeight;
    revealElements.forEach(function (el) {
      var elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - 120) el.classList.add('visible');
    });
  }

  window.addEventListener('scroll', checkReveal, { passive: true });
  window.addEventListener('resize', checkReveal);
  checkReveal();

  /* --- Opening Hours Status --- */
  function updateOpeningStatus() {
    var statusElements = document.querySelectorAll('.hours-status');
    if (statusElements.length === 0) return;
    var now = new Date();
    var day = now.getDay();
    var currentTime = now.getHours() + now.getMinutes() / 60;
    var isOpen = false;

    if (day >= 1 && day <= 3) { if (currentTime >= 9 && currentTime < 16) isOpen = true; }
    if (day >= 4 && day <= 5) { if (currentTime >= 9 && currentTime < 18) isOpen = true; }

    statusElements.forEach(function (el) {
      if (isOpen) {
        el.className = 'hours-status hours-status--open';
        el.innerHTML = '<span class="hours-status__dot"></span> Aktuell geöffnet';
      } else {
        el.className = 'hours-status hours-status--closed';
        el.innerHTML = '<span class="hours-status__dot"></span> Aktuell geschlossen';
      }
    });
  }

  updateOpeningStatus();
  setInterval(updateOpeningStatus, 60000);

    /* --- Header Live Status & Timer --- */
  function updateHeaderStatus() {
    var statusEl = document.getElementById('headerStatus');
    if (!statusEl) return;

    var now = new Date();
    var day = now.getDay(); // 0=So, 1=Mo, ...
    var currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    var isOpen = false;
    var targetTime = null; // Wann ändert sich der Status?

    // Öffnungszeiten prüfen
    // Montag (1) bis Mittwoch (3): 09:00–16:00
    if (day >= 1 && day <= 3) {
      if (currentTotalMinutes >= 540 && currentTotalMinutes < 960) {
        isOpen = true;
        targetTime = new Date(now); targetTime.setHours(16, 0, 0, 0); // Schließt um 16:00
      } else if (currentTotalMinutes < 540) {
        isOpen = false;
        targetTime = new Date(now); targetTime.setHours(9, 0, 0, 0); // Öffnet heute noch
      } else {
        isOpen = false;
        targetTime = getNextOpenTime(now); // Öffnet an anderem Tag
      }
    }
    // Donnerstag (4) bis Freitag (5): 09:00–18:00
    else if (day >= 4 && day <= 5) {
      if (currentTotalMinutes >= 540 && currentTotalMinutes < 1080) {
        isOpen = true;
        targetTime = new Date(now); targetTime.setHours(18, 0, 0, 0); // Schließt um 18:00
      } else if (currentTotalMinutes < 540) {
        isOpen = false;
        targetTime = new Date(now); targetTime.setHours(9, 0, 0, 0); // Öffnet heute noch
      } else {
        isOpen = false;
        targetTime = getNextOpenTime(now); // Öffnet an anderem Tag
      }
    }
    // Samstag (6) & Sonntag (0)
    else {
      isOpen = false;
      targetTime = getNextOpenTime(now);
    }

    // Countdown berechnen
    var diff = targetTime - now;
    if (diff < 0) diff = 0; // fallback
    
    var hours = Math.floor(diff / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    
    var countdownStr = "";
    if (hours > 0) {
      countdownStr = hours + " Std " + minutes + " Min";
    } else {
      countdownStr = minutes + " Min";
    }

    var statusText = isOpen 
      ? "Geöffnet – schließt in " + countdownStr 
      : "Geschlossen – öffnet in " + countdownStr;

    statusEl.className = "header__status " + (isOpen ? "header__status--open" : "header__status--closed");
    statusEl.innerHTML = '<span class="header__status-dot"></span><span>' + statusText + '</span>';
  }

    /* --- Live Status Section (Startseite) --- */
  function updateLiveStatus() {
    var statusEl = document.getElementById('liveStatusBadge');
    if (!statusEl) return; // Bricht ab, wenn nicht auf der Startseite

    var now = new Date();
    var day = now.getDay(); // 0=So, 1=Mo, ...
    var currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    var isOpen = false;
    var targetTime = null; 

    // Montag (1) bis Mittwoch (3): 09:00–16:00
    if (day >= 1 && day <= 3) {
      if (currentTotalMinutes >= 540 && currentTotalMinutes < 960) {
        isOpen = true;
        targetTime = new Date(now); targetTime.setHours(16, 0, 0, 0);
      } else if (currentTotalMinutes < 540) {
        isOpen = false;
        targetTime = new Date(now); targetTime.setHours(9, 0, 0, 0);
      } else {
        isOpen = false;
        targetTime = getNextOpenTime(now);
      }
    }
    // Donnerstag (4) bis Freitag (5): 09:00–18:00
    else if (day >= 4 && day <= 5) {
      if (currentTotalMinutes >= 540 && currentTotalMinutes < 1080) {
        isOpen = true;
        targetTime = new Date(now); targetTime.setHours(18, 0, 0, 0);
      } else if (currentTotalMinutes < 540) {
        isOpen = false;
        targetTime = new Date(now); targetTime.setHours(9, 0, 0, 0);
      } else {
        isOpen = false;
        targetTime = getNextOpenTime(now);
      }
    }
    // Samstag (6) & Sonntag (0)
    else {
      isOpen = false;
      targetTime = getNextOpenTime(now);
    }

    var diff = targetTime - now;
    if (diff < 0) diff = 0;
    
    var statusText = "";

    if (isOpen) {
      var hours = Math.floor(diff / 3600000);
      var minutes = Math.floor((diff % 3600000) / 60000);
      
      if (hours > 0) {
        statusText = "Aktuell geöffnet – schließt in " + hours + " Std " + minutes + " Min";
      } else {
        statusText = "Aktuell geöffnet – schließt in " + minutes + " Minuten";
      }
    } else {
      var days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
      var tDay = targetTime.getDay();
      var tHours = targetTime.getHours().toString().padStart(2, '0');
      var tMinutes = targetTime.getMinutes().toString().padStart(2, '0');
      
      if (now.getDay() === tDay) {
        statusText = "Aktuell geschlossen – öffnet heute um " + tHours + ":" + tMinutes + " Uhr";
      } else {
        statusText = "Aktuell geschlossen – öffnet am " + days[tDay] + " um " + tHours + ":" + tMinutes + " Uhr";
      }
    }

    statusEl.className = "live-status__badge " + (isOpen ? "live-status__badge--open" : "live-status__badge--closed");
    statusEl.innerHTML = '<span class="live-status__dot"></span><span>' + statusText + '</span>';
  }

  function getNextOpenTime(fromDate) {
    var date = new Date(fromDate);
    var day = date.getDay();
    
    if (day === 5) date.setDate(date.getDate() + 3); // Fr -> Mo
    else if (day === 6) date.setDate(date.getDate() + 2); // Sa -> Mo
    else if (day === 0) date.setDate(date.getDate() + 1); // So -> Mo
    else date.setDate(date.getDate() + 1); // Mo-Do -> nächster Tag
    
    date.setHours(9, 0, 0, 0);
    return date;
  }

  updateLiveStatus();
  setInterval(updateLiveStatus, 30000); // Aktualisiert alle 30 Sekunden

  /* --- Contact Form Validation --- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;
      contactForm.querySelectorAll('.form-error').forEach(function (el) { el.classList.remove('visible'); });
      contactForm.querySelectorAll('.form-control').forEach(function (el) { el.classList.remove('error'); });

      var nameInput = contactForm.querySelector('#name');
      if (!nameInput.value.trim()) { showError(nameInput, 'Bitte geben Sie Ihren Namen ein.'); isValid = false; }

      var emailInput = contactForm.querySelector('#email');
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) { showError(emailInput, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'); isValid = false; }

      var phoneInput = contactForm.querySelector('#phone');
      if (phoneInput && phoneInput.value.trim()) {
        var phoneClean = phoneInput.value.replace(/[\s\-\/]/g, '');
        if (phoneClean.length < 6) { showError(phoneInput, 'Bitte geben Sie eine gültige Telefonnummer ein.'); isValid = false; }
      }

      var subjectInput = contactForm.querySelector('#subject');
      if (subjectInput && !subjectInput.value.trim()) { showError(subjectInput, 'Bitte geben Sie einen Betreff ein.'); isValid = false; }

      var messageInput = contactForm.querySelector('#message');
      if (!messageInput.value.trim()) { showError(messageInput, 'Bitte geben Sie eine Nachricht ein.'); isValid = false; }

      if (isValid) {
        var successEl = contactForm.querySelector('.form-success');
        if (successEl) successEl.classList.add('visible');
        contactForm.reset();
        setTimeout(function () { if (successEl) successEl.classList.remove('visible'); }, 5000);
      }
    });
  }

  function showError(input, message) {
    input.classList.add('error');
    var errorEl = input.parentElement.querySelector('.form-error');
    if (errorEl) { errorEl.textContent = message; errorEl.classList.add('visible'); }
  }

  /* --- Counter Animation --- */
  var counters = document.querySelectorAll('[data-counter]');
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    counters.forEach(function (counter) {
      var rect = counter.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        countersAnimated = true;
        var target = parseInt(counter.getAttribute('data-counter'), 10);
        var suffix = counter.getAttribute('data-suffix') || '';
        var prefix = counter.getAttribute('data-prefix') || '';
        var duration = 2000;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(eased * target);
          counter.textContent = prefix + current + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else counter.textContent = prefix + target + suffix;
        }
        requestAnimationFrame(step);
      }
    });
      /* --- Opening Hours Modal --- */
  const openModalBtn = document.getElementById('openHoursModal');
  const closeModalBtn = document.getElementById('closeHoursModal');
  const modalOverlay = document.getElementById('hoursModalOverlay');

  if (openModalBtn && modalOverlay) {
    // Öffnen
    openModalBtn.addEventListener('click', function() {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Verhindert Scrollen im Hintergrund
    });

    // Schließen über X-Button
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', function() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Schließen durch Klick außerhalb des Modals
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Schließen durch Escape-Taste
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();

});