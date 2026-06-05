import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'

const CoachAvancadoPage = () => {
  const { session, hasFeature } = useAuth()

  const [activeTab, setActiveTab] = useState('dicas')

  const tabs = [
    { id: 'dicas', name: 'Dicas', icon: '💡' },
    { id: 'videos', name: 'Vídeos', icon: '🎬' },
    { id: 'suplementos', name: 'Suplementos', icon: '💊' },
    { id: 'alimentacao', name: 'Alimentação', icon: '🥗' },
    { id: 'sono', name: 'Sono', icon: '😴' },
    { id: 'agua', name: 'Água', icon: '💧' },
    { id: 'jejum', name: 'Jejum', icon: '⏰' },
    { id: 'praticas', name: 'Práticas', icon: '🏋️' },
    { id: 'redes', name: 'Redes Sociais', icon: '📱' }
  ]

  const content = {
    dicas: [
      {
        title: 'Dica #1: Progressão de Carga',
        description: 'Aumente gradualmente o peso ou número de repetições a cada treino para estimular o crescimento muscular.',
        category: 'Treino'
      },
      {
        title: 'Dica #2: Descanso Adequado',
        description: 'Dormir 7-9 horas por noite é essencial para recuperação muscular e crescimento.',
        category: 'Recuperação'
      },
      {
        title: 'Dica #3: Proteína Pós-Treino',
        description: 'Consuma proteína dentro de 30 minutos após o treino para maximizar a síntese proteica.',
        category: 'Nutrição'
      },
      {
        title: 'Dica #4: Hidratação',
        description: 'Beba pelo menos 3-4 litros de água por dia para manter o corpo funcionando otimamente.',
        category: 'Saúde'
      },
      {
        title: 'Dica #5: Consistência',
        description: 'A consistência é mais importante que a intensidade. Treine regularmente mesmo nos dias difíceis.',
        category: 'Mentalidade'
      }
    ],
    videos: [
      {
        title: 'Como fazer Agachamento Corretamente',
        url: 'https://www.youtube.com/watch?v=gcNh17Ckjgg',
        description: 'Tutorial completo sobre a técnica correta do agachamento.',
        duration: '10 min'
      },
      {
        title: 'Supino Reto: Guia Completo',
        url: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
        description: 'Aprenda a técnica perfeita do supino reto.',
        duration: '8 min'
      },
      {
        title: 'Deadlift: Técnica e Segurança',
        url: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
        description: 'Como fazer o deadlift sem se machucar.',
        duration: '12 min'
      },
      {
        title: 'Alimentação para Ganho de Massa',
        url: 'https://www.youtube.com/watch?v=1F8xR0VtiEI',
        description: 'Guia nutricional para hipertrofia.',
        duration: '15 min'
      }
    ],
    suplementos: [
      {
        name: 'Creatina Monohidratada',
        description: 'Aumenta força, potência e volume muscular. Dose: 5g/dia.',
        category: 'Performance',
        timing: 'Pós-treino'
      },
      {
        name: 'Whey Protein',
        description: 'Proteína de rápida absorção para recuperação muscular. Dose: 30g pós-treino.',
        category: 'Proteína',
        timing: 'Pós-treino'
      },
      {
        name: 'BCAA',
        description: 'Aminoácidos de cadeia ramificada para recuperação. Dose: 10g durante o treino.',
        category: 'Recuperação',
        timing: 'Durante treino'
      },
      {
        name: 'Beta-Alanina',
        description: 'Reduz fadiga muscular e aumenta performance. Dose: 3-5g/dia.',
        category: 'Performance',
        timing: 'Pré-treino'
      },
      {
        name: 'Multivitamínico',
        description: 'Cobre deficiências nutricionais. Dose: 1x ao dia.',
        category: 'Saúde',
        timing: 'Com refeição'
      },
      {
        name: 'Ômega-3',
        description: 'Anti-inflamatório natural e saúde cardiovascular. Dose: 2-3g/dia.',
        category: 'Saúde',
        timing: 'Com refeição'
      }
    ],
    alimentacao: [
      {
        title: 'Proteínas',
        items: ['Frango', 'Peixe', 'Ovos', 'Carne vermelha', 'Tofu', 'Iogurte grego'],
        description: 'Consuma 1.6-2.2g de proteína por kg de peso corporal.'
      },
      {
        title: 'Carboidratos Complexos',
        items: ['Arroz integral', 'Batata doce', 'Aveia', 'Quinoa', 'Massa integral'],
        description: 'Principal fonte de energia para treinos intensos.'
      },
      {
        title: 'Gorduras Saudáveis',
        items: ['Abacate', 'Azeite de oliva', 'Nozes', 'Sementes', 'Peixe gordo'],
        description: 'Essenciais para produção hormonal e saúde cerebral.'
      },
      {
        title: 'Vegetais',
        items: ['Brócolis', 'Espinafre', 'Couve', 'Pimentão', 'Tomate'],
        description: 'Ricos em vitaminas, minerais e antioxidantes.'
      },
      {
        title: 'Frutas',
        items: ['Banana', 'Maçã', 'Berries', 'Laranja', 'Manga'],
        description: 'Carboidratos de rápida absorção e antioxidantes.'
      }
    ],
    sono: [
      {
        title: 'Duração Ideal',
        description: '7-9 horas de sono por noite para recuperação muscular e hormonal.'
      },
      {
        title: 'Horário Regular',
        description: 'Dormir e acordar no mesmo horário todos os dias regula o ciclo circadiano.'
      },
      {
        title: 'Ambiente Escuro',
        description: 'Mantenha o quarto escuro e silencioso para sono profundo.'
      },
      {
        title: 'Sem Telas',
        description: 'Evite telas 1-2 horas antes de dormir para melhorar qualidade do sono.'
      },
      {
        title: 'Temperatura',
        description: 'Mantenha o quarto entre 18-22°C para sono ideal.'
      },
      {
        title: 'Cafeína',
        description: 'Evite cafeína 6-8 horas antes de dormir.'
      }
    ],
    agua: [
      {
        title: 'Quantidade Diária',
        description: '3-4 litros por dia para homens ativos, 2-3 litros para mulheres.'
      },
      {
        title: 'Ao Acordar',
        description: 'Beba 500ml de água assim que acordar para reidratar o corpo.'
      },
      {
        title: 'Antes do Treino',
        description: '500ml 30 minutos antes do treino para hidratação prévia.'
      },
      {
        title: 'Durante o Treino',
        description: '200-300ml a cada 15-20 minutos durante o treino.'
      },
      {
        title: 'Pós-Treino',
        description: '500ml após o treino para repor líquidos perdidos.'
      },
      {
        title: 'Cor da Urina',
        description: 'Urina amarela clara indica boa hidratação. Amarela escuro indica desidratação.'
      }
    ],
    jejum: [
      {
        title: 'Jejum Intermitente 16/8',
        description: '16 horas de jejum, 8 horas de alimentação. Ex: 12h-20h alimentação, 20h-12h jejum.'
      },
      {
        title: 'Benefícios',
        description: 'Melhora sensibilidade à insulina, queima gordura, aumenta hormônio de crescimento.'
      },
      {
        title: 'Adaptação',
        description: 'Comece com 12/12 e aumente gradualmente para 16/8 ao longo de semanas.'
      },
      {
        title: 'Durante o Jejum',
        description: 'Água, café sem açúcar e chá são permitidos. Zero calorias.'
      },
      {
        title: 'Quebra de Jejum',
        description: 'Comece com proteína e gorduras, evite carboidratos simples na primeira refeição.'
      },
      {
        title: 'Não Para Todos',
        description: 'Não recomendado para grávidas, pessoas com distúrbios alimentares ou baixo peso.'
      }
    ],
    praticas: [
      {
        title: 'Treino de Força',
        description: '3-5x por semana, focando em progressão de carga e boa técnica.'
      },
      {
        title: 'Cardio',
        description: '2-3x por semana, 20-30 minutos, HIIT ou steady state conforme objetivo.'
      },
      {
        title: 'Flexibilidade',
        description: 'Alongamentos 3-4x por semana, 10-15 minutos por sessão.'
      },
      {
        title: 'Recuperação Ativa',
        description: 'Caminhadas leves nos dias de descanso para melhorar recuperação.'
      },
      {
        title: 'Meditação',
        description: '5-10 minutos diários para reduzir estresse e melhorar foco.'
      },
      {
        title: 'Registro de Progresso',
        description: 'Anote peso, medidas e performance semanalmente para acompanhar evolução.'
      }
    ],
    redes: [
      {
        name: 'Instagram',
        url: 'https://instagram.com/peakos',
        description: 'Dicas diárias, motivação e conteúdo educativo.',
        followers: '50k+'
      },
      {
        name: 'YouTube',
        url: 'https://youtube.com/@peakos',
        description: 'Tutoriais de exercícios, nutrição e lifestyle.',
        subscribers: '25k+'
      },
      {
        name: 'TikTok',
        url: 'https://tiktok.com/@peakos',
        description: 'Conteúdo rápido e educativo sobre fitness.',
        followers: '100k+'
      },
      {
        name: 'Twitter/X',
        url: 'https://twitter.com/peakos',
        description: 'Notícias, ciência e dicas rápidas.',
        followers: '15k+'
      },
      {
        name: 'Telegram',
        url: 'https://t.me/peakos',
        description: 'Comunidade exclusiva para membros.',
        members: '5k+'
      }
    ]
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dicas':
        return (
          <div className="space-y-4">
            {content.dicas.map((dica, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{dica.title}</h3>
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">{dica.category}</span>
                </div>
                <p className="text-sm text-[var(--color-muted)]">{dica.description}</p>
              </Card>
            ))}
          </div>
        )
      case 'videos':
        return (
          <div className="space-y-4">
            {content.videos.map((video, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{video.title}</h3>
                  <span className="text-xs text-[var(--color-muted)]">{video.duration}</span>
                </div>
                <p className="text-sm text-[var(--color-muted)] mb-3">{video.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(video.url, '_blank')}
                  className="w-full"
                >
                  Assistir no YouTube →
                </Button>
              </Card>
            ))}
          </div>
        )
      case 'suplementos':
        return (
          <div className="space-y-4">
            {content.suplementos.map((sup, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{sup.name}</h3>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{sup.category}</span>
                </div>
                <p className="text-sm text-[var(--color-muted)] mb-2">{sup.description}</p>
                <div className="text-xs text-[var(--color-muted)]">
                  <span className="font-medium">Momento:</span> {sup.timing}
                </div>
              </Card>
            ))}
          </div>
        )
      case 'alimentacao':
        return (
          <div className="space-y-4">
            {content.alimentacao.map((cat, index) => (
              <Card key={index} className="p-4">
                <h3 className="font-semibold mb-2">{cat.title}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {cat.items.map((item, i) => (
                    <span key={i} className="text-xs bg-[var(--color-border)] px-2 py-1 rounded-full">{item}</span>
                  ))}
                </div>
                <p className="text-sm text-[var(--color-muted)]">{cat.description}</p>
              </Card>
            ))}
          </div>
        )
      case 'sono':
      case 'agua':
      case 'jejum':
      case 'praticas':
        return (
          <div className="space-y-4">
            {content[activeTab].map((item, index) => (
              <Card key={index} className="p-4">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--color-muted)]">{item.description}</p>
              </Card>
            ))}
          </div>
        )
      case 'redes':
        return (
          <div className="space-y-4">
            {content.redes.map((rede, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{rede.name}</h3>
                  <span className="text-xs text-[var(--color-muted)]">{rede.followers || rede.members}</span>
                </div>
                <p className="text-sm text-[var(--color-muted)] mb-3">{rede.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(rede.url, '_blank')}
                  className="w-full"
                >
                  Acessar →
                </Button>
              </Card>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-2">Coach Avançado</h1>
        <p className="text-[var(--color-muted)] mb-6">Recomendações exclusivas para maximizar seus resultados</p>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-sm font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {renderContent()}
        </div>
      </main>

      <Navigation />
    </div>
  )
}

export default CoachAvancadoPage
