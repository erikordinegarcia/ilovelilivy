// =====================================================
// PAINEL — CRUD de produtos (tabela "products" + bucket "product-images")
// =====================================================

const form = document.getElementById('productForm');
const listEl = document.getElementById('productList');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formError = document.getElementById('formError');
const formOk = document.getElementById('formOk');
const imageInput = document.getElementById('image');
const imageHint = document.getElementById('imageHint');
const preview = document.getElementById('preview');

const MAX_BYTES = 5 * 1024 * 1024;

let editandoId = null;
let imagemAtualUrl = null;
let produtos = [];
let filtro = 'todos';

// ---------------------------------------------------
(async function iniciar() {
  const sessao = await exigirLogin();
  if (!sessao) return;
  document.getElementById('logoutBtn').addEventListener('click', fazerLogout);
  carregarLista();
})();

// ---------------------------------------------------
// LISTA
// ---------------------------------------------------
async function carregarLista() {
  listEl.innerHTML = '<p class="muted">Carregando...</p>';

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .order('category')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    listEl.innerHTML = '<p class="muted">Erro ao carregar os produtos.</p>';
    return;
  }
  produtos = data || [];
  renderLista();
}

// Igual ao CATEGORIAS_DESTAQUES / POR_CATEGORIA_DESTAQUES de assets/js/main.js
const CATEGORIAS_DESTAQUES = { brincos: 'Brincos', colares: 'Colares', bolsas: 'Bolsas' };
const POR_CATEGORIA_DESTAQUES = 3;

function podeSerDestaque(categoria) {
  return Object.prototype.hasOwnProperty.call(CATEGORIAS_DESTAQUES, categoria);
}
// Quantos destaques a categoria já tem (sem contar o produto "ignorarId")
function destaquesNaCategoria(categoria, ignorarId) {
  return produtos.filter((p) => p.category === categoria && p.featured && p.active && p.id !== ignorarId).length;
}
// Retorna a mensagem de erro, ou null se puder destacar
function erroDestaque(categoria, ignorarId) {
  if (!podeSerDestaque(categoria)) {
    return `A página inicial só tem destaques de ${Object.values(CATEGORIAS_DESTAQUES).join(', ')}.`;
  }
  if (destaquesNaCategoria(categoria, ignorarId) >= POR_CATEGORIA_DESTAQUES) {
    return `${CATEGORIAS_DESTAQUES[categoria]} já tem ${POR_CATEGORIA_DESTAQUES} destaques. Tire um deles (★) antes de escolher outro.`;
  }
  return null;
}

function renderLista() {
  const itens =
    filtro === 'todos' ? produtos :
    filtro === 'destaques' ? produtos.filter((p) => p.featured) :
    produtos.filter((p) => p.category === filtro);

  atualizarInfoDestaques();

  if (!itens.length) {
    listEl.innerHTML = filtro === 'destaques'
      ? '<p class="muted">Nenhum destaque ainda. Clique na ☆ de um produto para destacá-lo na página inicial.</p>'
      : '<p class="muted">Nenhum produto cadastrado aqui ainda.</p>';
    return;
  }

  listEl.innerHTML = itens.map(itemHTML).join('');

  itens.forEach((p) => {
    const star = document.getElementById(`star-${p.id}`);
    if (star) star.addEventListener('click', () => alternarDestaque(p));
    document.getElementById(`edit-${p.id}`).addEventListener('click', () => editar(p));
    document.getElementById(`del-${p.id}`).addEventListener('click', () => excluir(p));
  });
}

function atualizarInfoDestaques() {
  const el = document.getElementById('featuredInfo');
  if (!produtos.length) {
    el.textContent = '';
    el.className = 'featured-info';
    return;
  }
  const partes = Object.keys(CATEGORIAS_DESTAQUES).map((cat) =>
    `${CATEGORIAS_DESTAQUES[cat]} ${destaquesNaCategoria(cat)}/${POR_CATEGORIA_DESTAQUES}`);
  el.textContent = `★ Na página inicial: ${partes.join(' · ')}. ` +
    'Clique em "Pôr nos destaques" no produto que deve aparecer lá; os outros ficam só na página Produtos.';
  el.className = 'featured-info';
}

async function alternarDestaque(p) {
  if (!p.featured) {
    const erro = erroDestaque(p.category, p.id);
    if (erro) { alert(erro); return; }
  }
  const btn = document.getElementById(`star-${p.id}`);
  btn.disabled = true;
  const { error } = await supabaseClient.from('products').update({ featured: !p.featured }).eq('id', p.id);
  if (error) {
    console.error(error);
    alert('Não foi possível alterar o destaque.');
    btn.disabled = false;
    return;
  }
  p.featured = !p.featured;
  if (editandoId === p.id) form.featured.checked = p.featured;
  renderLista();
}

function itemHTML(p) {
  const thumb = p.image_url
    ? `<img src="${esc(p.image_url)}" alt="" class="item__thumb" loading="lazy">`
    : `<div class="item__thumb item__thumb--empty">sem foto</div>`;
  const preco = p.price === null ? 'Sob consulta' : formatarBRL(Number(p.price));

  return `
    <article class="item${p.active ? '' : ' item--off'}">
      ${thumb}
      <div class="item__info">
        <span class="tag">${esc(CATEGORIAS[p.category] || p.category)}</span>
        ${p.featured ? '<span class="tag tag--star">★ Destaque</span>' : ''}
        ${p.active ? '' : '<span class="tag tag--off">Oculto</span>'}
        <strong>${esc(p.name)}</strong>
        <span class="item__price">${preco}</span>
        ${p.description ? `<p>${esc(p.description)}</p>` : ''}
      </div>
      <div class="item__actions">
        ${podeSerDestaque(p.category) ? `<button id="star-${p.id}" class="btn-star${p.featured ? ' is-on' : ''}" aria-pressed="${p.featured}"
          title="${p.featured ? 'Tirar da página inicial' : 'Mostrar nos Destaques da página inicial'}">${p.featured ? '★ Nos destaques' : '☆ Pôr nos destaques'}</button>` : ''}
        <button id="edit-${p.id}" class="btn-small">Editar</button>
        <button id="del-${p.id}" class="btn-small btn-small--danger">Excluir</button>
      </div>
    </article>`;
}

document.querySelectorAll('.filter').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((x) => x.classList.toggle('is-active', x === b));
    filtro = b.dataset.filter;
    renderLista();
  })
);

// ---------------------------------------------------
// FORMULÁRIO
// ---------------------------------------------------
imageInput.addEventListener('change', () => {
  const f = imageInput.files[0];
  if (!f) {
    mostrarPreview(imagemAtualUrl);
    return;
  }
  mostrarPreview(URL.createObjectURL(f));
});

function mostrarPreview(url) {
  if (url) {
    preview.src = url;
    preview.hidden = false;
  } else {
    preview.removeAttribute('src');
    preview.hidden = true;
  }
}

function editar(p) {
  editandoId = p.id;
  imagemAtualUrl = p.image_url;

  form.category.value = p.category;
  form.name.value = p.name;
  form.description.value = p.description || '';
  form.price.value = p.price === null ? '' : String(p.price).replace('.', ',');
  form.sortOrder.value = p.sort_order ?? 0;
  form.active.checked = p.active;
  form.featured.checked = !!p.featured;
  imageInput.value = '';
  mostrarPreview(p.image_url);

  imageHint.textContent = 'Deixe em branco para manter a foto atual.';
  formTitle.textContent = 'Editar produto';
  submitBtn.textContent = 'Salvar alterações';
  cancelBtn.hidden = false;
  limparMsgs();
  document.getElementById('formCard').scrollIntoView({ behavior: 'smooth' });
}

cancelBtn.addEventListener('click', resetar);

function resetar() {
  editandoId = null;
  imagemAtualUrl = null;
  form.reset();
  form.active.checked = true;
  form.featured.checked = false;
  form.sortOrder.value = 0;
  mostrarPreview(null);
  imageHint.textContent = 'JPG, PNG ou WEBP, até 5 MB. De preferência quadrada.';
  formTitle.textContent = 'Novo produto';
  submitBtn.textContent = 'Adicionar produto';
  cancelBtn.hidden = true;
}

function limparMsgs() {
  formError.textContent = '';
  formOk.textContent = '';
}

function lerPreco(txt) {
  const t = txt.trim();
  if (!t) return null;
  const n = Number(t.replace(/[R$\s.]/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) throw new Error('Preço inválido. Use o formato 39,90.');
  return Math.round(n * 100) / 100;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  limparMsgs();

  const textoBotao = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Salvando...';

  try {
    const name = form.name.value.trim();
    if (!name) throw new Error('Informe o nome do produto.');

    const registro = {
      category: form.category.value,
      name,
      description: form.description.value.trim() || null,
      price: lerPreco(form.price.value),
      sort_order: parseInt(form.sortOrder.value, 10) || 0,
      active: form.active.checked,
      featured: form.featured.checked
    };
    if (registro.featured) {
      const erro = erroDestaque(registro.category, editandoId);
      if (erro) throw new Error(erro);
    }

    const arquivo = imageInput.files[0];
    if (arquivo && arquivo.size > MAX_BYTES) throw new Error('A foto passa de 5 MB. Escolha uma imagem menor.');
    if (!arquivo && !editandoId) throw new Error('Escolha uma foto para o produto.');

    const imagemAntiga = imagemAtualUrl;
    registro.image_url = arquivo ? await enviarImagem(arquivo) : imagemAtualUrl;

    if (editandoId) {
      const { error } = await supabaseClient.from('products').update(registro).eq('id', editandoId);
      if (error) throw error;
      if (arquivo && imagemAntiga) await excluirImagem(imagemAntiga);
      formOk.textContent = 'Produto atualizado!';
    } else {
      const { error } = await supabaseClient.from('products').insert([registro]);
      if (error) throw error;
      formOk.textContent = 'Produto adicionado!';
    }

    resetar();
    carregarLista();
  } catch (err) {
    console.error(err);
    formError.textContent = err.message || 'Erro ao salvar o produto.';
    submitBtn.textContent = textoBotao;
  } finally {
    submitBtn.disabled = false;
    if (!formError.textContent) submitBtn.textContent = editandoId ? 'Salvar alterações' : 'Adicionar produto';
  }
});

// ---------------------------------------------------
// STORAGE
// ---------------------------------------------------
async function enviarImagem(arquivo) {
  const ext = (arquivo.name.split('.').pop() || 'jpg').toLowerCase();
  const nome = `${form.category.value}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseClient.storage
    .from(PRODUCT_BUCKET)
    .upload(nome, arquivo, { cacheControl: '31536000', contentType: arquivo.type });
  if (error) throw error;

  return supabaseClient.storage.from(PRODUCT_BUCKET).getPublicUrl(nome).data.publicUrl;
}

function caminhoNoStorage(url) {
  if (!url) return null;
  const marcador = `/${PRODUCT_BUCKET}/`;
  const i = url.indexOf(marcador);
  return i === -1 ? null : decodeURIComponent(url.substring(i + marcador.length));
}

async function excluirImagem(url) {
  const caminho = caminhoNoStorage(url);
  if (!caminho) return;
  const { error } = await supabaseClient.storage.from(PRODUCT_BUCKET).remove([caminho]);
  if (error) console.warn('Não foi possível excluir a foto antiga:', error.message);
}

// ---------------------------------------------------
// EXCLUIR
// ---------------------------------------------------
async function excluir(p) {
  if (!confirm(`Excluir "${p.name}"? Essa ação não pode ser desfeita.`)) return;

  const { error } = await supabaseClient.from('products').delete().eq('id', p.id);
  if (error) {
    alert('Erro ao excluir o produto.');
    console.error(error);
    return;
  }
  await excluirImagem(p.image_url);
  if (editandoId === p.id) resetar();
  carregarLista();
}

// ---------------------------------------------------
function esc(t) {
  const d = document.createElement('div');
  d.textContent = t ?? '';
  return d.innerHTML;
}

function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
