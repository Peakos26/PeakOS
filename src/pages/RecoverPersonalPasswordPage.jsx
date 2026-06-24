import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Input from '@components/ui/Input'
import { Lock, Smartphone, ArrowLeft, AlertCircle, Mail } from 'lucide-react'

const RecoverPersonalPasswordPage = () => {
  const navigate = useNavigate()
  const [celular, setCelular] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: celular, 2: instrucoes

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!celular || celular.length < 10) {
      setError('Digite um celular válido (com DDD)')
      return
    }

    setLoading(true)

    try {
      // Verificar se usuário existe
      const { database, ref, get } = await import('@config/firebase.config')
      const requestsSnapshot = await get(ref(database, 'gymai_requests'))
      let foundUser = null
      
      requestsSnapshot.forEach(child => {
        if (child.val().celular === celular && child.val().status === 'approved') {
          foundUser = child.val()
        }
      })

      if (!foundUser) {
        setError('Usuário não encontrado ou não aprovado')
        setLoading(false)
        return
      }

      setStep(2)
    } catch (err) {
      setError('Erro ao verificar usuário')
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
                <Lock className="text-primary-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold font-display mb-2">
                Esqueceu sua Senha Pessoal?
              </h1>
              <p className="text-[var(--color-muted)]">
                Entre em contato com o administrador para redefinir sua senha
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? 'Verificando...' : 'Continuar'}
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-primary-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">Entre em Contato</h2>
            <p className="text-[var(--color-muted)] mb-6">
              Para redefinir sua senha pessoal, entre em contato com o administrador através do email:
            </p>
            <div className="p-4 bg-[var(--color-border)] rounded-xl mb-6">
              <p className="text-lg font-bold text-primary-600">heltonsales1982@gmail.com</p>
            </div>
            <p className="text-sm text-[var(--color-muted)] mb-6">
              Informe seu celular ({celular}) para que o administrador possa redefinir sua senha.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Voltar ao Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default RecoverPersonalPasswordPage
