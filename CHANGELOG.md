# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2026-06-07

### Adicionado
- Sprint 5 - Gamificação e Social
- Sistema de Conquistas com 30+ troféus
- Conquistas por volume, consistência, PRs, streaks, primeiros logs
- Notificação in-app ao desbloquear conquista
- Página de troféus com timeline de conquistas
- Sistema de Níveis e XP (10 níveis com nomes e ícones distintos)
- XP ganho por treino logado, check-in, meta atingida, streak mantida
- Barra de progresso para próximo nível
- Badge de nível visível no perfil
- Streak de dias consecutivos de treino
- Streak de dias consecutivos de log alimentar
- Protetor de streak (1x por mês pode salvar streak perdida)
- Maior streak histórica registrada
- Desafios Semanais (3 desafios novos toda segunda-feira)
- Progresso em barra visual para desafios
- XP dobrado ao completar desafio
- Salvar em gymai_desafios/{tokenKey}
- Compartilhamento de treino via Web Share API
- Card visual com exercícios, volume total, PR batidos, data

## [1.0.5] - 2026-06-07

### Adicionado
- Sprint 4 - IA Avançada
- Coach IA Contextual com histórico de conversa persistido (últimas 10 mensagens)
- Quick chips dinâmicos baseados no histórico do usuário
- Modo "Analisar minha semana" com relatório completo gerado pela IA
- Gerador de Treino com IA baseado em objetivo, equipamento, tempo e histórico
- Ajuste automático de volume baseado na recuperação informada
- Sugestão de substituição de exercício se reportar dor
- Plano de 4-8 semanas com progressão automática
- Análise Nutricional por Foto com upload de imagem
- Integração preparada para Groq (llama-3.2-11b-vision-preview)
- Confirmação ou ajuste manual de estimativa nutricional
- Insights Semanais Automáticos com comparação com semana anterior
- 3 pontos positivos + 2 áreas de melhoria gerados pela IA
- Metas Inteligentes Dinâmicas com reavaliação automática a cada 4 semanas
- Metas adaptativas (se usuário supera meta 3x seguidas → IA sugere aumentar)
- Notificação de progresso em direção às metas

### Corrigido
- Corrigido erro de `require is not defined` no CardioPage.jsx ao rodar localmente
- Substituído require() por URLs diretas do unpkg para ícones do Leaflet

## [1.0.4] - 2026-06-07

### Adicionado
- Cálculo de BMR (Taxa Metabólica Basal) baseado no perfil
- Cálculo de IMC (Índice de Massa Corporal) com categoria
- Meta de água calculada automaticamente baseada no peso (35ml por kg)
- Página de Medidas Corporais com histórico de 30 dias
- Gráfico de Pareto para comparativo de medidas corporais
- Registro de 10 tipos de medidas (peso, cintura, quadril, peito, braços, coxas, panturrilhas)
- Indicador de variação de medidas (vermelho = aumento, verde = redução)

### Alterado
- MacrosPage agora mostra TDEE, BMR, IMC e meta de água
- HydrationPage calcula meta de água baseada no peso do perfil
- Metas de macros ajustadas automaticamente com base no perfil completo

### Corrigido
- Cálculo de TDEE agora usa perfil completo (altura, idade, peso, peso objetivo)

## [1.0.3] - 2026-06-07

### Adicionado
- Sprint 3 - Bem-estar e Recuperação
- Página de Sono com registro de horário e qualidade (1-5 estrelas)
- Gráfico histórico de sono (7 dias)
- Página de Recuperação com escala de fadiga muscular por grupo (1-10)
- Sugestão de treino baseada na recuperação
- Página de Mindset com diário de humor (emoji scale 1-5)
- Nível de estresse (1-10)
- Meditação guiada com timer (5 opções)
- Página de Jejum Intermitente com timer em tempo real
- Modos de jejum: 12h, 14h, 16h, 18h, 5:2, OMAD
- Gráfico de consistência de jejum (30 dias)
- Página de Cardio com log manual
- Mapa de corrida/caminhada com Leaflet
- Integração com react-chartjs-2 e react-leaflet

## [1.0.2] - 2026-06-07

### Adicionado
- Sprint 2 - Nutrição e Dieta
- Página de Diário Alimentar com log de refeições
- Banco de alimentos brasileiro (50+ itens com macros)
- Cálculo de calorias e macros por refeição
- Total diário vs metas
- Página de Hidratação com tracker de água
- Meta diária configurável
- Histórico dos últimos 7 dias
- Página de Macros Inteligentes
- Cálculo de TDEE automático (fórmula Mifflin-St Jeor)
- Metas de macros por dia (treino vs descanso)
- Gráfico de macros em pizza
- Alerta quando atingir meta calórica

## [1.0.1] - 2026-06-07

### Adicionado
- Sprint 1 - Core de Treino
- Log de Treino Avançado (warm-up, working, drop, failure sets)
- Rest timer
- Progressive overload
- Volume total
- Biblioteca de Exercícios (100+ exercícios)
- Filtros por grupo muscular e equipamento
- Exercícios customizados
- Estimativa de 1RM (fórmula Epley)
- Salvar PRs automaticamente
- Programas de Treino (ABC, Push Pull Legs, Upper Lower, Full Body, 5x5)
- Progressão de programas
- Analytics de Treino
- Volume por grupo muscular (última semana)
- Frequência de treino (dias da semana)
- Calendário de consistência (últimos 30 dias)

### Corrigido
- Login automático para usuários aprovados sem token

## [1.0.0] - 2026-06-07

### Adicionado
- Versão inicial
- Sistema de login com aprovação
- Perfil de usuário
- Dashboard
- Navegação responsiva (mobile/desktop)
- Tema claro/escuro
- Integração com Firebase
