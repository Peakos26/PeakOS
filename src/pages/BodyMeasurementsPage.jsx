import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Ruler, TrendingUp, Plus, Trash2 } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const measurementTypes = [
  { id: 'peso', label: 'Peso (kg)', unit: 'kg' },
  { id: 'cintura', label: 'Cintura (cm)', unit: 'cm' },
  { id: 'quadril', label: 'Quadril (cm)', unit: 'cm' },
  { id: 'peito', label: 'Peito (cm)', unit: 'cm' },
  { id: 'braco_direito', label: 'Braço Direito (cm)', unit: 'cm' },
  { id: 'braco_esquerdo', label: 'Braço Esquerdo (cm)', unit: 'cm' },
  { id: 'coxa_direita', label: 'Coxa Direita (cm)', unit: 'cm' },
  { id: 'coxa_esquerda', label: 'Coxa Esquerda (cm)', unit: 'cm' },
  { id: 'panturrilha_direita', label: 'Panturrilha Direita (cm)', unit: 'cm' },
  { id: 'panturrilha_esquerda', label: 'Panturrilha Esquerda (cm)', unit: 'cm' },
]

const BodyMeasurementsPage = () => {
  const { session } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [measurements, setMeasurements] = useState({})
  const [history, setHistory] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMeasurement, setNewMeasurement] = useState({ type: '', value: '' })

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadMeasurements()
    loadHistory()
  }, [selectedDate, session])

  const loadMeasurements = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_medidas/${encodedKey}/${selectedDate}`))
      const data = snapshot.val()
      if (data) {
        setMeasurements(data)
      } else {
        setMeasurements({})
      }
    } catch (error) {
      console.error('Erro ao carregar medidas:', error)
    }
  }

  const loadHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_medidas/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([date, entry]) => ({
            date,
            measurements: entry
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-30)
        
        setHistory(historyArray)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }

  const saveMeasurements = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_medidas/${encodedKey}/${selectedDate}`), {
        ...measurements,
        timestamp: Date.now()
      })
      
      loadHistory()
    } catch (error) {
      console.error('Erro ao salvar medidas:', error)
    }
  }

  const addMeasurement = async () => {
    if (!session?.tokenKey || !newMeasurement.type || !newMeasurement.value) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const updatedMeasurements = {
        ...measurements,
        [newMeasurement.type]: Number(newMeasurement.value)
      }
      
      await set(ref(database, `gymai_medidas/${encodedKey}/${selectedDate}`), {
        ...updatedMeasurements,
        timestamp: Date.now()
      })
      
      setMeasurements(updatedMeasurements)
      setNewMeasurement({ type: '', value: '' })
      setShowAddForm(false)
      loadHistory()
    } catch (error) {
      console.error('Erro ao adicionar medida:', error)
    }
  }

  const deleteMeasurement = async (type) => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const updatedMeasurements = { ...measurements }
      delete updatedMeasurements[type]
      
      await set(ref(database, `gymai_medidas/${encodedKey}/${selectedDate}`), {
        ...updatedMeasurements,
        timestamp: Date.now()
      })
      
      setMeasurements(updatedMeasurements)
    } catch (error) {
      console.error('Erro ao remover medida:', error)
    }
  }

  const calculateChange = (type) => {
    if (history.length < 2) return 0
    
    const latest = history[history.length - 1].measurements[type]
    const previous = history[history.length - 2].measurements[type]
    
    if (!latest || !previous) return 0
    
    const change = latest - previous
    return change.toFixed(1)
  }

  const getChangeColor = (type) => {
    const change = calculateChange(type)
    if (change > 0) return 'text-red-500'
    if (change < 0) return 'text-green-500'
    return 'text-gray-500'
  }

  // Preparar dados para o gráfico de Pareto
  const chartData = {
    labels: measurementTypes.map(m => m.label),
    datasets: [
      {
        label: 'Medida Atual',
        data: measurementTypes.map(m => measurements[m.id] || 0),
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 1,
      },
      {
        label: 'Medida Anterior',
        data: measurementTypes.map(m => {
          if (history.length >= 2) {
            return history[history.length - 2].measurements[m.id] || 0
          }
          return 0
        }),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Medidas Corporais</h1>
        <p className="text-[var(--color-muted)]">Acompanhe sua evolução corporal</p>
      </div>

      {/* Seleção de data */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:max-w-xs p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
          />
          <Button onClick={() => setShowAddForm(!showAddForm)} className="ml-4">
            {showAddForm ? <Trash2 size={20} /> : <Plus size={20} />}
          </Button>
        </div>

        {showAddForm && (
          <div className="mt-4 p-4 bg-[var(--color-border)] rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Medida</label>
              <select
                value={newMeasurement.type}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, type: e.target.value })}
                className="w-full p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
              >
                <option value="">Selecione...</option>
                {measurementTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valor</label>
              <Input
                type="number"
                value={newMeasurement.value}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, value: e.target.value })}
                placeholder="Digite o valor"
              />
            </div>
            <Button onClick={addMeasurement} className="w-full">
              Adicionar Medida
            </Button>
          </div>
        )}
      </Card>

      {/* Medidas atuais */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Ruler size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">Medidas Atuais</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {measurementTypes.map((type) => (
            <div
              key={type.id}
              className="p-4 bg-[var(--color-border)] rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{type.label}</div>
                {measurements[type.id] && (
                  <div className={`text-sm ${getChangeColor(type.id)}`}>
                    {calculateChange(type.id) > 0 ? '+' : ''}{calculateChange(type.id)} {type.unit}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">
                  {measurements[type.id] || '-'}
                </div>
                {measurements[type.id] && (
                  <button
                    onClick={() => deleteMeasurement(type.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={saveMeasurements} className="w-full mt-4">
          Salvar Medidas
        </Button>
      </Card>

      {/* Gráfico de Pareto */}
      {Object.keys(measurements).length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-primary-600" />
            <h2 className="text-xl font-bold">Comparativo (Pareto)</h2>
          </div>
          <Bar data={chartData} options={chartOptions} />
        </Card>
      )}

      {/* Histórico */}
      {history.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Histórico (30 dias)</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.slice().reverse().map((entry, index) => (
              <div
                key={index}
                className="p-3 bg-[var(--color-border)] rounded-lg"
              >
                <div className="font-medium mb-2">
                  {new Date(entry.date).toLocaleDateString('pt-BR')}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {Object.entries(entry.measurements).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-[var(--color-muted)]">
                        {measurementTypes.find(m => m.id === key)?.label || key}:
                      </span>{' '}
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default BodyMeasurementsPage
