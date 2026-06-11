import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Shield, AlertCircle } from 'lucide-react'

const TwoFactorLogin = ({ onSuccess, onCancel, tokenKey }) => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Pass the password to the parent component for verification
      await onSuccess(password)
    } catch (err) {
      setError('Erro ao verificar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <Shield className="text-accent" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Autenticação em 2 Fatores</h2>
            <p className="text-sm text-muted">Digite sua senha pessoal para continuar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-bg3 rounded-xl mb-4">
            <Lock className="text-accent" size={20} />
            <p className="text-sm">
              Proteção adicional para sua conta vinculada ao seu celular
            </p>
          </div>

          <div>
            <label className="block text-sm mb-2">Senha Pessoal (6-8 dígitos)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Digite 6-8 números"
              maxLength={8}
              pattern="\d{6,8}"
              inputMode="numeric"
              className="w-full px-4 py-3 bg-bg3 border border-border rounded-xl text-white focus:border-accent outline-none text-center text-2xl tracking-widest"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="text-red-400" size={16} />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-bg3 border border-border rounded-xl hover:bg-bg3/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Continuar'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/recuperar-senha-pessoal')}
            className="w-full text-sm text-[var(--color-muted)] hover:text-white transition-colors"
          >
            Esqueci minha senha pessoal
          </button>
        </form>
      </div>
    </div>
  )
}

export default TwoFactorLogin
