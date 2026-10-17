/* =========================================================
   Aarogya Healthcare Clinic — site interactions
   Plain JavaScript, no framework or build step.
   ========================================================= */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '918477854507';
  var PHONE_LINK = 'tel:+918477854507';

  var doc = document;
  var header = doc.getElementById('header');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(selector, context) {
    return (context || doc).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call((context || doc).querySelectorAll(selector));
  }

  function scrollBehavior() {
    return reducedMotion.matches ? 'auto' : 'smooth';
  }

  function headerOffset() {
    return (header ? header.offsetHeight : 0) + 12;
  }

  /* ---------- Footer year ---------- */
  var year = doc.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* ---------- Mobile navigation (off-canvas drawer) ---------- */
  var nav = doc.getElementById('site-nav');
  var navToggle = $('.nav-toggle');
  var navClose = $('.nav__close');
  var backdrop = $('.nav-backdrop');
  var drawerQuery = window.matchMedia('(max-width: 1023.98px)');
  var lastFocused = null;

  function focusableIn(container) {
    return $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', container)
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function onDrawerKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeNav(true);
      return;
    }
    if (event.key !== 'Tab') return;

    // Keep keyboard focus inside the open drawer
    var items = focusableIn(nav);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && doc.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openNav() {
    if (!nav || nav.classList.contains('is-open')) return;
    lastFocused = doc.activeElement;
    nav.classList.add('is-open');
    backdrop.hidden = false;
    window.requestAnimationFrame(function () { backdrop.classList.add('is-visible'); });
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'मेनू बंद करें');
    doc.documentElement.classList.add('nav-open');
    doc.addEventListener('keydown', onDrawerKeydown);
    if (navClose) focusWhenVisible(navClose, 10);
  }

  // The drawer can only take focus once its visibility has switched to "visible"
  function focusWhenVisible(el, framesLeft) {
    if (!nav.classList.contains('is-open')) return;
    if (window.getComputedStyle(nav).visibility === 'visible') {
      el.focus({ preventScroll: true });
    } else if (framesLeft > 0) {
      window.requestAnimationFrame(function () { focusWhenVisible(el, framesLeft - 1); });
    }
  }

  function closeNav(restoreFocus) {
    if (!nav || !nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'मेनू खोलें');
    doc.documentElement.classList.remove('nav-open');
    doc.removeEventListener('keydown', onDrawerKeydown);
    window.setTimeout(function () {
      if (!nav.classList.contains('is-open')) backdrop.hidden = true;
    }, 300);
    if (restoreFocus && lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }

  if (nav && navToggle && backdrop) {
    navToggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) {
        closeNav(true);
      } else {
        openNav();
      }
    });
    if (navClose) navClose.addEventListener('click', function () { closeNav(true); });
    backdrop.addEventListener('click', function () { closeNav(true); });

    var onBreakpointChange = function (event) {
      if (!event.matches) closeNav(false);
    };
    if (drawerQuery.addEventListener) {
      drawerQuery.addEventListener('change', onBreakpointChange);
    } else {
      drawerQuery.addListener(onBreakpointChange);
    }
  }

  /* ---------- Smooth scrolling for in-page links ---------- */
  function scrollToSection(target, hash) {
    var top = hash === '#home' ? 0 : target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior() });
  }

  doc.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;

    var hash = link.getAttribute('href');
    if (hash === '#') {
      // Placeholder link (e.g. a social profile that has not been added yet)
      event.preventDefault();
      return;
    }

    var target = doc.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    if (nav && nav.contains(link)) closeNav(false);
    scrollToSection(target, hash);

    try {
      window.history.pushState(null, '', hash);
    } catch (error) {
      // Some browsers block history updates on file:// pages; scrolling still works.
    }

    // Move keyboard focus to the section without causing a second jump
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ---------- Header shadow, back-to-top button, active menu link ---------- */
  var backToTop = $('.back-to-top');
  var navLinks = $$('.nav__link');
  var spySections = $$('#home, #about, #services, #treatments, #why-us, #appointment, #reviews, #health-info, #gallery, #contact');
  var ticking = false;

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveLink() {
    if (!spySections.length) return;
    var line = window.pageYOffset + headerOffset() + window.innerHeight * 0.3;
    var current = spySections[0];
    spySections.forEach(function (section) {
      if (section.getBoundingClientRect().top + window.pageYOffset <= line) current = section;
    });
    var atBottom = window.innerHeight + window.pageYOffset >= doc.documentElement.scrollHeight - 4;
    if (atBottom) current = spySections[spySections.length - 1];
    setActiveLink(current.id);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var y = window.pageYOffset;
      if (header) header.classList.toggle('is-scrolled', y > 10);
      if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
      updateActiveLink();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Reveal-on-scroll animation ---------- */
  var revealItems = $$('.reveal');

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    revealItems.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
        return child.classList.contains('reveal');
      });
      var index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--reveal-delay', Math.min(index, 5) * 90 + 'ms');
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- About: "Read more" toggle ---------- */
  var aboutMore = doc.getElementById('about-more');
  var aboutToggle = $('.about__toggle');

  if (aboutMore && aboutToggle) {
    var aboutLabel = $('.about__toggle-label', aboutToggle);
    aboutMore.hidden = true;
    aboutToggle.hidden = false;
    aboutToggle.addEventListener('click', function () {
      var isOpen = aboutToggle.getAttribute('aria-expanded') === 'true';
      aboutToggle.setAttribute('aria-expanded', String(!isOpen));
      aboutMore.hidden = isOpen;
      aboutLabel.textContent = isOpen ? 'और जानें' : 'कम दिखाएं';
    });
  }

  /* ---------- Reviews slider ---------- */
  var track = doc.getElementById('reviews-track');
  var prevButton = $('.slider-btn--prev');
  var nextButton = $('.slider-btn--next');

  if (track && prevButton && nextButton) {
    var stepSize = function () {
      var card = $('.review-card', track);
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    };

    var updateSliderButtons = function () {
      var maxScroll = track.scrollWidth - track.clientWidth - 6;
      prevButton.disabled = track.scrollLeft <= 6;
      nextButton.disabled = track.scrollLeft >= maxScroll;
    };

    prevButton.addEventListener('click', function () {
      track.scrollBy({ left: -stepSize(), behavior: scrollBehavior() });
    });
    nextButton.addEventListener('click', function () {
      track.scrollBy({ left: stepSize(), behavior: scrollBehavior() });
    });
    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(updateSliderButtons);
    }, { passive: true });
    window.addEventListener('resize', updateSliderButtons);
    updateSliderButtons();
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = doc.getElementById('lightbox');

  if (lightbox && typeof lightbox.showModal === 'function') {
    var lightboxFigure = $('.lightbox__figure', lightbox);
    var lightboxCaption = $('.lightbox__caption', lightbox);
    var lightboxImage = doc.createElement('img');
    lightboxImage.className = 'lightbox__img';
    lightboxImage.alt = '';
    lightboxFigure.insertBefore(lightboxImage, lightboxCaption);

    $$('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function (event) {
        event.preventDefault();
        var thumb = $('img', item);
        lightboxImage.src = item.getAttribute('href');
        lightboxImage.alt = thumb ? thumb.alt : '';
        lightboxCaption.textContent = item.getAttribute('data-caption') || '';
        lightbox.showModal();
      });
    });

    $('.lightbox__close', lightbox).addEventListener('click', function () { lightbox.close(); });
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) lightbox.close();
    });
  }

  /* ---------- Appointment form ---------- */
  var form = doc.getElementById('appointment-form');
  if (form) initAppointmentForm(form);

  function toISODate(date) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function formatDate(iso) {
    var parts = iso.split('-');
    return parts[2] + '-' + parts[1] + '-' + parts[0];
  }

  // Accepts 10-digit Indian mobile numbers, optionally with +91 / 91 / 0 in front.
  function normalizePhone(value) {
    var digits = value.replace(/[\s\-().]/g, '');
    if (digits.indexOf('+91') === 0) {
      digits = digits.slice(3);
    } else if (digits.indexOf('0091') === 0) {
      digits = digits.slice(4);
    } else if (digits.length === 12 && digits.indexOf('91') === 0) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.charAt(0) === '0') {
      digits = digits.slice(1);
    }
    return /^[6-9]\d{9}$/.test(digits) ? digits : '';
  }

  function initAppointmentForm(form) {
    /* The form is only "connected" when its action attribute points to a real
       submission endpoint (see the comment above the form in index.html). */
    var endpoint = (form.getAttribute('action') || '').trim();
    var isConnected = endpoint !== '' && endpoint !== '#';
    var backendNote = doc.getElementById('form-backend-note');
    var status = doc.getElementById('form-status');
    var submitButton = $('[type="submit"]', form);
    var submitLabel = $('.appointment-form__submit-label', form);
    var submitText = submitLabel.textContent;
    var today = toISODate(new Date());
    var submittedOnce = false;

    var fields = {
      name: form.elements.name,
      phone: form.elements.phone,
      age: form.elements.age,
      concern: form.elements.concern,
      date: form.elements.date,
      time: form.elements.time
    };
    var fieldOrder = ['name', 'phone', 'age', 'concern', 'date', 'time'];

    form.noValidate = true;
    fields.date.min = today;

    if (isConnected) {
      if (backendNote) backendNote.hidden = true;
    } else if (window.console) {
      window.console.info('[Aarogya] The appointment form is not connected to a submission service yet. Add action="https://…" to #appointment-form in index.html.');
    }

    var validators = {
      name: function (input) {
        var value = input.value.trim();
        if (!value) return 'कृपया अपना पूरा नाम लिखें।';
        if (value.length < 2) return 'नाम कम से कम 2 अक्षरों का होना चाहिए।';
        return '';
      },
      phone: function (input) {
        if (!input.value.trim()) return 'कृपया अपना मोबाइल नंबर लिखें।';
        if (!normalizePhone(input.value)) return 'कृपया सही 10 अंकों का मोबाइल नंबर लिखें।';
        return '';
      },
      age: function (input) {
        if (input.validity && input.validity.badInput) return 'कृपया उम्र केवल अंकों में लिखें।';
        if (input.value === '') return '';
        var age = Number(input.value);
        if (!Number.isInteger(age) || age < 0 || age > 120) return 'कृपया सही उम्र लिखें (0 से 120 के बीच)।';
        return '';
      },
      concern: function () {
        return '';
      },
      date: function (input) {
        if (!input.value) return '';
        if (input.value < today) return 'कृपया आज या आगे की कोई तारीख चुनें।';
        return '';
      },
      time: function (input) {
        if (!input.value || fields.date.value !== today) return '';
        var end = input.value.split('-')[1].split(':');
        var now = new Date();
        if (now.getHours() * 60 + now.getMinutes() >= Number(end[0]) * 60 + Number(end[1])) {
          return 'आज के लिए यह समय निकल चुका है, कृपया दूसरा समय चुनें।';
        }
        return '';
      }
    };

    function setError(name, message) {
      var input = fields[name];
      var field = input.closest('.form-field');
      var errorEl = doc.getElementById(input.getAttribute('aria-describedby'));
      field.classList.toggle('has-error', Boolean(message));
      if (message) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }
      if (errorEl) errorEl.textContent = message;
    }

    function validateField(name) {
      var message = validators[name](fields[name]);
      setError(name, message);
      return !message;
    }

    fields.phone.addEventListener('input', function () {
      var cleaned = fields.phone.value.replace(/[^\d+\s\-]/g, '');
      if (cleaned !== fields.phone.value) fields.phone.value = cleaned;
    });

    fieldOrder.forEach(function (name) {
      var input = fields[name];
      var eventName = input.tagName === 'SELECT' || input.type === 'date' ? 'change' : 'input';
      input.addEventListener(eventName, function () {
        if (submittedOnce || input.getAttribute('aria-invalid') === 'true') validateField(name);
        if (name === 'date' && fields.time.value) validateField('time');
      });
      input.addEventListener('blur', function () {
        if (input.value) validateField(name);
      });
    });

    function hideStatus() {
      if (!status.hidden) {
        status.hidden = true;
        status.replaceChildren();
      }
    }

    function collectData() {
      var concernOption = fields.concern.options[fields.concern.selectedIndex];
      var timeOption = fields.time.options[fields.time.selectedIndex];
      return {
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        age: fields.age.value.trim(),
        concern: fields.concern.value ? concernOption.textContent.trim() : '',
        date: fields.date.value ? formatDate(fields.date.value) : '',
        time: fields.time.value ? timeOption.textContent.trim() : ''
      };
    }

    function whatsappLink(data) {
      var lines = [
        'नमस्ते, मैं आरोग्य हेल्थकेयर क्लीनिक में अपॉइंटमेंट लेना चाहता/चाहती हूं।',
        '',
        'नाम: ' + data.name,
        'मोबाइल: ' + data.phone
      ];
      if (data.age) lines.push('उम्र: ' + data.age);
      if (data.concern) lines.push('समस्या / उपचार: ' + data.concern);
      if (data.date) lines.push('तारीख: ' + data.date);
      if (data.time) lines.push('समय: ' + data.time);
      return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    }

    function contactActions(data) {
      return [
        { label: 'WhatsApp पर जानकारी भेजें', href: whatsappLink(data), icon: 'fa-brands fa-whatsapp', className: 'btn--whatsapp', external: true },
        { label: 'कॉल करें', href: PHONE_LINK, icon: 'fa-solid fa-phone', className: 'btn--outline' }
      ];
    }

    function showStatus(type, content) {
      status.className = 'form-status form-status--' + type;
      status.replaceChildren();

      var title = doc.createElement('p');
      title.className = 'form-status__title';
      var icon = doc.createElement('i');
      icon.className = content.icon;
      icon.setAttribute('aria-hidden', 'true');
      title.append(icon, doc.createTextNode(content.title));

      var text = doc.createElement('p');
      text.className = 'form-status__text';
      text.textContent = content.text;
      status.append(title, text);

      if (content.actions && content.actions.length) {
        var actions = doc.createElement('div');
        actions.className = 'form-status__actions';
        content.actions.forEach(function (action) {
          var link = doc.createElement('a');
          link.className = 'btn ' + action.className;
          link.href = action.href;
          if (action.external) {
            link.target = '_blank';
            link.rel = 'noopener';
          }
          var actionIcon = doc.createElement('i');
          actionIcon.className = action.icon;
          actionIcon.setAttribute('aria-hidden', 'true');
          link.append(actionIcon, doc.createTextNode(action.label));
          actions.append(link);
        });
        status.append(actions);
      }

      status.hidden = false;
      status.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
    }

    function setBusy(busy) {
      submitButton.disabled = busy;
      submitButton.setAttribute('aria-busy', String(busy));
      submitLabel.textContent = busy ? 'भेजा जा रहा है…' : submitText;
    }

    // Any edit makes an earlier message (and its WhatsApp link) out of date
    form.addEventListener('input', hideStatus);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submittedOnce = true;

      var invalid = fieldOrder.filter(function (name) { return !validateField(name); });
      if (invalid.length) {
        hideStatus();
        fields[invalid[0]].focus();
        return;
      }

      var data = collectData();

      if (!isConnected) {
        // No backend: be explicit that nothing was booked, and offer real alternatives.
        showStatus('warning', {
          icon: 'fa-solid fa-triangle-exclamation',
          title: 'अपॉइंटमेंट अभी बुक नहीं हुआ है',
          text: 'यह ऑनलाइन फ़ॉर्म अभी किसी सबमिशन सेवा से जुड़ा नहीं है, इसलिए आपकी जानकारी क्लीनिक तक नहीं पहुंची है। अपॉइंटमेंट के लिए नीचे दिए बटन से यही जानकारी WhatsApp पर भेजें या सीधे कॉल करें।',
          actions: contactActions(data)
        });
        return;
      }

      setBusy(true);
      window.fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          form.reset();
          submittedOnce = false;
          showStatus('success', {
            icon: 'fa-solid fa-circle-check',
            title: 'आपका अनुरोध क्लीनिक को भेज दिया गया है',
            text: 'अपॉइंटमेंट की पुष्टि क्लीनिक द्वारा की जाएगी। तुरंत सहायता के लिए +91 8477854507 पर कॉल करें।'
          });
        })
        .catch(function (error) {
          if (window.console) window.console.error('[Aarogya] Appointment request failed:', error);
          showStatus('error', {
            icon: 'fa-solid fa-circle-exclamation',
            title: 'अनुरोध नहीं भेजा जा सका',
            text: 'कृपया दोबारा कोशिश करें, या अपॉइंटमेंट के लिए WhatsApp करें या कॉल करें।',
            actions: contactActions(data)
          });
        })
        .then(function () {
          setBusy(false);
        });
    });
  }
})();
