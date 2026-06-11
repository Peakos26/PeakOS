import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPendenciasDoDia } from '../services/pendenciesService'
import { useNavigate } from 'react-router-dom'

export const NotificationBell = () => {
  const { session } = useAuth()
  const [pendencies, setPendencies] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const fetchPendencies = async () => {
    if (!session?.tokenKey) return
    setLoading(true)
    try {
      const data = await getPendenciasDoDia(session.tokenKey)
      setPendencies(data)
    } catch (error) {
      console.error('Erro ao buscar pendências:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchPendencies()
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchPendencies, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [session])
  
  const totalPendentes = pendencies.length
  
  const handleItemClick = (rota) => {
    setIsOpen(false)
    navigate(rota)
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {totalPendentes > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalPendentes > 9 ? '9+' : totalPendentes}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Pendências de hoje
              </h3>
              <p className="text-xs text-gray-500">
                {totalPendentes} item(ns) para completar
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Carregando...</div>
              ) : pendencies.length === 0 ? (
                <div className="p-4 text-center text-green-500">
                  <span className="text-2xl">✅</span>
                  <p className="text-sm mt-1">Tudo em dia! Ótimo trabalho!</p>
                </div>
              ) : (
                pendencies.map(pendency => (
                  <button
                    key={pendency.id}
                    onClick={() => handleItemClick(pendency.rota)}
                    className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-center gap-3"
                  >
                    <span className="text-2xl">{pendency.icone}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {pendency.titulo}
                      </p>
                      <p className="text-xs text-gray-500">{pendency.descricao}</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                ))
              )}
            </div>
            
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={fetchPendencies}
                className="w-full text-center text-xs text-primary-500 py-1"
              >
                ↻ Atualizar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
