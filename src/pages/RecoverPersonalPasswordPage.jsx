import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestPasswordRecovery, verifyRecoveryCode, resetPasswordWithCode } from '@services/passwordService'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Input from '@components/ui/Input'
import { Lock, Smartphone, ArrowLeft, Check, AlertCircle, Clock } from 'lucide-react'

const RecoverPersonalPasswordPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: celular, 2: codigo, 3: nova_senha, 4: sucesso
  const [celular, setCelular] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tokenKey, setTokenKey] = useState('')
  const [countdown, setCountdown] = useState(0)

  const validatePassword = (pwd) => {
    const regex = /^\d{6,8}$/
    return regex.test(pwd)
  }

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await requestPasswordRecovery(celular)
      
      if (result.success) {
        // Buscar tokenKey
        const { database, ref, get } = await import('@config/firebase.config')
        const requestsSnapshot = await get(ref(database, 'gymai_requests'))
        let foundTokenKey = null
        
        requestsSnapshot.forEach(child => {
          if (child.val().celular === celular && child.val().status === 'approved') {
            foundTokenKey = child.val().tokenKey || celular
          }
        })
        
        setTokenKey(foundTokenKey)
        setStep(2)
        startCountdown()
      } else {
        setError(result.message || 'Erro ao solicitar código')
      }
    } catch (err) {
      setError('Erro ao solicitar código de recuperação')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await verifyRecoveryCode(tokenKey, code)
      
      if (result.success) {
        setStep(3)
      } else {
        setError(result.message || 'Código inválido')
      }
    } catch (err) {
      setError('Erro ao verificar código')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!validatePassword(newPassword)) {
      setError('A senha deve ter 6-8 dígitos numéricos')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const result = await resetPasswordWithCode(tokenKey, code, newPassword)
      
      if (result.success) {
        setStep(4)
      } else {
        setError(result.message || 'Erro ao redefinir senha')
      }
    } catch (err) {
      setError('Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResendCode = async () => {
    if (countdown > 0) return
    
    setError('')
    setLoading(true)

    try {
      const result = await requestPasswordRecovery(celular)
      
      if (result.success) {
        setCode('')
        startCountdown()
      } else {
        setError(result.message || 'Erro ao reenviar código')
      }
    } catch (err) {
      setError('Erro ao reenviar código')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <Card className="w-full max-w-md">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-[var(--color-muted)] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-primary-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold font-display mb-2">
                Recuperar Senha Pessoal
              </h1>
              <p className="text-[var(--color-muted)]">
                Digite seu celular para receber um código de recuperação
              </p>
            </div>

            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label htmlFor="celular" className="block text-sm font-medium mb-2">
                  Celular (com DDD)
                </label>
                <Input
                  type="tel"
                  id="celular"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 11999999999"
                  maxLength={11}
                  pattern="\d{10,11}"
                  inputMode="tel"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="text-red-400" size={16} />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Receber Código'}
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-primary-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold font-display mb-2">
                Digite o Código
              </h1>
              <p className="text-[var(--color-muted)]">
                Enviamos um código de 6 dígitos para {celular}
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-2">
                  Código de Recuperação
                </label>
                <Input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  pattern="\d{6}"
                  inputMode="numeric"
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="text-red-400" size={16} />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || loading}
                className="w-full text-sm text-[var(--color-muted)] hover:text-white transition-colors disabled:opacity-50"
              >
                {countdown > 0 ? (
                  <span className="flex items-center justify-center gap-2">
                    <Clock size={14} />
                    Reenviar em {countdown}s
                  </span>
                ) : (
                  'Reenviar código'
                )}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-primary-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold font-display mb-2">
                Nova Senha Pessoal
              </h1>
              <p className="text-[var(--color-muted)]">
                Crie uma nova senha de 6-8 dígitos
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  Nova Senha (6-8 dígitos)
                </label>
                <Input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Digite 6-8 números"
                  maxLength={8}
                  pattern="\d{6,8}"
                  inputMode="numeric"
                  autoFocus
                />
                {newPassword && !validatePassword(newPassword) && (
                  <p className="text-red-500 text-sm mt-1">
                    A senha deve ter 6-8 dígitos numéricos
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirmar Nova Senha
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
                {confirmPassword && newPassword !== confirmPassword && (
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

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !validatePassword(newPassword) || newPassword !== confirmPassword}
              >
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </form>
          </>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">Senha Redefinida!</h2>
            <p className="text-[var(--color-muted)] mb-6">
              Sua senha pessoal foi redefinida com sucesso. Use a nova senha para fazer login.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Fazer Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default RecoverPersonalPasswordPage
