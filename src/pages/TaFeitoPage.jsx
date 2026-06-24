import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import HeaderSummary from '@components/dashboard/HeaderSummary'
import WorkoutStory from '@components/workout/WorkoutStory'
import { database, ref, get } from '@config/firebase.config'

const TaFeitoPage = () => {
  const { session } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState(location.state?.workout || null)

  useEffect(() => {
    // Carregar último treino se não foi passado via state
    if (!workout && session) {
      loadLastWorkout()
    }
  }, [session])

  const loadLastWorkout = async () => {
    try {
      const encodedKey = session.tokenKey.replace(/[.#$\[\]]/g, '_')
      const logsRef = ref(database, `gymai_log/${encodedKey}`)
      const snapshot = await get(logsRef)
      
      if (snapshot.exists()) {
        const logs = snapshot.val()
        const logArray = Object.values(logs).flat()
        const lastLog = logArray[logArray.length - 1]
        setWorkout(lastLog)
      }
    } catch (error) {
      console.error('Erro ao carregar último treino:', error)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <HeaderSummary showActions={false} />
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="text-3xl font-bold font-display mb-2">Tá Feito!</h1>
        <p className="text-[#6e6e73]">Treino Concluído</p>
      </div>

      {/* Story do Treino */}
      <div className="mb-6">
        <WorkoutStory workout={workout} />
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/')}
        className="w-full bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white font-medium py-4 rounded-xl transition-colors"
      >
        Voltar ao Início
      </button>
    </main>
  )
}

export default TaFeitoPage
