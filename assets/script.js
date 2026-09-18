document.addEventListener('DOMContentLoaded', function () {
  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Product / cert sliders with arrow controls
  document.querySelectorAll('.product-slider-wrap').forEach(function (wrap) {
    var track = wrap.querySelector('.product-slider');
    var prev = wrap.querySelector('.slider-arrow.prev');
    var next = wrap.querySelector('.slider-arrow.next');
    if (!track) return;
    function step() {
      var card = track.querySelector('.product-card');
      return card ? card.getBoundingClientRect().width + 1 : 260;
    }
    function updateArrows() {
      var scrollable = track.scrollWidth > track.clientWidth + 2;
      if (prev) prev.style.display = scrollable ? 'flex' : 'none';
      if (next) next.style.display = scrollable ? 'flex' : 'none';
    }
    if (prev) prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
    updateArrows();
    window.addEventListener('resize', updateArrows);
  });

  // Certificate slider arrow controls
  document.querySelectorAll('.cert-arrows').forEach(function (arrows) {
    var wrap = arrows.closest('section') || document;
    var track = wrap.querySelector('.cert-slider');
    var prev = arrows.querySelector('.slider-arrow.prev');
    var next = arrows.querySelector('.slider-arrow.next');
    if (!track) return;
    function step() {
      var card = track.querySelector('.cert');
      return card ? card.getBoundingClientRect().width + 16 : 220;
    }
    if (prev) prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
  });

  // Certificate lightbox: click a thumb to open, page through with arrows/keys
  (function () {
    const certButtons = Array.from(document.querySelectorAll('.cert-slider .cert'));
    const lightbox = document.getElementById('certLightbox');
    if (!certButtons.length || !lightbox) return;
    const imgEl = lightbox.querySelector('.cert-lightbox-img');
    const countEl = lightbox.querySelector('.cert-lightbox-count');
    let current = 0;
    function show(i) {
      current = (i + certButtons.length) % certButtons.length;
      const num = certButtons[current].getAttribute('data-cert');
      imgEl.src = 'assets/certs/cert-' + String(num).padStart(2, '0') + '.jpg';
      countEl.textContent = (current + 1) + ' / ' + certButtons.length;
    }
    certButtons.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        show(i);
        lightbox.classList.add('open');
      });
    });
    lightbox.querySelector('.cert-lightbox-close').addEventListener('click', function () {
      lightbox.classList.remove('open');
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.classList.remove('open');
    });
    lightbox.querySelector('.cert-lightbox-nav.prev').addEventListener('click', function () { show(current - 1); });
    lightbox.querySelector('.cert-lightbox-nav.next').addEventListener('click', function () { show(current + 1); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') lightbox.classList.remove('open');
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  })();

  // Types accordion (metal-constructions page)
  document.querySelectorAll('.types-accordion').forEach(function (wrap) {
    wrap.querySelectorAll('.ta-item').forEach(function (item) {
      var q = item.querySelector('.ta-q');
      var plus = item.querySelector('.plus');
      if (!q) return;
      q.addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        wrap.querySelectorAll('.ta-item').forEach(function (i) {
          i.classList.remove('open');
          i.querySelector('.plus').textContent = '+';
        });
        if (!wasOpen) {
          item.classList.add('open');
          plus.textContent = '−';
        }
      });
    });
  });

  // Types tabs (metal-constructions page)
  document.querySelectorAll('.types-tabs').forEach(function (wrap) {
    var btns = wrap.querySelectorAll('.tab-btn');
    var panels = wrap.querySelectorAll('.tab-panel');
    btns.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        panels[i].classList.add('active');
      });
    });
  });

  // Phone input mask: formats as +7 (___) ___-__-__ while typing
  document.querySelectorAll('input.phone-mask').forEach(function (input) {
    function formatPhone(value) {
      let digits = value.replace(/\D/g, '');
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (!digits.startsWith('7')) digits = '7' + digits;
      digits = digits.slice(0, 11);
      let out = '+7';
      const rest = digits.slice(1);
      if (rest.length > 0) out += ' (' + rest.slice(0, 3);
      if (rest.length >= 3) out += ')';
      if (rest.length > 3) out += ' ' + rest.slice(3, 6);
      if (rest.length > 6) out += '-' + rest.slice(6, 8);
      if (rest.length > 8) out += '-' + rest.slice(8, 10);
      return out;
    }
    input.addEventListener('focus', function () {
      if (!input.value) input.value = '+7 (';
    });
    input.addEventListener('input', function () {
      input.value = formatPhone(input.value);
    });
    input.addEventListener('blur', function () {
      if (input.value === '+7 (' || input.value === '+7') input.value = '';
    });
  });

  // Form validation: block submit until required fields + consent are valid
  document.querySelectorAll('.contact-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      let valid = true;
      const name = form.querySelector('input[name="name"]');
      const phone = form.querySelector('input.phone-mask');
      const consent = form.querySelector('.consent-check');

      form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
      form.querySelectorAll('.field-invalid').forEach(function (el) { el.classList.remove('field-invalid'); });

      function showError(field, message) {
        valid = false;
        field.classList.add('field-invalid');
        const err = document.createElement('div');
        err.className = 'field-error';
        err.textContent = message;
        field.insertAdjacentElement('afterend', err);
      }

      if (name && name.value.trim().length < 2) {
        showError(name, 'Введите имя');
      }
      if (phone) {
        const digits = phone.value.replace(/\D/g, '');
        if (digits.length !== 11) {
          showError(phone, 'Введите полный номер телефона');
        }
      }
      if (consent && !consent.checked) {
        valid = false;
        consent.closest('label').classList.add('field-invalid');
      }

      if (!valid) {
        e.preventDefault();
      }
    });
  });

  // Mobile nav
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.main-nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('nav-open');
    });
  }
});
