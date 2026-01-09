# 🚀 Trader Hub V2 - AI-Powered Trading Intelligence Platform

> Real-time trading platform featuring **custom AI trained on forex books**, live market data, AI insights, and interactive charts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.3.1-61DAFB)

## ⭐ What's New in V2

### 🤖 Custom Forex AI with RAG (Retrieval Augmented Generation)
- **Train AI with YOUR books** - Upload "The Candlestick Trading Bible", price action guides, trading strategies
- **AI cites sources** - Get analysis referencing specific patterns and chapters from your books
- **Semantic search** - 176 candlestick patterns instantly searchable
- **Cloud vector database** - Pinecone integration (no Docker needed)
- **Gemini 3 Flash** - Latest AI model (2x faster than previous version)

### 💡 Optimized API Usage
- **Smart quota management** - News uses rule-based sentiment, saving 100% of API quota for AI insights
- **Gemini restricted to AI Insights only** - Maximum value from free tier

## ✨ Core Features

### 🧠 AI Market Insights
- **RAG-Enhanced Analysis** - AI references YOUR uploaded trading books
- **Smart Trade Setups** - Entry, Stop Loss, and Take Profit levels
- **Pattern Recognition** - Candlestick patterns with source citations
- **Market Structure Analysis** - Trend identification (HH/HL, LH/LL, ranging)
- **Risk Assessment** - Confidence scores and risk factors
- **Multi-Asset Support** - Crypto and Forex pairs

### 📰 Real-Time Market Intelligence
- **Live News Feed** - Crypto news from NewsData.io
- **Rule-Based Sentiment** - Instant sentiment analysis (no API quota used)
- **Market Impact Predictions** - Affected assets and impact scores

### 💰 Live Price Tracking
- **Cryptocurrencies** - 12 coins via CoinGecko (BTC, ETH, SOL, XRP, etc.)
- **Forex Pairs** - Major pairs and crosses (EUR/USD, GBP/USD, USD/JPY, etc.)
- **Commodities** - Gold, Silver, Oil prices

### 📈 TradingView Charts
- **Interactive Charts** - Full TradingView widget integration
- **Multiple Categories** - Forex, Crypto, Indices
- **Popular Pairs** - XAU/USD, GBP/USD, EUR/USD, BTC/USDT

### 🎨 Premium UI
- **Dark/Light Mode** - Toggle with sun/moon icon
- **Anti-Gravity Design** - Floating cards, particle effects
- **Responsive** - Desktop and mobile optimized

### 💬 Community Chat
- Real-time trading discussions via WebSocket

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** - Fast development and build
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icons
- **Socket.io Client** - Real-time updates

### Backend
- **Node.js** + **Express** - Server framework
- **Socket.io** - WebSocket connections
- **Google Gemini 3 Flash** - AI analysis
- **Pinecone** - Cloud vector database for RAG
- **Axios** - API requests
- **PDF-Parse**, **Mammoth** - Document processing

### APIs & Data Sources
- **Google Gemini AI** - Market analysis & embeddings
- **Pinecone** - Vector database (free tier: 100k vectors)
- **NewsData.io** - Crypto news
- **CoinGecko** - Cryptocurrency prices
- **Twelve Data** - Forex data

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Pinecone Account** (free tier) - [Sign up here](https://www.pinecone.io/)
- **Google Gemini API Key** - [Get it here](https://aistudio.google.com/apikey)
- **NewsData.io API Key** - [Get it here](https://newsdata.io/)

### 1. Clone the Repository
```bash
git clone https://github.com/Muheez001/TRADERS-HUB.git
cd "TRADERS-HUB/TRADER HUB V2"
```

### 2. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create `server/.env` from the example:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your API keys:
```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
NEWSDATA_API_KEY=your_newsdata_api_key_here

# Optional (for live forex data)
TWELVE_DATA_API_KEY=your_twelve_data_key_here

# Server Port
PORT=3001
```

### 4. Run the Application

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

Open your browser: **http://localhost:5173**

---

## 📚 Training Your Custom AI

### Upload Trading Books

1. **Place your PDF in the project folder** or note the full path
2. **Update the path** in `server/upload-pdf.js`:
   ```javascript
   const pdfPath = 'C:\\path\\to\\your\\book.pdf';
   ```
3. **Run the upload**:
   ```bash
   cd server
   node upload-pdf.js
   ```

**What happens:**
- PDF is parsed (~100k-200k characters typical)
- Text is chunked (1000 chars, 200 overlap)
- Gemini generates embeddings
- Uploaded to Pinecone cloud

**Recommended books to upload:**
- "The Candlestick Trading Bible"
- "Forex Price Action Scalping"
- "Technical Analysis of Financial Markets"
- Your personal trading journals/notes

### Add Manual Knowledge

```bash
cd server
node test-rag.js
```

Or use the API:
```bash
curl -X POST http://localhost:3001/api/knowledge/add \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Double Top Pattern",
    "content": "A bearish reversal pattern...",
    "category": "chart_patterns"
  }'
```

---

## 📖 API Documentation

### Knowledge Base Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/knowledge/upload` | POST | Upload PDF/DOCX/TXT files |
| `/api/knowledge/add` | POST | Add manual knowledge snippets |
| `/api/knowledge/search?query=...` | GET | Semantic search |
| `/api/knowledge/stats` | GET | Database statistics |
| `/api/knowledge/clear` | DELETE | Clear all knowledge |

### Market Data Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server status |
| `/api/news` | GET | Latest crypto news |
| `/api/prices` | GET | All prices (crypto, forex, commodities) |
| `/api/prices/:type` | GET | Specific type (crypto/forex/commodities) |
| `/api/insights/:symbol/:timeframe` | GET | AI analysis (RAG-enhanced) |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `initialData` | Server → Client | Initial news and prices |
| `newsUpdate` | Server → Client | News updates |
| `priceUpdate` | Server → Client | Price updates (every 30s) |
| `chatMessage` | Bidirectional | Trading floor chat |

---

## 📁 Project Structure

```
TRADER HUB V2/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/          # Custom hooks
│   │   └── main.jsx        # App entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Node.js backend
│   ├── services/
│   │   ├── aiAnalyst.js     # RAG-enhanced AI analysis
│   │   ├── vectorStore.js   # Pinecone integration
│   │   ├── knowledgeBase.js # Document processing
│   │   └── dataFetcher.js   # API data fetching
│   ├── routes/
│   │   └── knowledgeRoutes.js # Knowledge API
│   ├── index.js             # Server entry point
│   ├── upload-pdf.js        # PDF upload script
│   ├── test-rag.js          # RAG test script
│   └── package.json
│
└── README.md                # This file
```

---

## 🤝 Contributing

We welcome contributions! Whether it's bug fixes, new features, or documentation improvements.

### How to Contribute

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/TRADERS-HUB.git
   cd "TRADERS-HUB/TRADER HUB V2"
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

4. **Make your changes**
   - Follow existing code style
   - Test your changes thoroughly
   - Update documentation if needed

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add some AmazingFeature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes

### Contribution Guidelines

- **Code Style**: Follow existing patterns
- **Commits**: Use clear, descriptive messages
- **Testing**: Test all changes before submitting
- **Documentation**: Update README if adding features
- **Issues**: Check existing issues before creating new ones

### Areas for Contribution

- 🎨 **UI/UX**: Improve design and user experience
- 🤖 **AI Features**: Enhance RAG system, add new AI capabilities
- 📊 **Data Sources**: Integrate additional market data APIs
- 🐛 **Bug Fixes**: Fix bugs and improve stability
- 📚 **Documentation**: Improve README, add tutorials
- 🧪 **Testing**: Add unit/integration tests

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# AI & Vector Database
GEMINI_API_KEY=your_gemini_api_key           # Required
PINECONE_API_KEY=your_pinecone_api_key       # Required for RAG

# News Data
NEWSDATA_API_KEY=your_newsdata_api_key       # Required

# Market Data (Optional but recommended)
TWELVE_DATA_API_KEY=your_twelve_data_key    # Forex data
COINMARKETCAP_API_KEY=your_cmc_key          # Alternative crypto source

# Server
PORT=3001                                    # Optional (default: 3001)
```

### Free API Keys

All services offer free tiers:

- **Gemini AI**: https://aistudio.google.com/apikey
  - Free tier: 60 requests/minute, 1500/day
  
- **Pinecone**: https://www.pinecone.io/
  - Free tier: 100k vectors, 1 index, unlimited queries
  
- **NewsData.io**: https://newsdata.io/
  - Free tier: 200 requests/day
  
- **Twelve Data**: https://twelvedata.com/
  - Free tier: 800 requests/day

---

## 🎓 How RAG Works

```
User Request: "Analyze EUR/USD"
        ↓
AI Analyst (aiAnalyst.js)
        ↓
Vector Search (vectorStore.js)
        ↓
Pinecone (semantic search)
        ↓
Returns: Top 3 relevant patterns from YOUR books
        ↓
Gemini 3 Flash (augmented prompt with knowledge)
        ↓
"Based on Bullish Engulfing (Candlestick Bible, Ch.3)..."
```

---

## 🐛 Troubleshooting

### "Pinecone API key not configured"
- Make sure `PINECONE_API_KEY` is in `server/.env`
- Restart the server after adding the key

### "Gemini API rate limit exceeded"
- Free tier: 60 requests/minute
- Wait 60 seconds or upgrade your Gemini API plan
- News analysis is disabled by default to save quota

### Port already in use
```bash
# Kill process on port 3001 (server)
npx kill-port 3001

# Kill process on port 5173 (client)
npx kill-port 5173
```

### ChromaDB/Docker issues
- This project uses **Pinecone** (cloud), Docker is NOT needed
- If you see old ChromaDB references, they can be ignored

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**Muheez Muftau**
- GitHub: [@Muheez001](https://github.com/Muheez001)
- Email: muftaumuheez6@gmail.com

---

## 🙏 Acknowledgments

- **Google Gemini** - AI analysis and embeddings
- **Pinecone** - Vector database
- **NewsData.io** - Crypto news feed
- **CoinGecko** - Cryptocurrency data
- **TradingView** - Chart widgets
- **Candlestick Trading Bible** - Trading knowledge reference

---

## 📊 Project Stats

- **Lines of Code**: ~5000+
- **Components**: 15+
- **API Integrations**: 5
- **AI Models**: Gemini 3 Flash Preview
- **Knowledge Documents**: 176 (3 test + 173 from Candlestick Bible)

---

## 🔮 Roadmap

- [ ] Frontend UI for knowledge management
- [ ] Batch PDF upload
- [ ] Knowledge categorization and tagging
- [ ] Export/import knowledge base
- [ ] Mobile app (React Native)
- [ ] Trading signals notifications
- [ ] Backtesting capabilities
- [ ] Portfolio tracking

---

**⭐ If you find this project useful, please consider giving it a star on GitHub!**
