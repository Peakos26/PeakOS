import { database, ref, get } from '@config/firebase.config'

const getUserDailySummary = async (targetTokenKey) => {
  const hoje = new Date().toISOString().split('T')[0]
  
  try {
    // 1. Treino
    const treinoSnap = await get(ref(database, `gymai_log/${targetTokenKey}/${hoje}`))
    const treinoFeito = treinoSnap.exists()
    let treinoData = { feito: treinoFeito, exercicios: [], series: 0, volume_total: 0 }
    
    if (treinoFeito) {
      const logs = Object.values(treinoSnap.val())
      const ultimoTreino = logs[logs.length - 1]
      
      // Contar séries totais
      let totalSeries = 0
      if (ultimoTreino.exercicios) {
        ultimoTreino.exercicios.forEach(ex => {
          if (ex.series) {
            totalSeries += ex.series.length
          }
        })
        treinoData.exercicios = ultimoTreino.exercicios?.map(ex => ex.nome) || []
      }
      
      treinoData.series = totalSeries
      treinoData.volume_total = ultimoTreino.volume_total || 0
    }

    // 2. Alimentação
    const alimentacaoSnap = await get(ref(database, `gymai_diario_alimentar/${targetTokenKey}/${hoje}`))
    let nutri = { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
    
    if (alimentacaoSnap.exists()) {
      const refeicoes = Object.values(alimentacaoSnap.val())
      refeicoes.forEach(refeicao => {
        if (refeicao.alimentos) {
          Object.values(refeicao.alimentos).forEach(alimento => {
            nutri.calorias += alimento.calorias || 0
            nutri.proteinas += alimento.proteina || 0
            nutri.carboidratos += alimento.carboidratos || 0
            nutri.gorduras += alimento.gorduras || 0
          })
        }
      })
    }

    // Meta calórica (buscar do perfil do alvo)
    const perfilSnap = await get(ref(database, `gymai_profile/${targetTokenKey}`))
    const perfilData = perfilSnap.exists() ? perfilSnap.val() : {}
    const metaCalorias = perfilData.meta_calorias || 2000

    // 3. Hidratação
    const aguaSnap = await get(ref(database, `gymai_hidratacao/${targetTokenKey}/${hoje}`))
    const aguaData = aguaSnap.exists() ? aguaSnap.val() : {}
    const aguaQuantidade = aguaData.intake || 0
    const metaAgua = aguaData.goal || (perfilData.peso ? perfilData.peso * 35 : 2000)

    // 4. Check-in
    const checkinSnap = await get(ref(database, `gymai_dias_treino/${targetTokenKey}/${hoje}`))
    const checkinFeito = checkinSnap.exists()
    let localizacao = ''
    if (checkinFeito && checkinSnap.val().location) {
      localizacao = checkinSnap.val().location.city || ''
    }

    return {
      nome: perfilData.nome || 'Usuário',
      treino: treinoData,
      alimentacao: { ...nutri, meta_calorias: metaCalorias },
      agua: { quantidade: aguaQuantidade, meta: metaAgua },
      checkin: { feito: checkinFeito, localizacao },
      data_ref: hoje
    }
  } catch (error) {
    console.error('Erro ao buscar resumo do usuário:', error)
    throw error
  }
}

export { getUserDailySummary }
