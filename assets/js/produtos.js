/* ==========================================================
   CATÁLOGO DE EXEMPLO — I Love Lilivy
   Os produtos reais são cadastrados pelas donas no painel /admin
   (Supabase). Este arquivo só é usado enquanto o Supabase não está
   configurado em assets/js/supabase-client.js.

   Campos de cada produto:
     nome      → nome do produto (aparece em maiúsculas)
     descricao → descrição curta que aparece sobre a foto
     preco     → preço cheio em reais (número, ex.: 39.90). null = "Sob consulta"
     foto      → caminho da imagem (ex.: "assets/img/produtos/brinco-1.jpg").
                 null = mostra um espaço reservado até a foto chegar.
   ========================================================== */
window.LILIVY_CONFIG = {
  descontoAVista: 0.10, // 10% de desconto à vista (ajuste ou 0 para esconder)
  parcelasMax: 3        // parcelamento em até 3x sem juros
};

window.LILIVY_PRODUTOS = {
  brincos: {
    titulo: 'Brincos',
    itens: [
      { nome: 'Brinco Modelo 1', descricao: 'Descrição do brinco: material, banho e detalhes.', preco: null, foto: null },
      { nome: 'Brinco Modelo 2', descricao: 'Descrição do brinco: material, banho e detalhes.', preco: null, foto: null },
      { nome: 'Brinco Modelo 3', descricao: 'Descrição do brinco: material, banho e detalhes.', preco: null, foto: null }
    ]
  },
  pulseiras: {
    titulo: 'Pulseiras',
    itens: [
      { nome: 'Pulseira Modelo 1', descricao: 'Descrição da pulseira: material, banho e detalhes.', preco: null, foto: null },
      { nome: 'Pulseira Modelo 2', descricao: 'Descrição da pulseira: material, banho e detalhes.', preco: null, foto: null },
      { nome: 'Pulseira Modelo 3', descricao: 'Descrição da pulseira: material, banho e detalhes.', preco: null, foto: null }
    ]
  },
  bolsas: {
    titulo: 'Bolsas',
    itens: [
      { nome: 'Bolsa Modelo 1', descricao: 'Descrição da bolsa: material, tamanho e cores.', preco: null, foto: null },
      { nome: 'Bolsa Modelo 2', descricao: 'Descrição da bolsa: material, tamanho e cores.', preco: null, foto: null },
      { nome: 'Bolsa Modelo 3', descricao: 'Descrição da bolsa: material, tamanho e cores.', preco: null, foto: null }
    ]
  },
  colares: {
    titulo: 'Colares',
    itens: [
      { nome: 'Colar Modelo 1', descricao: 'Descrição do colar: material, banho e detalhes.', preco: null, foto: null },
      { nome: 'Colar Modelo 2', descricao: 'Descrição do colar: material, banho e detalhes.', preco: null, foto: null },
      { nome: 'Colar Modelo 3', descricao: 'Descrição do colar: material, banho e detalhes.', preco: null, foto: null }
    ]
  }
};
