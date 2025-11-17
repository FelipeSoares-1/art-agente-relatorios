/**
 * @file Contém funções utilitárias para validar datas.
 */

const MIN_REASONABLE_YEAR = 2020;
const EPOCH_TIME_START_OF_DAY_MS = new Date('1970-01-01T00:00:00.000Z').getTime();

/**
 * Verifica se uma data é "suspeita" com base em um conjunto de regras.
 * Uma data é suspeita se estiver no futuro, for muito antiga ou corresponder
 * a um valor padrão de "época" (epoch).
 *
 * @param date A data a ser verificada.
 * @returns `true` se a data for suspeita, `false` caso contrário.
 */
export function isDateSuspicious(date: Date): boolean {
  if (!date || isNaN(date.getTime())) {
    // Se a data for nula, indefinida ou inválida, é definitivamente suspeita.
    return true;
  }

  const now = new Date();
  const oneHourInMs = 60 * 60 * 1000;

  // 1. A data está no futuro? (com uma tolerância de 1 hora para fusos horários)
  if (date.getTime() > now.getTime() + oneHourInMs) {
    return true;
  }

  // 2. A data é muito antiga?
  if (date.getFullYear() < MIN_REASONABLE_YEAR) {
    return true;
  }

  // 3. A data é o início da época Unix?
  // Comparamos com o início do dia para pegar casos onde o fuso horário pode afetar.
  const dateAtStartOfDay = new Date(date);
  dateAtStartOfDay.setUTCHours(0, 0, 0, 0);
  if (dateAtStartOfDay.getTime() === EPOCH_TIME_START_OF_DAY_MS) {
    return true;
  }

  // Se nenhuma regra de suspeita foi acionada, a data é considerada confiável.
  return false;
}
