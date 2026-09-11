import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, font, radius, shadow, spacing } from '../theme/theme';

export function Card({ children, style, ...rest }) {
  return (
    <View style={[estilos.card, style]} {...rest}>
      {children}
    </View>
  );
}

export function Titulo({ children, style }) {
  return <Text style={[font.title, style]}>{children}</Text>;
}

export function Secao({ children, direita, style }) {
  return (
    <View style={[estilos.secao, style]}>
      <Text style={font.section}>{children}</Text>
      {direita ? <View>{direita}</View> : null}
    </View>
  );
}

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando,
  desabilitado,
  style,
}) {
  const paleta = {
    primario: { fundo: colors.yellow, texto: '#16233A', borda: colors.yellow },
    azul: { fundo: colors.blue, texto: colors.white, borda: colors.blue },
    contorno: { fundo: 'transparent', texto: colors.text, borda: colors.border },
    perigo: { fundo: 'transparent', texto: colors.danger, borda: 'rgba(255,92,92,0.45)' },
    sucesso: { fundo: 'rgba(47,208,124,0.14)', texto: colors.success, borda: 'rgba(47,208,124,0.5)' },
  }[variante];

  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={inativo ? undefined : onPress}
      style={({ pressed }) => [
        estilos.botao,
        {
          backgroundColor: paleta.fundo,
          borderColor: paleta.borda,
          opacity: inativo ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !inativo ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={paleta.texto} />
      ) : (
        <>
          {icone ? <Text style={[estilos.botaoIcone, { color: paleta.texto }]}>{icone}</Text> : null}
          <Text style={[estilos.botaoTexto, { color: paleta.texto }]}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Campo({ rotulo, erro, dica, style, ...rest }) {
  const [focado, setFocado] = React.useState(false);
  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      {rotulo ? <Text style={estilos.rotulo}>{rotulo}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textFaint}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        style={[
          estilos.input,
          focado && { borderColor: colors.blue, backgroundColor: 'rgba(27,107,255,0.08)' },
          !!erro && { borderColor: colors.danger },
        ]}
        {...rest}
      />
      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
      {!erro && dica ? <Text style={estilos.dica}>{dica}</Text> : null}
    </View>
  );
}

export function Etiqueta({ texto, cor = colors.blue, fundo, style }) {
  return (
    <View
      style={[
        estilos.etiqueta,
        { backgroundColor: fundo || `${cor}22`, borderColor: `${cor}55` },
        style,
      ]}
    >
      <Text style={[estilos.etiquetaTexto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

export function Divisor({ style }) {
  return <View style={[estilos.divisor, style]} />;
}

export function EstadoVazio({ icone = '💤', titulo, descricao, acao }) {
  return (
    <View style={estilos.vazio}>
      <Text style={estilos.vazioIcone}>{icone}</Text>
      <Text style={estilos.vazioTitulo}>{titulo}</Text>
      {descricao ? <Text style={estilos.vazioDescricao}>{descricao}</Text> : null}
      {acao ? <View style={{ marginTop: spacing.lg, width: '100%' }}>{acao}</View> : null}
    </View>
  );
}

export function LinhaInfo({ rotulo, valor }) {
  return (
    <View style={estilos.linhaInfo}>
      <Text style={estilos.linhaInfoRotulo}>{rotulo}</Text>
      <Text style={estilos.linhaInfoValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  secao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
  },
  botaoTexto: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  botaoIcone: { fontSize: 16 },
  rotulo: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  input: {
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 15,
  },
  erro: { color: colors.danger, fontSize: 12, marginTop: 6, fontWeight: '600' },
  dica: { color: colors.textFaint, fontSize: 12, marginTop: 6 },
  etiqueta: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  etiquetaTexto: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divisor: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  vazio: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  vazioIcone: { fontSize: 40, marginBottom: spacing.md },
  vazioTitulo: { fontSize: 17, fontWeight: '800', color: colors.text, textAlign: 'center' },
  vazioDescricao: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  linhaInfoRotulo: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  linhaInfoValor: { fontSize: 15, color: colors.text, fontWeight: '600', flexShrink: 1 },
});

export default { Card, Titulo, Secao, Botao, Campo, Etiqueta, Divisor, EstadoVazio, LinhaInfo };
