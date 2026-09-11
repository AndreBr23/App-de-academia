import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cabecalho from '../components/Cabecalho';
import { Card, Etiqueta, Secao } from '../components/ui';
import { colors, radius, spacing } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { DIAS, diaKey, formatarDataHora } from '../utils/date';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ROTULO_ORIGEM = {
  padrao: 'Ficha padrão da academia',
  pdf: 'Enviada em PDF',
  planilha: 'Enviada em planilha',
  manual: 'Montada pelo professor',
};

export default function FichaGeralScreen({ abrirMenu }) {
  const { usuario, ficha, temFichaPropria } = useApp();
  const [aberto, setAberto] = useState(diaKey(new Date()));
  const propria = temFichaPropria(usuario?.matricula);

  const alternar = (chave) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAberto((atual) => (atual === chave ? null : chave));
  };

  const totalExercicios = DIAS.reduce(
    (soma, d) => soma + (ficha.dias[d.key]?.exercicios?.length || 0),
    0,
  );
  const diasAtivos = DIAS.filter((d) => (ficha.dias[d.key]?.exercicios?.length || 0) > 0).length;

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <Cabecalho subtitulo="Programa completo" titulo="Ficha de treino" onMenu={abrirMenu} />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Card style={estilos.vinculo}>
          <View style={estilos.vinculoTopo}>
            <View>
              <Text style={estilos.vinculoRotulo}>Vinculada à matrícula</Text>
              <Text style={estilos.vinculoMatricula}>{usuario?.matricula}</Text>
            </View>
            <Etiqueta
              texto={ROTULO_ORIGEM[ficha.origem?.tipo] || 'Ficha ativa'}
              cor={propria ? colors.yellow : colors.textMuted}
            />
          </View>

          <View style={estilos.vinculoLinha}>
            <InfoMini valor={diasAtivos} rotulo="Dias de treino" />
            <View style={estilos.separador} />
            <InfoMini valor={totalExercicios} rotulo="Exercícios" />
            <View style={estilos.separador} />
            <InfoMini
              valor={ficha.atualizadoEm ? formatarDataHora(ficha.atualizadoEm).slice(0, 5) : '—'}
              rotulo="Atualizada"
            />
          </View>

          <Text style={estilos.vinculoRodape}>
            {propria
              ? `Atualizada em ${formatarDataHora(ficha.atualizadoEm)} por ${ficha.atualizadoPor || 'equipe técnica'}.`
              : 'Você está com a ficha padrão da academia. Assim que o professor enviar sua ficha para esta matrícula, ela aparece aqui automaticamente.'}
          </Text>

          {ficha.origem?.arquivo ? (
            <View style={estilos.arquivo}>
              <Text style={estilos.arquivoIcone}>
                {ficha.origem.tipo === 'pdf' ? '📄' : '📊'}
              </Text>
              <Text style={estilos.arquivoNome} numberOfLines={1}>
                {ficha.origem.arquivo}
              </Text>
            </View>
          ) : null}
        </Card>

        <Secao>Semana completa</Secao>

        <View style={{ gap: spacing.md }}>
          {DIAS.map((dia) => {
            const doDia = ficha.dias[dia.key] || { foco: 'Descanso', exercicios: [] };
            const expandido = aberto === dia.key;
            const vazio = doDia.exercicios.length === 0;
            const eHoje = diaKey(new Date()) === dia.key;

            return (
              <Card key={dia.key} style={[estilos.diaCard, expandido && estilos.diaCardAberto]}>
                <Pressable onPress={() => alternar(dia.key)} style={estilos.diaTopo}>
                  <View style={[estilos.diaSelo, eHoje && estilos.diaSeloHoje]}>
                    <Text style={[estilos.diaSeloTexto, eHoje && { color: '#16233A' }]}>
                      {dia.abrev}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[estilos.diaFoco, vazio && { color: colors.textMuted }]}>
                      {doDia.foco}
                    </Text>
                    <Text style={estilos.diaResumo}>
                      {vazio
                        ? 'Sem treino programado'
                        : `${doDia.exercicios.length} exercícios`}
                      {eHoje ? ' · hoje' : ''}
                    </Text>
                  </View>
                  <Text style={[estilos.seta, expandido && { transform: [{ rotate: '90deg' }] }]}>
                    ›
                  </Text>
                </Pressable>

                {expandido && !vazio ? (
                  <View style={estilos.lista}>
                    {doDia.exercicios.map((ex, i) => (
                      <View key={ex.id || i} style={estilos.linhaExercicio}>
                        <Text style={estilos.linhaIndice}>{String(i + 1).padStart(2, '0')}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={estilos.linhaNome}>{ex.nome}</Text>
                          {ex.obs ? <Text style={estilos.linhaObs}>{ex.obs}</Text> : null}
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={estilos.linhaSeries}>
                            {ex.series ? `${ex.series}x` : ''}
                            {ex.reps || ''}
                          </Text>
                          {ex.carga ? <Text style={estilos.linhaCarga}>{ex.carga}</Text> : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoMini({ valor, rotulo }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={estilos.infoValor}>{valor}</Text>
      <Text style={estilos.infoRotulo}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  vinculo: { borderColor: 'rgba(27,107,255,0.35)' },
  vinculoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  vinculoRotulo: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  vinculoMatricula: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },
  vinculoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  separador: { width: 1, height: 28, backgroundColor: colors.border },
  infoValor: { color: colors.text, fontSize: 17, fontWeight: '800' },
  infoRotulo: { color: colors.textFaint, fontSize: 10, marginTop: 3 },
  vinculoRodape: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: spacing.lg },
  arquivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
  },
  arquivoIcone: { fontSize: 15 },
  arquivoNome: { color: colors.textMuted, fontSize: 12, flex: 1 },
  diaCard: { padding: spacing.md },
  diaCardAberto: { borderColor: 'rgba(255,210,51,0.3)' },
  diaTopo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  diaSelo: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaSeloHoje: { backgroundColor: colors.yellow },
  diaSeloTexto: { color: colors.textMuted, fontWeight: '900', fontSize: 11, letterSpacing: 0.8 },
  diaFoco: { color: colors.text, fontSize: 15.5, fontWeight: '800' },
  diaResumo: { color: colors.textFaint, fontSize: 11.5, marginTop: 3 },
  seta: { color: colors.textMuted, fontSize: 22, paddingHorizontal: spacing.sm },
  lista: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  linhaExercicio: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  linhaIndice: { color: colors.textFaint, fontSize: 11, fontWeight: '800', width: 20 },
  linhaNome: { color: colors.text, fontSize: 14, fontWeight: '600' },
  linhaObs: { color: colors.textFaint, fontSize: 11, marginTop: 2 },
  linhaSeries: { color: colors.yellow, fontSize: 13, fontWeight: '800' },
  linhaCarga: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
