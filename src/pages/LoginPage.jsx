import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Input from '@components/ui/Input'

const LoginPage = () => {
  const [tokenKey, setTokenKey] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(tokenKey)

    if (result.success) {
      navigate('/')
    } else {
      alert(result.error || 'Erro ao fazer login')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">PeakOS</h1>
          <p className="text-[var(--color-muted)]">Entre com sua chave de acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Chave de Acesso</label>
            <Input
              type="text"
              value={tokenKey}
              onChange={(e) => setTokenKey(e.target.value)}
              placeholder="Digite sua chave de acesso"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-muted)]">
          <p>Não tem uma chave? Entre em contato com o administrador.</p>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
