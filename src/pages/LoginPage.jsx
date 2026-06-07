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
  const [step, setStep] = useState(1) // 1: verificar celular, 2: solicitar acesso, 3: pendente
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const logLogin = async (tokenKey, userData) => {
    console.log('📝 [LOGIN] Iniciando registro de login')
    console.log('📝 [LOGIN] TokenKey:', tokenKey)
    console.log('📝 [LOGIN] UserData:', userData)
    console.log('📝 [LOGIN] Celular:', celular)
    try {
      const logRef = push(ref(database, 'gymai_logins'))
      await set(logRef, {
        tokenKey,
        nome: userData.nome,
        celular,
        timestamp: Date.now(),
        date: new Date().toISOString()
      })
      console.log('✅ [LOGIN] Login registrado com sucesso')
    } catch (err) {
      console.error('❌ [LOGIN] Erro ao registrar login:', err)
    }
  }

  const checkExistingUser = async () => {
    console.log('🔍 [LOGIN] Iniciando checkExistingUser')
    console.log('🔍 [LOGIN] Celular:', celular)
    setLoading(true)
    setError('')

    // Verificar por celular (STEP 1 do ROADMAP)
    if (!celular || celular.length < 10) {
      console.log('❌ [LOGIN] Celular inválido')
      setError('Digite um celular válido (com DDD)')
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
        console.log('✅ [LOGIN] Usuário aprovado, tentando login automático')
        // Login automático com token (STEP 1 do ROADMAP)
        const result = await login(existing.tokenKey, { nome: existing.nome })
        console.log('🔍 [LOGIN] Resultado login automático:', result)
        if (result.success) {
          console.log('✅ [LOGIN] Login automático sucesso')
          await logLogin(existing.tokenKey, { nome: existing.nome })
          console.log('🔍 [LOGIN] Login automático sucesso, navegando para /')
          navigate('/')
        } else {
          console.log('❌ [LOGIN] Erro ao fazer login automático')
          setError('Erro ao fazer login automático')
        }
      } else if (existing && existing.status === 'pending') {
        console.log('⏳ [LOGIN] Usuário pendente, indo para tela "Aguardando aprovação"')
        setStep(3)
      } else {
        console.log('📝 [LOGIN] Usuário não encontrado, indo para STEP 2 (solicitar acesso)')
        setStep(2)
      }
    } catch (err) {
      console.error('❌ [LOGIN] Erro ao verificar celular:', err)
      setError('Erro ao verificar celular')
    }

    setLoading(false)
  }

  const requestAccess = async () => {
    console.log('📝 [LOGIN] Iniciando requestAccess (STEP 2 do ROADMAP)')
    console.log('📝 [LOGIN] Nome:', nome)
    console.log('📝 [LOGIN] Celular:', celular)
    setLoading(true)
    setError('')

    if (!nome) {
      console.log('❌ [LOGIN] Nome não informado')
      setError('Digite seu nome')
      setLoading(false)
      return
    }
    if (!celular || celular.length < 10) {
      console.log('❌ [LOGIN] Celular inválido')
      setError('Digite um celular válido (com DDD)')
      setLoading(false)
      return
    }

    try {
      console.log('🔍 [LOGIN] Buscando requests existentes no Firebase')
      const requestsSnapshot = await get(ref(database, 'gymai_requests'))
      console.log('🔍 [LOGIN] Requests snapshot:', requestsSnapshot.val())
      const requests = requestsSnapshot.val() || {}
      const existing = Object.values(requests).find(r => r.celular === celular)
      console.log('🔍 [LOGIN] Usuário existente:', existing)

      if (existing) {
        console.log('🔍 [LOGIN] Usuário já existe, status:', existing.status)
        if (existing.status === 'pending') {
          console.log('📝 [LOGIN] Usuário pendente, indo para tela "Aguardando aprovação"')
          setStep(3)
          setLoading(false)
          return
        }
        if (existing.status === 'approved' && existing.tokenKey) {
          console.log('✅ [LOGIN] Usuário aprovado, tentando login automático')
          const result = await login(existing.tokenKey, { nome: existing.nome })
          console.log('🔍 [LOGIN] Resultado login automático:', result)
          if (result.success) {
            await logLogin(existing.tokenKey, { nome: existing.nome })
            console.log('✅ [LOGIN] Login automático sucesso, navegando para /')
            navigate('/')
          } else {
            console.log('❌ [LOGIN] Erro ao fazer login automático')
            setError('Erro ao fazer login')
          }
          setLoading(false)
          return
        }
      }

      console.log('📝 [LOGIN] Criando nova solicitação (STEP 2 do ROADMAP)')
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
      console.log('📝 [LOGIN] RequestID:', requestId)
      requests[requestId] = {
        nome,
        celular,
        status: 'pending',
        createdAt: Date.now()
      }

      await set(ref(database, 'gymai_requests'), requests)
      console.log('✅ [LOGIN] Solicitação criada com sucesso')
      setStep(3)
    } catch (err) {
      console.error('❌ [LOGIN] Erro ao solicitar acesso:', err)
      setError('Erro ao solicitar acesso')
    }

    setLoading(false)
  }

  const checkApproval = async () => {
    console.log('🔍 [LOGIN] Iniciando checkApproval (TELA PENDENTE do ROADMAP)')
    console.log('🔍 [LOGIN] Celular:', celular)
    setLoading(true)

    try {
      console.log('🔍 [LOGIN] Buscando requests no Firebase')
      const requestsSnapshot = await get(ref(database, 'gymai_requests'))
      console.log('🔍 [LOGIN] Requests snapshot:', requestsSnapshot.val())
      const requests = requestsSnapshot.val() || {}
      const existing = Object.values(requests).find(r => r.celular === celular)
      console.log('🔍 [LOGIN] Usuário existente:', existing)

      if (!existing) {
        console.log('❌ [LOGIN] Solicitação não encontrada')
        setError('Solicitação não encontrada')
        setLoading(false)
        return
      }

      console.log('🔍 [LOGIN] Status do usuário:', existing.status)
      if (existing.status === 'pending') {
        console.log('⏳ [LOGIN] Usuário ainda pendente')
        setError('Ainda pendente. Aguarde aprovação do administrador')
        setLoading(false)
        return
      }

      if (existing.status === 'approved' && existing.tokenKey) {
        console.log('✅ [LOGIN] Usuário aprovado, tentando login automático')
        const result = await login(existing.tokenKey, { nome: existing.nome })
        console.log('🔍 [LOGIN] Resultado login:', result)
        if (result.success) {
          await logLogin(existing.tokenKey, { nome: existing.nome })
          console.log('✅ [LOGIN] Login sucesso, navegando para /')
          navigate('/')
        } else {
          console.log('❌ [LOGIN] Erro ao fazer login')
          setError('Erro ao fazer login')
        }
      } else {
        console.log('❌ [LOGIN] Solicitação rejeitada')
        setError('Solicitação rejeitada')
      }
    } catch (err) {
      console.error('❌ [LOGIN] Erro ao verificar aprovação:', err)
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
              Solicitação enviada. Aguarde aprovação do administrador.
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
