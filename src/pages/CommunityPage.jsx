import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import Card from '@components/ui/Card'
import { database, ref, get } from '@config/firebase.config'
import { Users, MapPin, Activity } from 'lucide-react'
import UserStatsModal from '@components/community/UserStatsModal'

const CommunityPage = () => {
  const { session } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadCommunityUsers()
  }, [session])

  const loadCommunityUsers = async () => {
    if (!session) return

    try {
      setLoading(true)
      const requestsRef = ref(database, 'gymai_requests')
      const snapshot = await get(requestsRef)
      
      if (snapshot.exists()) {
        const allUsers = snapshot.val()
        const approvedUsers = Object.entries(allUsers)
          .filter(([key, user]) => user.status === 'approved' && key !== session.tokenKey)
          .map(([key, user]) => ({
            key,
            nome: user.nome || 'Usuário',
            celular: user.celular,
            cidade: user.cidade || ''
          }))
          .sort((a, b) => a.nome.localeCompare(b.nome))
        
        setUsers(approvedUsers)
      }
    } catch (error) {
      console.error('Erro ao carregar comunidade:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (user) => {
    setSelectedUser(user)
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Users size={28} className="text-primary-600" />
        <h1 className="text-2xl font-bold font-display">Comunidade PeakOS</h1>
      </div>

      <Card className="mb-6">
        <p className="text-[var(--color-muted)]">
          Conecte-se com outros usuários do PeakOS que já foram aprovados na plataforma.
        </p>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-[var(--color-muted)]">
          Carregando comunidade...
        </div>
      ) : users.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-[var(--color-muted)]">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário encontrado na comunidade</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card 
              key={user.key} 
              className="hover:border-primary-500/50 transition-colors cursor-pointer"
              onClick={() => handleUserClick(user)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{user.nome}</h3>
                    {user.cidade && (
                      <div className="flex items-center gap-1 text-sm text-[var(--color-muted)]">
                        <MapPin size={14} />
                        <span>{user.cidade}</span>
                      </div>
                    )}
                  </div>
                  <Activity size={20} className="text-primary-600" />
                </div>
                
                <div className="text-sm text-[var(--color-muted)]">
                  Clique para ver resumo do dia
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>

    {selectedUser && (
      <UserStatsModal
        userKey={selectedUser.key}
        userName={selectedUser.nome}
        onClose={() => setSelectedUser(null)}
      />
    )}
  </>
  )
}

export default CommunityPage
