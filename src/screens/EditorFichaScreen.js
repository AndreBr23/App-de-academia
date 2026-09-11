import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cabecalho from '../components/Cabecalho';
import { Botao, Card, EstadoVazio } from '../components/ui';
import { colors, radius, spacing } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { DIAS, diaKey } from '../utils/date';
import { novoExercicio } from '../data/seed';
import { normalizarMatricula } from '../utils/format';

export default function EditorFichaScreen({ navigation, route }) {
  const matricula = normalizarMatricula(route.params?.matricula);
  const { fichaDaMatricula, salvarFicha, usuario } = useApp();

  const [ficha, setFicha] = useState(() => {
    const base = fichaDaMatricula(matricula);
    return JSON.parse(JSON.stringify(base));
  });
  const [diaAtivo, setDiaAtivo] = useState(diaKey(new Date()));
  const [salvando, setSalvando] = useState(false);

  const doDia = ficha.dias[diaAtivo];

  const atualizarDia = (mudancas) =>
    setFicha((atual) => ({
      ...atual,
      dias: { ...atual.dias, [diaAtivo]: { ...atual.dias[diaAtivo], ...mudancas } },
    }));

  const atualizarExercicio = (indice, campo, valor) =>
    atualizarDia({
      exercicios: doDia.exercicios.map((ex, i) => (i === indice ? { ...ex, [campo]: valor } : ex)),
    });

  const adicionarExercicio = () =>
    atualizarDia({ exercicios: [...doDia.exercicios, novoExercicio()] });

  const removerExercicio = (indice) =>
    atualizarDia({ exercicios: doDia.exercicios.filter((_, i) => i !== indice) });

  async function salvar() {
    const limpa = JSON.parse(JSON.stringify(ficha));
    DIAS.forEach((dia) => {
      const alvo = limpa.dias[dia.key];
      alvo.exercicios = alvo.exercicios.filter((ex) => ex.nome.trim().length > 0);
      if (!alvo.exercicios.length && !alvo.foco.trim()) alvo.foco = 'Descanso';
    });
    limpa.origem = { tipo: 'manual', arquivo: ficha.origem?.arquivo || null };

    setSalvando(true);
    await salvarFicha(matricula, limpa, usuario?.nome);
    setSalvando(false);

    Alert.alert('Ficha salva', `A matrícula ${matricula} já está com a ficha atualizada.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <Cabecalho
        subtitulo={`Matrícula ${matricula}`}
        titulo="Montar ficha"
        onVoltar={navigation.goBack}
      />

      <View style={estilos.abas}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.xl }}>
          {DIAS.map((dia) => {
            const ativo = diaAtivo === dia.key;
            const qtd = ficha.dias[dia.key].exercicios.length;
            return (
              <Pressable
                key={dia.key}
                onPress={() => setDiaAtivo(dia.key)}
                style={[estilos.aba, ativo && estilos.abaAtiva]}
              >
                <Text style={[estilos.abaTexto, ativo && { color: '#16233A' }]}>{dia.abrev}</Text>
                <View style={[estilos.abaContador, ativo && { backgroundColor: 'rgba(22,35,58,0.2)' }]}>
                  <Text style={[estilos.abaContadorTexto, ativo && { color: '#16233A' }]}>{qtd}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <Text style={estilos.rotulo}>Foco do dia</Text>
            <TextInput
              value={doDia.foco}
              onChangeText={(v) => atualizarDia({ foco: v })}
              placeholder="Ex.: Peito e Tríceps"
              placeholderTextColor={colors.textFaint}
              style={estilos.inputFoco}
            />
          </Card>

          {doDia.exercicios.length === 0 ? (
            <Card style={{ marginTop: spacing.lg }}>
              <EstadoVazio
                icone="➕"
                titulo="Nenhum exercício neste dia"
                descricao="Adicione exercícios ou deixe o dia livre para descanso."
              />
            </Card>
          ) : (
            <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
              {doDia.exercicios.map((ex, indice) => (
                <Card key={ex.id} style={estilos.exercicio}>
                  <View style={estilos.exercicioTopo}>
                    <Text style={estilos.exercicioIndice}>
                      {String(indice + 1).padStart(2, '0')}
                    </Text>
                    <Pressable onPress={() => removerExercicio(indice)} hitSlop={10}>
                      <Text style={estilos.remover}>Remover</Text>
                    </Pressable>
                  </View>

                  <TextInput
                    value={ex.nome}
                    onChangeText={(v) => atualizarExercicio(indice, 'nome', v)}
                    placeholder="Nome do exercício"
                    placeholderTextColor={colors.textFaint}
                    style={estilos.inputNome}
                  />

                  <View style={estilos.linhaCampos}>
                    <CampoMini
                      rotulo="Séries"
                      valor={ex.series}
                      aoMudar={(v) => atualizarExercicio(indice, 'series', v)}
                      placeholder="4"
                      teclado="numeric"
                    />
                    <CampoMini
                      rotulo="Reps"
                      valor={ex.reps}
                      aoMudar={(v) => atualizarExercicio(indice, 'reps', v)}
                      placeholder="12"
                    />
                    <CampoMini
                      rotulo="Carga"
                      valor={ex.carga}
                      aoMudar={(v) => atualizarExercicio(indice, 'carga', v)}
                      placeholder="30 kg"
                    />
                  </View>

                  <TextInput
                    value={ex.obs}
                    onChangeText={(v) => atualizarExercicio(indice, 'obs', v)}
                    placeholder="Observação (opcional)"
                    placeholderTextColor={colors.textFaint}
                    style={estilos.inputObs}
                  />
                </Card>
              ))}
            </View>
          )}

          <Botao
            titulo="Adicionar exercício"
            variante="contorno"
            icone="＋"
            style={{ marginTop: spacing.lg }}
            onPress={adicionarExercicio}
          />

          <Botao
            titulo="Salvar e publicar"
            style={{ marginTop: spacing.md }}
            onPress={salvar}
            carregando={salvando}
          />

          <Text style={estilos.aviso}>
            A ficha é publicada na matrícula {matricula} e atualiza o app do aluno imediatamente.
          </Text>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CampoMini({ rotulo, valor, aoMudar, placeholder, teclado }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={estilos.rotuloMini}>{rotulo}</Text>
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={teclado}
        style={estilos.inputMini}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, paddingTop: spacing.lg },
  abas: { paddingBottom: spacing.sm },
  aba: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  abaAtiva: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  abaTexto: { color: colors.textMuted, fontWeight: '800', fontSize: 11.5, letterSpacing: 0.8 },
  abaContador: {
    minWidth: 20,
    paddingHorizontal: 5,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abaContadorTexto: { color: colors.textMuted, fontSize: 10, fontWeight: '800' },
  rotulo: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  rotuloMini: {
    color: colors.textFaint,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  inputFoco: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  exercicio: { padding: spacing.md, gap: spacing.md },
  exercicioTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exercicioIndice: { color: colors.blueSoft, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  remover: { color: colors.danger, fontSize: 11.5, fontWeight: '700' },
  inputNome: {
    height: 46,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 14.5,
    fontWeight: '600',
  },
  linhaCampos: { flexDirection: 'row', gap: spacing.sm },
  inputMini: {
    height: 42,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 13.5,
  },
  inputObs: {
    height: 42,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    color: colors.textMuted,
    fontSize: 12.5,
  },
  aviso: {
    color: colors.textFaint,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 17,
  },
});
