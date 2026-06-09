const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const groqService = {
  async generateWorkoutInsights(weekData) {
    if (!GROQ_API_KEY) {
      console.warn('GROQ_API_KEY não configurada, usando insights simulados')
      return null
    }

    try {
      const prompt = `
Analise os dados de treino da semana e gere:
1. Análise da Semana (3-4 frases curtas com números reais)
2. Uma citação motivacional relevante com autor

Dados:
- Treinos essa semana: ${weekData.weekWorkouts || 0}
- Volume total: ${weekData.totalVolume || 0}kg
- Sono médio: ${weekData.avgSleep || 0}h
- Consistência: ${weekData.consistency || 0}%

Responda em JSON:
{
  "analise": "texto da análise",
  "citacao": "texto da citação",
  "autor": "nome do autor"
}
`

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: 'Você é um coach de fitness experiente que fornece insights motivacionais baseados em dados reais.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      return JSON.parse(content)
    } catch (error) {
      console.error('Erro ao chamar Groq API:', error)
      return null
    }
  }
}
