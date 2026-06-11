import { ref, get } from 'firebase/database'
import { database } from '../config/firebase.config'

export const getPeakRingProgress = async (tokenKey) => {
  const hoje = new Date().toISOString().split('T')[0]
  
  // Buscar todos os dados em paralelo
  const [
    treinoSnap,
    alimentacaoSnap,
    aguaSnap,
    sonoSnap,
    checkinSnap,
    recuperacaoSnap,
    mindsetSnap,
    perfilSnap,
    metasSnap
  ] = await Promise.all([
    get(ref(database, `gymai_log/${tokenKey}/${hoje}`)),
    get(ref(database, `gymai_diario_alimentar/${tokenKey}/${hoje}`)),
    get(ref(database, `gymai_hidratacao/${tokenKey}/${hoje}`)),
    get(ref(database, `gymai_sono/${tokenKey}/${hoje}`)),
    get(ref(database, `gymai_dias_treino/${tokenKey}/${hoje}`)),
    get(ref(database, `gymai_recuperacao/${tokenKey}/${hoje}`)),
    get(ref(database, `gymai_mindset/${tokenKey}/${hoje}`)),
    get(ref(database, `gymai_profile/${tokenKey}`)),
    get(ref(database, `gymai_metas/${tokenKey}`))
  ])
  
  // 1. Treino (25%)
  const treinoFeito = treinoSnap.exists() && Object.keys(treinoSnap.val() || {}).length > 0
  const treinoScore = treinoFeito ? 1 : 0
  
  // 2. Alimentação (15%)
  const refeicoesCount = alimentacaoSnap.exists() ? Object.keys(alimentacaoSnap.val() || {}).length : 0
  const alimentacaoScore = Math.min(refeicoesCount / 3, 1)
  
  // 3. Hidratação (15%)
  const aguaAtual = aguaSnap.exists() ? aguaSnap.val().quantidade || 0 : 0
  const metaAgua = perfilSnap.exists() ? (perfilSnap.val().peso * 35) || 2000 : 2000
  const aguaScore = Math.min(aguaAtual / metaAgua, 1)
  
  // 4. Sono (10%)
  const sonoFeito = sonoSnap.exists()
  const sonoScore = sonoFeito ? 1 : 0
  
  // 5. Check-in (10%)
  const checkinFeito = checkinSnap.exists()
  const checkinScore = checkinFeito ? 1 : 0
  
  // 6. Recuperação (10%)
  const recuperacaoFeito = recuperacaoSnap.exists()
  const recuperacaoScore = recuperacaoFeito ? 1 : 0
  
  // 7. Mindset (10%)
  const mindsetFeito = mindsetSnap.exists()
  const mindsetScore = mindsetFeito ? 1 : 0
  
  // 8. Metas diárias (5% - opcional)
  let metasScore = 0
  if (metasSnap.exists()) {
    const metas = metasSnap.val()
    const metasProgress = []
    if (metas.calorias) metasProgress.push(Math.min(metas.calorias_atual / metas.calorias, 1))
    if (metas.proteina) metasProgress.push(Math.min(metas.proteina_atual / metas.proteina, 1))
    if (metas.passos) metasProgress.push(Math.min(metas.passos_atual / metas.passos, 1))
    metasScore = metasProgress.length > 0 
      ? metasProgress.reduce((a, b) => a + b, 0) / metasProgress.length 
      : 0.5
  } else {
    metasScore = 0.5 // Neutro se não configurado
  }
  
  // Cálculo final (pesos somam 100%)
  const progressoGeral = (
    (treinoScore * 0.25) +
    (alimentacaoScore * 0.15) +
    (aguaScore * 0.15) +
    (sonoScore * 0.10) +
    (checkinScore * 0.10) +
    (recuperacaoScore * 0.10) +
    (mindsetScore * 0.10) +
    (metasScore * 0.05)
  ) * 100
  
  return {
    progresso: Math.round(progressoGeral),
    detalhes: {
      treino: { valor: treinoScore * 100, peso: 25 },
      alimentacao: { valor: alimentacaoScore * 100, peso: 15 },
      agua: { valor: aguaScore * 100, peso: 15 },
      sono: { valor: sonoScore * 100, peso: 10 },
      checkin: { valor: checkinScore * 100, peso: 10 },
      recuperacao: { valor: recuperacaoScore * 100, peso: 10 },
      mindset: { valor: mindsetScore * 100, peso: 10 },
      metas: { valor: metasScore * 100, peso: 5 }
    }
  }
}
