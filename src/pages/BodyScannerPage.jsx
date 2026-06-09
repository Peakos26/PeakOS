import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

const BodyScannerPage = () => {
  const { session, hasFeature } = useAuth()
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [groqApiKey, setGroqApiKey] = useState('')

  useEffect(() => {
    loadGroqApiKey()
    loadAnalysisHistory()
  }, [session])

  const loadGroqApiKey = async () => {
    try {
      const snapshot = await get(ref(database, 'gymai_config/groq_api_key'))
      const data = snapshot.val()
      if (data) {
        setGroqApiKey(data)
      }
    } catch (error) {
      console.error('Erro ao carregar API key:', error)
    }
  }

  const loadAnalysisHistory = async () => {
    if (!session) return
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_body_scanner/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        setAnalysisHistory(Object.values(data).reverse())
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de análises:', error)
    }
  }

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedPhoto(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const analyzePhoto = async () => {
    if (!selectedPhoto || !groqApiKey) {
      if (!groqApiKey) {
        alert('Chave API Groq não configurada. Configure no portal admin (/admin)')
      }
      return
    }

    setAnalyzing(true)
    setAnalysisResult(null)

    try {
      // Converter imagem para base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Image = reader.result

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 1024,
            messages: [
              {
                role: 'system',
                content: `Você é um especialista em análise corporal. Analise a foto e forneça uma estimativa de composição corporal em formato JSON com as seguintes informações:
                - bodyFatPercentage: porcentagem de gordura corporal (número)
                - muscleMass: massa muscular estimada em kg (número)
                - observations: observações sobre a foto (texto)
                - recommendations: recomendações baseadas na análise (texto)
                
                Responda apenas com o JSON, sem texto adicional.`
              },
              {
                role: 'user',
                content: 'Analise esta foto de corpo e forneça a composição corporal estimada.'
              }
            ]
          })
        })

        const data = await response.json()
        const aiResponse = data.choices[0].message.content

        // Tentar parsear o JSON da resposta
        let analysisData
        try {
          analysisData = JSON.parse(aiResponse)
        } catch (e) {
          analysisData = {
            bodyFatPercentage: 0,
            muscleMass: 0,
            observations: aiResponse,
            recommendations: 'Continue com seus treinos e alimentação saudável.'
          }
        }

        const result = {
          id: Date.now(),
          imageUrl: base64Image,
          timestamp: Date.now(),
          ...analysisData
        }

        setAnalysisResult(result)

        // Salvar no Firebase
        const encodedKey = encodeTokenKey(session.tokenKey)
        await push(ref(database, `gymai_body_scanner/${encodedKey}`), result)
        
        // Atualizar histórico
        loadAnalysisHistory()
      }

      reader.readAsDataURL(selectedPhoto)
    } catch (error) {
      console.error('Erro ao analisar foto:', error)
      alert('Erro ao analisar foto')
    }

    setAnalyzing(false)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-2">Scanner Corporal IA</h1>
        <p className="text-[var(--color-muted)] mb-6">Análise de fotos para estimar composição corporal</p>

        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Nova Análise</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Selecione uma foto</label>
              <input
                type="file"
                id="photoInput"
                name="photoInput"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
              />
            </div>

            {previewUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Preview</label>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-w-md rounded-lg"
                />
              </div>
            )}

            <Button
              onClick={analyzePhoto}
              disabled={!selectedPhoto || analyzing}
              className="w-full"
            >
              {analyzing ? 'Analisando...' : 'Analisar Foto'}
            </Button>
          </div>
        </Card>

        {analysisResult && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Resultado da Análise</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <div className="text-sm text-[var(--color-muted)]">Gordura Corporal</div>
                  <div className="text-2xl font-bold">{analysisResult.bodyFatPercentage}%</div>
                </div>
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <div className="text-sm text-[var(--color-muted)]">Massa Muscular</div>
                  <div className="text-2xl font-bold">{analysisResult.muscleMass} kg</div>
                </div>
              </div>
              
              {analysisResult.observations && (
                <div>
                  <h3 className="font-semibold mb-2">Observações</h3>
                  <p className="text-sm text-[var(--color-muted)]">{analysisResult.observations}</p>
                </div>
              )}
              
              {analysisResult.recommendations && (
                <div>
                  <h3 className="font-semibold mb-2">Recomendações</h3>
                  <p className="text-sm text-[var(--color-muted)]">{analysisResult.recommendations}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {analysisHistory.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">Histórico de Análises</h2>
            <div className="space-y-4">
              {analysisHistory.map((analysis) => (
                <div key={analysis.id} className="p-4 bg-[var(--color-border)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{formatDate(analysis.timestamp)}</div>
                    <div className="text-sm text-[var(--color-muted)]">
                      {analysis.bodyFatPercentage}% BF | {analysis.muscleMass} kg MM
                    </div>
                  </div>
                  {analysis.observations && (
                    <p className="text-sm text-[var(--color-muted)]">{analysis.observations}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
  )
}

export default BodyScannerPage
