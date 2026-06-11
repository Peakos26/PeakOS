import { ref, get } from 'firebase/database'
import { database } from '../config/firebase.config'

export const getPendenciasDoDia = async (tokenKey) => {
  const hoje = new Date().toISOString().split('T')[0]
  const pendencies = []
  
  // 1. Verificar treino
  const treinoRef = ref(database, `gymai_log/${tokenKey}/${hoje}`)
  const treinoSnap = await get(treinoRef)
  if (!treinoSnap.exists() || Object.keys(treinoSnap.val() || {}).length === 0) {
    pendencies.push({
      id: 'treino',
      titulo: 'Treino do dia',
      descricao: 'Registre seu treino de hoje',
      icone: '💪',
      rota: '/log-treino',
      prioridade: 'alta'
    })
  }
  
  // 2. Verificar alimentação
  const alimentacaoRef = ref(database, `gymai_diario_alimentar/${tokenKey}/${hoje}`)
  const alimentacaoSnap = await get(alimentacaoRef)
  const refeicoesCount = alimentacaoSnap.exists() ? Object.keys(alimentacaoSnap.val() || {}).length : 0
  if (refeicoesCount < 3) {
    pendencies.push({
      id: 'alimentacao',
      titulo: 'Refeições pendentes',
      descricao: `${3 - refeicoesCount} refeição(ões) não registrada(s) hoje`,
      icone: '🍽️',
      rota: '/diario-alimentar',
      prioridade: 'media'
    })
  }
  
  // 3. Verificar hidratação
  const aguaRef = ref(database, `gymai_hidratacao/${tokenKey}/${hoje}`)
  const aguaSnap = await get(aguaRef)
  const aguaAtual = aguaSnap.exists() ? aguaSnap.val().quantidade || 0 : 0
  // Buscar meta de água do perfil (padrão: 2000ml)
  const perfilRef = ref(database, `gymai_profile/${tokenKey}`)
  const perfilSnap = await get(perfilRef)
  const metaAgua = perfilSnap.exists() ? (perfilSnap.val().peso * 35) || 2000 : 2000
  const percentualAgua = (aguaAtual / metaAgua) * 100
  
  if (percentualAgua < 70) {
    pendencies.push({
      id: 'agua',
      titulo: 'Hidratação',
      descricao: `${Math.round(metaAgua - aguaAtual)}ml para bater a meta`,
      icone: '💧',
      rota: '/hidratacao',
      prioridade: 'alta'
    })
  }
  
  // 4. Verificar sono
  const sonoRef = ref(database, `gymai_sono/${tokenKey}/${hoje}`)
  const sonoSnap = await get(sonoRef)
  if (!sonoSnap.exists()) {
    pendencies.push({
      id: 'sono',
      titulo: 'Registro de sono',
      descricao: 'Como você dormiu esta noite?',
      icone: '😴',
      rota: '/sono',
      prioridade: 'media'
    })
  }
  
  // 5. Verificar recuperação (fadiga)
  const recuperacaoRef = ref(database, `gymai_recuperacao/${tokenKey}/${hoje}`)
  const recuperacaoSnap = await get(recuperacaoRef)
  if (!recuperacaoSnap.exists()) {
    pendencies.push({
      id: 'recuperacao',
      titulo: 'Nível de fadiga',
      descricao: 'Registre como estão seus músculos',
      icone: '🔄',
      rota: '/recuperacao',
      prioridade: 'baixa'
    })
  }
  
  // 6. Verificar mindset
  const mindsetRef = ref(database, `gymai_mindset/${tokenKey}/${hoje}`)
  const mindsetSnap = await get(mindsetRef)
  if (!mindsetSnap.exists()) {
    pendencies.push({
      id: 'mindset',
      titulo: 'Diário de humor',
      descricao: 'Como está seu estado mental hoje?',
      icone: '🧠',
      rota: '/mindset',
      prioridade: 'baixa'
    })
  }
  
  // 7. Verificar medidas (última há mais de 7 dias)
  const medidasRef = ref(database, `gymai_medidas/${tokenKey}`)
  const medidasSnap = await get(medidasRef)
  if (medidasSnap.exists()) {
    const medidas = medidasSnap.val()
    const ultimaMedida = Math.max(...Object.values(medidas).map(m => m.timestamp || 0))
    const diasDesdeUltima = Math.floor((Date.now() - ultimaMedida) / (1000 * 60 * 60 * 24))
    if (diasDesdeUltima > 7) {
      pendencies.push({
        id: 'medidas',
        titulo: 'Atualizar medidas',
        descricao: `Última medida há ${diasDesdeUltima} dias`,
        icone: '📏',
        rota: '/medidas',
        prioridade: 'baixa'
      })
    }
  }
  
  // 8. Verificar check-in diário
  const checkinRef = ref(database, `gymai_dias_treino/${tokenKey}/${hoje}`)
  const checkinSnap = await get(checkinRef)
  if (!checkinSnap.exists()) {
    pendencies.push({
      id: 'checkin',
      titulo: 'Check-in diário',
      descricao: 'Registre sua presença hoje',
      icone: '📍',
      rota: '/evolucao',
      prioridade: 'media'
    })
  }
  
  // Ordenar por prioridade
  const prioridadeOrder = { alta: 0, media: 1, baixa: 2 }
  pendencies.sort((a, b) => prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade])
  
  return pendencies
}
