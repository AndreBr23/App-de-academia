export const DIAS = [
  { key: 'seg', curto: 'S', nome: 'Segunda', abrev: 'SEG' },
  { key: 'ter', curto: 'T', nome: 'Terça', abrev: 'TER' },
  { key: 'qua', curto: 'Q', nome: 'Quarta', abrev: 'QUA' },
  { key: 'qui', curto: 'Q', nome: 'Quinta', abrev: 'QUI' },
  { key: 'sex', curto: 'S', nome: 'Sexta', abrev: 'SEX' },
  { key: 'sab', curto: 'S', nome: 'Sábado', abrev: 'SAB' },
  { key: 'dom', curto: 'D', nome: 'Domingo', abrev: 'DOM' },
];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** 'YYYY-MM-DD' no fuso local (não usar toISOString: ele converte pra UTC). */
export function dateKey(date) {
  const d = new Date(date);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function fromKey(key) {
  const [ano, mes, dia] = key.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Índice 0..6 com a semana começando na segunda-feira. */
export function diaIndex(date) {
  return (new Date(date).getDay() + 6) % 7;
}

export function diaKey(date) {
  return DIAS[diaIndex(date)].key;
}

export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diaIndex(d));
  return d;
}

export function addDays(date, qtd) {
  const d = new Date(date);
  d.setDate(d.getDate() + qtd);
  return d;
}

export function semanaDe(date) {
  const inicio = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(inicio, i));
}

export function mesmoDia(a, b) {
  return dateKey(a) === dateKey(b);
}

export function ehFuturo(date) {
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  return new Date(date).getTime() > hoje.getTime();
}

export function formatarData(date) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function formatarDataHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${formatarData(d)} às ${hora}`;
}

export function nomeMes(date) {
  return MESES[new Date(date).getMonth()];
}

export function nomeDiaCompleto(date) {
  return DIAS[diaIndex(date)].nome;
}
