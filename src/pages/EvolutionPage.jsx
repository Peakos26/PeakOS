import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { reportService } from '@services/reportService'

const EvolutionPage = () => {
  const { session } = useAuth()
  const [currentPage, setCurrentPage] = useState('evolucao')
  const [weeklyReport, setWeeklyReport] = useState(null)
  const [monthlyReport, setMonthlyReport] = useState(null)

  useEffect(() => {
    loadReports()
  }, [session])

  const loadReports = async () => {
    if (!session) return

    const weeklyResult = await reportService.generateWeeklyReport(session.tokenKey)
    if (weeklyResult.success) {
      setWeeklyReport(weeklyResult.data)
    }

    const monthlyResult = await reportService.generateMonthlyReport(session.tokenKey)
    if (monthlyResult.success) {
      setMonthlyReport(monthlyResult.data)
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Evolução</h1>

        {/* Relatório Semanal */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Relatório Semanal</h2>
          {weeklyReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Total de Séries</div>
                  <div className="text-2xl font-bold">{weeklyReport.totalSeries}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Volume Total</div>
                  <div className="text-2xl font-bold">{weeklyReport.totalVolume} kg</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Dias de Treino</div>
                  <div className="text-2xl font-bold">{weeklyReport.treinoDays.length}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Check-ins</div>
                  <div className="text-2xl font-bold">{weeklyReport.diasMarcados}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[var(--color-muted)]">Carregando...</p>
          )}
        </Card>

        {/* Relatório Mensal */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Relatório Mensal</h2>
          {monthlyReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Total de Séries</div>
                  <div className="text-2xl font-bold">{monthlyReport.totalSeries}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Volume Total</div>
                  <div className="text-2xl font-bold">{monthlyReport.totalVolume} kg</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Dias de Treino</div>
                  <div className="text-2xl font-bold">{monthlyReport.treinoDays.length}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Check-ins</div>
                  <div className="text-2xl font-bold">{monthlyReport.diasMarcados}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[var(--color-muted)]">Carregando...</p>
          )}
        </Card>

        {/* Medidas */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Medidas Atuais</h2>
          {monthlyReport?.medidas ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[var(--color-muted)]">Peso</div>
                <div className="text-xl font-bold">{monthlyReport.medidas.peso || 0} kg</div>
              </div>
              <div>
                <div className="text-sm text-[var(--color-muted)]">Altura</div>
                <div className="text-xl font-bold">{monthlyReport.medidas.altura || 0} cm</div>
              </div>
              <div>
                <div className="text-sm text-[var(--color-muted)]">Cintura</div>
                <div className="text-xl font-bold">{monthlyReport.medidas.cintura || 0} cm</div>
              </div>
              <div>
                <div className="text-sm text-[var(--color-muted)]">Peito</div>
                <div className="text-xl font-bold">{monthlyReport.medidas.peito || 0} cm</div>
              </div>
            </div>
          ) : (
            <p className="text-[var(--color-muted)]">Nenhuma medida registrada</p>
          )}
        </Card>
      </main>

      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default EvolutionPage
