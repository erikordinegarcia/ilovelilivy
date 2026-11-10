/* I Love Lilivy Semijoias — main.js
   Usado em index.html (vitrine de Destaques) e produtos.html (catálogo completo). */
(function () {
  'use strict';

  // Número de WhatsApp da loja (somente dígitos, com DDI 55)
  var WHATSAPP_NUMBER = '5511949037126';
  var DEFAULT_MSG = 'Olá! Vim pelo site da I Love Lilivy e gostaria de mais informações.';

  // Destaques da página inicial: categorias (nesta ordem) e quantos produtos de cada
  var CATEGORIAS_DESTAQUES = ['brincos', 'colares', 'bolsas'];
  var POR_CATEGORIA_DESTAQUES = 3;
  // Quantos produtos o catálogo mostra por vez ("Ver mais" carrega o próximo lote)
  var POR_PAGINA = 12;

  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  // Links de WhatsApp
  document.querySelectorAll('.js-whatsapp').forEach(function (a) {
    a.href = waLink(DEFAULT_MSG);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Ano no rodapé
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Header ao rolar
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menu mobile
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  // Link ativo no menu (só para links de âncora da própria página)
  var links = Array.prototype.filter.call(document.querySelectorAll('.nav__link'), function (l) {
    return l.getAttribute('href').charAt(0) === '#';
  });
  var sections = links.map(function (l) { return document.querySelector(l.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    if (document.body.className.indexOf('page-catalogo') === -1) {
      var navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { if (s) navObserver.observe(s); });
    }

    // Animação de entrada
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  // =====================================================
  // PRODUTOS
  // =====================================================
  var TITULOS = { brincos: 'Brincos', pulseiras: 'Pulseiras', bolsas: 'Bolsas', colares: 'Colares' };
  var CAT_ICONS = {
    brincos: '<circle cx="24" cy="10" r="4"/><path d="M24 14v6"/><path d="M24 20 16 32a8 8 0 1 0 16 0z"/><circle cx="24" cy="33" r="2.5"/>',
    pulseiras: '<ellipse cx="24" cy="24" rx="17" ry="11"/><ellipse cx="24" cy="24" rx="12" ry="6.5"/><circle cx="10" cy="22" r="1.6"/><circle cx="17" cy="14.5" r="1.6"/><circle cx="31" cy="14.5" r="1.6"/><circle cx="38" cy="22" r="1.6"/>',
    bolsas: '<path d="M8 18h32l-3 24H11z"/><path d="M17 18v-4a7 7 0 0 1 14 0v4"/><rect x="21" y="25" width="6" height="4" rx="1"/>',
    colares: '<path d="M8 8c2 16 8 22 16 24 8-2 14-8 16-24"/><path d="M24 32v3"/><path d="m24 35-4 5 4 4 4-4z"/>'
  };
  var cfg = window.LILIVY_CONFIG || { descontoAVista: 0, parcelasMax: 3 };
  var temSupabase = typeof supabaseClient !== 'undefined' && !!supabaseClient;

  function brl(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function semAcento(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Registro do Supabase -> formato usado nos cards
  function doBanco(p) {
    return {
      cat: p.category,
      nome: p.name,
      descricao: p.description || '',
      preco: p.price === null ? null : Number(p.price),
      foto: p.image_url,
      destaque: !!p.featured,
      ordem: p.sort_order || 0,
      criado: p.created_at || ''
    };
  }

  // Catálogo de exemplo (assets/js/produtos.js), usado só sem Supabase
  function exemplos() {
    var cat = window.LILIVY_PRODUTOS || {};
    var lista = [];
    Object.keys(cat).forEach(function (c) {
      (cat[c].itens || []).forEach(function (p, i) {
        lista.push({ cat: c, nome: p.nome, descricao: p.descricao, preco: p.preco, foto: p.foto,
          destaque: i < 2, ordem: i, criado: '' });
      });
    });
    return lista;
  }

  var CAMPOS = 'id, category, name, description, price, image_url, sort_order, featured, created_at';

  function cardHTML(p, opts) {
    opts = opts || {};
    var titulo = TITULOS[p.cat] || p.cat;
    var media = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nome) + '" loading="lazy">'
      : '<div class="prod__placeholder"><svg viewBox="0 0 48 48">' + (CAT_ICONS[p.cat] || '') + '</svg><span>Foto em breve</span></div>';

    var precos;
    if (typeof p.preco === 'number') {
      var parcela = p.preco / cfg.parcelasMax;
      precos = '<p class="prod__price">' + brl(p.preco) + '</p>' +
        (cfg.descontoAVista ? '<p class="prod__cash"><strong>' + brl(p.preco * (1 - cfg.descontoAVista)) + '</strong> à vista com desconto</p>' : '') +
        '<p class="prod__install">ou ' + cfg.parcelasMax + 'x de ' + brl(parcela) + ' sem juros</p>';
    } else {
      precos = '<p class="prod__price prod__price--ask">Sob consulta</p>' +
        '<p class="prod__install">Parcelamento em até ' + cfg.parcelasMax + 'x</p>';
    }

    return '<article class="prod">' +
      '<div class="prod__media">' + media +
        (opts.selo && p.destaque ? '<span class="prod__badge">Destaque</span>' : '') +
        (p.descricao ? '<div class="prod__desc"><p>' + esc(p.descricao) + '</p></div>' : '') +
      '</div>' +
      '<div class="prod__body">' +
        '<span class="prod__cat">' + esc(titulo) + '</span>' +
        '<h3 class="prod__name">' + esc(p.nome) + '</h3>' + precos +
        '<a class="btn btn--green prod__btn" target="_blank" rel="noopener" href="' +
          waLink('Olá! Tenho interesse no produto: ' + p.nome + ' (' + titulo + ').') +
        '">Quero este</a>' +
      '</div>' +
    '</article>';
  }

  function skeleton(n) {
    var s = '';
    for (var i = 0; i < n; i++) s += '<div class="prod prod--skeleton" aria-hidden="true"><div class="prod__media"></div><div class="prod__body"><span></span><span></span></div></div>';
    return s;
  }

  // ---------------- Página inicial: Destaques ----------------
  // Um bloco por categoria (Brincos, Colares, Bolsas) com até 3 produtos cada.
  // Só aparecem os produtos marcados com ★ Destaque no /admin; os demais ficam
  // apenas na página de Produtos. Categoria sem destaque não aparece.
  var destaquesGrid = document.getElementById('destaquesGrid');
  if (destaquesGrid) {
    var mostrarDestaques = function (lista) {
      var grupos = CATEGORIAS_DESTAQUES.map(function (cat) {
        var itens = lista.filter(function (p) { return p.cat === cat && p.destaque; })
          .sort(function (a, b) {
            return (a.ordem - b.ordem) ||
              (b.criado > a.criado ? 1 : b.criado < a.criado ? -1 : 0);
          })
          .slice(0, POR_CATEGORIA_DESTAQUES);
        return { cat: cat, itens: itens };
      }).filter(function (g) { return g.itens.length; });

      if (!grupos.length) {
        destaquesGrid.innerHTML = '<p class="prod-empty">Novidades em breve. <a target="_blank" rel="noopener" href="' +
          waLink(DEFAULT_MSG) + '">Fale com a gente no WhatsApp</a>.</p>';
        return;
      }
      destaquesGrid.innerHTML = grupos.map(function (g) {
        return '<div class="destaques__group">' +
          '<div class="destaques__head">' +
            '<h3 class="destaques__title">' + esc(TITULOS[g.cat]) + '</h3>' +
            '<span class="destaques__line" aria-hidden="true"></span>' +
            '<a class="destaques__all" href="produtos.html?cat=' + g.cat + '">Ver todos' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></a>' +
          '</div>' +
          '<div class="prod-grid">' + g.itens.map(function (p) { return cardHTML(p); }).join('') + '</div>' +
        '</div>';
      }).join('');
    };

    if (!temSupabase) {
      mostrarDestaques(exemplos());
    } else {
      destaquesGrid.innerHTML = '<div class="prod-grid">' + skeleton(3) + '</div>';
      supabaseClient.from('products').select(CAMPOS)
        .eq('active', true).eq('featured', true)
        .in('category', CATEGORIAS_DESTAQUES)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .then(function (res) {
          if (res.error) throw res.error;
          mostrarDestaques(res.data.map(doBanco));
        })
        .catch(function (err) {
          console.error('Erro ao carregar destaques:', err);
          mostrarDestaques([]);
        });
    }
  }


  // ---------------- produtos.html: catálogo completo ----------------
  var catalogoGrid = document.getElementById('catalogoGrid');
  if (catalogoGrid) {
    var todos = [];
    var params = new URLSearchParams(location.search);
    var estado = {
      cat: TITULOS[params.get('cat')] ? params.get('cat') : 'todos',
      busca: params.get('q') || '',
      ordem: 'destaques',
      mostrando: POR_PAGINA
    };

    var chips = Array.prototype.slice.call(document.querySelectorAll('#catChips .chip'));
    var busca = document.getElementById('busca');
    var ordem = document.getElementById('ordem');
    var verMais = document.getElementById('verMais');
    var contador = document.getElementById('catalogoCount');
    busca.value = estado.busca;

    var atualizarURL = function () {
      var q = new URLSearchParams();
      if (estado.cat !== 'todos') q.set('cat', estado.cat);
      if (estado.busca.trim()) q.set('q', estado.busca.trim());
      var s = q.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
    };

    var ordenar = function (lista) {
      var porOrdem = function (a, b) { return a.ordem - b.ordem || (b.criado > a.criado ? 1 : b.criado < a.criado ? -1 : 0); };
      var preco = function (p, dir) { return typeof p.preco === 'number' ? p.preco : dir * Infinity; };
      var l = lista.slice();
      if (estado.ordem === 'novidades') l.sort(function (a, b) { return b.criado > a.criado ? 1 : b.criado < a.criado ? -1 : 0; });
      else if (estado.ordem === 'menor') l.sort(function (a, b) { return preco(a, 1) - preco(b, 1); });
      else if (estado.ordem === 'maior') l.sort(function (a, b) { return preco(b, -1) - preco(a, -1); });
      else l.sort(function (a, b) { return (b.destaque - a.destaque) || porOrdem(a, b); });
      return l;
    };

    var render = function () {
      var termo = semAcento(estado.busca.trim());
      var daBusca = todos.filter(function (p) {
        return !termo || semAcento(p.nome + ' ' + p.descricao + ' ' + TITULOS[p.cat]).indexOf(termo) !== -1;
      });

      // Contagem por categoria (respeitando a busca)
      chips.forEach(function (c) {
        var cat = c.getAttribute('data-cat');
        var n = cat === 'todos' ? daBusca.length : daBusca.filter(function (p) { return p.cat === cat; }).length;
        c.querySelector('.chip__n').textContent = n;
        var on = cat === estado.cat;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });

      // No celular a fileira de categorias rola de lado: mantém a ativa visível
      var ativa = chips.filter(function (c) { return c.classList.contains('is-active'); })[0];
      var fileira = ativa && ativa.parentElement;
      if (fileira && fileira.scrollWidth > fileira.clientWidth) {
        var esq = ativa.offsetLeft - fileira.offsetLeft;
        if (esq < fileira.scrollLeft || esq + ativa.offsetWidth > fileira.scrollLeft + fileira.clientWidth) {
          fileira.scrollLeft = esq - 16;
        }
      }

      var lista = ordenar(estado.cat === 'todos' ? daBusca : daBusca.filter(function (p) { return p.cat === estado.cat; }));
      var visiveis = lista.slice(0, estado.mostrando);

      if (!lista.length) {
        catalogoGrid.classList.add('prod-grid--empty');
        var oque = termo ? 'Nenhum produto encontrado para "' + esc(estado.busca.trim()) + '".' :
          'Novidades em breve nesta categoria.';
        catalogoGrid.innerHTML = '<p class="prod-empty">' + oque + ' <a target="_blank" rel="noopener" href="' +
          waLink('Olá! Estou procurando ' + (termo ? estado.busca.trim() : (TITULOS[estado.cat] || 'semijoias')) + '. Vocês têm?') +
          '">Pergunte no WhatsApp</a>.</p>';
        contador.textContent = '';
      } else {
        catalogoGrid.classList.remove('prod-grid--empty');
        catalogoGrid.innerHTML = visiveis.map(function (p) { return cardHTML(p, { selo: true }); }).join('');
        contador.textContent = lista.length === 1 ? '1 produto' :
          (visiveis.length < lista.length ? 'Mostrando ' + visiveis.length + ' de ' + lista.length + ' produtos' : lista.length + ' produtos');
      }

      var restantes = lista.length - visiveis.length;
      verMais.hidden = restantes <= 0;
      verMais.textContent = 'Ver mais produtos (' + restantes + ')';
    };

    var mudouFiltro = function () {
      estado.mostrando = POR_PAGINA;
      atualizarURL();
      render();
    };

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        estado.cat = c.getAttribute('data-cat');
        mudouFiltro();
      });
    });
    var t;
    busca.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { estado.busca = busca.value; mudouFiltro(); }, 200);
    });
    ordem.addEventListener('change', function () { estado.ordem = ordem.value; mudouFiltro(); });
    verMais.addEventListener('click', function () {
      var primeiroNovo = estado.mostrando;
      estado.mostrando += POR_PAGINA;
      render();
      // Leva o foco do teclado para o primeiro produto novo
      var novo = catalogoGrid.children[primeiroNovo];
      var alvo = novo && novo.querySelector('a');
      if (alvo) alvo.focus({ preventScroll: true });
    });

    if (!temSupabase) {
      todos = exemplos();
      render();
    } else {
      catalogoGrid.innerHTML = skeleton(8);
      supabaseClient.from('products').select(CAMPOS)
        .eq('active', true)
        .then(function (res) {
          if (res.error) throw res.error;
          todos = res.data.map(doBanco).filter(function (p) { return TITULOS[p.cat]; });
          render();
        })
        .catch(function (err) {
          console.error('Erro ao carregar produtos:', err);
          catalogoGrid.innerHTML = '<p class="prod-empty">Não foi possível carregar os produtos agora. <a target="_blank" rel="noopener" href="' +
            waLink(DEFAULT_MSG) + '">Fale com a gente no WhatsApp</a>.</p>';
        });
    }
  }

  // =====================================================
  // ORÇAMENTO (só na página inicial)
  // =====================================================
  var tel = document.getElementById('telefone');
  if (tel) {
    // Máscara simples de telefone
    tel.addEventListener('input', function () {
      var d = tel.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      tel.value = out;
    });
  }

  // Formulário de orçamento → WhatsApp
  var form = document.getElementById('quoteForm');
  var error = document.getElementById('formError');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.nome.value.trim();
      var fone = form.telefone.value.replace(/\D/g, '');
      if (!nome || fone.length < 10) {
        error.textContent = 'Preencha seu nome e um WhatsApp válido.';
        error.hidden = false;
        return;
      }
      error.hidden = true;

      var msg = 'Olá! Gostaria de solicitar um orçamento.\n\n' +
        '*Nome:* ' + nome + '\n' +
        '*WhatsApp:* ' + form.telefone.value + '\n' +
        '*Interesse:* ' + form.produto.value +
        (form.mensagem.value.trim() ? '\n*Mensagem:* ' + form.mensagem.value.trim() : '');

      window.open(waLink(msg), '_blank', 'noopener');
    });
  }
})();
