import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Plus, Trash2, Search, Camera, Utensils, Apple, Droplets, X } from 'lucide-react'

// Banco de alimentos brasileiro com macros (por 100g)
const FOOD_DATABASE = [
  // Proteínas
  { name: 'Ovo cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, category: 'proteina' },
  { name: 'Peito de frango grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, category: 'proteina' },
  { name: 'Carne bovina magra', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, category: 'proteina' },
  { name: 'Peixe branco (tilápia)', calories: 96, protein: 20, carbs: 0, fat: 1.7, fiber: 0, category: 'proteina' },
  { name: 'Salmão', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, category: 'proteina' },
  { name: 'Atum em água', calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0, category: 'proteina' },
  { name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, category: 'proteina' },
  { name: 'Grão de bico', calories: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 7.6, category: 'proteina' },
  { name: 'Lentilha', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, category: 'proteina' },
  { name: 'Feijão preto', calories: 132, protein: 8.9, carbs: 23, fat: 0.5, fiber: 8.7, category: 'proteina' },
  
  // Carboidratos
  { name: 'Arroz branco cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, category: 'carbo' },
  { name: 'Arroz integral cozido', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, category: 'carbo' },
  { name: 'Batata doce cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, category: 'carbo' },
  { name: 'Batata inglesa cozida', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 2.2, category: 'carbo' },
  { name: 'Pão francês', calories: 285, protein: 9, carbs: 50, fat: 4.5, fiber: 2.7, category: 'carbo' },
  { name: 'Pão integral', calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 6, category: 'carbo' },
  { name: 'Macarrão cozido', calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.5, category: 'carbo' },
  { name: 'Aveia cozida', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7, category: 'carbo' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, category: 'carbo' },
  { name: 'Maçã', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, category: 'carbo' },
  
  // Gorduras
  { name: 'Azeite de oliva', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, category: 'gordura' },
  { name: 'Abacate', calories: 160, protein: 2, carbs: 8.5, fat: 15, fiber: 6.7, category: 'gordura' },
  { name: 'Amendoim', calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, category: 'gordura' },
  { name: 'Castanha do Pará', calories: 659, protein: 14, carbs: 12, fat: 66, fiber: 7.5, category: 'gordura' },
  { name: 'Manteiga', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, category: 'gordura' },
  { name: 'Queijo minas', calories: 329, protein: 25, carbs: 3.6, fat: 25, fiber: 0, category: 'gordura' },
  { name: 'Iogurte natural', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, category: 'gordura' },
  
  // Vegetais
  { name: 'Alface', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, category: 'vegetal' },
  { name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, category: 'vegetal' },
  { name: 'Brócolis', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, category: 'vegetal' },
  { name: 'Cenoura', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, category: 'vegetal' },
  { name: 'Espinafre', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, category: 'vegetal' },
  { name: 'Pepino', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, category: 'vegetal' },
  
  // Frutas
  { name: 'Laranja', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, category: 'fruta' },
  { name: 'Manga', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, category: 'fruta' },
  { name: 'Morango', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, category: 'fruta' },
  { name: 'Uva', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, category: 'fruta' },
  { name: 'Melancia', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, category: 'fruta' },
  
  // Bebidas
  { name: 'Leite integral', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, category: 'bebida' },
  { name: 'Leite desnatado', calories: 35, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, category: 'bebida' },
  { name: 'Suco de laranja natural', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, fiber: 0.2, category: 'bebida' },
  { name: 'Café preto', calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, category: 'bebida' },
  { name: 'Água', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, category: 'bebida' },
]

const MEAL_TYPES = [
  { id: 'cafe', label: 'Café da Manhã', icon: '🌅' },
  { id: 'almoco', label: 'Almoço', icon: '☀️' },
  { id: 'lanche', label: 'Lanche', icon: '🍎' },
  { id: 'jantar', label: 'Jantar', icon: '🌙' },
  { id: 'ceia', label: 'Ceia', icon: '🌜' },
]

const FoodDiaryPage = () => {
  const { session } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMeal, setSelectedMeal] = useState('cafe')
  const [foodEntries, setFoodEntries] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [portionSize, setPortionSize] = useState(100)
  const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
  const [dailyGoals, setDailyGoals] = useState({ calories: 2000, protein: 150, carbs: 200, fat: 65, fiber: 25 })
  const [showAddFood, setShowAddFood] = useState(false)
  const [customFoodName, setCustomFoodName] = useState('')
  const [customFoodMacros, setCustomFoodMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadFoodDiary()
    loadDailyGoals()
  }, [selectedDate, session])

  const loadFoodDiary = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_diario_alimentar/${encodedKey}/${selectedDate}`))
      const data = snapshot.val()
      if (data) {
        setFoodEntries(data)
        calculateDailyTotals(data)
      } else {
        setFoodEntries({})
        setDailyTotals({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
      }
    } catch (error) {
      console.error('Erro ao carregar diário alimentar:', error)
    }
  }

  const loadDailyGoals = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
      const data = snapshot.val()
      if (data && data.macros) {
        setDailyGoals(data.macros)
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    }
  }

  const calculateDailyTotals = (entries) => {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    
    Object.values(entries).forEach(meal => {
      meal.forEach(food => {
        const multiplier = food.portion / 100
        totals.calories += food.calories * multiplier
        totals.protein += food.protein * multiplier
        totals.carbs += food.carbs * multiplier
        totals.fat += food.fat * multiplier
        totals.fiber += food.fiber * multiplier
      })
    })
    
    setDailyTotals(totals)
  }

  const addFoodToMeal = async () => {
    if (!selectedFood || !session?.tokenKey) return
    
    const multiplier = portionSize / 100
    const foodEntry = {
      ...selectedFood,
      portion: portionSize,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * multiplier * 10) / 10,
      fiber: Math.round(selectedFood.fiber * multiplier * 10) / 10,
      timestamp: Date.now()
    }
    
    const updatedEntries = { ...foodEntries }
    if (!updatedEntries[selectedMeal]) {
      updatedEntries[selectedMeal] = []
    }
    updatedEntries[selectedMeal].push(foodEntry)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_diario_alimentar/${encodedKey}/${selectedDate}`), updatedEntries)
      setFoodEntries(updatedEntries)
      calculateDailyTotals(updatedEntries)
      setSelectedFood(null)
      setPortionSize(100)
      setShowAddFood(false)
    } catch (error) {
      console.error('Erro ao salvar alimento:', error)
    }
  }

  const addCustomFood = async () => {
    if (!customFoodName || !session?.tokenKey) return
    
    const foodEntry = {
      name: customFoodName,
      calories: customFoodMacros.calories,
      protein: customFoodMacros.protein,
      carbs: customFoodMacros.carbs,
      fat: customFoodMacros.fat,
      fiber: customFoodMacros.fiber,
      portion: 100,
      category: 'custom',
      timestamp: Date.now()
    }
    
    const updatedEntries = { ...foodEntries }
    if (!updatedEntries[selectedMeal]) {
      updatedEntries[selectedMeal] = []
    }
    updatedEntries[selectedMeal].push(foodEntry)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_diario_alimentar/${encodedKey}/${selectedDate}`), updatedEntries)
      setFoodEntries(updatedEntries)
      calculateDailyTotals(updatedEntries)
      setCustomFoodName('')
      setCustomFoodMacros({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
      setShowAddFood(false)
    } catch (error) {
      console.error('Erro ao salvar alimento customizado:', error)
    }
  }

  const removeFoodFromMeal = async (mealId, foodIndex) => {
    const updatedEntries = { ...foodEntries }
    updatedEntries[mealId].splice(foodIndex, 1)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_diario_alimentar/${encodedKey}/${selectedDate}`), updatedEntries)
      setFoodEntries(updatedEntries)
      calculateDailyTotals(updatedEntries)
    } catch (error) {
      console.error('Erro ao remover alimento:', error)
    }
  }

  const filteredFoods = FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProgressColor = (current, goal) => {
    const percentage = (current / goal) * 100
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-yellow-500'
    if (percentage >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Diário Alimentar</h1>
        <p className="text-[var(--color-muted)]">Acompanhe sua nutrição diária</p>
      </div>

      {/* Seleção de data */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </Card>

      {/* Totais diários vs metas */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Totais Diários</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Calorias', current: dailyTotals.calories, goal: dailyGoals.calories, unit: 'kcal' },
            { label: 'Proteína', current: dailyTotals.protein, goal: dailyGoals.protein, unit: 'g' },
            { label: 'Carboidratos', current: dailyTotals.carbs, goal: dailyGoals.carbs, unit: 'g' },
            { label: 'Gorduras', current: dailyTotals.fat, goal: dailyGoals.fat, unit: 'g' },
            { label: 'Fibras', current: dailyTotals.fiber, goal: dailyGoals.fiber, unit: 'g' },
          ].map((macro) => (
            <div key={macro.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{macro.label}</span>
                <span>{macro.current} / {macro.goal} {macro.unit}</span>
              </div>
              <div className="w-full bg-[var(--color-border)] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(macro.current, macro.goal)}`}
                  style={{ width: `${Math.min((macro.current / macro.goal) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Seleção de refeição */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((meal) => (
            <button
              key={meal.id}
              onClick={() => setSelectedMeal(meal.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedMeal === meal.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
              }`}
            >
              {meal.icon} {meal.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Adicionar alimento */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Adicionar Alimento</h2>
          <Button onClick={() => setShowAddFood(!showAddFood)}>
            {showAddFood ? <X /> : <Plus />}
          </Button>
        </div>

        {showAddFood && (
          <div className="space-y-4">
            {/* Busca de alimentos */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)]" size={20} />
                <Input
                  type="text"
                  placeholder="Buscar alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lista de alimentos */}
            {searchTerm && filteredFoods.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredFoods.map((food, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedFood(food)
                      setSearchTerm('')
                    }}
                    className="p-3 bg-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-border)] transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{food.name}</span>
                      <span className="text-sm text-[var(--color-muted)]">{food.calories} kcal/100g</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alimento selecionado */}
            {selectedFood && (
              <div className="p-4 bg-[var(--color-border)] rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedFood.name}</span>
                  <button onClick={() => setSelectedFood(null)} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Porção (g)</label>
                  <Input
                    type="number"
                    value={portionSize}
                    onChange={(e) => setPortionSize(Number(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="grid grid-cols-5 gap-2 text-sm">
                  <div>
                    <span className="text-[var(--color-muted)]">Cal:</span>
                    <span className="font-medium">{Math.round(selectedFood.calories * (portionSize / 100))}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Prot:</span>
                    <span className="font-medium">{Math.round(selectedFood.protein * (portionSize / 100) * 10) / 10}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Carb:</span>
                    <span className="font-medium">{Math.round(selectedFood.carbs * (portionSize / 100) * 10) / 10}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Gord:</span>
                    <span className="font-medium">{Math.round(selectedFood.fat * (portionSize / 100) * 10) / 10}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Fibr:</span>
                    <span className="font-medium">{Math.round(selectedFood.fiber * (portionSize / 100) * 10) / 10}</span>
                  </div>
                </div>

                <Button onClick={addFoodToMeal} className="w-full">
                  Adicionar à Refeição
                </Button>
              </div>
            )}

            {/* Alimento customizado */}
            <div className="border-t border-[var(--color-border)] pt-4">
              <h3 className="font-medium mb-2">Alimento Customizado</h3>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nome do alimento"
                  value={customFoodName}
                  onChange={(e) => setCustomFoodName(e.target.value)}
                />
                <div className="grid grid-cols-5 gap-2">
                  <Input
                    type="number"
                    placeholder="Cal"
                    value={customFoodMacros.calories}
                    onChange={(e) => setCustomFoodMacros({ ...customFoodMacros, calories: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Prot"
                    value={customFoodMacros.protein}
                    onChange={(e) => setCustomFoodMacros({ ...customFoodMacros, protein: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Carb"
                    value={customFoodMacros.carbs}
                    onChange={(e) => setCustomFoodMacros({ ...customFoodMacros, carbs: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Gord"
                    value={customFoodMacros.fat}
                    onChange={(e) => setCustomFoodMacros({ ...customFoodMacros, fat: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Fibr"
                    value={customFoodMacros.fiber}
                    onChange={(e) => setCustomFoodMacros({ ...customFoodMacros, fiber: Number(e.target.value) })}
                  />
                </div>
                <Button onClick={addCustomFood} className="w-full" variant="outline">
                  Adicionar Customizado
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Lista de alimentos da refeição */}
      <Card>
        <h2 className="text-xl font-bold mb-4">
          {MEAL_TYPES.find(m => m.id === selectedMeal)?.label}
        </h2>
        
        {foodEntries[selectedMeal] && foodEntries[selectedMeal].length > 0 ? (
          <div className="space-y-2">
            {foodEntries[selectedMeal].map((food, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--color-border)] rounded-lg"
              >
                <div>
                  <span className="font-medium">{food.name}</span>
                  <span className="text-sm text-[var(--color-muted)] ml-2">{food.portion}g</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-[var(--color-muted)]">{food.calories} kcal</span>
                    <span className="ml-2 text-[var(--color-muted)]">P: {food.protein}g</span>
                    <span className="ml-2 text-[var(--color-muted)]">C: {food.carbs}g</span>
                    <span className="ml-2 text-[var(--color-muted)]">G: {food.fat}g</span>
                  </div>
                  <button
                    onClick={() => removeFoodFromMeal(selectedMeal, index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-muted)] text-center py-8">
            Nenhum alimento adicionado a esta refeição
          </p>
        )}
      </Card>
    </div>
  )
}

export default FoodDiaryPage
