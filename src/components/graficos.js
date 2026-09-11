import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors, radius, spacing } from '../theme/theme';
import { DIAS } from '../utils/date';

/** Suaviza a linha com curvas de Bézier derivadas dos pontos vizinhos. */
function caminhoSuave(pontos) {
  if (pontos.length < 2) return '';
  const tensao = 0.36;
  let d = `M ${pontos[0].x} ${pontos[0].y}`;
  for (let i = 0; i < pontos.length - 1; i += 1) {
    const p0 = pontos[i - 1] || pontos[i];
    const p1 = pontos[i];
    const p2 = pontos[i + 1];
    const p3 = pontos[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * tensao * 0.5;
    const c1y = p1.y + (p2.y - p0.y) * tensao * 0.5;
    const c2x = p2.x - (p3.x - p1.x) * tensao * 0.5;
    const c2y = p2.y - (p3.y - p1.y) * tensao * 0.5;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Gráfico de área minimalista com a frequência semanal de treinos.
 * `serie`: [{ rotulo, total }] — o último item é sempre a semana corrente.
 */
export function GraficoFrequencia({ serie, meta = 5, altura = 168 }) {
  const [largura, setLargura] = useState(0);

  const layout = useMemo(() => {
    if (!largura || !serie?.length) return null;

    const padX = 6;
    const padTopo = 18;
    const padBase = 26;
    const maximo = Math.max(meta, ...serie.map((s) => s.total), 1);
    const areaAltura = altura - padTopo - padBase;
    const passo = serie.length > 1 ? (largura - padX * 2) / (serie.length - 1) : 0;

    const pontos = serie.map((item, i) => ({
      x: padX + passo * i,
      y: padTopo + areaAltura * (1 - item.total / maximo),
      ...item,
    }));

    const linha = caminhoSuave(pontos);
    const area = `${linha} L ${pontos[pontos.length - 1].x} ${padTopo + areaAltura} L ${pontos[0].x} ${
      padTopo + areaAltura
    } Z`;

    return {
      pontos,
      linha,
      area,
      maximo,
      base: padTopo + areaAltura,
      topo: padTopo,
      yMeta: padTopo + areaAltura * (1 - Math.min(meta, maximo) / maximo),
    };
  }, [largura, serie, meta, altura]);

  return (
    <View onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
      {layout ? (
        <Svg width={largura} height={altura}>
          <Defs>
            <LinearGradient id="areaFreq" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.blueSoft} stopOpacity="0.45" />
              <Stop offset="1" stopColor={colors.blueSoft} stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="linhaFreq" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.blue} />
              <Stop offset="1" stopColor={colors.yellow} />
            </LinearGradient>
          </Defs>

          {[0, 0.5, 1].map((fracao) => (
            <Line
              key={fracao}
              x1={0}
              x2={largura}
              y1={layout.topo + (layout.base - layout.topo) * fracao}
              y2={layout.topo + (layout.base - layout.topo) * fracao}
              stroke={colors.border}
              strokeWidth={1}
              opacity={0.5}
            />
          ))}

          <Line
            x1={0}
            x2={largura}
            y1={layout.yMeta}
            y2={layout.yMeta}
            stroke={colors.yellow}
            strokeWidth={1}
            strokeDasharray="4 6"
            opacity={0.5}
          />

          <Path d={layout.area} fill="url(#areaFreq)" />
          <Path
            d={layout.linha}
            stroke="url(#linhaFreq)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {layout.pontos.map((ponto, i) => {
            const ultimo = i === layout.pontos.length - 1;
            return (
              <G key={ponto.rotulo + i}>
                {ultimo ? (
                  <Circle cx={ponto.x} cy={ponto.y} r={11} fill={colors.yellow} opacity={0.18} />
                ) : null}
                <Circle
                  cx={ponto.x}
                  cy={ponto.y}
                  r={ultimo ? 5.5 : 3.5}
                  fill={ultimo ? colors.yellow : colors.bg}
                  stroke={ultimo ? colors.yellow : colors.blueSoft}
                  strokeWidth={2}
                />
              </G>
            );
          })}
        </Svg>
      ) : (
        <View style={{ height: altura }} />
      )}

      <View style={estilos.rotulos}>
        {serie.map((item, i) => (
          <Text
            key={item.rotulo + i}
            style={[estilos.rotulo, i === serie.length - 1 && estilos.rotuloAtivo]}
          >
            {item.rotulo}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** Anel de progresso do aproveitamento semanal. */
export function AnelProgresso({ valor, tamanho = 92, espessura = 9, rotulo }) {
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = Math.max(0, Math.min(1, valor / 100));

  return (
    <View style={{ width: tamanho, height: tamanho, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={tamanho} height={tamanho} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="anel" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.blue} />
            <Stop offset="1" stopColor={colors.yellow} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke={colors.surfaceAlt}
          strokeWidth={espessura}
          fill="none"
        />
        <Circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke="url(#anel)"
          strokeWidth={espessura}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circunferencia} ${circunferencia}`}
          strokeDashoffset={circunferencia * (1 - preenchido)}
          transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
        />
      </Svg>
      <Text style={estilos.anelValor}>{Math.round(valor)}%</Text>
      {rotulo ? <Text style={estilos.anelRotulo}>{rotulo}</Text> : null}
    </View>
  );
}

/** Mapa de calor estilo "contribuições": 12 semanas de presença. */
export function MapaCalor({ semanas }) {
  const [largura, setLargura] = useState(0);
  const colunas = semanas.length;
  const espaco = 4;
  const larguraGrade = largura ? Math.max(0, largura - 20) : 0;
  const lado = larguraGrade ? Math.max(6, (larguraGrade - espaco * (colunas - 1)) / colunas) : 0;
  const altura = lado ? lado * 7 + espaco * 6 : 0;

  return (
    <View onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
      {lado ? (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginRight: 8, height: altura, justifyContent: 'space-between' }}>
            {DIAS.map((d, i) => (
              <Text key={d.key} style={estilos.diaLabel}>
                {i % 2 === 0 ? d.curto : ' '}
              </Text>
            ))}
          </View>
          <Svg width={larguraGrade} height={altura}>
            {semanas.map((semana, x) =>
              semana.map((dia, y) => {
                let preenchimento = colors.surfaceAlt;
                let opacidade = 1;
                if (dia.feito) preenchimento = colors.yellow;
                else if (dia.futuro) opacidade = 0.35;
                else if (dia.programado) preenchimento = 'rgba(27,107,255,0.28)';
                return (
                  <Rect
                    key={dia.chave}
                    x={x * (lado + espaco)}
                    y={y * (lado + espaco)}
                    width={lado}
                    height={lado}
                    rx={3}
                    fill={preenchimento}
                    opacity={opacidade}
                  />
                );
              }),
            )}
          </Svg>
        </View>
      ) : (
        <View style={{ height: 80 }} />
      )}

      <View style={estilos.legenda}>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaCor, { backgroundColor: colors.yellow }]} />
          <Text style={estilos.legendaTexto}>Treinou</Text>
        </View>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaCor, { backgroundColor: 'rgba(27,107,255,0.28)' }]} />
          <Text style={estilos.legendaTexto}>Programado</Text>
        </View>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaCor, { backgroundColor: colors.surfaceAlt }]} />
          <Text style={estilos.legendaTexto}>Sem treino</Text>
        </View>
      </View>
    </View>
  );
}

/** Barras da semana corrente — leitura rápida de quem treinou em quais dias. */
export function BarrasSemana({ dias }) {
  return (
    <View style={estilos.barras}>
      {dias.map((dia) => (
        <View key={dia.chave} style={estilos.barraColuna}>
          <View style={estilos.barraTrilho}>
            <View
              style={[
                estilos.barraPreenchida,
                {
                  height: dia.feito ? '100%' : dia.programado ? '38%' : '12%',
                  backgroundColor: dia.feito
                    ? colors.yellow
                    : dia.programado
                      ? 'rgba(27,107,255,0.5)'
                      : colors.surfaceAlt,
                },
              ]}
            />
          </View>
          <Text style={[estilos.barraRotulo, dia.hoje && { color: colors.yellow, fontWeight: '800' }]}>
            {dia.rotulo}
          </Text>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  rotulos: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  rotulo: { fontSize: 10, color: colors.textFaint, letterSpacing: 0.3 },
  rotuloAtivo: { color: colors.yellow, fontWeight: '800' },
  anelValor: { color: colors.text, fontSize: 20, fontWeight: '800' },
  anelRotulo: {
    color: colors.textMuted,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  diaLabel: { fontSize: 9, color: colors.textFaint, height: 12, lineHeight: 12 },
  legenda: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md, flexWrap: 'wrap' },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaCor: { width: 10, height: 10, borderRadius: 3 },
  legendaTexto: { fontSize: 10.5, color: colors.textFaint },
  barras: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  barraColuna: { flex: 1, alignItems: 'center', gap: 6 },
  barraTrilho: {
    width: '100%',
    height: 70,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barraPreenchida: { width: '100%', borderRadius: radius.sm },
  barraRotulo: { fontSize: 10, color: colors.textMuted, fontWeight: '700' },
});

export default { GraficoFrequencia, AnelProgresso, MapaCalor, BarrasSemana };
