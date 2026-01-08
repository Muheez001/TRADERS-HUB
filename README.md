# 🚀 Trader Hub - Anti-Gravity Trading Platform

A real-time trading intelligence platform with AI-powered market analysis, live crypto/forex prices, interactive TradingView charts, and community features.

![Trader Hub](screenshot.png)

## ✨ Features

### 📰 Real-Time Market Intelligence
- **Live News Feed** - Crypto news from NewsData.io with AI sentiment analysis
- **Gemini AI Insights** - Market impact predictions powered by Google Gemini

### 💰 Live Price Tracking
- **Cryptocurrencies** - 12 coins via CoinGecko (BTC, ETH, SOL, XRP, ADA, BNB, DOGE, AVAX, LINK, DOT, MATIC, ATOM)
- **Forex Pairs** - Major currency pairs (USD/JPY, EUR/USD, GBP/USD, etc.)
- **Commodities** - Real-time Gold, Silver, Oil prices via Yahoo Finance

### 📈 TradingView Charts
- **Interactive Charts** - Full TradingView widget integration
- **Multiple Categories** - Forex, Crypto, and Indices
- **Popular Pairs** - XAU/USD, GBP/USD, EUR/USD, BTC/USDT, and more

### 🎨 Premium UI
- **Dark/Light Mode** - Toggle with sun/moon icon
- **Anti-Gravity Design** - Floating cards, particle effects, smooth animations
- **Responsive** - Works on desktop and mobile

### 💬 Community Chat
- Real-time trading floor discussions via WebSocket

## 🛠 Tech Stack

| Frontend | Backend |
|----------|---------|
| React 18 + Vite | Node.js + Express |
| Tailwind CSS | Socket.io |
| Framer Motion | Google Gemini AI |
| Lucide Icons | NewsData.io / CoinGecko / Yahoo Finance |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/trader-hub.git
cd trader-hub

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Copy the example environment file and add your API keys:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your API keys:

```env
# Required
GEMINI_API_KEY=your_gemini_key
NEWSDATA_API_KEY=your_newsdata_key

# Optional (fallbacks)
NEWS_API_KEY=your_newsapi_key
COINMARKETCAP_API_KEY=your_cmc_key

# Server
PORT=3001
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
trader-hub/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── Navbar.jsx
│   │   │   ├── NewsFeed.jsx
│   │   │   ├── PriceGrid.jsx
│   │   │   ├── PriceTicker.jsx
│   │   │   ├── TradingViewChart.jsx
│   │   │   ├── ChatWidget.jsx
│   │   │   └── ParticleBackground.jsx
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── services/
│   │   ├── dataFetcher.js      # API integrations
│   │   └── aiAnalyst.js        # Gemini AI
│   ├── index.js                # Express + Socket.io
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/news` | GET | Fetch cached news |
| `/api/prices` | GET | All prices (crypto/forex/commodities) |
| `/api/prices/:type` | GET | Prices by type |

## 📡 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `initialData` | Server → Client | Initial news & prices |
| `newsUpdate` | Server → Client | New articles (every 5 min) |
| `priceUpdate` | Server → Client | Price changes (every 30 sec) |
| `chatMessage` | Bidirectional | Community messages |

## 🔑 Free API Keys

| Service | Free Tier | Get Key |
|---------|-----------|---------|
| NewsData.io | 200 req/day | [newsdata.io](https://newsdata.io) |
| Google Gemini | Free tier | [aistudio.google.com](https://aistudio.google.com) |
| CoinGecko | Unlimited (rate-limited) | No key needed |
| Yahoo Finance | Unlimited | No key needed |
| TradingView | Unlimited | Widget, no key needed |

## ⚠️ Disclaimer

> **AI opinions are vibecode estimates, not financial advice—DYOR (Do Your Own Research)**

## 📄 License

MIT License - Use freely for learning and building!
