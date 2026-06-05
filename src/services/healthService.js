// Serviço para integração com Apple Health, Garmin e Google Fit
// Nota: Apple HealthKit requer app nativa iOS, Garmin Connect API e Google Fit API requerem autenticação

import { database, GROQ_API_KEY } from '@config/firebase.config'

export const healthService = {
  // Apple Health (simulado para web, requer app nativa para HealthKit)
  async connectAppleHealth() {
    try {
      // Em produção, isso usaria Apple HealthKit via app nativa ou web API
      if ('webkit' in window && 'messageHandlers' in window.webkit) {
        // Comunicação com app nativa iOS
        window.webkit.messageHandlers.healthKit.postMessage({ action: 'requestAuthorization' })
        return { success: true, message: 'Solicitação de autorização enviada' }
      }
      
      // Simulação para desenvolvimento
      console.log('Apple HealthKit requer app nativa iOS')
      return { 
        success: false, 
        message: 'Apple HealthKit requer app nativa iOS. Em desenvolvimento, usando dados simulados.' 
      }
    } catch (error) {
      console.error('Erro ao conectar Apple Health:', error)
      return { success: false, error: error.message }
    }
  },

  async getAppleHealthData() {
    try {
      // Em produção, buscaria dados reais do HealthKit
      // Simulação para desenvolvimento
      return {
        success: true,
        data: {
          steps: 8500,
          distance: 6.5, // km
          activeCalories: 450,
          heartRate: 72, // bpm
          sleepHours: 7.5,
          waterIntake: 2000, // ml
          weight: 75.5, // kg
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados Apple Health:', error)
      return { success: false, error: error.message }
    }
  },

  // Garmin Connect API
  async connectGarmin() {
    try {
      // Garmin Connect API requer OAuth 2.0
      // URL de autorização: https://connectapi.garmin.com/oauthConfirm
      const clientId = process.env.VITE_GARMIN_CLIENT_ID
      const redirectUri = window.location.origin + '/garmin/callback'
      const scope = 'read:all'
      
      const authUrl = `https://connectapi.garmin.com/oauthConfirm?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}`
      
      window.location.href = authUrl
      return { success: true, message: 'Redirecionando para Garmin Connect' }
    } catch (error) {
      console.error('Erro ao conectar Garmin:', error)
      return { success: false, error: error.message }
    }
  },

  async getGarminData(accessToken) {
    try {
      const response = await fetch('https://connectapi.garmin.com/users/userSettings', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao buscar dados Garmin:', error)
      return { success: false, error: error.message }
    }
  },

  // Google Fit API
  async connectGoogleFit() {
    try {
      // Google Fit API requer OAuth 2.0 com Google Identity Services
      const clientId = process.env.VITE_GOOGLE_CLIENT_ID
      const scope = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read'
      
      // Usar Google Identity Services para OAuth
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scope,
        callback: (response) => {
          if (response.access_token) {
            localStorage.setItem('google_fit_token', response.access_token)
            return { success: true, token: response.access_token }
          }
        }
      })
      
      tokenClient.requestAccessToken()
      return { success: true, message: 'Solicitação de token enviada' }
    } catch (error) {
      console.error('Erro ao conectar Google Fit:', error)
      return { success: false, error: error.message }
    }
  },

  async getGoogleFitData() {
    try {
      const accessToken = localStorage.getItem('google_fit_token')
      if (!accessToken) {
        return { success: false, error: 'Token não encontrado' }
      }

      // Buscar dados de atividade dos últimos 7 dias
      const endTime = Date.now()
      const startTime = endTime - (7 * 24 * 60 * 60 * 1000) // 7 dias atrás

      const response = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataSources?dataSourceId=derived:com.google.step_count.delta:com.google.android.gms:estimated_step_count&startTime=${startTime}&endTime=${endTime}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao buscar dados Google Fit:', error)
      return { success: false, error: error.message }
    }
  },

  // Função para sincronizar dados de saúde com o Firebase
  async syncHealthData(tokenKey, healthData) {
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
              content: 'Você é um especialista em saúde e fitness. Analise os dados de saúde fornecidos e forneça insights úteis. Responda em português brasileiro.'
            },
            {
              role: 'user',
              content: `Analise estes dados de saúde e forneça insights:
Passos: ${healthData.steps}
Distância: ${healthData.distance} km
Calorias ativas: ${healthData.activeCalories}
Frequência cardíaca: ${healthData.heartRate} bpm
Sono: ${healthData.sleepHours} horas
Água: ${healthData.waterIntake} ml
Peso: ${healthData.weight} kg

Forneça:
1. Análise geral
2. Pontos fortes
3. Áreas para melhorar
4. Recomendações`
            }
          ]
        })
      })

      const data = await response.json()
      const insights = data.choices[0].message.content

      return {
        success: true,
        data: {
          ...healthData,
          insights,
          syncedAt: Date.now()
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados de saúde:', error)
      return { success: false, error: error.message }
    }
  }
}
