import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { Pencil } from 'lucide-react'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { profileService } from '@services/profileService'

const ProfilePage = () => {
  const { session, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState('perfil')
  const [profile, setProfile] = useState({
    sexo: '',
    nascimento: '',
    peso: '',
    altura: '',
    pesoObjetivo: ''
  })
  const [medidas, setMedidas] = useState({
    cintura: '',
    peito: '',
    bracoEsq: '',
    bracoDir: '',
    coxaEsq: '',
    coxaDir: '',
    abdomen: ''
  })
  const [loading, setLoading] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [medidasSaved, setMedidasSaved] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingMedidas, setEditingMedidas] = useState(false)

  useEffect(() => {
    loadProfile()
    loadMedidas()
  }, [session])

  const loadProfile = async () => {
    if (!session) return
    const result = await profileService.getProfile(session.tokenKey)
    if (result.success && result.data) {
      setProfile(result.data)
      setProfileSaved(true)
    }
  }

  const loadMedidas = async () => {
    if (!session) return
    const result = await profileService.getMeasurements(session.tokenKey)
    if (result.success && result.data) {
      setMedidas(result.data)
      setMedidasSaved(true)
    }
  }

  const handleSaveProfile = async () => {
    if (!session) return
    setLoading(true)

    const result = await profileService.saveProfile(session.tokenKey, profile)
    if (result.success) {
      alert('Perfil salvo com sucesso!')
      setProfileSaved(true)
      setEditingProfile(false)
    } else {
      alert('Erro ao salvar perfil')
    }

    setLoading(false)
  }

  const handleSaveMedidas = async () => {
    if (!session) return
    setLoading(true)

    const result = await profileService.saveMeasurements(session.tokenKey, medidas)
    if (result.success) {
      alert('Medidas salvas com sucesso!')
      setMedidasSaved(true)
      setEditingMedidas(false)
    } else {
      alert('Erro ao salvar medidas')
    }

    setLoading(false)
  }

  const handleEditProfile = () => {
    setEditingProfile(true)
  }

  const handleEditMedidas = () => {
    setEditingMedidas(true)
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Perfil</h1>

        {/* Informações Pessoais */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sexo</label>
              <select
                value={profile.sexo}
                onChange={(e) => setProfile({ ...profile, sexo: e.target.value })}
                disabled={!editingProfile}
                className={`w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary-500 ${!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
              <Input
                type="date"
                id="nascimento"
                name="nascimento"
                value={profile.nascimento}
                onChange={(e) => setProfile({ ...profile, nascimento: e.target.value })}
                disabled={!editingProfile}
                className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Peso (kg)</label>
              <Input
                type="number"
                id="peso"
                name="peso"
                value={profile.peso}
                onChange={(e) => setProfile({ ...profile, peso: e.target.value })}
                disabled={!editingProfile}
                className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Altura (cm)</label>
              <Input
                type="number"
                id="altura"
                name="altura"
                value={profile.altura}
                onChange={(e) => setProfile({ ...profile, altura: e.target.value })}
                disabled={!editingProfile}
                className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Peso Objetivo (kg)</label>
              <Input
                type="number"
                id="pesoObjetivo"
                name="pesoObjetivo"
                value={profile.pesoObjetivo}
                onChange={(e) => setProfile({ ...profile, pesoObjetivo: e.target.value })}
                disabled={!editingProfile}
                className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <Button onClick={editingProfile ? handleSaveProfile : handleEditProfile} disabled={loading}>
              {loading ? 'Salvando...' : editingProfile ? 'Salvar Perfil' : (
                <span className="flex items-center gap-2">
                  <Pencil size={16} />
                  Editar Perfil
                </span>
              )}
            </Button>
          </div>
        </Card>

        {/* Medidas Corporais */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Medidas Corporais</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cintura (cm)</label>
              <Input
                type="number"
                id="cintura"
                name="cintura"
                value={medidas.cintura}
                onChange={(e) => setMedidas({ ...medidas, cintura: e.target.value })}
                disabled={!editingMedidas}
                className={!editingMedidas ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Peito (cm)</label>
              <Input
                type="number"
                id="peito"
                name="peito"
                value={medidas.peito}
                onChange={(e) => setMedidas({ ...medidas, peito: e.target.value })}
                disabled={!editingMedidas}
                className={!editingMedidas ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Braço Esquerdo (cm)</label>
              <Input
                type="number"
                id="bracoEsq"
                name="bracoEsq"
                value={medidas.bracoEsq}
                onChange={(e) => setMedidas({ ...medidas, bracoEsq: e.target.value })}
                disabled={!editingMedidas}
                className={!editingMedidas ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Braço Direito (cm)</label>
              <Input
                type="number"
                id="bracoDir"
                name="bracoDir"
                value={medidas.bracoDir}
                onChange={(e) => setMedidas({ ...medidas, bracoDir: e.target.value })}
                disabled={!editingMedidas}
                className={!editingMedidas ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Coxa Esquerda (cm)</label>
              <Input
                type="number"
                id="coxaEsq"
                name="coxaEsq"
                value={medidas.coxaEsq}
                onChange={(e) => setMedidas({ ...medidas, coxaEsq: e.target.value })}
                disabled={!editingMedidas}
                className={!editingMedidas ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Coxa Direita (cm)</label>
              <Input
                type="number"
                id="coxaDir"
                name="coxaDir"
                value={medidas.coxaDir}
                onChange={(e) => setMedidas({ ...medidas, coxaDir: e.target.value })}
                disabled={!editingMedidas}
                className={!editingMedidas ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Abdômen (cm)</label>
              <Input
                type="number"
                id="abdomen"
                name="abdomen"
                value={medidas.abdomen}
                onChange={(e) => setMedidas({ ...medidas, abdomen: e.target.value })}
                disabled={!editingMedidas}
                className={!editingMedidas ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
            <Button onClick={editingMedidas ? handleSaveMedidas : handleEditMedidas} disabled={loading}>
              {loading ? 'Salvando...' : editingMedidas ? 'Salvar Medidas' : (
                <span className="flex items-center gap-2">
                  <Pencil size={16} />
                  Editar Medidas
                </span>
              )}
            </Button>
          </div>
        </Card>

        {/* Sair */}
        <Button variant="outline" onClick={logout} className="w-full">
          Sair
        </Button>
      </main>

      <Navigation />
    </div>
  )
}

export default ProfilePage
