export const TREINOS_POR_OBJETIVO = {
  massa: {
    nome: 'Ganho de Massa',
    descricao: 'Treino focado em hipertrofia muscular com cargas moderadas a altas',
    duracao: 45,
    descanso: 90,
    intervalo: 120,
    exercicios: [
      { nome: 'Supino Reto', series: 4, repeticoes: '8-12', descanso: 90 },
      { nome: 'Agachamento Livre', series: 4, repeticoes: '8-12', descanso: 120 },
      { nome: 'Desenvolvimento Militar', series: 3, repeticoes: '10-12', descanso: 60 },
      { nome: 'Barra Fixa', series: 3, repeticoes: '8-10', descanso: 90 },
      { nome: 'Remada Curvada', series: 4, repeticoes: '10-12', descanso: 90 },
      { nome: 'HIIT: Burpees', series: 3, repeticoes: '30s', descanso: 30 }
    ]
  },
  peso: {
    nome: 'Perda de Peso',
    descricao: 'Treino combinado HIIT + musculação para queima calórica',
    duracao: 40,
    descanso: 60,
    intervalo: 30,
    exercicios: [
      { nome: 'HIIT: Polichinelo', series: 3, repeticoes: '45s', descanso: 15 },
      { nome: 'Agachamento com Peso', series: 3, repeticoes: '15-20', descanso: 45 },
      { nome: 'HIIT: Mountain Climber', series: 3, repeticoes: '30s', descanso: 15 },
      { nome: 'Supino com Halteres', series: 3, repeticoes: '12-15', descanso: 45 },
      { nome: 'HIIT: Saltos', series: 3, repeticoes: '30s', descanso: 15 },
      { nome: 'Leg Press', series: 3, repeticoes: '15-20', descanso: 60 }
    ]
  },
  tonificacao: {
    nome: 'Tonificação',
    descricao: 'Treino com repetições moderadas para definição muscular',
    duracao: 35,
    descanso: 45,
    intervalo: 60,
    exercicios: [
      { nome: 'Supino Inclinado', series: 3, repeticoes: '12-15', descanso: 45 },
      { nome: 'Agachamento Búlgaro', series: 3, repeticoes: '12-15', descanso: 45 },
      { nome: 'Elevação Lateral', series: 3, repeticoes: '15-20', descanso: 30 },
      { nome: 'HIIT: Corrida no lugar', series: 2, repeticoes: '45s', descanso: 15 },
      { nome: 'Abdominal Infra', series: 3, repeticoes: '15-20', descanso: 30 },
      { nome: 'Rosca Direta', series: 3, repeticoes: '12-15', descanso: 45 }
    ]
  },
  gordura: {
    nome: 'Queima de Gordura',
    descricao: 'Treino intenso com foco em HIIT para queima de gordura',
    duracao: 30,
    descanso: 30,
    intervalo: 20,
    exercicios: [
      { nome: 'HIIT: Sprint', series: 4, repeticoes: '30s', descanso: 30 },
      { nome: 'Agachamento Pulo', series: 3, repeticoes: '15', descanso: 30 },
      { nome: 'HIIT: Burpees', series: 3, repeticoes: '30s', descanso: 20 },
      { nome: 'Flexão de Braço', series: 3, repeticoes: '15-20', descanso: 30 },
      { nome: 'HIIT: Corda', series: 3, repeticoes: '45s', descanso: 20 },
      { nome: 'Prancha', series: 3, repeticoes: '45s', descanso: 20 }
    ]
  },
  performance: {
    nome: 'Alta Performance',
    descricao: 'Treino avançado para atletas com alta intensidade',
    duracao: 50,
    descanso: 120,
    intervalo: 90,
    exercicios: [
      { nome: 'Power Clean', series: 4, repeticoes: '6-8', descanso: 120 },
      { nome: 'Snatch', series: 3, repeticoes: '4-6', descanso: 180 },
      { nome: 'HIIT: Sprints', series: 5, repeticoes: '20s', descanso: 40 },
      { nome: 'Agachamento Pesado', series: 5, repeticoes: '5-8', descanso: 150 },
      { nome: 'Deadlift', series: 4, repeticoes: '5-8', descanso: 180 },
      { nome: 'HIIT: Box Jumps', series: 4, repeticoes: '10', descanso: 60 }
    ]
  },
  manutencao: {
    nome: 'Manutenção',
    descricao: 'Treino equilibrado para manter condicionamento físico',
    duracao: 40,
    descanso: 60,
    intervalo: 60,
    exercicios: [
      { nome: 'Supino Reto', series: 3, repeticoes: '10-12', descanso: 60 },
      { nome: 'Agachamento', series: 3, repeticoes: '12-15', descanso: 60 },
      { nome: 'HIIT: Corda', series: 2, repeticoes: '30s', descanso: 30 },
      { nome: 'Remada', series: 3, repeticoes: '12-15', descanso: 60 },
      { nome: 'HIIT: Polichinelo', series: 2, repeticoes: '30s', descanso: 30 },
      { nome: 'Abdominal', series: 3, repeticoes: '15-20', descanso: 45 }
    ]
  },
  caminhada: {
    nome: 'Caminhada',
    descricao: 'Programa de caminhada para saúde cardiovascular e bem-estar',
    duracao: 30,
    descanso: 0,
    intervalo: 0,
    exercicios: [
      { nome: 'Caminhada Leve', series: 1, repeticoes: '15 min', descanso: 0 },
      { nome: 'Caminhada Moderada', series: 1, repeticoes: '10 min', descanso: 0 },
      { nome: 'Caminhada Rápida', series: 1, repeticoes: '5 min', descanso: 0 },
      { nome: 'Alongamento de Pernas', series: 1, repeticoes: '5 min', descanso: 0 }
    ]
  },
  pedalada: {
    nome: 'Pedalada',
    descricao: 'Programa de pedalada para condicionamento cardiovascular',
    duracao: 35,
    descanso: 0,
    intervalo: 0,
    exercicios: [
      { nome: 'Pedalada Leve', series: 1, repeticoes: '10 min', descanso: 0 },
      { nome: 'Pedalada Moderada', series: 1, repeticoes: '15 min', descanso: 0 },
      { nome: 'Pedalada Intensa', series: 1, repeticoes: '5 min', descanso: 0 },
      { nome: 'Pedalada Leve (Recuperação)', series: 1, repeticoes: '5 min', descanso: 0 }
    ]
  }
}

export const DIAS_LABEL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
