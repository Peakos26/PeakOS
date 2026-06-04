import { database } from '@config/firebase.config'

export const paymentService = {
  // Planos disponíveis
  PLANS: {
    free: {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      features: [
        'Log de treino básico',
        'Planos de treino padrão',
        'Check-in com geolocalização',
        'IA Coach (limitado)'
      ]
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 19.90,
      period: 'monthly',
      features: [
        'Todas as features do plano gratuito',
        'Treinos personalizados com IA',
        'Scanner corporal com IA',
        'Metas inteligentes',
        'Performance score detalhado',
        'Relatórios avançados',
        'IA Coach ilimitado',
        'Integração com Apple Health',
        'Integração com Garmin Connect',
        'Integração com Google Fit'
      ]
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 49.90,
      period: 'monthly',
      features: [
        'Todas as features do plano Pro',
        'Consultoria personalizada com IA',
        'Análise de fotos ilimitada',
        'Relatórios personalizados',
        'Suporte prioritário',
        'Acesso antecipado a novas features'
      ]
    }
  },

  async createPaymentIntent(tokenKey, planId) {
    try {
      const plan = this.PLANS[planId]
      if (!plan) {
        throw new Error('Plano inválido')
      }

      // Em produção, isso usaria Stripe ou outro gateway de pagamento
      // Aqui simulamos a criação do pagamento
      const paymentIntent = {
        id: `pi_${Date.now()}`,
        amount: plan.price * 100, // em centavos
        currency: 'BRL',
        planId,
        status: 'pending',
        createdAt: Date.now()
      }

      await database.ref(`gymai_payments/${tokenKey}/${paymentIntent.id}`).set(paymentIntent)

      return { success: true, data: paymentIntent }
    } catch (error) {
      console.error('Erro ao criar payment intent:', error)
      return { success: false, error: error.message }
    }
  },

  async confirmPayment(tokenKey, paymentIntentId) {
    try {
      const paymentRef = database.ref(`gymai_payments/${tokenKey}/${paymentIntentId}`)
      const snapshot = await paymentRef.once('value')
      const payment = snapshot.val()

      if (!payment) {
        throw new Error('Pagamento não encontrado')
      }

      // Atualizar status do pagamento
      await paymentRef.update({
        status: 'succeeded',
        confirmedAt: Date.now()
      })

      // Atualizar plano do usuário
      const plan = this.PLANS[payment.planId]
      await database.ref(`gymai_tokens/${tokenKey}`).update({
        plan: payment.planId,
        planExpiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 dias
        planActivatedAt: Date.now()
      })

      // Adicionar features do plano
      const featuresMap = {
        pro: ['treinos_personalizados', 'scanner_corporal', 'metas_inteligentes', 'performance_score', 'relatorios_avancados', 'apple_health', 'garmin_connect', 'google_fit'],
        premium: ['treinos_personalizados', 'scanner_corporal', 'metas_inteligentes', 'performance_score', 'relatorios_avancados', 'apple_health', 'garmin_connect', 'google_fit', 'consultoria_ia', 'suporte_prioritario']
      }

      const features = featuresMap[payment.planId] || []
      await database.ref(`gymai_tokens/${tokenKey}/features`).set(features)

      return { success: true, data: { plan: payment.planId, features } }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error)
      return { success: false, error: error.message }
    }
  },

  async getUserPlan(tokenKey) {
    try {
      const snapshot = await database.ref(`gymai_tokens/${tokenKey}`).once('value')
      const tokenData = snapshot.val()

      if (!tokenData) {
        return { success: true, data: { plan: 'free', features: [] } }
      }

      const plan = tokenData.plan || 'free'
      const features = tokenData.features || []
      const planExpiresAt = tokenData.planExpiresAt

      // Verificar se o plano expirou
      if (plan !== 'free' && planExpiresAt && Date.now() > planExpiresAt) {
        // Reverter para plano gratuito
        await database.ref(`gymai_tokens/${tokenKey}`).update({
          plan: 'free',
          features: []
        })
        return { success: true, data: { plan: 'free', features: [] } }
      }

      return { success: true, data: { plan, features, planExpiresAt } }
    } catch (error) {
      console.error('Erro ao buscar plano do usuário:', error)
      return { success: false, error: error.message }
    }
  },

  async cancelSubscription(tokenKey) {
    try {
      const snapshot = await database.ref(`gymai_tokens/${tokenKey}`).once('value')
      const tokenData = snapshot.val()

      if (!tokenData) {
        throw new Error('Token não encontrado')
      }

      // Em produção, isso cancelaria a assinatura no Stripe
      // Aqui apenas removemos o plano pago
      await database.ref(`gymai_tokens/${tokenKey}`).update({
        plan: 'free',
        features: [],
        planExpiresAt: null,
        planCancelledAt: Date.now()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error)
      return { success: false, error: error.message }
    }
  },

  async getPaymentHistory(tokenKey) {
    try {
      const snapshot = await database.ref(`gymai_payments/${tokenKey}`).once('value')
      const payments = snapshot.val()

      if (!payments) {
        return { success: true, data: [] }
      }

      const paymentsArray = Object.values(payments).sort((a, b) => b.createdAt - a.createdAt)
      return { success: true, data: paymentsArray }
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error)
      return { success: false, error: error.message }
    }
  }
}
