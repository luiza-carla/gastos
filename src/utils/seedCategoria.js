const Categoria = require('../models/Categoria');
const logger = require('./logger');

// Função para garantir que categorias padrão existem no banco
async function garantirCategoriasPadrao() {
  const categorias = [
    { nome: 'Salário', cor: '#2ecc71' },

    { nome: 'Freelance', cor: '#27ae60' },
    { nome: 'Comissão', cor: '#1abc9c' },
    { nome: 'Bônus', cor: '#16a085' },
    { nome: 'Venda', cor: '#27ae60' },
    { nome: 'Investimento', cor: '#2ecc71' },
    { nome: 'Presente', cor: '#58d68d' },
    { nome: 'Reembolso', cor: '#52be80' },

    { nome: 'Aluguel', cor: '#e74c3c' },
    { nome: 'Financiamento', cor: '#c0392b' },
    { nome: 'Condomínio', cor: '#cd6155' },
    { nome: 'Conta', cor: '#ec7063' },

    { nome: 'Mercado', cor: '#d35400' },
    { nome: 'Restaurante', cor: '#e67e22' },
    { nome: 'Delivery', cor: '#eb984e' },

    { nome: 'Combustível', cor: '#f39c12' },
    { nome: 'Transporte público', cor: '#f5b041' },
    { nome: 'Transporte por aplicativo', cor: '#f8c471' },
    { nome: 'Veículo', cor: '#d68910' },

    { nome: 'Plano de saúde', cor: '#c0392b' },
    { nome: 'Medicamento', cor: '#e74c3c' },
    { nome: 'Consulta', cor: '#ec7063' },
    { nome: 'Academia', cor: '#f1948a' },

    { nome: 'Faculdade', cor: '#8e44ad' },
    { nome: 'Curso', cor: '#9b59b6' },
    { nome: 'Livro', cor: '#a569bd' },

    { nome: 'Cinema', cor: '#3498db' },
    { nome: 'Streaming', cor: '#5dade2' },
    { nome: 'Viagem', cor: '#2e86c1' },
    { nome: 'Show/evento', cor: '#1f618d' },

    { nome: 'Roupa', cor: '#af7ac5' },
    { nome: 'Eletrônico', cor: '#bb8fce' },
    { nome: 'Compra online', cor: '#d2b4de' },
    { nome: 'Salão de beleza', cor: '#884ea0' },

    { nome: 'Cartão de crédito', cor: '#6c3483' },
    { nome: 'Empréstimos', cor: '#5b2c6f' },
    { nome: 'Juros', cor: '#4a235a' },
    { nome: 'Impostos', cor: '#7b241c' },

    { nome: 'Doação', cor: '#d98880' },
    { nome: 'Imprevisto', cor: '#7f8c8d' },
    { nome: 'Outros', cor: '#95a5a6' },
  ];

  // Insere categorias no banco (ou atualiza se já existem)
  for (const cat of categorias) {
    await Categoria.updateOne(
      { nome: cat.nome },
      { $setOnInsert: cat },
      { upsert: true }
    );
  }

  // Log de confirmação
  logger.info('Categorias padrao garantidas', 'seedCategoria');
}

module.exports = garantirCategoriasPadrao;
