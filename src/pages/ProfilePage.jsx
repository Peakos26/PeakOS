import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { profileService } from '@services/profileService'

const ProfilePage = () => {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    sexo: '',
    nascimento: '',
    peso: '',
    altura: '',
    pesoObjetivo: ''
  })
  const [loading, setLoading] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [session])

  const loadProfile = async () => {
    if (!session) return
    const result = await profileService.getProfile(session.tokenKey)
    if (result.success && result.data) {
      setProfile(result.data)
      setProfileSaved(true)
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

  const handleEditProfile = () => {
    setEditingProfile(true)
  }

  return (
      
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
      </main>
  )
}

export default ProfilePage
