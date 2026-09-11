import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  usuarios: '@ironpulse:usuarios',
  sessao: '@ironpulse:sessao',
  fichas: '@ironpulse:fichas',
  checkins: '@ironpulse:checkins',
};

export async function lerJSON(chave, padrao) {
  try {
    const bruto = await AsyncStorage.getItem(chave);
    if (bruto == null) return padrao;
    return JSON.parse(bruto);
  } catch (e) {
    console.warn(`Falha ao ler ${chave}`, e);
    return padrao;
  }
}

export async function salvarJSON(chave, valor) {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (e) {
    console.warn(`Falha ao salvar ${chave}`, e);
    return false;
  }
}

export async function remover(chave) {
  try {
    await AsyncStorage.removeItem(chave);
  } catch (e) {
    console.warn(`Falha ao remover ${chave}`, e);
  }
}
