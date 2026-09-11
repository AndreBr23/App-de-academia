import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cabecalho from '../components/Cabecalho';
import { Card, Etiqueta, EstadoVazio } from '../components/ui';
import { colors, radius, spacing } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { iniciais, normalizarMatricula } from '../utils/format';
import { formatarDataHora } from '../utils/date';

export default function AlunosScreen({ navigation, abrirMenu }) {
  const { usuarios, fichas, checkinsDaMatricula } = useApp();
  const [busca, setBusca] = useState('');

  const alunos = useMemo(
    () => usuarios.filter((u) => u.perfil !== 'adm'),
    [usuarios],
  );

  // Fichas enviadas para matrículas que ainda não têm conta no app.
  const matriculasSoltas = useMemo(() => {
    const cadastradas = new Set(alunos.map((a) => normalizarMatricula(a.matricula)));
    return Object.keys(fichas)
      .filter((mat) => !cadastradas.has(mat))
      .map((mat) => ({
        id: `pendente_${mat}`,
        nome: 'Matrícula sem cadastro',
        matricula: mat,
        pendente: true,
      }));
  }, [fichas, alunos]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const todos = [...alunos, ...matriculasSoltas];
    if (!termo) return todos;
    return todos.filter(
      (a) =>
        a.nome.toLowerCase().includes(termo) ||
        String(a.matricula).toLowerCase().includes(termo) ||
        String(a.email || '').toLowerCase().includes(termo),
    );
  }, [alunos, matriculasSoltas, busca]);

  const comFicha = alunos.filter((a) => fichas[normalizarMatricula(a.matricula)]).length;

  function novaMatricula() {
    if (Alert.prompt) {
      Alert.prompt(
        'Vincular matrícula',
        'Informe a matrícula que receberá a ficha:',
        (valor) => {
          const mat = normalizarMatricula(valor);
          if (mat.length >= 3) navigation.navigate('AlunoDetalhe', { matricula: mat });
        },
        'plain-text',
      );
      return;
    }
    // Android não tem Alert.prompt: a busca vira o campo de entrada.
    const mat = normalizarMatricula(busca);
    if (mat.length >= 3) {
      navigation.navigate('AlunoDetalhe', { matricula: mat });
    } else {
      Alert.alert(
        'Vincular matrícula',
        'Digite a matrícula no campo de busca acima e toque novamente em "Nova matrícula".',
      );
    }
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <Cabecalho
        subtitulo="Área do professor"
        titulo="Alunos"
        onVoltar={navigation.canGoBack() ? navigation.goBack : undefined}
        onMenu={abrirMenu}
      />

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={estilos.resumo}>
              <ResumoCard valor={alunos.length} rotulo="Alunos" />
              <ResumoCard valor={comFicha} rotulo="Com ficha" destaque />
              <ResumoCard valor={alunos.length - comFicha} rotulo="Pendentes" />
            </View>

            <View style={estilos.buscaLinha}>
              <TextInput
                placeholder="Buscar por nome ou matrícula"
                placeholderTextColor={colors.textFaint}
                value={busca}
                onChangeText={setBusca}
                autoCapitalize="characters"
                style={estilos.busca}
              />
              <Pressable onPress={novaMatricula} style={estilos.botaoNova}>
                <Text style={estilos.botaoNovaTexto}>+ Nova</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Card style={{ marginTop: spacing.xl }}>
            <EstadoVazio
              icone="🔍"
              titulo="Nenhum aluno encontrado"
              descricao="Ajuste a busca ou use “+ Nova” para enviar uma ficha direto para uma matrícula."
            />
          </Card>
        }
        renderItem={({ item }) => {
          const mat = normalizarMatricula(item.matricula);
          const ficha = fichas[mat];
          const checkins = Object.keys(checkinsDaMatricula(mat)).length;
          return (
            <Pressable
              onPress={() =>
                navigation.navigate('AlunoDetalhe', { alunoId: item.id, matricula: mat })
              }
            >
              {({ pressed }) => (
                <Card style={[estilos.item, pressed && { opacity: 0.85 }]}>
                  <View style={[estilos.avatar, item.pendente && estilos.avatarPendente]}>
                    <Text style={estilos.avatarTexto}>
                      {item.pendente ? '#' : iniciais(item.nome)}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={estilos.nome} numberOfLines={1}>
                      {item.nome}
                    </Text>
                    <Text style={estilos.detalhe}>
                      Matrícula {mat}
                      {!item.pendente ? ` · ${checkins} treinos` : ''}
                    </Text>
                    {ficha ? (
                      <Text style={estilos.atualizado}>
                        Ficha de {formatarDataHora(ficha.atualizadoEm)}
                      </Text>
                    ) : null}
                  </View>

                  <Etiqueta
                    texto={ficha ? 'Com ficha' : 'Sem ficha'}
                    cor={ficha ? colors.success : colors.textMuted}
                  />
                </Card>
              )}
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
    </SafeAreaView>
  );
}

function ResumoCard({ valor, rotulo, destaque }) {
  return (
    <View style={[estilos.resumoCard, destaque && { borderColor: 'rgba(255,210,51,0.35)' }]}>
      <Text style={[estilos.resumoValor, destaque && { color: colors.yellow }]}>{valor}</Text>
      <Text style={estilos.resumoRotulo}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  resumo: { flexDirection: 'row', gap: spacing.md },
  resumoCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  resumoValor: { color: colors.text, fontSize: 22, fontWeight: '900' },
  resumoRotulo: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  buscaLinha: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  busca: {
    flex: 1,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 14,
  },
  botaoNova: {
    paddingHorizontal: spacing.lg,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoNovaTexto: { color: '#16233A', fontWeight: '800', fontSize: 12.5, letterSpacing: 0.6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPendente: { backgroundColor: colors.surfaceAlt },
  avatarTexto: { color: colors.white, fontWeight: '800', fontSize: 15 },
  nome: { color: colors.text, fontSize: 15, fontWeight: '700' },
  detalhe: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  atualizado: { color: colors.textFaint, fontSize: 11, marginTop: 2 },
});
