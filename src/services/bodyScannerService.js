import { database, ref, get, set, push, GROQ_API_KEY } from '@config/firebase.config'

export const bodyScannerService = {
  async saveAnalysis(tokenKey, analysisData) {
    try {
      const analysisRef = push(ref(database, `gymai_body_scanner/${tokenKey}`))
      await set(analysisRef, {
        ...analysisData,
        createdAt: Date.now()
      })
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar análise de corpo:', error)
      return { success: false, error: error.message }
    }
  },

  async getAnalysisHistory(tokenKey) {
    try {
      const snapshot = await get(ref(database, `gymai_body_scanner/${tokenKey}`))
      const analyses = snapshot.val()
      return { success: true, data: analyses }
    } catch (error) {
      console.error('Erro ao buscar histórico de análises:', error)
      return { success: false, error: error.message }
    }
  },

  async analyzePhotos(photos) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1024,
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de composição corporal através de fotos. Forneça estimativas realistas baseadas nas imagens e dados fornecidos. Responda em português brasileiro.'
            },
            {
              role: 'user',
              content: `Analise estas fotos de corpo e forneça:
1. Porcentagem estimada de gordura corporal
2. Massa magra estimada
3. Pontos fortes
4. Áreas para melhorar
5. Comparação com análise anterior (se houver)

Fotos: ${JSON.stringify(photos)}`
            }
          ]
        })
      })

      const data = await response.json()
      return { success: true, data: data.choices[0].message.content }
    } catch (error) {
      console.error('Erro ao analisar fotos:', error)
      return { success: false, error: error.message }
    }
  }
}
