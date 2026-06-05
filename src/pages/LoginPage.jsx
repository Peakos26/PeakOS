import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Input from '@components/ui/Input'

const LoginPage = () => {
  const [celular, setCelular] = useState('')
  const [nome, setNome] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState(1) // 1: verificar celular/token, 2: solicitar acesso, 3: pendente
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const logLogin = async (tokenKey, userData) => {
    try {
      const logRef = push(ref(database, 'gymai_logins'))
      await set(logRef, {
        tokenKey,
        nome: userData.nome,
        celular,
        timestamp: Date.now(),
        date: new Date().toISOString()
      })
    } catch (err) {
      console.error('Erro ao registrar login:', err)
    }
  }

  const checkExistingUser = async () => {
    console.log('🔍 [LOGIN] Iniciando checkExistingUser')
    console.log('🔍 [LOGIN] Token:', token)
    console.log('🔍 [LOGIN] Celular:', celular)
    setLoading(true)
    setError('')

    // Se o usuário inseriu um token, tentar login com o token
    if (token) {
      console.log('🔍 [LOGIN] Tentando login com token')
      try {
        const result = await login(token, { nome: 'Usuário' })
        console.log('🔍 [LOGIN] Resultado login token:', result)
        if (result.success) {
          await logLogin(token, { nome: 'Usuário' })
          console.log('🔍 [LOGIN] Login com token sucesso, navegando para /')
          navigate('/')
        } else {
          console.log('🔍 [LOGIN] Token inválido ou expirado')
          setError('Token inválido ou expirado')
        }
        setLoading(false)
        return
      } catch (err) {
        console.error('❌ [LOGIN] Erro ao verificar token:', err)
        setError('Erro ao verificar token')
        setLoading(false)
        return
      }
    }

    // Se não tiver token, verificar por celular
    if (!celular || celular.length < 10) {
      console.log('🔍 [LOGIN] Celular inválido')
      setError('Digite um celular válido (com DDD) ou insira um token')
      setLoading(false)
      return
    }

    try {
      console.log('🔍 [LOGIN] Buscando requests no Firebase')
      const requestsSnapshot = await get(ref(database, 'gymai_requests'))
      console.log('🔍 [LOGIN] Requests snapshot:', requestsSnapshot.val())
      const requests = requestsSnapshot.val() || {}
      const existing = Object.values(requests).find(r => r.celular === celular)
      console.log('🔍 [LOGIN] Usuário existente:', existing)

      if (existing && existing.status === 'approved' && existing.tokenKey) {
        console.log('🔍 [LOGIN] Usuário aprovado, tentando login automático')
        // Login automático com token
        const result = await login(existing.tokenKey, { nome: existing.nome })
        console.log('🔍 [LOGIN] Resultado login automático:', result)
        if (result.success) {
          await logLogin(existing.tokenKey, { nome: existing.nome })
          console.log('🔍 [LOGIN] Login automático sucesso, navegando para /')
          navigate('/')
        } else {
          console.log('🔍 [LOGIN] Erro ao fazer login automático')
          setError('Erro ao fazer login automático')
        }
      } else if (existing && existing.status === 'pending') {
        console.log('🔍 [LOGIN] Usuário pendente')
        setStep(3)
      } else {
        setStep(2)
      }
    } catch (err) {
      setError('Erro ao verificar celular')
    }

    setLoading(false)
  }

  const requestAccess = async () => {
    setLoading(true)
    setError('')

    if (!nome) {
      setError('Digite seu nome')
      setLoading(false)
      return
    }
    if (!celular || celular.length < 10) {
      setError('Digite um celular válido (com DDD)')
      setLoading(false)
      return
    }

    try {
      const requestsSnapshot = await get(ref(database, 'gymai_requests'))
      const requests = requestsSnapshot.val() || {}
      const existing = Object.values(requests).find(r => r.celular === celular)

      if (existing) {
        if (existing.status === 'pending') {
          setStep(3)
          setLoading(false)
          return
        }
        if (existing.status === 'approved' && existing.tokenKey) {
          const result = await login(existing.tokenKey, { nome: existing.nome })
          if (result.success) {
            await logLogin(existing.tokenKey, { nome: existing.nome })
            navigate('/')
          } else {
            setError('Erro ao fazer login')
          }
          setLoading(false)
          return
        }
      }

      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
      requests[requestId] = {
        nome,
        celular,
        status: 'pending',
        createdAt: Date.now()
      }

      await set(ref(database, 'gymai_requests'), requests)
      setStep(3)
    } catch (err) {
      setError('Erro ao solicitar acesso')
    }

    setLoading(false)
  }

  const checkApproval = async () => {
    setLoading(true)

    try {
      const requestsSnapshot = await get(ref(database, 'gymai_requests'))
      const requests = requestsSnapshot.val() || {}
      const existing = Object.values(requests).find(r => r.celular === celular)

      if (!existing) {
        setError('Solicitação não encontrada')
        setLoading(false)
        return
      }

      if (existing.status === 'pending') {
        setError('Ainda pendente. Aguarde aprovação do administrador')
        setLoading(false)
        return
      }

      if (existing.status === 'approved' && existing.tokenKey) {
        const result = await login(existing.tokenKey, { nome: existing.nome })
        if (result.success) {
          await logLogin(existing.tokenKey, { nome: existing.nome })
          navigate('/')
        } else {
          setError('Erro ao fazer login')
        }
      } else {
        setError('Solicitação rejeitada')
      }
    } catch (err) {
      setError('Erro ao verificar aprovação')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">
            Peak<span className="font-bold text-primary-600">OS</span>
          </h1>
          <p className="text-[var(--color-muted)]">
            {step === 1 ? 'Acessar aplicativo' : step === 2 ? 'Solicitar acesso' : 'Solicitação enviada'}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="celular" className="block text-sm font-medium mb-2">Celular (com DDD)</label>
              <Input
                type="tel"
                id="celular"
                name="celular"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="Ex: 11999999999"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={checkExistingUser} className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Acessar'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium mb-2">Nome</label>
              <Input
                type="text"
                id="nome"
                name="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label htmlFor="celularRegistro" className="block text-sm font-medium mb-2">Celular (com DDD)</label>
              <Input
                type="tel"
                id="celularRegistro"
                name="celularRegistro"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="Ex: 11999999999"
                disabled
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={requestAccess} className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Solicitar acesso'}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <p className="text-[var(--color-muted)]">
              Sua solicitação foi enviada ao administrador.<br />
              Você receberá acesso assim que for aprovada.
            </p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={checkApproval} className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar aprovação'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default LoginPage
