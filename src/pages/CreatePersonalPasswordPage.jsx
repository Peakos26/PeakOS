import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { createPersonalPassword } from '@services/passwordService'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Input from '@components/ui/Input'
import { Lock, Shield, Check, AlertCircle } from 'lucide-react'

const CreatePersonalPasswordPage = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: create, 2: success

  useEffect(() => {
    // Verificar se usuário tem sessão
    if (!session?.tokenKey) {
      navigate('/login')
      return
    }
  }, [session, navigate])

  const validatePassword = (pwd) => {
    // Deve ser 6-8 dígitos numéricos
    const regex = /^\d{6,8}$/
    return regex.test(pwd)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validar senha
    if (!validatePassword(password)) {
      setError('A senha deve ter 6-8 dígitos numéricos')
      return
    }

    // Validar confirmação
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const result = await createPersonalPassword(
        session.tokenKey,
        session.email,
        password
      )

      if (result.success) {
        setStep(2)
      } else {
        setError(result.message || 'Erro ao criar senha pessoal')
      }
    } catch (err) {
      setError('Erro ao criar senha pessoal')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/')
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
        <Card className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">Senha Pessoal Criada!</h2>
          <p className="text-[var(--color-muted)] mb-6">
            Sua senha pessoal foi configurada com sucesso. Use esta senha para fazer login no futuro.
          </p>
          <div className="p-4 bg-[var(--color-border)] rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <Shield className="text-primary-600" size={20} />
              <p className="text-sm text-left">
                <strong>Segurança ativada:</strong> Sua conta agora está protegida com autenticação em dois fatores.
              </p>
            </div>
          </div>
          <Button onClick={handleContinue} className="w-full">
            Continuar para o App
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold font-display mb-2">
            Criar Senha Pessoal
          </h1>
          <p className="text-[var(--color-muted)]">
            Configure uma senha pessoal de 6-8 dígitos para proteger sua conta
          </p>
        </div>

        <div className="p-4 bg-[var(--color-border)] rounded-xl mb-6">
          <div className="flex items-start gap-3">
            <Shield className="text-primary-600 mt-1" size={20} />
            <div className="text-sm">
              <p className="font-medium mb-1">Por que preciso disso?</p>
              <p className="text-[var(--color-muted)]">
                Esta senha pessoal funciona como um segundo fator de autenticação, vinculada ao seu número de celular. Você precisará dela toda vez que fizer login.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Senha Pessoal (6-8 dígitos)
            </label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Digite 6-8 números"
              maxLength={8}
              pattern="\d{6,8}"
              inputMode="numeric"
              autoFocus
            />
            {password && !validatePassword(password) && (
              <p className="text-red-500 text-sm mt-1">
                A senha deve ter 6-8 dígitos numéricos
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirmar Senha
            </label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Confirme sua senha"
              maxLength={8}
              pattern="\d{6,8}"
              inputMode="numeric"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                As senhas não coincidem
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="text-red-400" size={16} />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="p-4 bg-[var(--color-border)] rounded-xl">
            <p className="text-xs text-[var(--color-muted)]">
              <strong>Importante:</strong> Memorize sua senha pessoal. Se esquecê-la, você precisará usar a recuperação por SMS.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !validatePassword(password) || password !== confirmPassword}
          >
            {loading ? 'Criando senha...' : 'Criar Senha Pessoal'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default CreatePersonalPasswordPage
