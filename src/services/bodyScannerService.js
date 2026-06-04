import { database } from '@config/firebase.config'

export const bodyScannerService = {
  async saveAnalysis(tokenKey, analysisData) {
    try {
      const analysisRef = database.ref(`gymai_body_scanner/${tokenKey}`).push()
      await analysisRef.set({
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
      const snapshot = await database.ref(`gymai_body_scanner/${tokenKey}`).once('value')
      const analyses = snapshot.val()
      return { success: true, data: analyses }
    } catch (error) {
      console.error('Erro ao buscar histórico de análises:', error)
      return { success: false, error: error.message }
    }
  },

  async analyzePhotos(photos) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.VITE_ANTHROPIC_API_KEY || 'SUA_CHAVE_API_ANTHROPIC',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1024,
          messages: [
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
      return { success: true, data: data.content[0].text }
    } catch (error) {
      console.error('Erro ao analisar fotos:', error)
      return { success: false, error: error.message }
    }
  }
}
