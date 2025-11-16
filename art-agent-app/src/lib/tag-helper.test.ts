// src/lib/tag-helper.test.ts

import { 
  detectarConcorrentesBoolean,
  detectarArtplan,
  detectarPremios,
  detectarNovosClientes,
  detectarEventos
} from './tag-helper';

// ================================================================
// SUÍTE DE TESTES PARA detectarConcorrentesBoolean
// ================================================================
describe('Tag Helper - detectarConcorrentesBoolean', () => {
  it('should_return_true_when_competitor_alias_is_used', () => {
    // Arrange: Texto usa um alias (apelido) de um concorrente. "Almap" para "AlmapBBDO".
    const texto = 'A Almap foi a agência mais premiada do ano no festival de Cannes.';
    const feedName = 'Clube de Criação';

    // Act: Executa a função de detecção.
    const resultado = detectarConcorrentesBoolean(texto, feedName);

    // Assert: O resultado deve ser verdadeiro.
    expect(resultado).toBe(true);
  });
});

// ================================================================
// SUÍTE DE TESTES PARA detectarArtplan
// ================================================================
describe('Tag Helper - detectarArtplan', () => {
  it('should_return_true_for_relevant_artplan_news', () => {
    const texto = 'Artplan anuncia nova campanha para o cliente Rock in Rio.';
    const feedName = 'Propmark';
    expect(detectarArtplan(texto, feedName)).toBe(true);
  });

  it('should_return_false_for_irrelevant_text', () => {
    const texto = 'O mercado financeiro está em alta.';
    const feedName = 'Exame';
    expect(detectarArtplan(texto, feedName)).toBe(false);
  });

  it('should_return_false_for_similar_but_irrelevant_names', () => {
    const texto = 'A empresa Art Plan Imóveis vendeu 10 apartamentos.';
    const feedName = 'Zap Imóveis';
    expect(detectarArtplan(texto, feedName)).toBe(false);
  });
});

// ================================================================
// SUÍTE DE TESTES PARA detectarPremios
// ================================================================
describe('Tag Helper - detectarPremios', () => {
  it('should_return_true_for_publicity_award_news', () => {
    const texto = 'Agência brasileira ganha Leão de Ouro em Cannes com campanha inovadora.';
    const feedName = 'Meio & Mensagem';
    expect(detectarPremios(texto, feedName)).toBe(true);
  });

  it('should_return_false_for_sports_awards', () => {
    const texto = 'Atleta vence a competição e leva a medalha de ouro para casa.';
    const feedName = 'Globo Esporte';
    expect(detectarPremios(texto, feedName)).toBe(false);
  });

  it('should_return_false_for_non-publicity_entertainment_awards', () => {
    const texto = 'Filme "A Vida Secreta" ganha o Oscar de melhor roteiro adaptado.';
    const feedName = 'Omelete';
    expect(detectarPremios(texto, feedName)).toBe(false);
  });
});

// ================================================================
// SUÍTE DE TESTES PARA detectarNovosClientes
// ================================================================
describe('Tag Helper - detectarNovosClientes', () => {
  it('should_return_true_when_agency_wins_a_new_account', () => {
    const texto = 'A WMcCann venceu a concorrência e conquistou a conta publicitária da Americanas.';
    const feedName = 'AdNews';
    expect(detectarNovosClientes(texto, feedName)).toBe(true);
  });

  it('should_return_false_for_banking_account_context', () => {
    const texto = 'Cliente abre nova conta corrente no Banco Itaú para aproveitar benefícios.';
    const feedName = 'Valor Econômico';
    expect(detectarNovosClientes(texto, feedName)).toBe(false);
  });

  it('should_return_false_for_sports_championship_context', () => {
    const texto = 'O time do Flamengo conquista o título do campeonato brasileiro.';
    const feedName = 'Lance!';
    expect(detectarNovosClientes(texto, feedName)).toBe(false);
  });
});

// ================================================================
// SUÍTE DE TESTES PARA detectarEventos
// ================================================================
describe('Tag Helper - detectarEventos', () => {
  it('should_return_true_for_relevant_publicity_events', () => {
    const texto = 'O Festival de Publicidade de Cannes (Cannes Lions) começa na próxima semana.';
    const feedName = 'Propmark';
    expect(detectarEventos(texto, feedName)).toBe(true);
  });

  it('should_return_false_for_music_festivals', () => {
    const texto = 'Rock in Rio anuncia as principais atrações do palco mundo para a edição de 2025.';
    const feedName = 'G1 Música';
    expect(detectarEventos(texto, feedName)).toBe(false);
  });

  it('should_return_false_for_political_events', () => {
    const texto = 'O Congresso Nacional se reúne para votar a nova reforma tributária.';
    const feedName = 'Folha de S.Paulo';
    expect(detectarEventos(texto, feedName)).toBe(false);
  });
});
