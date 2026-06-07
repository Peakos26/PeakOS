# PeakOS — Roadmap Completo

> Baseado nas features dos 3 maiores apps de fitness do mundo: MyFitnessPal, Hevy e Nike Training Club
> Implementar em sprints priorizados. Cada sprint é independente e deployável.

---

## ⚠️ REGRAS TÉCNICAS OBRIGATÓRIAS (nunca violar)

```
1. Firebase SDK v10 MODULAR — sempre import { ref, get, set, push, update } from 'firebase/database'
2. NUNCA usar database.ref().once() — sintaxe legada quebra tudo
3. vite.config.js SEMPRE com base: '/PeakOS/'
4. BrowserRouter com basename="/PeakOS" em AppRouter.jsx
5. Login por CELULAR — busca em gymai_requests, não por tokenKey
6. Features salvas em gymai_features/{tokenKey}, NÃO em gymai_admin_tokens
7. PIX key fixa: 14cc72c1-f0d5-4522-a745-3af6c31a13f1
8. Deploy: npm run deploy (Node v18+, nvm use 18)
9. Remote: https://github.com/Peakos26/PeakOS.git
```

---

## 🔴 SPRINT 0 — Bugs críticos (fazer PRIMEIRO)

### 0.1 — Login completo (AuthContext.jsx + LoginPage.jsx)
O fluxo atual está incompleto. Implementar:

```
STEP 1: Usuário digita celular
  → busca gymai_requests por celular
  → SE approved + tokenKey válido → login automático → home
  → SE pending → tela "Aguardando aprovação" + botão "Verificar"
  → SE não existe → STEP 2

STEP 2: Formulário com campo "Nome"
  → botão "Solicitar acesso"
  → cria gymai_requests/{req_timestamp_random} com status: "pending"
  → vai para tela "Aguardando aprovação"

TELA PENDENTE:
  → mensagem: "Solicitação enviada. Aguarde aprovação do administrador."
  → botão "Verificar aprovação" → re-busca gymai_requests
  → SE approved → login automático
```

### 0.2 — recordLogin() após login bem-sucedido
```js
// Gravar em gymai_logins/{loginId}
{
  tokenKey, nome,
  timestamp: Date.now(),
  date: new Date().toISOString(),
  userAgent: navigator.userAgent,
  browser: detectBrowser(),   // Chrome/Safari/Firefox/Edge
  device: detectDevice(),     // Mobile/Tablet/Desktop
  language: navigator.language,
  latitude: null,             // preencher se geolocation permitida
  longitude: null
}
```

### 0.3 — Features em gymai_features (não em gymai_admin_tokens)
```
Features GRATUITAS (price: 0) → botão "Ativar" → set gymai_features/{tk}/{featureId} = true
Features PAGAS (price > 0) → botão "Comprar" → modal PIX
  → grava gymai_purchases/{purchaseId}
  → exibe chave PIX: 14cc72c1-f0d5-4522-a745-3af6c31a13f1
  → Admin ativa manualmente: set gymai_features/{tk}/{featureId} = true
```

Features disponíveis:
```js
treinos_personalizados: R$6
dieta_personalizada:    R$6
cardio_suplementos:     R$6
analise_foto:           R$6
perfil_completo:        R$6
metas_diarias:          grátis
medidas_corporais:      grátis
jejum_sono:             grátis
apple_health:           grátis
```

### 0.4 — Performance Score (corrigir fórmula)
```
Cardio score  = min(100, passos_atuais / meta_passos × 100)
                [buscar de gymai_metas/{tokenKey}.passos]
Sono score    = min(100, horas_dormidas / meta_sono × 100)
                [buscar de gymai_jejum_sono/{tokenKey}.sonoHoras]
```

---

## 🟡 SPRINT 1 — Core de Treino (inspirado no Hevy)

### 1.1 — Log de Treino Avançado
- [ ] Warm-up sets, working sets, drop sets, failure sets (tag por série)
- [ ] Supersets (agrupar 2+ exercícios)
- [ ] Rest timer automático após cada série (configurável por exercício)
- [ ] Sugestão de carga baseada na última sessão (progressive overload)
- [ ] Contador de volume total em tempo real durante o treino

### 1.2 — Biblioteca de Exercícios
- [ ] 400+ exercícios com nome, grupo muscular, equipamento
- [ ] Demonstração em GIF/imagem por exercício
- [ ] Filtro por grupo muscular, equipamento, tipo
- [ ] Exercícios customizados criados pelo usuário
- [ ] Salvar em `gymai_exercicios_custom/{tokenKey}` 

### 1.3 — Estimativa de 1RM
- [ ] Calcular automaticamente após cada série (fórmula Epley: peso × (1 + reps/30))
- [ ] Gráfico histórico de 1RM por exercício
- [ ] Marcar PR (Personal Record) automaticamente com badge
- [ ] Salvar em `gymai_prs/{tokenKey}/{exercicio}` 

### 1.4 — Programas de Treino
- [ ] Planos pré-definidos: ABC, Push Pull Legs, Upper Lower, Full Body, 5x5
- [ ] Cada plano com semanas de progressão definidas
- [ ] Progressão automática de carga semana a semana
- [ ] Salvar programa ativo em `gymai_programa/{tokenKey}` 

### 1.5 — Analytics de Treino
- [ ] Heatmap de grupos musculares trabalhados (diagrama corpo humano)
- [ ] Volume por grupo muscular por semana
- [ ] Frequência de treino (dias/semana) histórico
- [ ] Gráfico de consistência (calendário de calor estilo GitHub)

---

## 🟡 SPRINT 2 — Nutrição e Dieta (inspirado no MyFitnessPal)

### 2.1 — Diário Alimentar
- [ ] Log de refeições por horário (café, almoço, lanche, jantar, ceia)
- [ ] Banco de alimentos brasileiro (500+ itens com macros)
- [ ] Scanner de código de barras (usar API Open Food Facts - gratuita)
- [ ] Calcular calorias + macros (proteína, carbo, gordura, fibra) por refeição
- [ ] Total diário vs metas
- [ ] Salvar em `gymai_diario_alimentar/{tokenKey}/{date}` 

### 2.2 — Planejador de Refeições
- [ ] Gerar plano semanal com IA baseado em objetivo + preferências
- [ ] 1.500+ receitas categorizadas por objetivo
- [ ] Lista de compras automática a partir do plano
- [ ] Salvar plano em `gymai_plano_refeicoes/{tokenKey}` 

### 2.3 — Macros Inteligentes
- [ ] Calcular TDEE (Total Daily Energy Expenditure) automático
- [ ] Metas de macros por dia (dias de treino vs descanso diferentes)
- [ ] Gráfico de macros em pizza (proteína / carbo / gordura)
- [ ] Alerta quando atingir meta calórica

### 2.4 — Hidratação
- [ ] Tracker de água com copos/ml
- [ ] Notificação de lembrete de hidratação (se PWA)
- [ ] Meta diária configurável
- [ ] Salvar em `gymai_hidratacao/{tokenKey}/{date}` 

### 2.5 — Log por Voz (diferencial IA)
- [ ] Usar Web Speech API (gratuita no Chrome/Safari)
- [ ] Usuário fala "comi 2 ovos e uma banana" → IA interpreta → sugere itens para confirmar
- [ ] Integração com Groq para parseamento de refeição

---

## 🟡 SPRINT 3 — Saúde Holística (inspirado no NTC)

### 3.1 — Módulo de Sono
- [ ] Registro de horário de dormir e acordar
- [ ] Qualidade do sono (1-5 estrelas)
- [ ] Gráfico histórico de sono
- [ ] Correlação sono × performance de treino
- [ ] Salvar em `gymai_sono/{tokenKey}/{date}` 

### 3.2 — Módulo de Recuperação
- [ ] Escala de fadiga muscular por grupo (1-10)
- [ ] Sugestão de treino baseada na recuperação
- [ ] Dias de descanso ativo (yoga, caminhada, mobilidade)
- [ ] Salvar em `gymai_recuperacao/{tokenKey}/{date}` 

### 3.3 — Módulo de Mindset
- [ ] Diário de humor diário (emoji scale)
- [ ] Registro de nível de estresse (1-10)
- [ ] Meditação guiada (texto + timer) com 5 opções
- [ ] Correlação humor × consistência de treino
- [ ] Salvar em `gymai_mindset/{tokenKey}/{date}` 

### 3.4 — Jejum Intermitente (melhorar o existente)
- [ ] Timer de jejum em tempo real (mostra quanto tempo falta)
- [ ] Histórico de janelas de jejum
- [ ] Modos: 12h, 14h, 16h, 18h, 5:2, OMAD
- [ ] Gráfico de consistência do jejum
- [ ] Salvar em `gymai_jejum/{tokenKey}` 

### 3.5 — Passos e Cardio
- [ ] Integração com Pedometer API do browser (se disponível)
- [ ] Log manual de cardio (tipo, duração, intensidade, calorias)
- [ ] Mapa de corrida/caminhada com Leaflet (rota gravada)
- [ ] Salvar em `gymai_cardio/{tokenKey}/{date}` 

---

## 🟢 SPRINT 4 — IA Avançada (diferencial competitivo)

### 4.1 — Coach IA Contextual (melhorar o existente)
- [ ] Histórico de conversa persistido (últimas 10 mensagens como contexto)
- [ ] Coach analisa treino do dia antes de responder
- [ ] Sugestões proativas: "Você não treina costas há 5 dias"
- [ ] Modo "Analisar minha semana" → relatório completo gerado pela IA
- [ ] Quick chips dinâmicos baseados no histórico do usuário

### 4.2 — Geração de Treino com IA (melhorar o existente)
- [ ] IA gera treino baseado em: objetivo + equipamento disponível + tempo disponível + histórico
- [ ] Ajuste automático de volume baseado na recuperação informada
- [ ] Sugestão de substituição de exercício se reportar dor
- [ ] Plano de 4-8 semanas com progressão automática

### 4.3 — Análise Nutricional por Foto
- [ ] Upload de foto da refeição → IA estima calorias e macros
- [ ] Usar Groq (llama-3.2-11b-vision-preview) para análise visual
- [ ] Confirmar ou ajustar estimativa manualmente
- [ ] Salvar análise em diário alimentar

### 4.4 — Insights Semanais Automáticos
- [ ] Todo domingo: IA gera resumo da semana automaticamente
- [ ] Comparação com semana anterior
- [ ] 3 pontos positivos + 2 áreas de melhoria
- [ ] Salvar em `gymai_insights/{tokenKey}/{weekId}` 

### 4.5 — Metas Inteligentes Dinâmicas (melhorar o existente)
- [ ] Reavaliação automática das metas a cada 4 semanas
- [ ] Metas adaptativas: se usuário supera meta 3x seguidas → IA sugere aumentar
- [ ] Notificação de progresso em direção às metas

---

## 🟢 SPRINT 5 — Gamificação e Social (inspirado no Hevy)

### 5.1 — Sistema de Conquistas (melhorar o existente)
- [ ] 30+ conquistas com ícones e descrições
- [ ] Conquistas por: volume, consistência, PRs, streaks, primeiros logs
- [ ] Notificação in-app ao desbloquear conquista
- [ ] Página de troféus com timeline de conquistas

### 5.2 — Níveis e XP (melhorar o existente)
- [ ] 10 níveis com nomes e ícones distintos
- [ ] XP ganho por: treino logado, check-in, meta atingida, streak mantida
- [ ] Barra de progresso para próximo nível na home
- [ ] Badge de nível visível no perfil

### 5.3 — Streaks e Consistência
- [ ] Streak de dias consecutivos de treino
- [ ] Streak de dias consecutivos de log alimentar
- [ ] Protetor de streak (1x por mês pode "salvar" streak perdida)
- [ ] Maior streak histórica registrada

### 5.4 — Desafios Semanais
- [ ] 3 desafios novos toda segunda-feira (gerados por IA)
- [ ] Exemplos: "Faça 100 séries essa semana", "Treine 5 dias seguidos"
- [ ] Progresso em barra visual
- [ ] XP dobrado ao completar desafio
- [ ] Salvar em `gymai_desafios/{tokenKey}` 

### 5.5 — Compartilhamento de Treino
- [ ] Gerar card visual do treino (canvas API)
- [ ] Compartilhar via Web Share API (WhatsApp, Instagram, etc.)
- [ ] Card com: exercícios, volume total, PR batidos, data

---

## 🟢 SPRINT 6 — Relatórios e Evolução

### 6.1 — Dashboard de Evolução (melhorar o existente)
- [ ] Gráfico de peso corporal ao longo do tempo
- [ ] Gráfico de medidas (cintura, braço, coxa) no tempo
- [ ] Gráfico de % gordura corporal (se scanner usado)
- [ ] Comparativo fotos (antes/depois lado a lado)

### 6.2 — Relatórios Avançados (melhorar o existente)
- [ ] Relatório semanal com gráficos reais (Chart.js)
- [ ] Relatório mensal com comparativo ao mês anterior
- [ ] Export PDF do relatório (usar jsPDF)
- [ ] Relatório de suplementação (o que usar, quando, por quanto tempo)

### 6.3 — Histórico Completo
- [ ] Timeline vertical com todos os eventos (treinos, check-ins, PRs, conquistas)
- [ ] Filtro por tipo de evento e período
- [ ] Busca por exercício no histórico
- [ ] Salvar/restaurar histórico completo

---

## 🔵 SPRINT 7 — Suplementação (feature exclusiva)

### 7.1 — Guia de Suplementos por Objetivo
- [ ] Banco de dados com 20+ suplementos principais
- [ ] Para cada suplemento: benefícios, dosagem, horário ideal, contraindicações
- [ ] Recomendação personalizada por objetivo do usuário
- [ ] Integração com plano alimentar (evitar duplicidade de nutrientes)

### 7.2 — Stack de Suplementos Personalizado
- [ ] Usuário monta sua "stack" atual
- [ ] IA avalia a stack e sugere ajustes
- [ ] Lembrete de tomar suplemento (horário configurável)
- [ ] Salvar em `gymai_suplementos/{tokenKey}` 

### 7.3 — Ciclo de Suplementação
- [ ] Planos de 4-12 semanas para cada objetivo
- [ ] Fase de carga / manutenção / off para creatina
- [ ] Calendário de suplementação visual
- [ ] Alertas de início/fim de ciclo

---

## 🔵 SPRINT 8 — PWA e Integrações

### 8.1 — PWA Completo
- [ ] manifest.json com ícones, cores, nome
- [ ] Service Worker para funcionamento offline
- [ ] Cache de dados do Firebase para uso offline
- [ ] Prompt de instalação "Adicionar à tela inicial"
- [ ] Push notifications (Web Push API)

### 8.2 — Apple Health (melhorar o existente)
- [ ] Sincronizar peso, passos, sono com Apple Health
- [ ] Importar dados históricos do Apple Health
- [ ] Exportar treinos para Apple Health como "Strength Training"

### 8.3 — Wearables
- [ ] Integração com Garmin Connect API
- [ ] Integração com Google Fit API
- [ ] Leitura de frequência cardíaca durante treino (se disponível)

---

## 📋 Ordem de Implementação Recomendada

```
SEMANA 1:  Sprint 0 (bugs críticos) — OBRIGATÓRIO
SEMANA 2:  Sprint 1.1 + 1.2 + 1.3 (log avançado + exercícios + 1RM)
SEMANA 3:  Sprint 1.4 + 1.5 (programas + analytics)
SEMANA 4:  Sprint 2.1 + 2.2 (diário alimentar + planejador)
SEMANA 5:  Sprint 2.3 + 2.4 + 2.5 (macros + hidratação + voz)
SEMANA 6:  Sprint 3 completo (sono + recuperação + mindset)
SEMANA 7:  Sprint 4.1 + 4.2 + 4.3 (IA avançada)
SEMANA 8:  Sprint 4.4 + 4.5 + Sprint 5 (insights + gamificação)
SEMANA 9:  Sprint 6 + 7 (relatórios + suplementação)
SEMANA 10: Sprint 8 (PWA + integrações)
```

---

## 🗄️ Novas coleções Firebase necessárias

```
gymai_exercicios_custom/{tokenKey}     Sprint 1.2
gymai_prs/{tokenKey}/{exercicio}       Sprint 1.3
gymai_programa/{tokenKey}              Sprint 1.4
gymai_diario_alimentar/{tokenKey}      Sprint 2.1
gymai_plano_refeicoes/{tokenKey}       Sprint 2.2
gymai_hidratacao/{tokenKey}            Sprint 2.4
gymai_sono/{tokenKey}                  Sprint 3.1
gymai_recuperacao/{tokenKey}           Sprint 3.2
gymai_mindset/{tokenKey}               Sprint 3.3
gymai_jejum/{tokenKey}                 Sprint 3.4 (renomear gymai_jejum_sono)
gymai_cardio/{tokenKey}                Sprint 3.5
gymai_insights/{tokenKey}              Sprint 4.4
gymai_desafios/{tokenKey}              Sprint 5.4
gymai_suplementos/{tokenKey}           Sprint 7.2
```

---

## 🏆 Diferenciais do PeakOS vs concorrentes

| Feature | MyFitnessPal | Hevy | NTC | PeakOS (objetivo) |
|---|---|---|---|---|
| Log de treino avançado | básico | ⭐ melhor | médio | ⭐ igual ao Hevy |
| Nutrição / dieta | ⭐ melhor | não tem | básico | ⭐ igual ao MFP |
| Treinos em vídeo | não | não | ⭐ melhor | texto + IA |
| Coach IA generativo | não | não | não | ⭐ EXCLUSIVO |
| Scanner corporal IA | não | não | não | ⭐ EXCLUSIVO |
| Suplementação guiada | básico | não | básico | ⭐ EXCLUSIVO |
| Gamificação | básico | médio | básico | ⭐ AVANÇADO |
| Preço | $80/ano | $30/ano | grátis | R$6/feature |

---

*Documento gerado em Junho/2026 — Helton Sales / PeakOS*
