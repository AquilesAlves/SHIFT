/* ==========================================================================
   SHIFT — Agência Digital
   JavaScript principal (Vanilla JS, sem dependências externas)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     1. TEMA CLARO / ESCURO
     - Detecta preferência do sistema no primeiro acesso
     - Salva a escolha do usuário no LocalStorage
     - Alterna o atributo data-theme no <html>
  ------------------------------------------------------------------ */
  var htmlEl = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var THEME_KEY = 'shift-theme';

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  function getInitialTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  applyTheme(getInitialTheme());

  themeToggle.addEventListener('click', function () {
    var current = htmlEl.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ------------------------------------------------------------------
     2. MENU MOBILE
  ------------------------------------------------------------------ */
  var menuToggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');

  menuToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  // Fecha o menu mobile ao clicar em um link
  document.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ------------------------------------------------------------------
     3. HEADER DINÂMICO AO ROLAR + BOTÃO VOLTAR AO TOPO
  ------------------------------------------------------------------ */
  var header = document.getElementById('header');
  var backToTop = document.getElementById('backToTop');

  function onScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', scrollY > 10);
    backToTop.classList.toggle('is-visible', scrollY > 400);
    updateActiveNavLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ------------------------------------------------------------------
     4. SCROLL SUAVE PARA ÂNCORAS INTERNAS
  ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId.length < 2) return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var headerHeight = header.offsetHeight;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ------------------------------------------------------------------
     5. DESTAQUE AUTOMÁTICO DO ITEM ATIVO DO MENU
  ------------------------------------------------------------------ */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));

  function updateActiveNavLink() {
    var scrollPos = window.scrollY + header.offsetHeight + 40;
    var currentId = null;

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('is-active', isActive);
    });
  }

  /* ------------------------------------------------------------------
     6. CONTADORES ANIMADOS (estatísticas)
     Só é iniciado quando a seção entra na tela (IntersectionObserver)
  ------------------------------------------------------------------ */
  var statNumbers = document.querySelectorAll('.stat__number');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1400;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  var statsObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        statNumbers.forEach(animateCounter);
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  var statsSection = document.querySelector('.stats');
  if (statsSection) statsObserver.observe(statsSection);

  /* ------------------------------------------------------------------
     7. ANIMAÇÕES AO ENTRAR NA TELA (scroll reveal)
     Adiciona a classe "reveal" via JS aos blocos principais
     e revela quando entram no viewport.
  ------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll(
    '.service-card, .feature, .portfolio-card, .testimonial, .about__text, .about__visual, .process-list li'
  );

  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  var revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(function (el) { revealObserver.observe(el); });

  /* ------------------------------------------------------------------
     8. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
  ------------------------------------------------------------------ */
  var form = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');

  var fields = {
    name: { input: document.getElementById('name'), error: document.getElementById('nameError') },
    email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
    phone: { input: document.getElementById('phone'), error: document.getElementById('phoneError') },
    message: { input: document.getElementById('message'), error: document.getElementById('messageError') }
  };

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phoneRegex = /^[0-9()+\-.\s]{8,20}$/;

  function setFieldError(field, message) {
    field.input.closest('.form__field').classList.toggle('has-error', Boolean(message));
    field.error.textContent = message || '';
  }

  function validateField(key) {
    var field = fields[key];
    var value = field.input.value.trim();

    if (!value) {
      setFieldError(field, 'Este campo é obrigatório.');
      return false;
    }

    if (key === 'email' && !emailRegex.test(value)) {
      setFieldError(field, 'Digite um e-mail válido.');
      return false;
    }

    if (key === 'phone' && !phoneRegex.test(value)) {
      setFieldError(field, 'Digite um telefone válido.');
      return false;
    }

    setFieldError(field, '');
    return true;
  }

  // Validação em tempo real ao sair do campo
  Object.keys(fields).forEach(function (key) {
    fields[key].input.addEventListener('blur', function () { validateField(key); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var isValid = Object.keys(fields).map(validateField).every(Boolean);

    if (!isValid) {
      formSuccess.hidden = true;
      return;
    }

    // Simulação de envio (sem backend integrado neste projeto)
    formSuccess.hidden = false;
    form.reset();
    Object.keys(fields).forEach(function (key) { setFieldError(fields[key], ''); });

    setTimeout(function () { formSuccess.hidden = true; }, 6000);
  });

  /* ------------------------------------------------------------------
     9. ANO ATUAL NO RODAPÉ
  ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
