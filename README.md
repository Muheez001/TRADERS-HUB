# 🚀 TRADERS-HUB V2

> **Precision Market Intelligence meets Anti-Gravity Design.** 
> An AI-powered trading terminal featuring RAG-enhanced technical analysis, real-time multi-asset tracking, and deep market insights.

![GitHub last commit](https://img.shields.io/github/last-commit/Muheez001/TRADERS-HUB)
![Version](https://img.shields.io/badge/version-2.0.0-blueviolet)
![Tech Stack](https://img.shields.io/badge/stack-MERN+%20Gemini-61DAFB)

---

## 🔥 Latest Updates (V2 Evolution)

Recently upgraded with cutting-edge features to redefine your trading experience:

*   **🤖 Gemini 3 Flash (Preview) Integration:** 2x faster reasoning and pro-level market analysis.
*   **🧠 RAG (Retrieval Augmented Generation):** The AI is now trained on "The Candlestick Trading Bible". It doesn't just guess; it references actual trading theory.
*   **📊 Multi-Timeframe Confluence (MTC):** Analysis now scans 15m/1h/4h timeframes simultaneously to find high-probability setups.
*   **☁️ Pinecone Cloud Migration:** Faster semantic search for patterns with 0ms local footprint.
*   **⚡ Smart Quota Management:** Optimized API usage to ensure 24/7 availability on free tiers.

---

## ✨ Core Features

### 🧠 AI Market Control
*   **RAG-Enhanced Insights:** AI cites specific chapters from uploaded trading books.
*   **Tailored Trade Setups:** Precise Entry, SL, and TP for any account size.
*   **Pattern Recognition:** Scans 170+ candlestick patterns instantly.
*   **Sentiment Fusion:** Combines technical price action with real-time news sentiment.

### 📈 Live Market Intelligence
*   **Omni-Asset Support:** Real-time tracking for Crypto, Forex, and Commodities (Gold, Silver, Oil).
*   **TradingView Pro:** Integrated interactive charts for technical charting.
*   **Impact Prediction:** Predicts how news headlines will move specific assets.

### 🎨 Premium Experience
*   **Anti-Gravity UI:** A sleek, cosmic-themed interface with smooth Framer Motion animations.
*   **Real-time Floor:** Live community chat via WebSockets for sharing setups.
*   **Performance First:** Built with Vite for instant loading.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, Socket.io |
| **AI/ML** | Google Gemini 3 Flash, Vector Embeddings |
| **Database** | Pinecone Cloud (Vector), Local Storage |
| **Data APIs** | CoinGecko, NewsData.io, Twelve Data |

---

## 🚀 Speed Run (Setup)

1.  **Clone & Install**
    ```bash
    git clone https://github.com/Muheez001/TRADERS-HUB.git
    cd TRADERS-HUB
    # Install server & client deps
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Environment Setup**
    Create a `.env` in the `server` folder:
    ```env
    GEMINI_API_KEY=your_key
    PINECONE_API_KEY=your_key
    NEWSDATA_API_KEY=your_key
    ```

3.  **Ignition**
    ```bash
    # Terminal 1 (Server)
    npm run dev
    # Terminal 2 (Client)
    npm run dev
    ```

---

## 📚 Training Your AI

To make the AI smarter, you can upload your own trading PDFs:
1. Place PDF in `server/`
2. Update path in `server/upload-pdf.js`
3. Run: `node upload-pdf.js`

The AI will then reference your specific strategies in its analysis!

---

## 👤 Author

**Muheez Muftau**
- GitHub: [@Muheez001](https://github.com/Muheez001)
- Email: muftaumuheez6@gmail.com

---

> **⚠️ Disclaimer:** TRADERS-HUB is an AI-generated experimental tool. All analysis is "vibecode" estimates. Trading involves significant risk. Always DYOR.

**⭐ If this platform helped you defy market gravity, consider giving it a star!**
