# 🚀 Trader Hub - Anti-Gravity Trading Platform

A real-time trading intelligence platform with AI-powered market analysis, live crypto/forex prices, interactive TradingView charts, and community features.

![Trader Hub](screenshot.png)

## ✨ Features

### 🧠 AI Market Insights (NEW!)
- **Smart Trade Setups** - AI-generated Entry, Stop Loss, and Take Profit levels
- **Pattern Recognition** - Candlestick patterns from "The Candlestick Trading Bible"
- **Market Structure Analysis** - Trend identification (HH/HL, LH/LL, ranging)
- **Risk Assessment** - Confidence scores and risk factors
- **Multi-Asset Support** - Both Crypto and Forex pairs
- **"Why Long/Short?"** - Detailed reasoning for every signal

### 📰 Real-Time Market Intelligence
- **Live News Feed** - Crypto news from NewsData.io with AI sentiment analysis
- **Gemini AI Insights** - Market impact predictions powered by Google Gemini

### 💰 Live Price Tracking
- **Cryptocurrencies** - 12 coins via CoinGecko/Binance (BTC, ETH, SOL, XRP, ADA, BNB, DOGE, AVAX, LINK, DOT, MATIC, ATOM)
- **Forex Pairs** - Major pairs, crosses, and metals (EUR/USD, XAU/USD, GBP/JPY, etc.)
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
| Lucide Icons | Binance / CoinGecko / Twelve Data |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/Muheez001/TRADERS-HUB.git
cd TRADERS-HUB

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
# Required for AI Analysis
GEMINI_API_KEY=your_gemini_key

# News Feed
NEWSDATA_API_KEY=your_newsdata_key

# Optional - Forex Data (for live forex candles)
TWELVE_DATA_API_KEY=your_twelve_data_key

# Optional fallbacks
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
TRADERS-HUB/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIInsights.jsx  # 🆕 AI Trade Analysis
│   │   │   ├── Navbar.jsx
│   │   │   ├── NewsFeed.jsx
│   │   │   ├── PriceGrid.jsx
│   │   │   ├── TradingViewChart.jsx
│   │   │   └── ChatWidget.jsx
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── services/
│   │   ├── dataFetcher.js      # Binance, CoinGecko, Twelve Data
│   │   └── aiAnalyst.js        # Gemini AI Analysis
│   ├── index.js
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
| `/api/insights/:symbol/:timeframe` | GET | 🆕 AI trade analysis |

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
| Google Gemini | 1,500 req/day | [aistudio.google.com](https://aistudio.google.com) |
| NewsData.io | 200 req/day | [newsdata.io](https://newsdata.io) |
| Twelve Data | 800 req/day | [twelvedata.com](https://twelvedata.com) |
| CoinGecko | Unlimited (rate-limited) | No key needed |
| Binance | Unlimited | No key needed |
| TradingView | Unlimited | Widget, no key needed |

## ⚠️ Disclaimer

> **AI opinions are vibecode estimates, not financial advice—DYOR (Do Your Own Research)**

## 📄 License

MIT License - Use freely for learning and building!
