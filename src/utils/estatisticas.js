import { addDays, dateKey, diaKey, startOfWeek } from './date';

/** Sequência, totais, série semanal e mapa de calor — tudo derivado dos check-ins. */
export function calcularEstatisticas(checkinsAluno, ficha) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const concluido = (d) => Boolean(checkinsAluno[dateKey(d)]?.concluido);

  // Meta semanal = dias com treino programado na ficha.
  const metaSemanal = Object.values(ficha?.dias || {}).filter(
    (d) => d && d.exercicios && d.exercicios.length > 0,
  ).length || 5;

  // Sequência atual (permite que hoje ainda não tenha sido feito).
  let sequencia = 0;
  let cursor = concluido(hoje) ? new Date(hoje) : addDays(hoje, -1);
  while (concluido(cursor)) {
    sequencia += 1;
    cursor = addDays(cursor, -1);
  }

  // Melhor sequência de todos os tempos.
  const chavesOrdenadas = Object.keys(checkinsAluno).filter((k) => checkinsAluno[k]?.concluido).sort();
  let melhorSequencia = 0;
  let corrente = 0;
  let anterior = null;
  chavesOrdenadas.forEach((chave) => {
    const atual = new Date(`${chave}T00:00:00`);
    if (anterior && (atual - anterior) / 86400000 === 1) corrente += 1;
    else corrente = 1;
    melhorSequencia = Math.max(melhorSequencia, corrente);
    anterior = atual;
  });

  const inicioSemana = startOfWeek(hoje);
  const semanaAtual = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));
  const naSemana = semanaAtual.filter((d) => concluido(d)).length;

  const noMes = chavesOrdenadas.filter((chave) => {
    const d = new Date(`${chave}T00:00:00`);
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  }).length;

  // Série de 8 semanas para o gráfico.
  const serieSemanal = [];
  for (let s = 7; s >= 0; s -= 1) {
    const inicio = addDays(inicioSemana, -7 * s);
    const total = Array.from({ length: 7 }, (_, i) => addDays(inicio, i)).filter((d) =>
      concluido(d),
    ).length;
    serieSemanal.push({
      inicio,
      total,
      rotulo: s === 0 ? 'Atual' : `${String(inicio.getDate()).padStart(2, '0')}/${String(inicio.getMonth() + 1).padStart(2, '0')}`,
    });
  }

  // Mapa de calor: 12 semanas x 7 dias (colunas = semanas).
  const mapaCalor = [];
  for (let s = 11; s >= 0; s -= 1) {
    const inicio = addDays(inicioSemana, -7 * s);
    mapaCalor.push(
      Array.from({ length: 7 }, (_, i) => {
        const dia = addDays(inicio, i);
        return {
          data: dia,
          chave: dateKey(dia),
          feito: concluido(dia),
          futuro: dia > hoje,
          programado: (ficha?.dias?.[diaKey(dia)]?.exercicios || []).length > 0,
        };
      }),
    );
  }

  const ultimos30 = Array.from({ length: 30 }, (_, i) => addDays(hoje, -i)).filter((d) =>
    concluido(d),
  ).length;

  return {
    total: chavesOrdenadas.length,
    sequencia,
    melhorSequencia,
    naSemana,
    metaSemanal,
    noMes,
    ultimos30,
    aproveitamento: Math.min(100, Math.round((naSemana / metaSemanal) * 100)) || 0,
    serieSemanal,
    mapaCalor,
  };
}
