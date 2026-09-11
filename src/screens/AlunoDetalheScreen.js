import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cabecalho from '../components/Cabecalho';
import { Botao, Card, Divisor, Etiqueta, LinhaInfo, Secao } from '../components/ui';
import { colors, radius, spacing } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { DIAS, formatarDataHora } from '../utils/date';
import { iniciais, normalizarMatricula } from '../utils/format';
import { escolherArquivo, planilhaParaFicha } from '../utils/importarFicha';

export default function AlunoDetalheScreen({ navigation, route }) {
  const { matricula: matriculaParam, alunoId } = route.params || {};
  const matricula = normalizarMatricula(matriculaParam);
  const { usuarios, usuario, fichas, fichaDaMatricula, salvarFicha, removerFicha, checkinsDaMatricula } =
    useApp();

  const aluno = usuarios.find((u) => u.id === alunoId) || null;
  const fichaAtual = fichas[matricula] || null;
  const ficha = fichaDaMatricula(matricula);
  const [previa, setPrevia] = useState(null);
  const [processando, setProcessando] = useState(false);

  const treinos = useMemo(
    () => Object.keys(checkinsDaMatricula(matricula)).length,
    [checkinsDaMatricula, matricula],
  );

  async function enviarArquivo() {
    try {
      setProcessando(true);
      const arquivo = await escolherArquivo();
      if (!arquivo) return;

      if (arquivo.ehPlanilha) {
        const { ficha: importada, resumo } = await planilhaParaFicha(arquivo);
        setPrevia({ ficha: importada, resumo, arquivo });
        return;
      }

      if (arquivo.ehPdf) {
        Alert.alert(
          'Anexar ficha em PDF',
          `O PDF "${arquivo.nome}" será vinculado à matrícula ${matricula} e ficará disponível no app do aluno.\n\nO conteúdo de um PDF não é lido automaticamente — para os exercícios aparecerem dia a dia, use uma planilha ou monte a ficha manualmente.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Anexar',
              onPress: async () => {
                await salvarFicha(
                  matricula,
                  { ...ficha, origem: { tipo: 'pdf', arquivo: arquivo.nome, uri: arquivo.uri } },
                  usuario?.nome,
                );
                Alert.alert('Pronto', 'PDF vinculado à matrícula com sucesso.');
              },
            },
          ],
        );
        return;
      }

      Alert.alert('Formato não suportado', 'Envie um arquivo PDF, XLSX, XLS ou CSV.');
    } catch (e) {
      Alert.alert('Não foi possível ler o arquivo', e.message || 'Tente novamente.');
    } finally {
      setProcessando(false);
    }
  }

  async function publicarPrevia() {
    if (!previa) return;
    await salvarFicha(matricula, previa.ficha, usuario?.nome);
    setPrevia(null);
    Alert.alert(
      'Ficha publicada',
      `A ficha foi vinculada à matrícula ${matricula}. ${
        aluno ? `${aluno.nome} já` : 'O aluno'
      } vê o novo treino no app automaticamente.`,
    );
  }

  function confirmarRemocao() {
    Alert.alert(
      'Remover ficha',
      `A matrícula ${matricula} volta a usar a ficha padrão da academia. Deseja continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removerFicha(matricula),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <Cabecalho
        subtitulo={`Matrícula ${matricula}`}
        titulo={aluno ? aluno.nome.split(' ')[0] : 'Ficha'}
        onVoltar={navigation.goBack}
      />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Card style={estilos.identidade}>
          <View style={estilos.avatar}>
            <Text style={estilos.avatarTexto}>{aluno ? iniciais(aluno.nome) : '#'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.nome}>{aluno ? aluno.nome : 'Matrícula sem cadastro'}</Text>
            <Text style={estilos.contato}>
              {aluno ? `${aluno.email}\n${aluno.telefone}` : 'A ficha fica reservada até o aluno criar a conta com esta matrícula.'}
            </Text>
          </View>
        </Card>

        <View style={estilos.numeros}>
          <NumeroCard valor={treinos} rotulo="Treinos registrados" />
          <NumeroCard
            valor={DIAS.filter((d) => (ficha.dias[d.key]?.exercicios?.length || 0) > 0).length}
            rotulo="Dias programados"
            destaque
          />
        </View>

        <Secao>Ficha vinculada</Secao>
        <Card>
          <View style={estilos.statusLinha}>
            <Etiqueta
              texto={fichaAtual ? 'Ficha personalizada' : 'Ficha padrão'}
              cor={fichaAtual ? colors.success : colors.textMuted}
            />
            {fichaAtual?.origem?.arquivo ? (
              <Text style={estilos.arquivo} numberOfLines={1}>
                {fichaAtual.origem.tipo === 'pdf' ? '📄 ' : '📊 '}
                {fichaAtual.origem.arquivo}
              </Text>
            ) : null}
          </View>

          <Divisor />

          <LinhaInfo rotulo="Atualizada" valor={formatarDataHora(fichaAtual?.atualizadoEm)} />
          <Divisor style={{ marginVertical: 0 }} />
          <LinhaInfo rotulo="Enviada por" valor={fichaAtual?.atualizadoPor || '—'} />

          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <Botao
              titulo="Enviar PDF ou planilha"
              icone="⬆"
              onPress={enviarArquivo}
              carregando={processando}
            />
            <Botao
              titulo="Montar ficha manualmente"
              variante="azul"
              icone="✎"
              onPress={() => navigation.navigate('EditorFicha', { matricula })}
            />
            {fichaAtual ? (
              <Botao titulo="Remover ficha" variante="perigo" onPress={confirmarRemocao} />
            ) : null}
          </View>
        </Card>

        <Card style={estilos.ajuda}>
          <Text style={estilos.ajudaTitulo}>Formato da planilha</Text>
          <Text style={estilos.ajudaTexto}>
            Use a primeira linha como cabeçalho, em qualquer ordem:
          </Text>
          <View style={estilos.colunas}>
            {['Dia', 'Foco', 'Exercicio', 'Series', 'Repeticoes', 'Carga', 'Observacao'].map((c) => (
              <View key={c} style={estilos.coluna}>
                <Text style={estilos.colunaTexto}>{c}</Text>
              </View>
            ))}
          </View>
          <Text style={estilos.ajudaRodape}>
            Aceita .xlsx, .xls e .csv. A coluna “Dia” entende Segunda, Seg, Terça… Linhas com o dia em
            branco herdam o dia da linha anterior.
          </Text>
        </Card>

        <Secao>Prévia da semana</Secao>
        <Card>
          {DIAS.map((dia, i) => {
            const doDia = ficha.dias[dia.key] || { foco: 'Descanso', exercicios: [] };
            return (
              <View key={dia.key}>
                {i > 0 ? <Divisor style={{ marginVertical: 0 }} /> : null}
                <View style={estilos.previaLinha}>
                  <Text style={estilos.previaDia}>{dia.abrev}</Text>
                  <Text style={estilos.previaFoco} numberOfLines={1}>
                    {doDia.foco}
                  </Text>
                  <Text style={estilos.previaQtd}>
                    {doDia.exercicios.length ? `${doDia.exercicios.length} ex.` : '—'}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Confirmação da planilha importada */}
      <Modal visible={!!previa} transparent animationType="fade" onRequestClose={() => setPrevia(null)}>
        <View style={estilos.modalFundo}>
          <View style={estilos.modal}>
            <Text style={estilos.modalTitulo}>Planilha lida com sucesso</Text>
            <Text style={estilos.modalArquivo} numberOfLines={1}>
              📊 {previa?.arquivo?.nome}
            </Text>

            <View style={estilos.modalResumo}>
              <ResumoModal valor={previa?.resumo?.importadas || 0} rotulo="Exercícios" />
              <ResumoModal valor={previa?.resumo?.dias || 0} rotulo="Dias" />
              <ResumoModal valor={previa?.resumo?.ignoradas || 0} rotulo="Ignoradas" />
            </View>

            <ScrollView style={estilos.modalLista}>
              {DIAS.map((dia) => {
                const doDia = previa?.ficha?.dias?.[dia.key];
                if (!doDia?.exercicios?.length) return null;
                return (
                  <View key={dia.key} style={estilos.modalDia}>
                    <Text style={estilos.modalDiaTitulo}>
                      {dia.nome} · {doDia.foco}
                    </Text>
                    {doDia.exercicios.map((ex) => (
                      <Text key={ex.id} style={estilos.modalExercicio} numberOfLines={1}>
                        • {ex.nome} {ex.series ? `— ${ex.series}x${ex.reps}` : ''}
                      </Text>
                    ))}
                  </View>
                );
              })}
            </ScrollView>

            <Text style={estilos.modalAviso}>
              Ao publicar, a ficha substitui a atual da matrícula {matricula} e aparece na hora para o
              aluno.
            </Text>

            <View style={{ gap: spacing.md }}>
              <Botao titulo={`Publicar para ${matricula}`} onPress={publicarPrevia} />
              <Botao titulo="Cancelar" variante="contorno" onPress={() => setPrevia(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function NumeroCard({ valor, rotulo, destaque }) {
  return (
    <View style={[estilos.numeroCard, destaque && { borderColor: 'rgba(255,210,51,0.35)' }]}>
      <Text style={[estilos.numeroValor, destaque && { color: colors.yellow }]}>{valor}</Text>
      <Text style={estilos.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

function ResumoModal({ valor, rotulo }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={estilos.resumoModalValor}>{valor}</Text>
      <Text style={estilos.resumoModalRotulo}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  identidade: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: colors.white, fontWeight: '800', fontSize: 17 },
  nome: { color: colors.text, fontSize: 17, fontWeight: '800' },
  contato: { color: colors.textMuted, fontSize: 12, marginTop: 4, lineHeight: 17 },
  numeros: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  numeroCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  numeroValor: { color: colors.text, fontSize: 22, fontWeight: '900' },
  numeroRotulo: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statusLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  arquivo: { color: colors.textMuted, fontSize: 11.5, flexShrink: 1 },
  ajuda: { marginTop: spacing.lg, backgroundColor: colors.bgElevated },
  ajudaTitulo: { color: colors.text, fontSize: 14, fontWeight: '800' },
  ajudaTexto: { color: colors.textMuted, fontSize: 12.5, marginTop: 6, lineHeight: 18 },
  colunas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  coluna: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  colunaTexto: { color: colors.blueSoft, fontSize: 11, fontWeight: '700' },
  ajudaRodape: { color: colors.textFaint, fontSize: 11.5, marginTop: spacing.md, lineHeight: 17 },
  previaLinha: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  previaDia: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    width: 36,
  },
  previaFoco: { color: colors.text, fontSize: 13.5, flex: 1 },
  previaQtd: { color: colors.yellow, fontSize: 12, fontWeight: '700' },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(4,10,18,0.8)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modal: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    maxHeight: '86%',
  },
  modalTitulo: { color: colors.text, fontSize: 18, fontWeight: '800' },
  modalArquivo: { color: colors.textMuted, fontSize: 12.5, marginTop: 6 },
  modalResumo: {
    flexDirection: 'row',
    marginVertical: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  resumoModalValor: { color: colors.yellow, fontSize: 19, fontWeight: '900' },
  resumoModalRotulo: { color: colors.textFaint, fontSize: 10, marginTop: 2, textTransform: 'uppercase' },
  modalLista: { maxHeight: 230 },
  modalDia: { marginBottom: spacing.md },
  modalDiaTitulo: {
    color: colors.blueSoft,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  modalExercicio: { color: colors.textMuted, fontSize: 12.5, lineHeight: 19 },
  modalAviso: {
    color: colors.textFaint,
    fontSize: 11.5,
    lineHeight: 17,
    marginVertical: spacing.lg,
  },
});
