import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { conteudoParaLinhas, linhasParaFicha } from './planilha';

const TIPOS_ACEITOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/comma-separated-values',
];

/** Abre o seletor nativo de arquivos (PDF, XLSX, XLS ou CSV). */
export async function escolherArquivo() {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: TIPOS_ACEITOS,
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (resultado.canceled || !resultado.assets?.length) return null;

  const arquivo = resultado.assets[0];
  const extensao = (arquivo.name || '').split('.').pop()?.toLowerCase() || '';
  return {
    uri: arquivo.uri,
    nome: arquivo.name || `ficha.${extensao}`,
    tamanho: arquivo.size || 0,
    extensao,
    ehPdf: extensao === 'pdf' || arquivo.mimeType === 'application/pdf',
    ehPlanilha: ['xlsx', 'xls', 'csv'].includes(extensao),
  };
}

/** Lê a planilha escolhida e devolve a ficha pronta para publicação. */
export async function planilhaParaFicha(arquivo) {
  const ehCsv = arquivo.extensao === 'csv';
  const conteudo = await FileSystem.readAsStringAsync(arquivo.uri, {
    encoding: ehCsv ? FileSystem.EncodingType.UTF8 : FileSystem.EncodingType.Base64,
  });

  const linhas = conteudoParaLinhas(conteudo, ehCsv);
  const { ficha, resumo } = linhasParaFicha(linhas);
  ficha.origem = { tipo: 'planilha', arquivo: arquivo.nome };

  return { ficha, resumo };
}

/** Modelo em CSV que o professor pode usar como referência. */
export const MODELO_CSV = [
  'Dia,Foco,Exercicio,Series,Repeticoes,Carga,Observacao',
  'Segunda,Peito e Triceps,Supino reto,4,10,40 kg,Cadencia 2-0-2',
  'Segunda,Peito e Triceps,Triceps corda,3,12,25 kg,',
  'Terca,Costas e Biceps,Puxada frente,4,10,45 kg,',
  'Quarta,Pernas,Agachamento livre,4,10,50 kg,Sem travar o joelho',
].join('\n');
