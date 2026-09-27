/* ==========================================================================
   SHIFT — Agência Digital
   JavaScript principal (Vanilla JS, sem dependências externas)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     1. TEMA CLARO / ESCURO
     - Detecta preferência do sistema no primeiro acesso
     - Salva a escolha do usuário no LocalStorage
     - Alterna o atributo data-tema no <html>
  ------------------------------------------------------------------ */
  var elementoHtml = document.documentElement;
  var alternarTema = document.getElementById('alternarTema');
  var CHAVE_TEMA = 'shift-tema';
  var abrirPaleta = document.getElementById('abrirPaleta');
  var opcoesCores = document.getElementById('opcoesCores');
  var opcoesCor = document.querySelectorAll('.opcao-cor');
  var CHAVE_COR = 'shift-cor';

  function aplicarTema(tema) {
    elementoHtml.setAttribute('data-tema', tema);
    alternarTema.setAttribute('aria-pressed', tema === 'dark' ? 'true' : 'false');
  }

  function obterTemaInicial() {
    var temaSalvo = localStorage.getItem(CHAVE_TEMA);
    if (temaSalvo === 'light' || temaSalvo === 'dark') return temaSalvo;
    var prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefereEscuro ? 'dark' : 'light';
  }

  aplicarTema(obterTemaInicial());

  function aplicarCor(cor) {
    elementoHtml.setAttribute('data-cor', cor);
    opcoesCor.forEach(function (opcao) {
      var estaSelecionada = opcao.getAttribute('data-cor') === cor;
      opcao.classList.toggle('esta-selecionada', estaSelecionada);
      opcao.setAttribute('aria-pressed', estaSelecionada ? 'true' : 'false');
    });
  }

  function obterCorInicial() {
    var corSalva = localStorage.getItem(CHAVE_COR);
    var coresDisponiveis = ['azul', 'vermelho', 'verde', 'amarelo', 'monocromatico'];
    return coresDisponiveis.indexOf(corSalva) > -1 ? corSalva : 'azul';
  }

  aplicarCor(obterCorInicial());

  alternarTema.addEventListener('click', function () {
    var temaAtual = elementoHtml.getAttribute('data-tema');
    var proximoTema = temaAtual === 'dark' ? 'light' : 'dark';
    aplicarTema(proximoTema);
    localStorage.setItem(CHAVE_TEMA, proximoTema);
  });

  abrirPaleta.addEventListener('click', function () {
    var estaAberta = opcoesCores.classList.toggle('esta-aberta');
    abrirPaleta.setAttribute('aria-expanded', estaAberta ? 'true' : 'false');
  });

  opcoesCor.forEach(function (opcao) {
    opcao.addEventListener('click', function () {
      var cor = this.getAttribute('data-cor');
      aplicarCor(cor);
      localStorage.setItem(CHAVE_COR, cor);
      opcoesCores.classList.remove('esta-aberta');
      abrirPaleta.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', function (evento) {
    if (!evento.target.closest('.seletor-paleta')) {
      opcoesCores.classList.remove('esta-aberta');
      abrirPaleta.setAttribute('aria-expanded', 'false');
    }
  });

  /* ------------------------------------------------------------------
     2. MENU MOBILE
  ------------------------------------------------------------------ */
  var alternarMenu = document.getElementById('alternarMenu');
  var navegacao = document.getElementById('navegacao');

  alternarMenu.addEventListener('click', function () {
    var estaAberto = navegacao.classList.toggle('esta-aberto');
    alternarMenu.classList.toggle('esta-aberto', estaAberto);
    alternarMenu.setAttribute('aria-expanded', estaAberto ? 'true' : 'false');
    alternarMenu.setAttribute('aria-label', estaAberto ? 'Fechar menu' : 'Abrir menu');
  });

  // Fecha o menu mobile ao clicar em um link
  document.querySelectorAll('.navegacao__link').forEach(function (ligacao) {
    ligacao.addEventListener('click', function () {
      navegacao.classList.remove('esta-aberto');
      alternarMenu.classList.remove('esta-aberto');
      alternarMenu.setAttribute('aria-expanded', 'false');
    });
  });

  /* ------------------------------------------------------------------
     3. cabecalho DINÂMICO AO ROLAR + BOTÃO VOLTAR AO TOPO
  ------------------------------------------------------------------ */
  var cabecalho = document.getElementById('cabecalho');
  var voltarAoTopo = document.getElementById('voltarAoTopo');

  function aoRolar() {
    var posicaoRolagemY = window.scrollY || window.pageYOffset;
    cabecalho.classList.toggle('esta-rolado', posicaoRolagemY > 10);
    voltarAoTopo.classList.toggle('esta-visivel', posicaoRolagemY > 400);
    atualizarLinkNavegacaoAtivo();
  }

  window.addEventListener('scroll', aoRolar, { passive: true });

  voltarAoTopo.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ------------------------------------------------------------------
     4. SCROLL SUAVE PARA ÂNCORAS INTERNAS
  ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (ancora) {
    ancora.addEventListener('click', function (evento) {
      var idDestino = this.getAttribute('href');
      if (idDestino.length < 2) return;
      var destino = document.querySelector(idDestino);
      if (!destino) return;
      evento.preventDefault();
      var alturaCabecalho = cabecalho.offsetHeight;
      var posicaoTopo = destino.getBoundingClientRect().top + window.pageYOffset - alturaCabecalho + 1;
      window.scrollTo({ top: posicaoTopo, behavior: 'smooth' });
    });
  });

  /* ------------------------------------------------------------------
     5. DESTAQUE AUTOMÁTICO DO ITEM ATIVO DO MENU
  ------------------------------------------------------------------ */
  var secoes = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var linksNavegacao = Array.prototype.slice.call(document.querySelectorAll('.navegacao__link'));

  function atualizarLinkNavegacaoAtivo() {
    var posicaoRolagem = window.scrollY + cabecalho.offsetHeight + 40;
    var idAtual = null;

    secoes.forEach(function (secao) {
      if (posicaoRolagem >= secao.offsetTop) {
        idAtual = secao.id;
      }
    });

    linksNavegacao.forEach(function (ligacao) {
      var estaAtivo = ligacao.getAttribute('href') === '#' + idAtual;
      ligacao.classList.toggle('esta-ativo', estaAtivo);
    });
  }

  // Executa depois que as seções e os links do menu foram definidos.
  aoRolar();

  /* ------------------------------------------------------------------
     6. CONTADORES ANIMADOS (eestatisticaísticas)
     Só é iniciado quando a seção entra na tela (IntersectionObserver)
  ------------------------------------------------------------------ */
  var numerosEstatisticas = document.querySelectorAll('.estatistica__numero');

  function animarContador(elemento) {
    var meta = parseInt(elemento.getAttribute('data-contagem'), 10) || 0;
    var duracao = 1400;
    var tempoInicial = null;

    function etapa(marcaTempo) {
      if (!tempoInicial) tempoInicial = marcaTempo;
      var progresso = Math.min((marcaTempo - tempoInicial) / duracao, 1);
      var progressoSuave = 1 - Math.pow(1 - progresso, 3); // ease-out cubic
      elemento.textContent = Math.floor(progressoSuave * meta);
      if (progresso < 1) {
        requestAnimationFrame(etapa);
      } else {
        elemento.textContent = meta;
      }
    }
    requestAnimationFrame(etapa);
  }

  var observadorEstatisticas = new IntersectionObserver(function (entradas, observador) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        numerosEstatisticas.forEach(animarContador);
        observador.disconnect();
      }
    });
  }, { threshold: 0.4 });

  var secaoEstatisticas = document.querySelector('.estatisticas');
  if (secaoEstatisticas) observadorEstatisticas.observe(secaoEstatisticas);

  /* ------------------------------------------------------------------
     7. ANIMAÇÕES AO ENTRAR NA TELA (scroll revelar)
     Adiciona a classe "revelar" via JS aos blocos principais
     e revela quando entram no viewport.
  ------------------------------------------------------------------ */
  var elementosRevelar = document.querySelectorAll(
    '.cartao-servico, .diferencial, .cartao-portifolio, .depoimento, .sobre__texto, .sobre__visual, .lista-processo li'
  );

  elementosRevelar.forEach(function (elemento) { elemento.classList.add('revelar'); });

  var observadorRevelar = new IntersectionObserver(function (entradas, observador) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('esta-visivel');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });

  elementosRevelar.forEach(function (elemento) { observadorRevelar.observe(elemento); });

  /* ------------------------------------------------------------------
     8. DESTAQUE DO WHATSAPP NA PRIMEIRA VISITA
  ------------------------------------------------------------------ */
  var botaoWhatsapp = document.querySelector('.botao-whatsapp');
  var CHAVE_DESTAQUE_WHATSAPP = 'shift-destaque-whatsapp';

  if (botaoWhatsapp && !localStorage.getItem(CHAVE_DESTAQUE_WHATSAPP)) {
    botaoWhatsapp.classList.add('chamar-atencao');
    localStorage.setItem(CHAVE_DESTAQUE_WHATSAPP, 'true');
    setTimeout(function () { botaoWhatsapp.classList.remove('chamar-atencao'); }, 3200);
  }

  /* ------------------------------------------------------------------
     9. ANO ATUAL NO RODAPÉ
  ------------------------------------------------------------------ */
  var elementoAno = document.getElementById('ano');
  if (elementoAno) elementoAno.textContent = new Date().getFullYear();

});
