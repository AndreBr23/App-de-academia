import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

/** Barra superior compartilhada: título, subtítulo, voltar e o botão de menu. */
export default function Cabecalho({ titulo, subtitulo, onMenu, onVoltar, acaoDireita }) {
  return (
    <View style={estilos.container}>
      <View style={estilos.esquerda}>
        {onVoltar ? (
          <Pressable
            onPress={onVoltar}
            hitSlop={10}
            style={({ pressed }) => [estilos.iconeBotao, pressed && estilos.pressionado]}
          >
            <Text style={estilos.seta}>‹</Text>
          </Pressable>
        ) : null}
        <View style={{ flexShrink: 1 }}>
          {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
          <Text style={estilos.titulo} numberOfLines={1}>
            {titulo}
          </Text>
        </View>
      </View>

      {acaoDireita ||
        (onMenu ? (
          <Pressable
            onPress={onMenu}
            hitSlop={10}
            accessibilityLabel="Abrir menu"
            style={({ pressed }) => [estilos.menuBotao, pressed && estilos.pressionado]}
          >
            <View style={[estilos.barra, { width: 18 }]} />
            <View style={[estilos.barra, { width: 12, backgroundColor: colors.yellow }]} />
            <View style={[estilos.barra, { width: 18 }]} />
          </Pressable>
        ) : null)}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  esquerda: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 1 },
  subtitulo: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.yellow,
    marginBottom: 3,
  },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  iconeBotao: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seta: { color: colors.text, fontSize: 28, lineHeight: 30, marginTop: -4 },
  menuBotao: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  barra: { height: 2, borderRadius: 2, backgroundColor: colors.text },
  pressionado: { opacity: 0.7, transform: [{ scale: 0.96 }] },
});
