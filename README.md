# PeakOS - Fitness AI Platform

Plataforma de fitness baseada em IA, construída com React + Vite + Tailwind CSS e Firebase.

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite
- **UI Framework**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Chart.js + React Chart.js 2
- **Maps**: Leaflet + React Leaflet
- **Backend**: Firebase (Realtime Database, Functions)
- **IA**: Anthropic Claude API

## 📁 Estrutura do Projeto

```
peakos-react/
├── src/
│   ├── components/
│   │   ├── layout/       # Componentes de layout (Header, Navigation, Router)
│   │   ├── ui/           # Componentes reutilizáveis (Button, Card, Input)
│   │   └── features/     # Componentes específicos de features
│   ├── pages/           # Páginas principais
│   ├── hooks/           # Custom hooks
│   ├── services/         # Serviços (Model) - Integração com Firebase
│   ├── context/         # Contextos (ViewModel) - Estado global
│   ├── utils/           # Utilitários
│   ├── types/           # Tipos TypeScript
│   ├── assets/          # Imagens, fontes
│   ├── styles/          # Estilos globais
│   ├── config/          # Configurações
│   └── constants/       # Constantes
├── public/              # Arquivos estáticos
└── functions/           # Firebase Cloud Functions
```

## 🏗️ Arquitetura MVVM

- **Model**: Serviços em `src/services/` - Integração com Firebase
- **View**: Componentes em `src/components/` e `src/pages/` - Interface do usuário
- **ViewModel**: Contextos em `src/context/` - Lógica de negócio e estado

## 📦 Instalação

```bash
cd peakos-react
npm install
```

## 🔧 Configuração

1. Configure a chave da API da Anthropic no arquivo `.env`:
```env
VITE_ANTHROPIC_API_KEY=sua_chave_aqui
```

2. O Firebase já está configurado em `src/config/firebase.config.js`

## 🚀 Desenvolvimento

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🌐 Deploy no GitHub Pages

```bash
npm run deploy
```

## 📝 Funcionalidades

- ✅ Autenticação com tokens
- ✅ Log de treino
- ✅ Planos de treino personalizados
- ✅ Fichas de treino
- ✅ Check-in com geolocalização
- ✅ Scanner corporal com IA
- ✅ Metas inteligentes
- ✅ Performance score
- ✅ Relatórios de progresso
- ✅ IA Coach
- ✅ Temas Dark/Light/System
- ✅ Responsivo (mobile e desktop)

## 🔐 Firebase Rules

As regras do Firebase estão configuradas no arquivo `../gymai/database.rules.json`

## 📱 PWA

O projeto está configurado como PWA com suporte a instalação.

## 🎨 Temas

O projeto suporta 3 temas:
- **Light**: Tema claro
- **Dark**: Tema escuro
- **System**: Segue a preferência do sistema

## 📊 Monitoramento

O projeto integra com Firebase Analytics para monitoramento de uso.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT.
