import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cabecalho from '../components/Cabecalho';
import { Botao, Card, Etiqueta, EstadoVazio } from '../components/ui';
import { colors, radius, spacing } from '../theme/theme';
import { useApp } from '../context/AppContext';
import {
  DIAS,
  addDays,
  dateKey,
  diaKey,
  ehFuturo,
  formatarData,
  mesmoDia,
  nomeDiaCompleto,
  nomeMes,
  semanaDe,
  startOfWeek,
} from '../utils/date';

export default function FichaDoDiaScreen({ abrirMenu }) {
  const { ficha, meusCheckins, marcarTreino, estatisticas } = useApp();
  const hoje = new Date();
  const [selecionado, setSelecionado] = useState(hoje);

  const semana = useMemo(() => semanaDe(selecionado), [selecionado]);
  const chaveDia = diaKey(selecionado);
  const treino = ficha.dias[chaveDia] || { foco: 'Descanso', exercicios: [] };
  const concluido = Boolean(meusCheckins[dateKey(selecionado)]?.concluido);
  const futuro = ehFuturo(selecionado);
  const ehDescanso = treino.exercicios.length === 0;

  const mudarSemana = (delta) => setSelecionado((atual) => addDays(startOfWeek(atual), delta * 7));

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <Cabecalho subtitulo="Treino" titulo="Ficha do dia" onMenu={abrirMenu} />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {/* Mini calendário da semana */}
        <Card style={{ paddingHorizontal: spacing.md }}>
          <View style={estilos.calendarioTopo}>
            <Pressable onPress={() => mudarSemana(-1)} hitSlop={12} style={estilos.navBotao}>
              <Text style={estilos.navTexto}>‹</Text>
            </Pressable>
            <View style={{ alignItems: 'center' }}>
              <Text style={estilos.mesTexto}>
                {nomeMes(semana[0])} {semana[0].getFullYear()}
              </Text>
              <Text style={estilos.semanaTexto}>
                {formatarData(semana[0]).slice(0, 5)} – {formatarData(semana[6]).slice(0, 5)}
              </Text>
            </View>
            <Pressable onPress={() => mudarSemana(1)} hitSlop={12} style={estilos.navBotao}>
              <Text style={estilos.navTexto}>›</Text>
            </Pressable>
          </View>

          <View style={estilos.faixaDias}>
            {semana.map((data, i) => {
              const ativo = mesmoDia(data, selecionado);
              const feito = Boolean(meusCheckins[dateKey(data)]?.concluido);
              const temTreino = (ficha.dias[DIAS[i].key]?.exercicios || []).length > 0;
              const eHoje = mesmoDia(data, hoje);
              return (
                <Pressable
                  key={dateKey(data)}
                  onPress={() => setSelecionado(data)}
                  style={[
                    estilos.dia,
                    ativo && estilos.diaAtivo,
                    !ativo && eHoje && estilos.diaHoje,
                  ]}
                >
                  <Text style={[estilos.diaSemana, ativo && { color: '#16233A' }]}>
                    {DIAS[i].abrev}
                  </Text>
                  <Text style={[estilos.diaNumero, ativo && { color: '#16233A' }]}>
                    {String(data.getDate()).padStart(2, '0')}
                  </Text>
                  <View
                    style={[
                      estilos.diaPonto,
                      {
                        backgroundColor: feito
                          ? ativo
                            ? '#16233A'
                            : colors.yellow
                          : temTreino
                            ? ativo
                              ? 'rgba(22,35,58,0.4)'
                              : colors.blue
                            : 'transparent',
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          {!mesmoDia(selecionado, hoje) ? (
            <Pressable onPress={() => setSelecionado(new Date())} style={estilos.voltarHoje}>
              <Text style={estilos.voltarHojeTexto}>↺  Voltar para hoje</Text>
            </Pressable>
          ) : null}
        </Card>

        {/* Resumo do dia selecionado */}
        <View style={estilos.resumoDia}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.diaNome}>{nomeDiaCompleto(selecionado)}</Text>
            <Text style={estilos.diaFoco}>{treino.foco}</Text>
          </View>
          <Etiqueta
            texto={concluido ? 'Concluído' : futuro ? 'Agendado' : ehDescanso ? 'Descanso' : 'Pendente'}
            cor={concluido ? colors.success : futuro ? colors.blueSoft : ehDescanso ? colors.textMuted : colors.yellow}
          />
        </View>

        {/* Exercícios */}
        {ehDescanso ? (
          <Card>
            <EstadoVazio
              icone="🧘"
              titulo="Dia de recuperação"
              descricao="Nenhum treino programado para este dia na sua ficha. Descanso também faz parte da progressão."
            />
          </Card>
        ) : (
          <View style={{ gap: spacing.md }}>
            {treino.exercicios.map((ex, indice) => (
              <Card key={ex.id || indice} style={estilos.exercicio}>
                <View style={estilos.exercicioNumero}>
                  <Text style={estilos.exercicioNumeroTexto}>{String(indice + 1).padStart(2, '0')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.exercicioNome}>{ex.nome}</Text>
                  <View style={estilos.exercicioMeta}>
                    {ex.series ? <Meta rotulo="Séries" valor={ex.series} /> : null}
                    {ex.reps ? <Meta rotulo="Reps" valor={ex.reps} /> : null}
                    {ex.carga ? <Meta rotulo="Carga" valor={ex.carga} /> : null}
                  </View>
                  {ex.obs ? <Text style={estilos.exercicioObs}>{ex.obs}</Text> : null}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Controle de conclusão */}
        {!ehDescanso ? (
          <View style={estilos.acoes}>
            {futuro ? (
              <Card style={estilos.avisoFuturo}>
                <Text style={estilos.avisoFuturoTexto}>
                  Este treino ainda está no futuro. Você poderá marcar a conclusão no dia.
                </Text>
              </Card>
            ) : concluido ? (
              <>
                <Card style={estilos.feitoCard}>
                  <Text style={estilos.feitoIcone}>✓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.feitoTitulo}>Treino concluído</Text>
                    <Text style={estilos.feitoSub}>
                      Registrado em {formatarData(selecionado)} · sequência de{' '}
                      {estatisticas.sequencia} {estatisticas.sequencia === 1 ? 'dia' : 'dias'}
                    </Text>
                  </View>
                </Card>
                <Botao
                  titulo="Não concluí este treino"
                  variante="perigo"
                  onPress={() => marcarTreino(selecionado, false)}
                />
              </>
            ) : (
              <>
                <Botao
                  titulo="Concluí o treino"
                  icone="✓"
                  onPress={() => marcarTreino(selecionado, true)}
                />
                <Text style={estilos.dicaAcao}>
                  Marcar o treino alimenta seu gráfico de frequência e a sequência de dias.
                </Text>
              </>
            )}
          </View>
        ) : null}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ rotulo, valor }) {
  return (
    <View style={estilos.meta}>
      <Text style={estilos.metaRotulo}>{rotulo}</Text>
      <Text style={estilos.metaValor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  calendarioTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  navBotao: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTexto: { color: colors.text, fontSize: 22, lineHeight: 24, marginTop: -2 },
  mesTexto: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  semanaTexto: { color: colors.textFaint, fontSize: 11, marginTop: 2 },
  faixaDias: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  dia: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 3,
  },
  diaAtivo: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  diaHoje: { borderColor: colors.blue },
  diaSemana: {
    color: colors.textFaint,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  diaNumero: { color: colors.text, fontSize: 15, fontWeight: '800' },
  diaPonto: { width: 5, height: 5, borderRadius: 3, marginTop: 1 },
  voltarHoje: { alignSelf: 'center', marginTop: spacing.lg },
  voltarHojeTexto: { color: colors.blueSoft, fontSize: 12.5, fontWeight: '700' },
  resumoDia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  diaNome: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  diaFoco: { color: colors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginTop: 3 },
  exercicio: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  exercicioNumero: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(27,107,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(27,107,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exercicioNumeroTexto: { color: colors.blueSoft, fontWeight: '800', fontSize: 12 },
  exercicioNome: { color: colors.text, fontSize: 15.5, fontWeight: '700' },
  exercicioMeta: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.md },
  meta: {},
  metaRotulo: {
    color: colors.textFaint,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metaValor: { color: colors.yellow, fontSize: 14, fontWeight: '800', marginTop: 2 },
  exercicioObs: { color: colors.textMuted, fontSize: 12, marginTop: spacing.md, lineHeight: 17 },
  acoes: { marginTop: spacing.xl, gap: spacing.md },
  dicaAcao: {
    color: colors.textFaint,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: spacing.lg,
  },
  feitoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderColor: 'rgba(47,208,124,0.4)',
    backgroundColor: 'rgba(47,208,124,0.08)',
  },
  feitoIcone: { color: colors.success, fontSize: 24, fontWeight: '900' },
  feitoTitulo: { color: colors.success, fontSize: 15, fontWeight: '800' },
  feitoSub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  avisoFuturo: { backgroundColor: colors.bgElevated },
  avisoFuturoTexto: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
