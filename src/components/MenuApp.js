import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme/theme';
import { iniciais } from '../utils/format';

const LARGURA = Math.min(320, Dimensions.get('window').width * 0.84);

/** Menu deslizante acionado pelo botão de menu do cabeçalho. */
export default function MenuApp({ visivel, aoFechar, usuario, rotaAtual, aoNavegar, aoSair }) {
  const deslocamento = useRef(new Animated.Value(LARGURA)).current;
  const fundo = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(deslocamento, {
        toValue: visivel ? 0 : LARGURA,
        duration: visivel ? 260 : 200,
        easing: visivel ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fundo, {
        toValue: visivel ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visivel, deslocamento, fundo]);

  const itens = [
    { rota: 'Inicio', icone: '⚡', titulo: 'Início', descricao: 'Frequência e progresso' },
    { rota: 'FichaDoDia', icone: '📅', titulo: 'Ficha do dia', descricao: 'Treino de hoje e check-in' },
    { rota: 'FichaGeral', icone: '📋', titulo: 'Ficha de treino geral', descricao: 'Semana completa' },
    { rota: 'Perfil', icone: '👤', titulo: 'Perfil', descricao: 'Seus dados e matrícula' },
  ];

  if (usuario?.perfil === 'adm') {
    itens.push({
      rota: 'Alunos',
      icone: '🏋️',
      titulo: 'Alunos',
      descricao: 'Enviar e vincular fichas',
      destaque: true,
    });
  }

  return (
    <Modal visible={visivel} transparent animationType="none" onRequestClose={aoFechar}>
      <View style={estilos.container}>
        <Animated.View style={[estilos.fundo, { opacity: fundo }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} />
        </Animated.View>

        <Animated.View
          style={[
            estilos.painel,
            {
              paddingTop: insets.top + spacing.xl,
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ translateX: deslocamento }],
            },
          ]}
        >
          <View style={estilos.perfil}>
            <View style={estilos.avatar}>
              <Text style={estilos.avatarTexto}>{iniciais(usuario?.nome)}</Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={estilos.nome} numberOfLines={1}>
                {usuario?.nome || 'Visitante'}
              </Text>
              <Text style={estilos.matricula}>
                {usuario?.perfil === 'adm' ? 'Professor · ' : 'Matrícula '}
                {usuario?.matricula}
              </Text>
            </View>
          </View>

          <View style={estilos.lista}>
            {itens.map((item) => {
              const ativo = rotaAtual === item.rota;
              return (
                <Pressable
                  key={item.rota}
                  onPress={() => aoNavegar(item.rota)}
                  style={({ pressed }) => [
                    estilos.item,
                    ativo && estilos.itemAtivo,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <View style={[estilos.itemIcone, ativo && estilos.itemIconeAtivo]}>
                    <Text style={{ fontSize: 17 }}>{item.icone}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[estilos.itemTitulo, ativo && { color: colors.yellow }]}>
                      {item.titulo}
                    </Text>
                    <Text style={estilos.itemDescricao}>{item.descricao}</Text>
                  </View>
                  {ativo ? <View style={estilos.indicador} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={{ flex: 1 }} />

          <Pressable
            onPress={aoSair}
            style={({ pressed }) => [estilos.sair, pressed && { opacity: 0.75 }]}
          >
            <Text style={estilos.sairIcone}>⏻</Text>
            <Text style={estilos.sairTexto}>Sair da conta</Text>
          </Pressable>

          <Text style={estilos.rodape}>IronPulse · v1.0</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  fundo: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,10,18,0.72)' },
  painel: {
    width: LARGURA,
    backgroundColor: colors.bgElevated,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: colors.white, fontWeight: '800', fontSize: 17, letterSpacing: 0.5 },
  nome: { color: colors.text, fontSize: 16, fontWeight: '800' },
  matricula: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  lista: { marginTop: spacing.lg, gap: 6 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemAtivo: {
    backgroundColor: 'rgba(27,107,255,0.12)',
    borderColor: 'rgba(27,107,255,0.35)',
  },
  itemIcone: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconeAtivo: { backgroundColor: colors.surfaceAlt },
  itemTitulo: { color: colors.text, fontSize: 14.5, fontWeight: '700' },
  itemDescricao: { color: colors.textFaint, fontSize: 11.5, marginTop: 2 },
  indicador: { width: 4, height: 26, borderRadius: 2, backgroundColor: colors.yellow },
  sair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,92,92,0.4)',
  },
  sairIcone: { color: colors.danger, fontSize: 15 },
  sairTexto: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rodape: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 11,
    marginTop: spacing.md,
    letterSpacing: 1,
  },
});
