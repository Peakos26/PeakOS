# PeakOS — Fitness AI Platform

> Plataforma de fitness baseada em IA, com check-in por geolocalização, scanner corporal, performance score e integração com Apple Health / Garmin / Google Fit.

**URL de produção:** https://peakos26.github.io/PeakOS/

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
# Instalar dependências
npm install

# Desenvolvimento local
npm run dev

# Build + publicar no GitHub Pages
npm run deploy
```

> ⚠️ Requer Node.js v18+. Use `nvm use 18` se necessário.

**Configuração do GitHub Pages:**
- Branch: `gh-pages` 
- Folder: `/ (root)` 
- URL: `peakos26.github.io/PeakOS/` 

**Configuração do Vite (`vite.config.js`):**
```js
base: '/PeakOS/' // OBRIGATÓRIO — nunca remover
```

---

## 🔥 Firebase — Estrutura do Banco

> Projeto: `mygym-ebc54`  
> URL: `https://mygym-ebc54-default-rtdb.firebaseio.com` 

### ⚠️ REGRA CRÍTICA — SDK Modular v9

**NUNCA usar sintaxe legada.** O projeto usa Firebase SDK v10 (modular):

```js
// ❌ ERRADO — sintaxe legada (causa: "$.ref is not a function")
database.ref('path').once('value')
database.ref('path').push().set(data)

// ✅ CORRETO — sintaxe modular v9+
import { ref, get, set, push, update, remove } from 'firebase/database'
await get(ref(database, 'path'))
const newRef = push(ref(database, 'path'))
await set(newRef, data)
```

### Coleções (todas com prefixo `gymai_`)

| Coleção | Descrição |
|---|---|
| `gymai_admin_tokens/{tokenKey}` | Tokens de acesso dos usuários |
| `gymai_requests/{reqId}` | Solicitações de acesso (status: pending/approved) |
| `gymai_logins/{logId}` | Histórico de logins |
| `gymai_log/{tokenKey}/{logId}` | Logs de treino |
| `gymai_treinos/{tokenKey}` | Plano de treino ativo |
| `gymai_fichas/{tokenKey}/{sheetId}` | Fichas de treino |
| `gymai_dias_treino/{tokenKey}/{day}` | Check-ins diários |
| `gymai_medidas/{tokenKey}` | Medidas corporais |
| `gymai_metas/{tokenKey}` | Metas (sono, calorias, água, proteína) |
| `gymai_profile/{tokenKey}` | Perfil do usuário |
| `gymai_performance/{tokenKey}` | Histórico de performance score |
| `gymai_rewards/{tokenKey}` | XP, nível e conquistas |
| `gymai_body_scanner/{tokenKey}` | Análises corporais por foto |
| `gymai_timeline/{tokenKey}` | Timeline de fotos e medidas |
| `gymai_relatorios/{tokenKey}` | Relatórios gerados |
| `gymai_payments/{tokenKey}` | Histórico de pagamentos |

### Estrutura do token (`gymai_admin_tokens`)

```json
{
  "tk_xxxxxxxxxxxxxxx": {
    "celular": "11991634961",
    "nome": "Helton Sales",
    "createdAt": 1780668113981,
    "expiresAt": 1783260113981,
    "uses": 0,
    "plan": "free",
    "features": []
  }
}
```

### Estrutura de request (`gymai_requests`)

```json
{
  "req_xxxx": {
    "celular": "11991634961",
    "nome": "Helton Sales",
    "status": "approved",
    "createdAt": 1780668101474,
    "approvedAt": 1780668113981,
    "tokenKey": "tk_xxxxxxxxxxxxxxx"
  }
}
```

---

## 🔐 Fluxo de Autenticação

```
1. Usuário digita celular (com DDD) na LoginPage
2. AuthContext busca em gymai_requests pelo celular
3. Verifica status === 'approved'
4. Busca token em gymai_admin_tokens/{tokenKey}
5. Salva sessão no localStorage como 'gymai_session'
6. Redireciona para '/'
```

> ⚠️ Login é por **celular**, não por tokenKey diretamente.

---

## 📁 Estrutura do Projeto

```
src/
├── config/
│   └── firebase.config.js      # Configuração Firebase + export database
├── context/
│   ├── AuthContext.jsx          # Login por celular, sessão localStorage
│   ├── FirebaseContext.jsx      
│   └── ThemeContext.jsx         
├── components/
│   ├── layout/
│   │   ├── AppRouter.jsx        # Rotas protegidas
│   │   ├── Header.jsx           
│   │   └── Navigation.jsx       
│   └── ui/
│       ├── Button.jsx
│       ├── Card.jsx
│       └── Input.jsx
├── pages/
│   ├── LoginPage.jsx            # Login por celular
│   ├── HomePage.jsx             
│   ├── TrainingPage.jsx         
│   ├── EvolutionPage.jsx        
│   ├── ProfilePage.jsx          
│   ├── AIPage.jsx               # Chat com Groq API
│   └── AdminPage.jsx            
├── services/                    # Todos usam Firebase v9 modular
│   ├── authService.js
│   ├── trainingService.js
│   ├── profileService.js
│   ├── performanceService.js
│   ├── rewardsService.js
│   ├── timelineService.js
│   ├── reportService.js
│   ├── paymentService.js
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

## 🐛 Problemas conhecidos e soluções

### `$.ref is not a function` 
**Causa:** Sintaxe legada do Firebase sendo usada.  
**Fix:** Usar sempre `get(ref(database, path))` da SDK modular v9.

### `Token inválido` no login
**Causa:** Path errado no Firebase ou busca por tokenKey em vez de celular.  
**Fix:** Login busca por celular em `gymai_requests`, não por token diretamente.

### Assets 404 no GitHub Pages
**Causa:** `base` ausente ou errado no `vite.config.js`.  
**Fix:** Garantir `base: '/PeakOS/'` no `vite.config.js`.

### React Router 404 ao navegar
**Causa:** GitHub Pages não suporta SPA routing nativamente.  
**Fix:** `public/404.html` com script de redirect + script de restore no `index.html`.

### `history item skippable` 
**Causa:** `history.pushState()` chamado sem interação do usuário.  
**Fix:** Chamar pushState apenas em handlers de eventos do usuário.

---

## 📋 Checklist de Deploy

- [ ] `vite.config.js` tem `base: '/PeakOS/'` 
- [ ] Node.js v18+ ativo (`node -v`)
- [ ] Remote correto: `https://github.com/Peakos26/PeakOS.git` 
- [ ] `npm run deploy` retorna `Published` 
- [ ] Branch `gh-pages` atualizado no GitHub
- [ ] GitHub Pages configurado para branch `gh-pages` / `/ (root)` 

---

## 👤 Contato

Desenvolvido por **Helton Sales** — IT Manager / IT Analytics & Insights  
GitHub: [@Peakos26](https://github.com/Peakos26)
