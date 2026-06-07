# PeakOS — Fitness AI Platform

> Plataforma de fitness baseada em IA, com gamificação, suplementação, PWA e integrações com Apple Health / Garmin / Google Fit.

**URL de produção:** https://peakos26.github.io/PeakOS/

**Versão atual:** 1.0.10

---

## 🎯 Status das Sprints

### ✅ Sprints Completadas
- **Sprint 1** - Core de Treino (log avançado, biblioteca de exercícios, 1RM, programas, analytics)
- **Sprint 2** - Nutrição e Dieta (diário alimentar, macros, hidratação)
- **Sprint 3** - Saúde Holística (sono, recuperação, mindset, jejum, cardio)
- **Sprint 4** - IA Avançada (coach contextual, gerador de treino, análise nutricional por foto, insights semanais, metas inteligentes)
- **Sprint 5** - Gamificação e Social (conquistas, níveis e XP, streaks, desafios semanais, compartilhamento)
- **Sprint 6** - Relatórios e Evolução (dashboard, gráficos, timeline, relatórios avançados)
- **Sprint 7** - Suplementação (guia de suplementos, stack personalizada, ciclos)
- **Sprint 8** - PWA e Integrações (manifest.json, service worker, Apple Health, Garmin, Google Fit)

### 📊 Progresso Geral
- **8/8 sprints** completadas (100%)
- **Todas as features principais** implementadas
- **PWA funcional** com suporte offline
- **Integrações** com Apple Health, Garmin e Google Fit

---

## 🏗️ Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 5 |
| Estilo | Tailwind CSS |
| Roteamento | React Router DOM v6 |
| Backend / DB | Firebase Realtime Database |
| IA | Groq API (llama-3.3-70b-versatile) |
| Deploy | GitHub Pages via `gh-pages` |

---

## 🚀 Deploy

```bash
# Requer Node.js v18+ — use nvm use 18 se necessário
npm install
npm run dev       # desenvolvimento local
npm run deploy    # build + publicar no GitHub Pages
```

**Configuração do GitHub Pages:**
- Branch: `gh-pages` / Folder: `/ (root)`
- URL: `peakos26.github.io/PeakOS/`

**Configuração OBRIGATÓRIA do Vite (`vite.config.js`):**
```js
base: '/PeakOS/' // NUNCA remover — quebra todos os assets no GitHub Pages
```

**Remote Git correto:**
```bash
git remote set-url origin https://github.com/Peakos26/PeakOS.git
```

---

## 🔥 Firebase — Estrutura do Banco

> Projeto: `mygym-ebc54`
> URL: `https://mygym-ebc54-default-rtdb.firebaseio.com`

### ⚠️ REGRA CRÍTICA — SDK Modular v9

**NUNCA usar sintaxe legada.** Causa erro: `$.ref is not a function`

```js
// ❌ ERRADO — sintaxe legada
database.ref('path').once('value')
database.ref('path').push().set(data)

// ✅ CORRETO — sintaxe modular v9+
import { ref, get, set, push, update, remove } from 'firebase/database'
await get(ref(database, 'path'))
const newRef = push(ref(database, 'path'))
await set(newRef, data)
```

### Coleções Firebase (todas com prefixo `gymai_`)

| Coleção | Descrição |
|---|---|
| `gymai_admin_tokens/{tokenKey}` | Tokens de acesso dos usuários |
| `gymai_requests/{reqId}` | Solicitações de acesso (status: pending/approved/rejected) |
| `gymai_logins/{logId}` | Histórico de logins com geolocalização |
| `gymai_features/{tokenKey}` | Features ativas por usuário (boolean map) |
| `gymai_purchases/{purchaseId}` | Solicitações de compra de features |
| `gymai_log/{tokenKey}/{date}/{logId}` | Logs de treino diários |
| `gymai_treinos/{tokenKey}` | Plano de treino ativo |
| `gymai_fichas/{tokenKey}/{sheetId}` | Fichas de treino personalizadas |
| `gymai_dias_treino/{tokenKey}/{day}` | Check-ins diários com geolocalização |
| `gymai_medidas/{tokenKey}` | Medidas corporais |
| `gymai_metas/{tokenKey}` | Metas diárias (sono, calorias, água, proteína, passos) |
| `gymai_profile/{tokenKey}` | Perfil do usuário |
| `gymai_jejum_sono/{tokenKey}` | Configurações de jejum intermitente e sono |
| `gymai_dietas/{tokenKey}` | Plano alimentar ativo |
| `gymai_chat_sessions/{sessionId}` | Sessões de chat com IA (expiram em 5 min) |
| `gymai_chats/{chatId}` | Mensagens individuais do chat |
| `gymai_performance/{tokenKey}` | Histórico de performance score |
| `gymai_rewards/{tokenKey}` | XP, nível e conquistas |
| `gymai_body_scanner/{tokenKey}` | Análises corporais por foto |
| `gymai_timeline/{tokenKey}` | Timeline de fotos e medidas |
| `gymai_relatorios/{tokenKey}` | Relatórios gerados |
| `gymai_payments/{tokenKey}` | Histórico de pagamentos PIX |

### Estruturas de dados

**Token (`gymai_admin_tokens`):**
```json
{
  "tk_xxxxxxxxxxxxxxx": {
    "celular": "11991634961",
    "nome": "Helton Sales",
    "createdAt": 1780668113981,
    "expiresAt": 1783260113981,
    "uses": 0,
    "maxUses": null
  }
}
```

**Request (`gymai_requests`):**
```json
{
  "req_xxxx_xxxxxx": {
    "celular": "11991634961",
    "nome": "Helton Sales",
    "status": "approved",
    "createdAt": 1780668101474,
    "approvedAt": 1780668113981,
    "tokenKey": "tk_xxxxxxxxxxxxxxx"
  }
}
```

**Features (`gymai_features`):**
```json
{
  "tk_xxxxxxxxxxxxxxx": {
    "treinos_personalizados": true,
    "dieta_personalizada": true,
    "metas_diarias": true,
    "jejum_sono": true
  }
}
```

**Purchase (`gymai_purchases`):**
```json
{
  "purchase_xxxx_xxxxxx": {
    "featureId": "treinos_personalizados",
    "featureName": "Treinos Personalizados",
    "price": 6,
    "pixKey": "14cc72c1-f0d5-4522-a745-3af6c31a13f1",
    "status": "pending",
    "createdAt": 1780668113981,
    "tokenKey": "tk_xxxxxxxxxxxxxxx",
    "userName": "Helton Sales"
  }
}
```

---

## 🔐 Fluxo de Autenticação COMPLETO

### Passo 1 — Usuário digita celular
```
LoginPage → checkExistingUser(celular)
  → busca em gymai_requests por celular
  → SE approved + tokenKey:
      → validateToken(tokenKey) — verifica expiresAt e maxUses
      → autoLogin() → saveSession() → bootApp()
      → recordLogin() — grava geolocalização
  → SE pending:
      → showPendingScreen() — "Aguarde aprovação"
      → botão "Verificar aprovação" → checkApproval()
  → SE não existe:
      → step 2 — formulário com campo "Nome"
```

### Passo 2 — Novo cadastro
```
requestAccess(nome, celular)
  → cria gymai_requests/{reqId} com status: "pending"
  → showPendingScreen()
  → botão "Verificar aprovação" → polling manual
```

### Passo 3 — Aprovação pelo admin
```
Admin aprova no painel → gymai_requests/{reqId}.status = "approved"
Admin gera token → gymai_admin_tokens/{tokenKey}
Admin vincula → gymai_requests/{reqId}.tokenKey = tokenKey
```

### Passo 4 — Login automático após aprovação
```
checkApproval(celular) → re-verifica gymai_requests
  → SE approved + tokenKey válido → autoLogin() → bootApp()
```

### Sessão salva em localStorage
```js
localStorage.setItem('gymai_session', JSON.stringify({
  nome: 'Helton Sales',
  tokenKey: 'tk_xxxxxxxxxxxxxxx',
  createdAt: Date.now()
}))
```

---

## 💰 Sistema de Features Pagas

### Definição de features (hardcoded no frontend)

```js
const FEATURES = {
  treinos_personalizados: { id: 'treinos_personalizados', name: 'Treinos Personalizados', price: 6 },
  dieta_personalizada:    { id: 'dieta_personalizada',    name: 'Dieta Personalizada',    price: 6 },
  cardio_suplementos:     { id: 'cardio_suplementos',     name: 'Cardio e Suplementos',   price: 6 },
  analise_foto:           { id: 'analise_foto',           name: 'Análise de Foto',         price: 6 },
  perfil_completo:        { id: 'perfil_completo',        name: 'Perfil Completo',         price: 6 },
  // Features gratuitas (price: 0) — ativáveis pelo próprio usuário:
  metas_diarias:          { id: 'metas_diarias',          name: 'Metas Diárias',           price: 0 },
  apple_health:           { id: 'apple_health',           name: 'Integração Apple Health', price: 0 },
  medidas_corporais:      { id: 'medidas_corporais',      name: 'Medidas Corporais',       price: 0 },
  jejum_sono:             { id: 'jejum_sono',             name: 'Jejum e Sono',            price: 0 },
}
```

### Fluxo de features gratuitas
```
Usuário clica "Ativar" → activateFreeFeature(featureId)
  → set(ref(database, gymai_features/{tokenKey}/{featureId}), true)
```

### Fluxo de compra (features pagas)
```
Usuário clica "Comprar" → requestFeaturePurchase(featureId)
  → grava gymai_purchases/{purchaseId} com status: "pending"
  → exibe modal com chave PIX: "14cc72c1-f0d5-4522-a745-3af6c31a13f1"
  → exibe valor: R$ {price}
  → Admin confirma pagamento → ativa gymai_features/{tokenKey}/{featureId} = true
```

### ⚠️ REGRA: Features salvas em `gymai_features/{tokenKey}`, NÃO em `gymai_admin_tokens`

---

## 🤖 Performance Score — Fórmula

```
Score Total = (Treino × 30%) + (Sono × 20%) + (Nutrição × 20%) + (Cardio × 15%) + (Consistência × 15%)

Treino       = min(100, séries_hoje / meta_series × 100)
Sono         = min(100, horas_dormidas / meta_sono × 100)  [de gymai_jejum_sono]
Nutrição     = min(100, agua_atual / meta_agua × 100)      [de gymai_metas]
Cardio       = min(100, passos_atual / meta_passos × 100)  [de gymai_metas]
Consistência = min(100, dias_treino_semana / 5 × 100)
```

---

## 📊 Treinos por Objetivo (hardcoded)

Objetivos disponíveis: `massa`, `peso`, `tonificacao`, `gordura`, `performance`, `manutencao`, `caminhada`, `pedalada`

Cada objetivo gera um objeto com: `nome`, `descricao`, `duracao`, `descanso`, `intervalo`, `exercicios[]`

Cada exercício tem: `nome`, `series`, `repeticoes`, `descanso`

Treino gerado é salvo em: `gymai_treinos/{tokenKey}`

---

## 🍽️ Dietas por Objetivo (hardcoded)

Objetivos: `massa`, `peso`, `tonificacao`, `gordura`, `performance`, `manutencao`

Cada dieta tem: `nome`, `descricao`, `calorias`, `refeicoes[]`

Cada refeição tem: `horario`, `nome`, `alimentos[]`

Dieta gerada é salva em: `gymai_dietas/{tokenKey}`

---

## 💬 Chat IA — Regras

- Modelo: `llama-3.3-70b-versatile` via Groq API
- Sessão de chat salva em `gymai_chat_sessions/{sessionId}` — expira em 5 minutos de inatividade
- Mensagens individuais em `gymai_chats/{chatId}`
- Contexto enviado ao modelo inclui: séries hoje, volume, perfil, medidas, metas, jejum/sono
- Quick chips: "Monte um treino ABC", "Como aumentar supino?", "Dica de recuperação", "Analisa meu volume"

---

## 📍 Check-in com Geolocalização

```
Usuário clica no dia de hoje → salvarDiaTreino(dia)
  → navigator.geolocation.getCurrentPosition()
  → salva gymai_dias_treino/{tokenKey}/{dia} = { dia, timestamp, location }
  → salva gymai_logins com action: "checkin"
  → exibe modal de confirmação
  → exibe mapa Leaflet com localização
```

---

## 🔑 recordLogin() — Dados gravados no login

```js
{
  tokenKey, nome,
  timestamp, date, time,
  userAgent, browser, device,
  language, platform,
  latitude, longitude  // se permitido
}
// salvo em: gymai_logins/{loginId}
```

---

## 📁 Estrutura do Projeto

```
src/
├── config/
│   └── firebase.config.js        # initializeApp + export database
├── context/
│   ├── AuthContext.jsx            # Login por celular, sessão localStorage
│   ├── FirebaseContext.jsx
│   └── ThemeContext.jsx
├── components/
│   ├── layout/
│   │   ├── AppRouter.jsx          # Rotas protegidas
│   │   ├── Header.jsx
│   │   └── Navigation.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Card.jsx
│       └── Input.jsx
├── pages/
│   ├── LoginPage.jsx              # Step 1: celular | Step 2: nome | Pending screen
│   ├── HomePage.jsx               # Performance score + check-in + stats
│   ├── TrainingPage.jsx           # Fichas + log de treino (modo rápido e tradicional)
│   ├── EvolutionPage.jsx          # Gráficos de evolução por exercício
│   ├── ProfilePage.jsx            # Perfil + medidas + metas IA + treino/dieta por objetivo
│   ├── AIPage.jsx                 # Chat com Groq API
│   ├── AdminPage.jsx              # Painel admin
│   ├── BodyScannerPage.jsx        # Scanner corporal com IA
│   └── FeaturesPage.jsx           # Loja de features
├── services/                      # TODOS usam Firebase v9 modular
│   ├── authService.js             # validateToken, consumeTokenUse
│   ├── trainingService.js
│   ├── profileService.js
│   ├── performanceService.js
│   ├── rewardsService.js
│   ├── timelineService.js
│   ├── reportService.js
│   ├── paymentService.js          # PIX key fixa: 14cc72c1-f0d5-4522-a745-3af6c31a13f1
│   ├── bodyScannerService.js
│   └── healthService.js
├── constants/
│   └── trainingConstants.js
└── utils/
    └── cn.js
```

---

## ⚙️ Variáveis de Ambiente

```env
VITE_GROQ_API_KEY=sua_chave_groq
VITE_GARMIN_CLIENT_ID=sua_chave_garmin
VITE_GOOGLE_CLIENT_ID=sua_chave_google
```

---

## 🐛 Bugs conhecidos e soluções

| Erro | Causa | Fix |
|---|---|---|
| `$.ref is not a function` | Sintaxe legada Firebase | Usar `get(ref(database, path))` |
| `Token inválido` no login | Busca por tokenKey em vez de celular | Login busca celular em `gymai_requests` |
| Assets 404 GitHub Pages | `base` ausente no vite.config.js | `base: '/PeakOS/'` obrigatório |
| React Router 404 | GitHub Pages não suporta SPA | `public/404.html` + redirect no `index.html` |
| `history item skippable` | `pushState` sem interação | Chamar pushState só em event handlers |
| Features não ativam | Path errado | Features em `gymai_features/{tk}`, não em `gymai_admin_tokens` |

---

## 🚨 Gaps a implementar (pendentes)

### 1. LoginPage — Fluxo completo
- [ ] Step 2: campo "Nome" + botão "Solicitar cadastro"
- [ ] Tela "Solicitação enviada" com botão "Verificar aprovação"
- [ ] `checkApproval(celular)` — polling manual pelo usuário
- [ ] `recordLogin()` — gravar geolocalização + device info no login

### 2. Features
- [ ] `gymai_features/{tokenKey}` — coleção separada para features ativas
- [ ] Features gratuitas: botão "Ativar" → `activateFreeFeature()`
- [ ] Features pagas: modal PIX com chave fixa `14cc72c1-f0d5-4522-a745-3af6c31a13f1`
- [ ] Listener em tempo real em `gymai_features/{tokenKey}` para atualização automática

### 3. Coleções ausentes
- [ ] `gymai_jejum_sono/{tokenKey}` — jejum intermitente + horas de sono
- [ ] `gymai_dietas/{tokenKey}` — plano alimentar por objetivo
- [ ] `gymai_chat_sessions/{sessionId}` — sessões de chat com timeout 5min
- [ ] `gymai_purchases/{purchaseId}` — solicitações de compra PIX

### 4. Performance Score
- [ ] Cardio score = `passos / meta_passos` (de `gymai_metas`), não exercícios com nome "cardio"
- [ ] Sono score = dados de `gymai_jejum_sono`, não de `gymai_metas`

---

## 📋 Checklist de Deploy

- [ ] `vite.config.js` tem `base: '/PeakOS/'`
- [ ] Node.js v18+ ativo (`node -v`)
- [ ] Remote: `https://github.com/Peakos26/PeakOS.git` (`git remote -v`)
- [ ] `npm run deploy` retorna `Published`
- [ ] Branch `gh-pages` sem subpastas (`PeakOSV2/` deve estar ausente)
- [ ] GitHub Pages: branch `gh-pages` / folder `/ (root)`
- [ ] `.nojekyll` presente no `gh-pages`

---

## 👤 Projeto

Desenvolvido por **Helton Sales** — IT Manager / IT Analytics & Insights
GitHub: [@Peakos26](https://github.com/Peakos26)
