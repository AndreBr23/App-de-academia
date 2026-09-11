import { DIAS } from '../utils/date';

export const CODIGO_ADMIN = 'IRON2024';

export function novoExercicio(dados = {}) {
  return {
    id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    nome: dados.nome || '',
    series: dados.series || '',
    reps: dados.reps || '',
    carga: dados.carga || '',
    obs: dados.obs || '',
  };
}

export function fichaVazia() {
  const dias = {};
  DIAS.forEach((d) => {
    dias[d.key] = { foco: 'Descanso', exercicios: [] };
  });
  return {
    dias,
    origem: { tipo: 'padrao', arquivo: null },
    atualizadoEm: null,
    atualizadoPor: null,
  };
}

/** Ficha inicial usada enquanto o professor não envia a planilha do aluno. */
export function fichaPadrao() {
  const base = fichaVazia();
  base.dias = {
    seg: {
      foco: 'Peito & Tríceps',
      exercicios: [
        novoExercicio({ nome: 'Supino reto com barra', series: '4', reps: '10', carga: '40 kg' }),
        novoExercicio({ nome: 'Supino inclinado halteres', series: '3', reps: '12', carga: '16 kg' }),
        novoExercicio({ nome: 'Crucifixo máquina', series: '3', reps: '15', carga: '30 kg' }),
        novoExercicio({ nome: 'Tríceps corda', series: '4', reps: '12', carga: '25 kg' }),
        novoExercicio({ nome: 'Tríceps francês', series: '3', reps: '12', carga: '12 kg' }),
      ],
    },
    ter: {
      foco: 'Costas & Bíceps',
      exercicios: [
        novoExercicio({ nome: 'Puxada frente', series: '4', reps: '10', carga: '45 kg' }),
        novoExercicio({ nome: 'Remada curvada', series: '4', reps: '10', carga: '35 kg' }),
        novoExercicio({ nome: 'Remada unilateral', series: '3', reps: '12', carga: '20 kg' }),
        novoExercicio({ nome: 'Rosca direta', series: '4', reps: '12', carga: '20 kg' }),
        novoExercicio({ nome: 'Rosca martelo', series: '3', reps: '12', carga: '14 kg' }),
      ],
    },
    qua: {
      foco: 'Pernas',
      exercicios: [
        novoExercicio({ nome: 'Agachamento livre', series: '4', reps: '10', carga: '50 kg' }),
        novoExercicio({ nome: 'Leg press 45°', series: '4', reps: '12', carga: '120 kg' }),
        novoExercicio({ nome: 'Cadeira extensora', series: '3', reps: '15', carga: '40 kg' }),
        novoExercicio({ nome: 'Mesa flexora', series: '3', reps: '15', carga: '35 kg' }),
        novoExercicio({ nome: 'Panturrilha em pé', series: '4', reps: '20', carga: '60 kg' }),
      ],
    },
    qui: {
      foco: 'Ombros & Abdômen',
      exercicios: [
        novoExercicio({ nome: 'Desenvolvimento halteres', series: '4', reps: '10', carga: '18 kg' }),
        novoExercicio({ nome: 'Elevação lateral', series: '4', reps: '15', carga: '8 kg' }),
        novoExercicio({ nome: 'Elevação frontal', series: '3', reps: '12', carga: '8 kg' }),
        novoExercicio({ nome: 'Prancha isométrica', series: '3', reps: '45s', carga: 'Peso corporal' }),
        novoExercicio({ nome: 'Abdominal supra', series: '4', reps: '20', carga: 'Peso corporal' }),
      ],
    },
    sex: {
      foco: 'Full Body & Cardio',
      exercicios: [
        novoExercicio({ nome: 'Levantamento terra', series: '4', reps: '8', carga: '60 kg' }),
        novoExercicio({ nome: 'Afundo com halteres', series: '3', reps: '12', carga: '14 kg' }),
        novoExercicio({ nome: 'Remada baixa', series: '3', reps: '12', carga: '40 kg' }),
        novoExercicio({ nome: 'Esteira moderada', series: '1', reps: '20 min', carga: '—' }),
      ],
    },
    sab: {
      foco: 'Cardio leve',
      exercicios: [
        novoExercicio({ nome: 'Bike ergométrica', series: '1', reps: '30 min', carga: 'Nível 6' }),
        novoExercicio({ nome: 'Alongamento geral', series: '1', reps: '10 min', carga: '—' }),
      ],
    },
    dom: { foco: 'Descanso', exercicios: [] },
  };
  base.origem = { tipo: 'padrao', arquivo: null };
  return base;
}

/** Turma de exemplo para o professor conseguir navegar no app já na 1ª execução. */
export function alunosDemo() {
  const agora = new Date().toISOString();
  return [
    {
      id: 'demo_1',
      nome: 'Marina Alves',
      email: 'marina.alves@email.com',
      telefone: '(11) 98812-4477',
      matricula: '2024001',
      perfil: 'aluno',
      criadoEm: agora,
      demo: true,
    },
    {
      id: 'demo_2',
      nome: 'Rafael Torres',
      email: 'rafael.torres@email.com',
      telefone: '(21) 99654-1120',
      matricula: '2024002',
      perfil: 'aluno',
      criadoEm: agora,
      demo: true,
    },
    {
      id: 'demo_3',
      nome: 'Camila Souza',
      email: 'camila.souza@email.com',
      telefone: '(31) 99145-8890',
      matricula: '2024003',
      perfil: 'aluno',
      criadoEm: agora,
      demo: true,
    },
  ];
}
