import { useState } from 'react'
import { useAuth } from '@context/AuthContext'
import { setup2FA } from '@services/securityService'
import { Shield, Lock, Smartphone, CheckCircle } from 'lucide-react'

const TwoFactorSetup = ({ onComplete, onClose }) => {
  const { session } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: phone, 2: password, 3: success

  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Digite um número de celular válido')
      return
    }
    setStep(2)
    setError('')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const result = await setup2FA(session.tokenKey, phoneNumber, password)
      
      if (result.success) {
        setStep(3)
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        setError(result.message || 'Erro ao configurar 2FA')
      }
    } catch (err) {
      setError('Erro ao configurar 2FA')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="text-accent" />
            Configurar 2FA
          </h2>
          <button onClick={onClose} className="text-muted hover:text-white">✕</button>
        </div>

        {step === 1 && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-bg3 rounded-xl mb-4">
              <Smartphone className="text-accent" size={24} />
              <div>
                <p className="text-sm font-semibold">Segurança adicional</p>
                <p className="text-xs text-muted">Proteja sua conta com autenticação em dois fatores</p>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Número de Celular</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 bg-bg3 border border-border rounded-xl text-white focus:border-accent outline-none"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors"
            >
              Continuar
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-bg3 rounded-xl mb-4">
              <Lock className="text-accent" size={24} />
              <div>
                <p className="text-sm font-semibold">Senha Pessoal</p>
                <p className="text-xs text-muted">Crie uma senha para acessar sua conta</p>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 bg-bg3 border border-border rounded-xl text-white focus:border-accent outline-none"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                className="w-full px-4 py-3 bg-bg3 border border-border rounded-xl text-white focus:border-accent outline-none"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-bg3 border border-border rounded-xl hover:bg-bg3/80 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Configurando...' : 'Configurar'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">2FA Configurado!</h3>
            <p className="text-muted mb-4">
              Sua conta agora está protegida com autenticação em dois fatores.
            </p>
            <p className="text-sm text-muted">
              Você precisará da sua senha pessoal para fazer login.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TwoFactorSetup
