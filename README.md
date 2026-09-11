# IronPulse — app de academia

App em React Native (Expo) para acompanhar a rotina na academia: frequência com gráfico,
ficha do dia com check-in de treino concluído, ficha semanal completa e um painel do professor
para enviar fichas em PDF ou planilha vinculadas à matrícula do aluno.

Tema visual: **azul profundo + amarelo**, minimalista e moderno, com pegada fitness.

## Rodando

```bash
npm install --legacy-peer-deps
npm start
```

Depois leia o QR Code no app **Expo Go** (ou use `npm run android` / `npm run ios`).

> O `--legacy-peer-deps` evita que o npm aninhe `expo-asset`/`expo-constants` dentro de
> `node_modules/expo`, o que faz o Metro não encontrá-los. O `package-lock.json` do repositório
> já vem com a árvore correta.

## Telas

| Tela | O que faz |
| --- | --- |
| **Login / Cadastro** | Cadastro com nome, e-mail, telefone e matrícula da academia. Também dá para entrar só com a matrícula. Há o perfil de professor (código `IRON2024`). |
| **Início** | Frequência de dias: treino de hoje, sequência, treinos na semana/mês, gráfico de área das últimas 8 semanas, barras da semana atual e mapa de calor de 12 semanas. |
| **Ficha do dia** | Mini calendário semanal (com navegação entre semanas) mostrando o dia da semana e o treino, lista de exercícios e o botão **Concluí o treino** / **Não concluí este treino**. |
| **Ficha de treino geral** | A semana inteira em lista expansível, com o vínculo da matrícula e a origem da ficha. |
| **Perfil** | Dados cadastrais editáveis (inclusive a matrícula), estatísticas e sair. |
| **Alunos (professor)** | Lista de alunos com status da ficha, envio de PDF/planilha, editor manual e remoção da ficha. |

O **botão de menu** (canto superior direito) abre o painel deslizante com: Início, Ficha do dia,
Ficha de treino geral, Perfil, Alunos (só professor) e Sair.

## Ficha vinculada à matrícula

As fichas são guardadas por **matrícula**, não por usuário. Quando o professor publica uma ficha
para `2024001`, qualquer conta com essa matrícula passa a ver o treino na hora — e se o aluno
trocar a matrícula no perfil, a ficha correspondente passa a valer automaticamente. Matrículas sem
conta criada ainda podem receber ficha: ela fica reservada até alguém se cadastrar com aquele número.

## Enviando a ficha (professor)

**Planilha (.xlsx, .xls ou .csv) — importação completa.** A primeira linha é o cabeçalho, em qualquer
ordem, com ou sem acento:

```
Dia,Foco,Exercicio,Series,Repeticoes,Carga,Observacao
Segunda,Peito e Triceps,Supino reto,4,10,40 kg,Cadencia 2-0-2
,Peito e Triceps,Triceps corda,3,12,25 kg,
Terca,Costas e Biceps,Puxada frente,4,10,45 kg,
```

A coluna `Dia` entende `Segunda`, `Seg`, `Segunda-feira`, `Monday`. Linhas com o dia em branco
herdam o dia da linha anterior (planilhas com células mescladas). Antes de publicar, o app mostra
uma prévia com o que foi lido.

**PDF — anexo.** O PDF é vinculado à matrícula e aparece identificado na ficha do aluno, mas o
conteúdo de um PDF não é interpretado automaticamente: para os exercícios aparecerem dia a dia,
use uma planilha ou o editor manual (**Montar ficha manualmente**).

## Dados

Tudo é persistido localmente com `AsyncStorage` (chaves `@ironpulse:*`): usuários, sessão, fichas por
matrícula e check-ins por matrícula. Não há back-end — trocar o `src/storage/storage.js` por chamadas
de API é o próximo passo natural.

Na primeira execução o app semeia três alunos de demonstração: matrículas `2024001`, `2024002` e
`2024003`.

## Estrutura

```
App.js
src/
  components/    ui.js, Cabecalho.js, MenuApp.js, graficos.js (SVG)
  context/       AppContext.js — autenticação, fichas e check-ins
  data/          seed.js — ficha padrão e turma de demonstração
  navigation/    RootNavigator.js
  screens/       Login, Inicio, FichaDoDia, FichaGeral, Perfil, Alunos, AlunoDetalhe, EditorFicha
  storage/       storage.js — AsyncStorage
  theme/         theme.js — cores, espaçamentos, tipografia
  utils/         date, format, estatisticas, planilha, importarFicha
```
