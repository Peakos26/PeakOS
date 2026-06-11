// Array com 30+ frases
const FRASES = [
  { texto: "A consistência supera a intensidade. Treine hoje como se fosse seu último dia.", autor: "PeakOS" },
  { texto: "Seu único concorrente é você de ontem.", autor: "Desconhecido" },
  { texto: "O desconforto do treino é o preço pelo corpo que você quer.", autor: "PeakOS" },
  { texto: "Não pare quando cansar. Pare quando terminar.", autor: "David Goggins" },
  { texto: "O sucesso é a soma de pequenos esforços repetidos dia após dia.", autor: "Robert Collier" },
  { texto: "Seu corpo consegue. É sua mente que você precisa convencer.", autor: "Desconhecido" },
  { texto: "O melhor momento para começar era ontem. O segundo melhor é agora.", autor: "Provérbio Chinês" },
  { texto: "Treine para ser forte, não para parecer forte.", autor: "PeakOS" },
  { texto: "A dor que você sente hoje será a força que você sentirá amanhã.", autor: "Desconhecido" },
  { texto: "Disciplina é fazer o que precisa ser feito, mesmo quando não quer.", autor: "PeakOS" },
  { texto: "Cada treino é um voto a favor da pessoa que você quer se tornar.", autor: "James Clear" },
  { texto: "Não é sobre ter tempo. É sobre fazer tempo.", autor: "Desconhecido" },
  { texto: "O único treino ruim é aquele que não aconteceu.", autor: "PeakOS" },
  { texto: "Progresso, não perfeição.", autor: "Desconhecido" },
  { texto: "Seu futuro te agradece por cada gota de suor hoje.", autor: "PeakOS" },
  { texto: "A diferença entre quem você é e quem quer ser é o que você faz.", autor: "Desconhecido" },
  { texto: "Treine como se alguém estivesse te observando. Porque está: você.", autor: "PeakOS" },
  { texto: "Resultados vêm de hábitos, não de motivação.", autor: "Desconhecido" },
  { texto: "Você não sobe a escada do sucesso com as mãos nos bolsos.", autor: "Provérbio Americano" },
  { texto: "O peso que você levanta hoje é leve perto do peso das desculpas.", autor: "PeakOS" },
  { texto: "Acredite que pode e você já está no meio do caminho.", autor: "Theodore Roosevelt" },
  { texto: "Não conte os dias. Faça os dias contarem.", autor: "Muhammad Ali" },
  { texto: "O único limite é aquele que você coloca na sua mente.", autor: "PeakOS" },
  { texto: "Hoje é um presente. Use-o para construir seu melhor eu.", autor: "Desconhecido" },
  { texto: "A jornada de mil quilômetros começa com um único passo.", autor: "Lao Tsé" },
  { texto: "Mais forte do que ontem, mais fraco do que amanhã.", autor: "PeakOS" }
];

// Função para obter a frase do dia baseada na data atual
export const getSabedoriaDoDia = () => {
  const hoje = new Date();
  const diaDoAno = Math.floor((hoje - new Date(hoje.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Usar dia do ano para selecionar frase (ciclo anual)
  const index = diaDoAno % FRASES.length;
  
  return FRASES[index];
};

// Alternativa: usar localStorage para persistir a frase do dia
// e só mudar quando a data mudar
export const getSabedoriaDoDiaComCache = () => {
  const hoje = new Date().toDateString();
  const cached = localStorage.getItem('peakos_sabedoria');
  
  if (cached) {
    const { data, frase } = JSON.parse(cached);
    if (data === hoje) return frase;
  }
  
  const novaFrase = getSabedoriaDoDia();
  localStorage.setItem('peakos_sabedoria', JSON.stringify({
    data: hoje,
    frase: novaFrase
  }));
  
  return novaFrase;
};
