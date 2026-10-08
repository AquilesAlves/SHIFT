/* ==========================================================================
   SHIFT — Agência Digital
   JavaScript principal (Vanilla JS, sem dependências externas)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     0. WHATSAPP — edite apenas estas duas linhas
     Número no formato internacional, só dígitos (55 + DDD + número).
  ------------------------------------------------------------------ */
  var WHATSAPP_NUMBER = '5511999999999';
  var WHATSAPP_MESSAGE = 'Olá! Vim pelo site da SHIFT e gostaria de solicitar um orçamento.';

  document.querySelectorAll('[data-whatsapp]').forEach(function (link) {
    link.setAttribute('href', 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE));
  });

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

  backToTop.addEventListener('click', function () {
    smoothScrollTo(0);
  });

  /* ------------------------------------------------------------------
     4. SCROLL SUAVE PARA ÂNCORAS INTERNAS
  ------------------------------------------------------------------ */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Animação de rolagem com aceleração/desaceleração suave
  function smoothScrollTo(targetY, onDone) {
    var startY = window.pageYOffset;
    var distance = targetY - startY;

    if (reduceMotion || Math.abs(distance) < 2) {
      window.scrollTo(0, targetY);
      if (onDone) onDone();
      return;
    }

    // Duração proporcional à distância (entre 0,5s e 0,9s)
    var duration = Math.min(900, Math.max(500, Math.abs(distance) * 0.4));
    var startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else if (onDone) {
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId.length < 2) return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();

      // Animação de clique no item do menu
      if (this.classList.contains('nav__link')) {
        this.classList.remove('is-clicked');
        void this.offsetWidth; // reinicia a animação
        this.classList.add('is-clicked');
      }

      var top = target.getBoundingClientRect().top + window.pageYOffset - header.offsetHeight + 1;

      smoothScrollTo(Math.max(0, top), function () {
        // Ao chegar, dá um pequeno destaque na linha de comando da seção
        var prompt = target.querySelector('.prompt');
        if (prompt) {
          prompt.classList.remove('is-flash');
          void prompt.offsetWidth; // reinicia a animação
          prompt.classList.add('is-flash');
        }
      });
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
    '.service-card, .feature, .portfolio-card, .testimonial, .box, .process-list li'
  );

  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  var revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        el.classList.add('is-visible');
        observer.unobserve(el);
        // Depois da animação, remove as classes para não conflitar com o hover
        setTimeout(function () { el.classList.remove('reveal', 'is-visible'); }, 800);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(function (el) { revealObserver.observe(el); });

  /* ------------------------------------------------------------------
     10. TERMINAL DO HERO — efeito de digitação
     Comandos (data-type="cmd") são digitados letra a letra;
     as saídas (data-type="out") aparecem em sequência.
     Respeita "prefers-reduced-motion" (mostra tudo de uma vez).
  ------------------------------------------------------------------ */
  var heroTerm = document.getElementById('heroTerminal');

  if (heroTerm && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var lines = Array.prototype.slice.call(heroTerm.querySelectorAll('.term__line'));
    var texts = lines.map(function (l) { return l.textContent; });

    // Esconde tudo e limpa o texto antes de começar
    lines.forEach(function (l) { l.style.display = 'none'; l.textContent = ''; });

    var index = 0;

    function typeNextLine() {
      if (index >= lines.length) return;

      var line = lines[index];
      var text = texts[index];
      var isCmd = line.getAttribute('data-type') === 'cmd';
      var isLast = index === lines.length - 1;
      line.style.display = 'block';

      // Última linha: apenas o cursor piscando
      if (isLast) {
        line.innerHTML = '<span class="cursor"></span>';
        return;
      }

      if (!isCmd) {
        // Saída: aparece de uma vez
        line.textContent = text;
        index++;
        setTimeout(typeNextLine, 350);
        return;
      }

      // Comando: digita caractere por caractere
      var i = 0;
      var timer = setInterval(function () {
        line.textContent = text.slice(0, ++i);
        if (i >= text.length) {
          clearInterval(timer);
          index++;
          setTimeout(typeNextLine, 450);
        }
      }, 45);
    }

    setTimeout(typeNextLine, 600);
  }

  /* ------------------------------------------------------------------
     9. ANO ATUAL NO RODAPÉ
  ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Estado inicial (roda por último, quando tudo já foi declarado)
  onScroll();

});
