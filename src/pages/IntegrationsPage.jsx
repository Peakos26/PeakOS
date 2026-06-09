import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { Smartphone, Watch, Heart, Activity, Moon, Scale, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const IntegrationsPage = () => {
  const { session } = useAuth()
  const [activeTab, setActiveTab] = useState('pwa')
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [appleHealthConnected, setAppleHealthConnected] = useState(false)
  const [garminConnected, setGarminConnected] = useState(false)
  const [googleFitConnected, setGoogleFitConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    checkPWAInstallation()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const checkPWAInstallation = () => {
    setIsPWAInstalled(window.matchMedia('(display-mode: standalone)').matches)
  }

  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault()
    setDeferredPrompt(e)
  }

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsPWAInstalled(true)
      }
      setDeferredPrompt(null)
    }
  }

  const connectAppleHealth = async () => {
    // Simulação de conexão com Apple Health
    // Em produção, usar Apple HealthKit
    setIsSyncing(true)
    setTimeout(() => {
      setAppleHealthConnected(true)
      setIsSyncing(false)
      alert('Apple Health conectado com sucesso!')
    }, 2000)
  }

  const syncAppleHealth = async () => {
    if (!appleHealthConnected) return
    setIsSyncing(true)
    
    // Simulação de sincronização
    setTimeout(() => {
      setIsSyncing(false)
      alert('Dados sincronizados com Apple Health:\n- Peso: 75kg\n- Passos: 10,000\n- Sono: 7h30min')
    }, 2000)
  }

  const exportToAppleHealth = async () => {
    if (!appleHealthConnected) return
    
    // Simulação de exportação de treino
    alert('Treino exportado para Apple Health como "Strength Training"')
  }

  const connectGarmin = async () => {
    // Simulação de conexão com Garmin Connect
    // Em produção, usar Garmin Connect API
    setIsSyncing(true)
    setTimeout(() => {
      setGarminConnected(true)
      setIsSyncing(false)
      alert('Garmin Connect conectado com sucesso!')
    }, 2000)
  }

  const connectGoogleFit = async () => {
    // Simulação de conexão com Google Fit
    // Em produção, usar Google Fit API
    setIsSyncing(true)
    setTimeout(() => {
      setGoogleFitConnected(true)
      setIsSyncing(false)
      alert('Google Fit conectado com sucesso!')
    }, 2000)
  }

  const readHeartRate = async () => {
    // Simulação de leitura de frequência cardíaca
    alert('Frequência cardíaca atual: 72 bpm')
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Integrações</h1>
          <p className="text-[var(--color-muted)]">Conecte com PWA, Apple Health e Wearables</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'pwa'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Smartphone size={20} />
            PWA
          </button>
          <button
            onClick={() => setActiveTab('apple-health')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'apple-health'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Heart size={20} />
            Apple Health
          </button>
          <button
            onClick={() => setActiveTab('wearables')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'wearables'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Watch size={20} />
            Wearables
          </button>
        </div>

        {activeTab === 'pwa' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Smartphone size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Progressive Web App</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Status da Instalação</h3>
                    {isPWAInstalled ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={20} />
                        <span className="text-sm">Instalado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <AlertTriangle size={20} />
                        <span className="text-sm">Não instalado</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">
                    {isPWAInstalled 
                      ? 'O app está instalado no seu dispositivo.'
                      : 'Instale o app para acesso offline e melhor experiência.'}
                  </p>
                </div>

                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <h3 className="font-semibold mb-2">Funcionalidades PWA</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span>Funcionamento offline com Service Worker</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span>Cache de dados do Firebase</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span>Ícone na tela inicial</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span>Push notifications (Web Push API)</span>
                    </li>
                  </ul>
                </div>

                {!isPWAInstalled && deferredPrompt && (
                  <Button onClick={installPWA} className="w-full">
                    <Smartphone size={20} className="mr-2" />
                    Instalar App
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'apple-health' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Heart size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Apple Health</h2>
              </div>

              <div className="space-y-4">
                {!appleHealthConnected ? (
                  <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
                    <Heart size={48} className="mx-auto mb-4 text-[var(--color-muted)]" />
                    <p className="text-[var(--color-muted)] mb-4">
                      Conecte com Apple Health para sincronizar seus dados de saúde.
                    </p>
                    <Button onClick={connectAppleHealth} disabled={isSyncing}>
                      {isSyncing ? 'Conectando...' : 'Conectar Apple Health'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={20} className="text-green-600" />
                        <h3 className="font-semibold text-green-700 dark:text-green-300">Conectado</h3>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Apple Health está conectado e sincronizado.
                      </p>
                    </div>

                    <div className="p-4 bg-[var(--color-border)] rounded-lg">
                      <h3 className="font-semibold mb-3">Dados Sincronizados</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Scale size={20} className="text-primary-600" />
                            <span>Peso</span>
                          </div>
                          <span className="text-sm text-[var(--color-muted)]">75 kg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity size={20} className="text-primary-600" />
                            <span>Passos</span>
                          </div>
                          <span className="text-sm text-[var(--color-muted)]">10,000</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Moon size={20} className="text-primary-600" />
                            <span>Sono</span>
                          </div>
                          <span className="text-sm text-[var(--color-muted)]">7h 30min</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={syncAppleHealth} disabled={isSyncing} className="flex-1">
                        {isSyncing ? 'Sincronizando...' : <><RefreshCw size={20} className="mr-2" />Sincronizar</>}
                      </Button>
                      <Button onClick={exportToAppleHealth} variant="outline" className="flex-1">
                        Exportar Treino
                      </Button>
                    </div>

                    <div className="p-4 bg-[var(--color-border)] rounded-lg">
                      <h3 className="font-semibold mb-2">Importar Dados Históricos</h3>
                      <p className="text-sm text-[var(--color-muted)] mb-3">
                        Importe dados históricos do Apple Health para preencher seu perfil.
                      </p>
                      <Button onClick={() => alert('Dados históricos importados!')} variant="outline" className="w-full">
                        Importar Histórico
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'wearables' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Watch size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Wearables</h2>
              </div>

              <div className="space-y-6">
                {/* Garmin Connect */}
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Watch size={24} className="text-primary-600" />
                      <div>
                        <h3 className="font-semibold">Garmin Connect</h3>
                        <p className="text-xs text-[var(--color-muted)]">Sincronize treinos e dados de saúde</p>
                      </div>
                    </div>
                    {garminConnected ? (
                      <CheckCircle size={24} className="text-green-600" />
                    ) : (
                      <XCircle size={24} className="text-[var(--color-muted)]" />
                    )}
                  </div>
                  
                  {!garminConnected ? (
                    <Button onClick={connectGarmin} disabled={isSyncing} className="w-full">
                      {isSyncing ? 'Conectando...' : 'Conectar Garmin'}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-[var(--color-muted)]">Garmin Connect conectado</p>
                      <Button onClick={readHeartRate} variant="outline" className="w-full">
                        <Heart size={20} className="mr-2" />
                        Ler Frequência Cardíaca
                      </Button>
                    </div>
                  )}
                </div>

                {/* Google Fit */}
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity size={24} className="text-primary-600" />
                      <div>
                        <h3 className="font-semibold">Google Fit</h3>
                        <p className="text-xs text-[var(--color-muted)]">Sincronize atividades e métricas</p>
                      </div>
                    </div>
                    {googleFitConnected ? (
                      <CheckCircle size={24} className="text-green-600" />
                    ) : (
                      <XCircle size={24} className="text-[var(--color-muted)]" />
                    )}
                  </div>
                  
                  {!googleFitConnected ? (
                    <Button onClick={connectGoogleFit} disabled={isSyncing} className="w-full">
                      {isSyncing ? 'Conectando...' : 'Conectar Google Fit'}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-[var(--color-muted)]">Google Fit conectado</p>
                      <Button onClick={readHeartRate} variant="outline" className="w-full">
                        <Heart size={20} className="mr-2" />
                        Ler Frequência Cardíaca
                      </Button>
                    </div>
                  )}
                </div>

                {/* Heart Rate Monitoring */}
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart size={24} className="text-primary-600" />
                    <h3 className="font-semibold">Monitoramento de Frequência Cardíaca</h3>
                  </div>
                  <p className="text-sm text-[var(--color-muted)] mb-3">
                    Leitura de frequência cardíaca durante treino (se disponível no wearable).
                  </p>
                  <Button onClick={readHeartRate} variant="outline" className="w-full">
                    <Heart size={20} className="mr-2" />
                    Ler Frequência Cardíaca Atual
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
  )
}

export default IntegrationsPage
