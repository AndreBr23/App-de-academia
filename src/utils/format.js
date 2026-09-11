/** Máscara progressiva de telefone brasileiro: (11) 91234-5678. */
export function mascaraTelefone(valor) {
  const nums = String(valor || '').replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return nums;
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

export function somenteDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

/** Matrícula é sempre comparada em caixa alta e sem espaços. */
export function normalizarMatricula(valor) {
  return String(valor || '').trim().toUpperCase();
}

export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor || '').trim());
}

export function iniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function primeiroNome(nome) {
  return String(nome || '').trim().split(/\s+/)[0] || '';
}

export function plural(qtd, singular, pluralForma) {
  return qtd === 1 ? singular : pluralForma;
}
