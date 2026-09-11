import * as XLSX from 'xlsx';
import { fichaVazia, novoExercicio } from '../data/seed';
import { DIAS } from './date';

const ACENTOS = {
  á: 'a', à: 'a', ã: 'a', â: 'a', ä: 'a',
  é: 'e', ê: 'e', è: 'e', ë: 'e',
  í: 'i', î: 'i', ì: 'i',
  ó: 'o', õ: 'o', ô: 'o', ò: 'o', ö: 'o',
  ú: 'u', û: 'u', ù: 'u', ü: 'u',
  ç: 'c', ñ: 'n',
};

export function normalizar(texto) {
  return String(texto ?? '')
    .trim()
    .toLowerCase()
    .replace(/[áàãâäéêèëíîìóõôòöúûùüçñ]/g, (c) => ACENTOS[c] || c);
}

/** Aceita "segunda", "seg", "segunda-feira", "monday", "2"… */
export function diaParaChave(valor) {
  const texto = normalizar(valor)
    .replace(/[-_\s]*feira/g, '')
    .replace(/[^a-z0-9]/g, '');
  if (!texto) return null;

  const mapa = {
    seg: 'seg', segunda: 'seg', monday: 'seg', mon: 'seg', 2: 'seg',
    ter: 'ter', terca: 'ter', tuesday: 'ter', tue: 'ter', 3: 'ter',
    qua: 'qua', quarta: 'qua', wednesday: 'qua', wed: 'qua', 4: 'qua',
    qui: 'qui', quinta: 'qui', thursday: 'qui', thu: 'qui', 5: 'qui',
    sex: 'sex', sexta: 'sex', friday: 'sex', fri: 'sex', 6: 'sex',
    sab: 'sab', sabado: 'sab', saturday: 'sab', sat: 'sab', 7: 'sab',
    dom: 'dom', domingo: 'dom', sunday: 'dom', sun: 'dom', 1: 'dom',
  };
  if (mapa[texto]) return mapa[texto];

  // Só abreviações curtas ("seg.", "sab") caem no prefixo — evita casar texto solto.
  return texto.length <= 4 ? mapa[texto.slice(0, 3)] || null : null;
}

function indiceColuna(cabecalho, nomes) {
  return cabecalho.findIndex((celula) => nomes.includes(normalizar(celula)));
}

/**
 * Converte a matriz de células da planilha em uma ficha de treino.
 * Colunas esperadas (em qualquer ordem, com ou sem acento):
 * Dia | Foco | Exercicio | Series | Repeticoes | Carga | Observacao
 */
export function linhasParaFicha(linhas) {
  if (!linhas || linhas.length < 2) {
    throw new Error('A planilha precisa de um cabeçalho e ao menos uma linha.');
  }

  const cabecalho = linhas[0].map((c) => String(c));
  const col = {
    dia: indiceColuna(cabecalho, ['dia', 'diadasemana', 'dia da semana', 'weekday']),
    foco: indiceColuna(cabecalho, ['foco', 'treino', 'grupo', 'grupomuscular', 'grupo muscular']),
    nome: indiceColuna(cabecalho, ['exercicio', 'exercicios', 'nome', 'movimento']),
    series: indiceColuna(cabecalho, ['series', 'serie', 'sets']),
    reps: indiceColuna(cabecalho, ['repeticoes', 'repeticao', 'reps', 'rep']),
    carga: indiceColuna(cabecalho, ['carga', 'peso', 'kg']),
    obs: indiceColuna(cabecalho, ['observacao', 'observacoes', 'obs', 'nota', 'notas']),
  };

  if (col.dia < 0 || col.nome < 0) {
    throw new Error('A planilha precisa das colunas "Dia" e "Exercicio".');
  }

  const ficha = fichaVazia();
  const focoPorDia = {};
  let importadas = 0;
  let ignoradas = 0;
  let ultimoDia = null;

  linhas.slice(1).forEach((linha) => {
    const celula = (indice) => (indice >= 0 ? String(linha[indice] ?? '').trim() : '');

    // Célula de dia vazia herda o dia anterior (planilhas costumam mesclar células).
    const chaveDia = diaParaChave(celula(col.dia)) || ultimoDia;
    const nome = celula(col.nome);

    if (!chaveDia || !nome) {
      if (nome || celula(col.dia)) ignoradas += 1;
      return;
    }
    ultimoDia = chaveDia;

    const foco = celula(col.foco);
    if (foco) focoPorDia[chaveDia] = foco;

    ficha.dias[chaveDia].exercicios.push(
      novoExercicio({
        nome,
        series: celula(col.series),
        reps: celula(col.reps),
        carga: celula(col.carga),
        obs: celula(col.obs),
      }),
    );
    importadas += 1;
  });

  if (!importadas) throw new Error('Nenhum exercício válido foi encontrado na planilha.');

  DIAS.forEach((dia) => {
    const qtd = ficha.dias[dia.key].exercicios.length;
    ficha.dias[dia.key].foco = focoPorDia[dia.key] || (qtd ? 'Treino' : 'Descanso');
  });

  return {
    ficha,
    resumo: {
      importadas,
      ignoradas,
      dias: DIAS.filter((d) => ficha.dias[d.key].exercicios.length > 0).length,
    },
  };
}

/** Lê o conteúdo bruto (base64 ou texto CSV) e devolve a matriz de células. */
export function conteudoParaLinhas(conteudo, ehTexto) {
  const pasta = XLSX.read(conteudo, { type: ehTexto ? 'string' : 'base64' });
  const primeira = pasta.SheetNames[0];
  if (!primeira) throw new Error('A planilha não tem nenhuma aba.');

  return XLSX.utils.sheet_to_json(pasta.Sheets[primeira], {
    header: 1,
    blankrows: false,
    defval: '',
  });
}
