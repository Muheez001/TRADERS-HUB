# 🚀 TRADERS-HUB V2.1

> **Precision Market Intelligence meets Anti-Gravity Design.** 
> An AI-powered trading terminal featuring RAG-enhanced technical analysis, real-time multi-asset tracking, and automated signal intelligence.

![GitHub last commit](https://img.shields.io/github/last-commit/Muheez001/TRADERS-HUB)
![Version](https://img.shields.io/badge/version-2.1.0-blueviolet)
![Tech Stack](https://img.shields.io/badge/stack-MERN+%20Supabase+%20Resend-61DAFB)

---

## 🔥 Latest Updates (Phase 2 Evolution)

Recently upgraded with enterprise-grade features for a professional trading workflow:

*   **🔐 Secure Google Auth:** Seamless sign-in and session restoration via Supabase Auth.
*   **📡 Automated 4H Scanner:** High-precision market scanner optimized for 4-hour cycles (12AM, 4AM, 8AM...) to capture institutional trends.
*   **📧 Email Signal Alerts:** Instant trade notifications delivered to your inbox via Resend integration.
*   **🔔 Interactive Notification Center:** Real-time signal toasts with expandable trade details (SL/TP/Entry) and direct AI analysis links.
*   **🛡️ Advanced Risk HUD:** Improved capital management with tooltips and precise dollar-value risk calculations.
*   **🧠 RAG-Enhanced Insights:** AI now references "The Candlestick Trading Bible" for professional-grade setups.

---

## ✨ Core Features

### 🧠 AI Market Control
*   **RAG-Enhanced Insights:** AI cites specific chapters from uploaded trading books.
*   **Tailored Trade Setups:** Precise Entry, SL, and TP for any account size.
*   **Pattern Recognition:** Scans 170+ candlestick patterns instantly on 4H timeframes.
*   **Sentiment Fusion:** Combines technical price action with real-time news sentiment.

### 📈 Live Market Intelligence
*   **Omni-Asset Support:** Real-time tracking for Crypto, Forex, and Commodities.
*   **Background Scanning:** Automated monitoring every 4 hours with 0ms local footprint.
*   **Impact Prediction:** Predicts how news headlines will move specific assets.

### 🎨 Premium Experience
*   **Anti-Gravity UI:** A sleek, cosmic-themed interface with glassmorphism and smooth animations.
*   **Notification Prefs:** Full control over which assets trigger alerts (Crypto vs Forex).
*   **Performance First:** Built with Vite for instant loading.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, Socket.io, Node-Cron |
| **Auth/DB** | Supabase (PostgreSQL + RLS), Auth |
| **Email** | Resend API |
| **AI/ML** | Google Gemini 3 Flash, Vector Embeddings |
| **Vector DB** | Pinecone Cloud |
| **Data APIs** | CoinGecko, NewsData.io, Twelve Data |

---

## 🚀 Setup Guide

1.  **Clone & Install**
    ```bash
    git clone https://github.com/Muheez001/TRADERS-HUB.git
    cd TRADERS-HUB
    # Install server & client deps
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Environment Setup**
    Create a `.env` file in the `server` folder:
    *   **Gemini AI:** [Get API Key](https://aistudio.google.com/apikey)
    *   **Supabase:** [Get Project URL/Key](https://supabase.com/)
    *   **Resend:** [Get API Key](https://resend.com/)
    *   **Pinecone:** [Get API Key](https://www.pinecone.io/)
    *   **NewsData:** [Get API Key](https://newsdata.io/)

    ```env
    # AI & Search
    GEMINI_API_KEY=your_key
    PINECONE_API_KEY=your_key
    NEWSDATA_API_KEY=your_key
    
    # Supabase (Database & Auth)
    SUPABASE_URL=your_project_url
    SUPABASE_ANON_KEY=your_anon_key
    
    # Email Alerts
    RESEND_API_KEY=your_resend_key
    ```

3.  **Database Migration**
    Run the SQL scripts in your Supabase SQL Editor:
    1. `server/supabase-schema.sql` (Core tables)
    2. `server/user-preferences-schema.sql` (Preferences)
    3. `server/add-pair-preferences.sql` (Asset selection)

4.  **Ignition**
    ```bash
    # Terminal 1 (Server)
    npm run dev
    # Terminal 2 (Client)
    npm run dev
    ```

---

## 👤 Author

**Muheez Muftau**
- GitHub: [@Muheez001](https://github.com/Muheez001)
- Email: muftaumuheez6@gmail.com

---

> **⚠️ Disclaimer:** TRADERS-HUB is an AI-powered tool for educational purposes. Trading involves significant risk. Always DYOR.

**⭐ If this platform helped you defy market gravity, consider giving it a star!**
