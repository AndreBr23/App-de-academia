import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao, Campo } from '../components/ui';
import { colors, radius, spacing } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { CODIGO_ADMIN } from '../data/seed';
import { emailValido, mascaraTelefone, somenteDigitos } from '../utils/format';

const VAZIO = { nome: '', email: '', telefone: '', matricula: '', codigo: '' };

export default function LoginScreen() {
  const { entrar, cadastrar } = useApp();
  const [modo, setModo] = useState('cadastro');
  const [perfil, setPerfil] = useState('aluno');
  const [form, setForm] = useState(VAZIO);
  const [acesso, setAcesso] = useState('');
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: null, geral: null }));
  };

  function validarCadastro() {
    const novos = {};
    if (form.nome.trim().length < 3) novos.nome = 'Informe seu nome completo.';
    if (!emailValido(form.email)) novos.email = 'E-mail inválido.';
    if (somenteDigitos(form.telefone).length < 10) novos.telefone = 'Telefone com DDD, por favor.';
    if (form.matricula.trim().length < 3) novos.matricula = 'Matrícula da academia (mín. 3 caracteres).';
    if (perfil === 'adm' && form.codigo.trim().toUpperCase() !== CODIGO_ADMIN) {
      novos.codigo = 'Código da academia incorreto.';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function aoCadastrar() {
    if (!validarCadastro()) return;
    setEnviando(true);
    const resultado = await cadastrar({ ...form, perfil });
    setEnviando(false);
    if (!resultado.ok) setErros({ geral: resultado.erro });
  }

  async function aoEntrar() {
    setEnviando(true);
    const resultado = await entrar(acesso);
    setEnviando(false);
    if (!resultado.ok) setErros({ geral: resultado.erro });
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['rgba(27,107,255,0.35)', 'rgba(27,107,255,0)']}
            style={estilos.brilho}
          />

          <View style={estilos.marca}>
            <View style={estilos.logo}>
              <View style={estilos.logoBarra} />
              <View style={[estilos.logoBarra, { height: 26, backgroundColor: colors.yellow }]} />
              <View style={estilos.logoBarra} />
            </View>
            <Text style={estilos.marcaNome}>IRONPULSE</Text>
            <Text style={estilos.marcaSub}>Sua academia no ritmo certo</Text>
          </View>

          <View style={estilos.abas}>
            {[
              { id: 'cadastro', titulo: 'Criar conta' },
              { id: 'entrar', titulo: 'Entrar' },
            ].map((aba) => (
              <Pressable
                key={aba.id}
                onPress={() => {
                  setModo(aba.id);
                  setErros({});
                }}
                style={[estilos.aba, modo === aba.id && estilos.abaAtiva]}
              >
                <Text style={[estilos.abaTexto, modo === aba.id && estilos.abaTextoAtivo]}>
                  {aba.titulo}
                </Text>
              </Pressable>
            ))}
          </View>

          {modo === 'cadastro' ? (
            <View>
              <View style={estilos.perfilSeletor}>
                {[
                  { id: 'aluno', titulo: 'Sou aluno', icone: '🏃' },
                  { id: 'adm', titulo: 'Sou professor', icone: '🧑‍🏫' },
                ].map((opcao) => (
                  <Pressable
                    key={opcao.id}
                    onPress={() => {
                      setPerfil(opcao.id);
                      setErros({});
                    }}
                    style={[estilos.perfilOpcao, perfil === opcao.id && estilos.perfilOpcaoAtiva]}
                  >
                    <Text style={{ fontSize: 18 }}>{opcao.icone}</Text>
                    <Text
                      style={[
                        estilos.perfilTexto,
                        perfil === opcao.id && { color: colors.yellow },
                      ]}
                    >
                      {opcao.titulo}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Campo
                rotulo="Nome completo"
                placeholder="Ex.: Ana Beatriz Lima"
                value={form.nome}
                onChangeText={(v) => alterar('nome', v)}
                autoCapitalize="words"
                erro={erros.nome}
              />
              <Campo
                rotulo="E-mail"
                placeholder="voce@email.com"
                value={form.email}
                onChangeText={(v) => alterar('email', v)}
                autoCapitalize="none"
                keyboardType="email-address"
                erro={erros.email}
              />
              <Campo
                rotulo="Telefone"
                placeholder="(11) 91234-5678"
                value={form.telefone}
                onChangeText={(v) => alterar('telefone', mascaraTelefone(v))}
                keyboardType="phone-pad"
                erro={erros.telefone}
              />
              <Campo
                rotulo={perfil === 'adm' ? 'Matrícula funcional' : 'Matrícula na academia'}
                placeholder={perfil === 'adm' ? 'Ex.: ADM001' : 'Ex.: 2024001'}
                value={form.matricula}
                onChangeText={(v) => alterar('matricula', v.toUpperCase())}
                autoCapitalize="characters"
                erro={erros.matricula}
                dica={
                  perfil === 'adm'
                    ? 'Identifica você no painel da equipe técnica.'
                    : 'É por ela que sua ficha de treino chega até aqui.'
                }
              />
              {perfil === 'adm' ? (
                <Campo
                  rotulo="Código da academia"
                  placeholder="Código fornecido pela unidade"
                  value={form.codigo}
                  onChangeText={(v) => alterar('codigo', v.toUpperCase())}
                  autoCapitalize="characters"
                  erro={erros.codigo}
                  dica={`Demonstração: ${CODIGO_ADMIN}`}
                />
              ) : null}

              {erros.geral ? <Text style={estilos.erroGeral}>{erros.geral}</Text> : null}

              <Botao titulo="Criar conta" onPress={aoCadastrar} carregando={enviando} icone="⚡" />
            </View>
          ) : (
            <View>
              <Campo
                rotulo="Matrícula ou e-mail"
                placeholder="2024001"
                value={acesso}
                onChangeText={(v) => {
                  setAcesso(v);
                  setErros({});
                }}
                autoCapitalize="none"
                dica="Use a mesma matrícula cadastrada na recepção."
              />
              {erros.geral ? <Text style={estilos.erroGeral}>{erros.geral}</Text> : null}
              <Botao titulo="Entrar" onPress={aoEntrar} carregando={enviando} icone="→" />
              <Text style={estilos.rodapeDica}>
                Contas de demonstração: 2024001, 2024002 ou 2024003.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.lg },
  brilho: {
    position: 'absolute',
    top: -140,
    left: -60,
    right: -60,
    height: 300,
    borderRadius: 300,
  },
  marca: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xxl },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 46,
    marginBottom: spacing.md,
  },
  logoBarra: { width: 6, height: 18, borderRadius: 3, backgroundColor: colors.blue },
  marcaNome: { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  marcaSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 6, letterSpacing: 0.5 },
  abas: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing.xl,
  },
  aba: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  abaAtiva: { backgroundColor: colors.surfaceAlt },
  abaTexto: {
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 12.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  abaTextoAtivo: { color: colors.text },
  perfilSeletor: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  perfilOpcao: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  perfilOpcaoAtiva: { borderColor: colors.yellow, backgroundColor: 'rgba(255,210,51,0.08)' },
  perfilTexto: { fontSize: 12, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  erroGeral: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  rodapeDica: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 12,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
