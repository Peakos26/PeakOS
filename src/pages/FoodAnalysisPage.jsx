import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Camera, Upload, Check, X, Utensils, Zap } from 'lucide-react'

const FoodAnalysisPage = () => {
  const { session } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [adjustedCalories, setAdjustedCalories] = useState('')
  const [adjustedProtein, setAdjustedProtein] = useState('')
  const [adjustedCarbs, setAdjustedCarbs] = useState('')
  const [adjustedFat, setAdjustedFat] = useState('')
  const [mealName, setMealName] = useState('')

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setAnalysisResult(null)
    }
  }

  const handleCameraCapture = async () => {
    try {
      // Criar um input file temporário com capture="environment" para abrir a câmera traseira
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          setSelectedFile(file)
          setPreviewUrl(URL.createObjectURL(file))
          setAnalysisResult(null)
        }
      }
      
      input.click()
    } catch (error) {
      console.error('Erro ao abrir câmera:', error)
      alert('Não foi possível acessar a câmera. Tente selecionar uma foto da galeria.')
    }
  }

  const analyzeFood = async () => {
    if (!selectedFile || !session?.tokenKey) return
    
    setIsAnalyzing(true)
    
    try {
      // Em produção, integrar com Groq API (llama-3.2-11b-vision-preview)
      // Por enquanto, usar análise simulada
      
      setTimeout(() => {
        const result = {
          calories: Math.floor(Math.random() * 500) + 200,
          protein: Math.floor(Math.random() * 40) + 15,
          carbs: Math.floor(Math.random() * 60) + 20,
          fat: Math.floor(Math.random() * 25) + 5,
          confidence: Math.floor(Math.random() * 20) + 75,
          detectedFoods: ['Arroz', 'Frango', 'Salada', 'Feijão'],
          mealType: detectMealType()
        }
        
        setAnalysisResult(result)
        setAdjustedCalories(result.calories.toString())
        setAdjustedProtein(result.protein.toString())
        setAdjustedCarbs(result.carbs.toString())
        setAdjustedFat(result.fat.toString())
        setMealName(generateMealName(result.detectedFoods))
        setIsAnalyzing(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao analisar alimento:', error)
      setIsAnalyzing(false)
    }
  }

  const detectMealType = () => {
    const hour = new Date().getHours()
    if (hour < 11) return 'Café da Manhã'
    if (hour < 14) return 'Almoço'
    if (hour < 18) return 'Lanche'
    return 'Jantar'
  }

  const generateMealName = (foods) => {
    return foods.join(', ')
  }

  const saveToFoodDiary = async () => {
    if (!session?.tokenKey || !analysisResult) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const today = new Date().toISOString().split('T')[0]
      
      const mealEntry = {
        id: Date.now(),
        name: mealName || 'Refeição Analisada',
        calories: parseInt(adjustedCalories) || analysisResult.calories,
        protein: parseInt(adjustedProtein) || analysisResult.protein,
        carbs: parseInt(adjustedCarbs) || analysisResult.carbs,
        fat: parseInt(adjustedFat) || analysisResult.fat,
        mealType: analysisResult.mealType,
        timestamp: Date.now(),
        image: previewUrl
      }
      
      const diaryRef = push(ref(database, `gymai_diario_alimentar/${encodedKey}/${today}`))
      await set(diaryRef, mealEntry)
      
      alert('Refeição salva no diário alimentar!')
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar no diário:', error)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setAnalysisResult(null)
    setAdjustedCalories('')
    setAdjustedProtein('')
    setAdjustedCarbs('')
    setAdjustedFat('')
    setMealName('')
  }

  const discardAnalysis = () => {
    setAnalysisResult(null)
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Análise Nutricional por Foto</h1>
          <p className="text-[var(--color-muted)]">Tire uma foto da sua refeição para estimar calorias e macros</p>
        </div>

        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <div className="text-center">
              {!previewUrl ? (
                <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8">
                  <Camera size={48} className="mx-auto mb-4 text-[var(--color-muted)]" />
                  <p className="text-[var(--color-muted)] mb-4">Arraste uma foto ou clique para selecionar</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleCameraCapture} className="flex-1">
                      <Camera size={20} className="mr-2" />
                      Tirar Foto
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="flex-1">
                      <Button variant="outline" as="span" className="w-full">
                        <Upload size={20} className="mr-2" />
                        Galeria
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-96 mx-auto rounded-lg"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={analyzeFood} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Analisando...' : 'Analisar'}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      <X size={20} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Analysis Result */}
          {analysisResult && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Resultado da Análise</h2>
                <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                  <Zap size={16} />
                  {analysisResult.confidence}% confiança
                </div>
              </div>

              {/* Detected Foods */}
              <div className="mb-4 p-4 bg-[var(--color-border)] rounded-lg">
                <h3 className="font-medium mb-2">Alimentos Detectados</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.detectedFoods.map((food, index) => (
                    <span key={index} className="text-sm bg-primary-100 text-primary-600 px-3 py-1 rounded-full">
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary-600">{analysisResult.calories}</div>
                  <div className="text-sm text-[var(--color-muted)]">Calorias</div>
                </div>
                <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{analysisResult.protein}g</div>
                  <div className="text-sm text-[var(--color-muted)]">Proteína</div>
                </div>
                <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisResult.carbs}g</div>
                  <div className="text-sm text-[var(--color-muted)]">Carboidratos</div>
                </div>
                <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{analysisResult.fat}g</div>
                  <div className="text-sm text-[var(--color-muted)]">Gorduras</div>
                </div>
              </div>

              {/* Adjustment Section */}
              <div className="space-y-4 mb-4">
                <h3 className="font-medium">Ajustar Estimativa (opcional)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Calorias</label>
                    <Input
                      type="number"
                      value={adjustedCalories}
                      onChange={(e) => setAdjustedCalories(e.target.value)}
                      placeholder={analysisResult.calories}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Proteína (g)</label>
                    <Input
                      type="number"
                      value={adjustedProtein}
                      onChange={(e) => setAdjustedProtein(e.target.value)}
                      placeholder={analysisResult.protein}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Carboidratos (g)</label>
                    <Input
                      type="number"
                      value={adjustedCarbs}
                      onChange={(e) => setAdjustedCarbs(e.target.value)}
                      placeholder={analysisResult.carbs}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gorduras (g)</label>
                    <Input
                      type="number"
                      value={adjustedFat}
                      onChange={(e) => setAdjustedFat(e.target.value)}
                      placeholder={analysisResult.fat}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Refeição</label>
                  <Input
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder={analysisResult.detectedFoods.join(', ')}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={saveToFoodDiary} className="flex-1">
                  <Check size={20} className="mr-2" />
                  Salvar no Diário
                </Button>
                <Button variant="outline" onClick={discardAnalysis}>
                  <X size={20} />
                </Button>
              </div>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <div className="flex items-start gap-3">
              <Utensils size={24} className="text-primary-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Como funciona</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  A IA analisa a foto da sua refeição e estima as calorias e macros. 
                  Você pode confirmar ou ajustar os valores antes de salvar no diário alimentar.
                  Em produção, usaremos o modelo llama-3.2-11b-vision-preview do Groq para análise visual.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
  )
}

export default FoodAnalysisPage
