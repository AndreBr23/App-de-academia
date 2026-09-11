import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cabecalho from '../components/Cabecalho';
import { Card, Etiqueta, Secao } from '../components/ui';
import { AnelProgresso, BarrasSemana, GraficoFrequencia, MapaCalor } from '../components/graficos';
import { colors, radius, spacing } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { DIAS, dateKey, diaKey, mesmoDia, nomeMes, semanaDe } from '../utils/date';
import { plural, primeiroNome } from '../utils/format';

export default function InicioScreen({ navigation, abrirMenu }) {
  const { usuario, ficha, estatisticas, meusCheckins, marcarTreino } = useApp();
  const hoje = new Date();

  const treinoDeHoje = ficha.dias[diaKey(hoje)] || { foco: 'Descanso', exercicios: [] };
  const concluidoHoje = Boolean(meusCheckins[dateKey(hoje)]?.concluido);
  const ehDescanso = treinoDeHoje.exercicios.length === 0;

  const diasDaSemana = useMemo(
    () =>
      semanaDe(hoje).map((data, i) => ({
        chave: dateKey(data),
        rotulo: DIAS[i].curto,
        feito: Boolean(meusCheckins[dateKey(data)]?.concluido),
        programado: (ficha.dias[DIAS[i].key]?.exercicios || []).length > 0,
        hoje: mesmoDia(data, hoje),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meusCheckins, ficha],
  );

  const saudacao = (() => {
    const h = hoje.getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <Cabecalho
        subtitulo={`${saudacao},`}
        titulo={primeiroNome(usuario?.nome) || 'Atleta'}
        onMenu={abrirMenu}
      />

      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* Destaque do treino de hoje */}
        <Pressable onPress={() => navigation.navigate('FichaDoDia')}>
          <LinearGradient
            colors={
              concluidoHoje
                ? ['#0E4BC4', '#1B6BFF']
                : ehDescanso
                  ? ['#16283C', '#132435']
                  : ['#132435', '#1B3A63']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={estilos.hero}
          >
            <View style={estilos.heroTopo}>
              <Etiqueta
                texto={concluidoHoje ? 'Treino concluído' : ehDescanso ? 'Dia de descanso' : 'Treino de hoje'}
                cor={concluidoHoje ? colors.success : ehDescanso ? colors.textMuted : colors.yellow}
              />
              <Text style={estilos.heroData}>
                {String(hoje.getDate()).padStart(2, '0')} {nomeMes(hoje).slice(0, 3).toUpperCase()}
              </Text>
            </View>

            <Text style={estilos.heroFoco}>{treinoDeHoje.foco}</Text>
            <Text style={estilos.heroDetalhe}>
              {ehDescanso
                ? 'Aproveite para alongar e se recuperar.'
                : `${treinoDeHoje.exercicios.length} ${plural(
                    treinoDeHoje.exercicios.length,
                    'exercício programado',
                    'exercícios programados',
                  )}`}
            </Text>

            {!ehDescanso ? (
              <Pressable
                onPress={() => marcarTreino(hoje, !concluidoHoje)}
                style={({ pressed }) => [
                  estilos.heroBotao,
                  concluidoHoje && estilos.heroBotaoFeito,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[estilos.heroBotaoTexto, concluidoHoje && { color: colors.white }]}>
                  {concluidoHoje ? '✓  Concluído hoje' : 'Marcar como concluído'}
                </Text>
              </Pressable>
            ) : null}
          </LinearGradient>
        </Pressable>

        {/* Números principais */}
        <View style={estilos.numeros}>
          <CardNumero valor={estatisticas.sequencia} rotulo="Sequência" sufixo="dias" destaque />
          <CardNumero
            valor={`${estatisticas.naSemana}/${estatisticas.metaSemanal}`}
            rotulo="Na semana"
            sufixo="treinos"
          />
          <CardNumero valor={estatisticas.noMes} rotulo="No mês" sufixo="dias" />
        </View>

        {/* Gráfico de frequência */}
        <Secao>Frequência</Secao>
        <Card>
          <View style={estilos.graficoTopo}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.graficoTitulo}>Treinos por semana</Text>
              <Text style={estilos.graficoSub}>Últimas 8 semanas · meta de {estatisticas.metaSemanal}x</Text>
            </View>
            <AnelProgresso valor={estatisticas.aproveitamento} rotulo="semana" tamanho={78} />
          </View>

          <GraficoFrequencia serie={estatisticas.serieSemanal} meta={estatisticas.metaSemanal} />
        </Card>

        {/* Semana atual */}
        <Secao>Esta semana</Secao>
        <Card>
          <BarrasSemana dias={diasDaSemana} />
        </Card>

        {/* Mapa de calor */}
        <Secao>Constância · 12 semanas</Secao>
        <Card>
          <MapaCalor semanas={estatisticas.mapaCalor} />
          <View style={estilos.resumo}>
            <ResumoItem valor={estatisticas.total} rotulo="Treinos totais" />
            <View style={estilos.separador} />
            <ResumoItem valor={estatisticas.melhorSequencia} rotulo="Melhor sequência" />
            <View style={estilos.separador} />
            <ResumoItem valor={estatisticas.ultimos30} rotulo="Últimos 30 dias" />
          </View>
        </Card>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CardNumero({ valor, rotulo, sufixo, destaque }) {
  return (
    <View style={[estilos.cardNumero, destaque && estilos.cardNumeroDestaque]}>
      <Text style={[estilos.cardNumeroValor, destaque && { color: colors.yellow }]}>{valor}</Text>
      <Text style={estilos.cardNumeroSufixo}>{sufixo}</Text>
      <Text style={estilos.cardNumeroRotulo}>{rotulo}</Text>
    </View>
  );
}

function ResumoItem({ valor, rotulo }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={estilos.resumoValor}>{valor}</Text>
      <Text style={estilos.resumoRotulo}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroData: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  heroFoco: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: spacing.lg,
  },
  heroDetalhe: { color: 'rgba(242,246,250,0.72)', fontSize: 13, marginTop: 4 },
  heroBotao: {
    marginTop: spacing.xl,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBotaoFeito: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroBotaoTexto: {
    color: '#16233A',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  numeros: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  cardNumero: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  cardNumeroDestaque: { borderColor: 'rgba(255,210,51,0.35)' },
  cardNumeroValor: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.8 },
  cardNumeroSufixo: { color: colors.textFaint, fontSize: 10, marginTop: -2 },
  cardNumeroRotulo: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  graficoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  graficoTitulo: { color: colors.text, fontSize: 16, fontWeight: '800' },
  graficoSub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  separador: { width: 1, height: 30, backgroundColor: colors.border },
  resumoValor: { color: colors.text, fontSize: 19, fontWeight: '800' },
  resumoRotulo: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
