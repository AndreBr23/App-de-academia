import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cabecalho from '../components/Cabecalho';
import { Botao, Campo, Card, Divisor, Etiqueta, LinhaInfo, Secao } from '../components/ui';
import { colors, radius, spacing } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { emailValido, iniciais, mascaraTelefone, somenteDigitos } from '../utils/format';
import { formatarData, formatarDataHora } from '../utils/date';

export default function PerfilScreen({ navigation, abrirMenu }) {
  const { usuario, ehAdmin, atualizarPerfil, sair, ficha, temFichaPropria, estatisticas } = useApp();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', matricula: '' });
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        matricula: usuario.matricula,
      });
    }
  }, [usuario]);

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: null, geral: null }));
  };

  async function salvar() {
    const novos = {};
    if (form.nome.trim().length < 3) novos.nome = 'Informe seu nome completo.';
    if (!emailValido(form.email)) novos.email = 'E-mail inválido.';
    if (somenteDigitos(form.telefone).length < 10) novos.telefone = 'Telefone com DDD.';
    if (form.matricula.trim().length < 3) novos.matricula = 'Matrícula inválida.';
    setErros(novos);
    if (Object.keys(novos).length) return;

    setSalvando(true);
    const resultado = await atualizarPerfil(form);
    setSalvando(false);

    if (!resultado.ok) {
      setErros({ geral: resultado.erro });
      return;
    }
    setEditando(false);
    if (resultado.usuario.matricula !== usuario.matricula) {
      Alert.alert(
        'Matrícula atualizada',
        `Sua ficha agora é a vinculada à matrícula ${resultado.usuario.matricula}.`,
      );
    }
  }

  function confirmarSaida() {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  if (!usuario) return null;

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <Cabecalho subtitulo="Sua conta" titulo="Perfil" onMenu={abrirMenu} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card style={estilos.identidade}>
            <View style={estilos.avatar}>
              <Text style={estilos.avatarTexto}>{iniciais(usuario.nome)}</Text>
            </View>
            <Text style={estilos.nome}>{usuario.nome}</Text>
            <Etiqueta
              texto={ehAdmin ? 'Professor · Administrador' : 'Aluno'}
              cor={ehAdmin ? colors.yellow : colors.blueSoft}
              style={{ marginTop: spacing.sm }}
            />
            <View style={estilos.metricas}>
              <Metrica valor={estatisticas.total} rotulo="Treinos" />
              <View style={estilos.divisorVertical} />
              <Metrica valor={estatisticas.sequencia} rotulo="Sequência" />
              <View style={estilos.divisorVertical} />
              <Metrica valor={estatisticas.melhorSequencia} rotulo="Recorde" />
            </View>
          </Card>

          {ehAdmin ? (
            <>
              <Secao>Área do professor</Secao>
              <Pressable onPress={() => navigation.navigate('Alunos')}>
                {({ pressed }) => (
                  <Card style={[estilos.admCard, pressed && { opacity: 0.85 }]}>
                    <View style={estilos.admIcone}>
                      <Text style={{ fontSize: 20 }}>🏋️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={estilos.admTitulo}>Alunos</Text>
                      <Text style={estilos.admSub}>
                        Enviar ficha em PDF ou planilha e vincular à matrícula
                      </Text>
                    </View>
                    <Text style={estilos.admSeta}>›</Text>
                  </Card>
                )}
              </Pressable>
            </>
          ) : null}

          <Secao
            direita={
              !editando ? (
                <Pressable onPress={() => setEditando(true)} hitSlop={10}>
                  <Text style={estilos.editar}>Editar</Text>
                </Pressable>
              ) : null
            }
          >
            Dados cadastrais
          </Secao>

          <Card>
            {editando ? (
              <View>
                <Campo
                  rotulo="Nome completo"
                  value={form.nome}
                  onChangeText={(v) => alterar('nome', v)}
                  autoCapitalize="words"
                  erro={erros.nome}
                />
                <Campo
                  rotulo="E-mail"
                  value={form.email}
                  onChangeText={(v) => alterar('email', v)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  erro={erros.email}
                />
                <Campo
                  rotulo="Telefone"
                  value={form.telefone}
                  onChangeText={(v) => alterar('telefone', mascaraTelefone(v))}
                  keyboardType="phone-pad"
                  erro={erros.telefone}
                />
                <Campo
                  rotulo="Matrícula na academia"
                  value={form.matricula}
                  onChangeText={(v) => alterar('matricula', v.toUpperCase())}
                  autoCapitalize="characters"
                  erro={erros.matricula}
                  dica="Ao trocar a matrícula, a ficha vinculada a ela passa a valer."
                />
                {erros.geral ? <Text style={estilos.erroGeral}>{erros.geral}</Text> : null}
                <View style={{ gap: spacing.md }}>
                  <Botao titulo="Salvar alterações" onPress={salvar} carregando={salvando} />
                  <Botao
                    titulo="Cancelar"
                    variante="contorno"
                    onPress={() => {
                      setEditando(false);
                      setErros({});
                      setForm({
                        nome: usuario.nome,
                        email: usuario.email,
                        telefone: usuario.telefone,
                        matricula: usuario.matricula,
                      });
                    }}
                  />
                </View>
              </View>
            ) : (
              <View>
                <LinhaInfo rotulo="Nome" valor={usuario.nome} />
                <Divisor style={{ marginVertical: 0 }} />
                <LinhaInfo rotulo="E-mail" valor={usuario.email} />
                <Divisor style={{ marginVertical: 0 }} />
                <LinhaInfo rotulo="Telefone" valor={usuario.telefone} />
                <Divisor style={{ marginVertical: 0 }} />
                <LinhaInfo rotulo="Matrícula" valor={usuario.matricula} />
                <Divisor style={{ marginVertical: 0 }} />
                <LinhaInfo
                  rotulo="Membro desde"
                  valor={usuario.criadoEm ? formatarData(usuario.criadoEm) : '—'}
                />
              </View>
            )}
          </Card>

          {!ehAdmin ? (
            <>
              <Secao>Minha ficha</Secao>
              <Card>
                <LinhaInfo
                  rotulo="Status"
                  valor={temFichaPropria(usuario.matricula) ? 'Ficha personalizada' : 'Ficha padrão'}
                />
                <Divisor style={{ marginVertical: 0 }} />
                <LinhaInfo rotulo="Atualizada em" valor={formatarDataHora(ficha.atualizadoEm)} />
                <Divisor style={{ marginVertical: 0 }} />
                <LinhaInfo rotulo="Enviada por" valor={ficha.atualizadoPor || '—'} />
                <Botao
                  titulo="Ver ficha completa"
                  variante="contorno"
                  style={{ marginTop: spacing.lg }}
                  onPress={() => navigation.navigate('FichaGeral')}
                />
              </Card>
            </>
          ) : null}

          <Botao
            titulo="Sair da conta"
            variante="perigo"
            icone="⏻"
            style={{ marginTop: spacing.xxl }}
            onPress={confirmarSaida}
          />

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Metrica({ valor, rotulo }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={estilos.metricaValor}>{valor}</Text>
      <Text style={estilos.metricaRotulo}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  identidade: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: radius.lg,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarTexto: { color: colors.white, fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  nome: { color: colors.text, fontSize: 20, fontWeight: '800' },
  metricas: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  divisorVertical: { width: 1, height: 28, backgroundColor: colors.border },
  metricaValor: { color: colors.text, fontSize: 19, fontWeight: '800' },
  metricaRotulo: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  admCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderColor: 'rgba(255,210,51,0.35)',
  },
  admIcone: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,210,51,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  admTitulo: { color: colors.text, fontSize: 16, fontWeight: '800' },
  admSub: { color: colors.textMuted, fontSize: 12, marginTop: 3, lineHeight: 17 },
  admSeta: { color: colors.textMuted, fontSize: 24 },
  editar: {
    color: colors.blueSoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  erroGeral: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
});
