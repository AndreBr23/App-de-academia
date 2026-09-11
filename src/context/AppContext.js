import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS, lerJSON, salvarJSON } from '../storage/storage';
import { alunosDemo, fichaPadrao } from '../data/seed';
import { normalizarMatricula } from '../utils/format';
import { dateKey } from '../utils/date';
import { calcularEstatisticas } from '../utils/estatisticas';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [carregando, setCarregando] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [fichas, setFichas] = useState({});
  const [checkins, setCheckins] = useState({});

  // ---------------------------------------------------------------- bootstrap
  useEffect(() => {
    (async () => {
      const [listaUsuarios, sessao, mapaFichas, mapaCheckins] = await Promise.all([
        lerJSON(KEYS.usuarios, null),
        lerJSON(KEYS.sessao, null),
        lerJSON(KEYS.fichas, {}),
        lerJSON(KEYS.checkins, {}),
      ]);

      let usuariosIniciais = listaUsuarios;
      if (!usuariosIniciais) {
        usuariosIniciais = alunosDemo();
        await salvarJSON(KEYS.usuarios, usuariosIniciais);
      }

      setUsuarios(usuariosIniciais);
      setUsuarioId(sessao);
      setFichas(mapaFichas || {});
      setCheckins(mapaCheckins || {});
      setCarregando(false);
    })();
  }, []);

  const persistirUsuarios = useCallback(async (lista) => {
    setUsuarios(lista);
    await salvarJSON(KEYS.usuarios, lista);
  }, []);

  const persistirFichas = useCallback(async (mapa) => {
    setFichas(mapa);
    await salvarJSON(KEYS.fichas, mapa);
  }, []);

  const persistirCheckins = useCallback(async (mapa) => {
    setCheckins(mapa);
    await salvarJSON(KEYS.checkins, mapa);
  }, []);

  const usuario = useMemo(
    () => usuarios.find((u) => u.id === usuarioId) || null,
    [usuarios, usuarioId],
  );

  // --------------------------------------------------------------- auth
  const cadastrar = useCallback(
    async ({ nome, email, telefone, matricula, perfil = 'aluno' }) => {
      const mat = normalizarMatricula(matricula);
      const emailLimpo = String(email).trim().toLowerCase();

      const conflito = usuarios.find(
        (u) => normalizarMatricula(u.matricula) === mat || u.email.toLowerCase() === emailLimpo,
      );
      if (conflito) {
        const campo =
          normalizarMatricula(conflito.matricula) === mat ? 'matrícula' : 'e-mail';
        return { ok: false, erro: `Já existe uma conta com esta ${campo}.` };
      }

      const novo = {
        id: `u_${Date.now()}`,
        nome: String(nome).trim(),
        email: emailLimpo,
        telefone: String(telefone).trim(),
        matricula: mat,
        perfil,
        criadoEm: new Date().toISOString(),
      };

      await persistirUsuarios([...usuarios, novo]);
      await salvarJSON(KEYS.sessao, novo.id);
      setUsuarioId(novo.id);
      return { ok: true, usuario: novo };
    },
    [usuarios, persistirUsuarios],
  );

  const entrar = useCallback(
    async (identificador) => {
      const valor = String(identificador || '').trim();
      if (!valor) return { ok: false, erro: 'Informe sua matrícula ou e-mail.' };

      const mat = normalizarMatricula(valor);
      const encontrado = usuarios.find(
        (u) =>
          normalizarMatricula(u.matricula) === mat ||
          u.email.toLowerCase() === valor.toLowerCase(),
      );
      if (!encontrado) {
        return { ok: false, erro: 'Não encontramos essa matrícula. Crie sua conta.' };
      }

      await salvarJSON(KEYS.sessao, encontrado.id);
      setUsuarioId(encontrado.id);
      return { ok: true, usuario: encontrado };
    },
    [usuarios],
  );

  const sair = useCallback(async () => {
    await salvarJSON(KEYS.sessao, null);
    setUsuarioId(null);
  }, []);

  const atualizarPerfil = useCallback(
    async (dados) => {
      if (!usuario) return { ok: false, erro: 'Nenhum usuário logado.' };

      const mat = normalizarMatricula(dados.matricula ?? usuario.matricula);
      const emailLimpo = String(dados.email ?? usuario.email).trim().toLowerCase();

      const conflito = usuarios.find(
        (u) =>
          u.id !== usuario.id &&
          (normalizarMatricula(u.matricula) === mat || u.email.toLowerCase() === emailLimpo),
      );
      if (conflito) {
        return { ok: false, erro: 'Matrícula ou e-mail já usados por outra conta.' };
      }

      const atualizado = {
        ...usuario,
        ...dados,
        matricula: mat,
        email: emailLimpo,
        demo: false,
      };
      await persistirUsuarios(usuarios.map((u) => (u.id === usuario.id ? atualizado : u)));
      return { ok: true, usuario: atualizado };
    },
    [usuario, usuarios, persistirUsuarios],
  );

  // --------------------------------------------------------------- fichas
  /** A ficha é sempre resolvida pela matrícula: trocou a matrícula, troca a ficha. */
  const fichaDaMatricula = useCallback(
    (matricula) => {
      const mat = normalizarMatricula(matricula);
      return fichas[mat] || fichaPadrao();
    },
    [fichas],
  );

  const temFichaPropria = useCallback(
    (matricula) => Boolean(fichas[normalizarMatricula(matricula)]),
    [fichas],
  );

  const salvarFicha = useCallback(
    async (matricula, ficha, autor) => {
      const mat = normalizarMatricula(matricula);
      const registro = {
        ...ficha,
        atualizadoEm: new Date().toISOString(),
        atualizadoPor: autor || 'Equipe técnica',
      };
      await persistirFichas({ ...fichas, [mat]: registro });
      return registro;
    },
    [fichas, persistirFichas],
  );

  const removerFicha = useCallback(
    async (matricula) => {
      const mat = normalizarMatricula(matricula);
      const copia = { ...fichas };
      delete copia[mat];
      await persistirFichas(copia);
    },
    [fichas, persistirFichas],
  );

  const ficha = useMemo(
    () => (usuario ? fichaDaMatricula(usuario.matricula) : fichaPadrao()),
    [usuario, fichaDaMatricula],
  );

  // --------------------------------------------------------------- check-ins
  const checkinsDaMatricula = useCallback(
    (matricula) => checkins[normalizarMatricula(matricula)] || {},
    [checkins],
  );

  const meusCheckins = useMemo(
    () => (usuario ? checkinsDaMatricula(usuario.matricula) : {}),
    [usuario, checkinsDaMatricula],
  );

  const marcarTreino = useCallback(
    async (data, concluido) => {
      if (!usuario) return;
      const mat = normalizarMatricula(usuario.matricula);
      const chave = dateKey(data);
      const doAluno = { ...(checkins[mat] || {}) };

      if (concluido) {
        doAluno[chave] = { concluido: true, registradoEm: new Date().toISOString() };
      } else {
        delete doAluno[chave];
      }
      await persistirCheckins({ ...checkins, [mat]: doAluno });
    },
    [usuario, checkins, persistirCheckins],
  );

  const treinoConcluido = useCallback(
    (data) => Boolean(meusCheckins[dateKey(data)]?.concluido),
    [meusCheckins],
  );

  // --------------------------------------------------------------- estatísticas
  const estatisticas = useMemo(() => calcularEstatisticas(meusCheckins, ficha), [meusCheckins, ficha]);

  const valor = {
    carregando,
    usuario,
    usuarios,
    ehAdmin: usuario?.perfil === 'adm',
    cadastrar,
    entrar,
    sair,
    atualizarPerfil,
    ficha,
    fichas,
    fichaDaMatricula,
    temFichaPropria,
    salvarFicha,
    removerFicha,
    meusCheckins,
    checkinsDaMatricula,
    marcarTreino,
    treinoConcluido,
    estatisticas,
  };

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de <AppProvider>.');
  return ctx;
}
