/**
 * Trader Hub - Anti-Gravity Backend Server
 * Real-time market news, prices, and AI-driven insights
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { fetchNews, fetchCryptoPrices, fetchForexPrices, fetchCommodityPrices, fetchCandles, fetchForexCandles } from './services/dataFetcher.js';
import { analyzeNewsImpact, analyzeMarketStructure } from './services/aiAnalyst.js';
import { initializeVectorStore } from './services/vectorStore.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory cache (simulating Redis for simplicity)
let cachedNews = [];
let cachedPrices = {
    crypto: {},
    forex: {},
    commodities: {}
};

// REST API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'Anti-gravity systems nominal ✨', timestamp: new Date().toISOString() });
});

app.get('/api/news', (req, res) => {
    res.json({ success: true, data: cachedNews });
});

app.get('/api/prices', (req, res) => {
    res.json({ success: true, data: cachedPrices });
});


app.get('/api/prices/:type', (req, res) => {
    const { type } = req.params;
    if (cachedPrices[type]) {
        res.json({ success: true, data: cachedPrices[type] });
    } else {
        res.status(404).json({ success: false, message: 'Price type not found' });
    }
});

// Knowledge Base Routes
app.use('/api/knowledge', knowledgeRoutes);

/**
 * Enhanced Insights API - Supports both Crypto and Forex
 * GET /api/insights/:symbol/:timeframe?type=crypto|forex
 */
app.get('/api/insights/:symbol/:timeframe', async (req, res) => {
    try {
        const { symbol, timeframe } = req.params;
        const assetType = req.query.type || 'crypto';

        console.log(`🔍 Analyzing ${symbol} (${assetType}) on ${timeframe}...`);

        let candles;
        let cleanSymbol = symbol;

        if (assetType === 'forex') {
            // For forex, expect format like EUR-USD or EURUSD
            cleanSymbol = symbol.replace('-', '/').toUpperCase();
            if (!cleanSymbol.includes('/') && cleanSymbol.length === 6) {
                // Convert EURUSD to EUR/USD
                cleanSymbol = cleanSymbol.slice(0, 3) + '/' + cleanSymbol.slice(3);
            }
            candles = await fetchForexCandles(cleanSymbol, timeframe);
        } else {
            cleanSymbol = symbol.toUpperCase();
            candles = await fetchCandles(cleanSymbol, timeframe);
        }

        // Perform AI Analysis with asset type context
        const analysis = await analyzeMarketStructure(cleanSymbol, timeframe, candles, assetType);

        res.json({
            success: true,
            data: {
                symbol: cleanSymbol,
                assetType,
                timeframe,
                candles,
                analysis
            }
        });
    } catch (error) {
        console.error('Insights Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to generate insights' });
    }
});

// WebSocket Connection Handler
io.on('connection', (socket) => {
    console.log(`🚀 Client connected: ${socket.id}`);

    // Send initial data on connection
    socket.emit('initialData', {
        news: cachedNews,
        prices: cachedPrices
    });

    socket.on('disconnect', () => {
        console.log(`👋 Client disconnected: ${socket.id}`);
    });

    // Handle chat messages
    socket.on('chatMessage', (message) => {
        io.emit('chatMessage', {
            ...message,
            timestamp: new Date().toISOString()
        });
    });
});

// Data Fetching & Broadcasting Functions
async function updateNews() {
    try {
        console.log('📰 Fetching latest news...');
        const newsData = await fetchNews();

        if (newsData && newsData.length > 0) {
            // ⚠️ AI Analysis DISABLED to preserve API quota for AI Insights & document embeddings
            // Use rule-based sentiment instead
            const analyzedNews = newsData.slice(0, 10).map(article => {
                const aiAnalysis = generateRuleBasedSentiment(article.title, article.description);
                return { ...article, aiAnalysis };
            });

            cachedNews = analyzedNews;
            io.emit('newsUpdate', cachedNews);
            console.log(`✅ News updated: ${cachedNews.length} articles (no AI quota used)`);
        }
    } catch (error) {
        console.error('❌ News fetch error:', error.message);
    }
}

// Simple rule-based sentiment (no API usage)
function generateRuleBasedSentiment(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    const bullishKeywords = ['surge', 'rally', 'gain', 'rise', 'bullish', 'growth', 'profit', 'breakthrough', 'ATH', 'pump'];
    const bearishKeywords = ['crash', 'plunge', 'fall', 'drop', 'bearish', 'loss', 'decline', 'crisis', 'dump', 'selloff'];

    let bullishScore = bullishKeywords.filter(kw => text.includes(kw)).length;
    let bearishScore = bearishKeywords.filter(kw => text.includes(kw)).length;

    let sentiment = 'neutral';
    if (bullishScore > bearishScore) sentiment = 'bullish';
    else if (bearishScore > bullishScore) sentiment = 'bearish';

    const impactScore = Math.min(10, Math.max(3, bullishScore + bearishScore + 3));

    return {
        sentiment,
        impactScore,
        affectedAssets: ['MARKET'],
        opinion: `${sentiment.toUpperCase()} sentiment detected - API quota saved for AI Insights.`
    };
}

async function updatePrices() {
    try {
        console.log('💰 Fetching latest prices...');

        const [cryptoData, forexData, commodityData] = await Promise.all([
            fetchCryptoPrices(),
            fetchForexPrices(),
            fetchCommodityPrices()
        ]);

        if (cryptoData) cachedPrices.crypto = cryptoData;
        if (forexData) cachedPrices.forex = forexData;
        if (commodityData) cachedPrices.commodities = commodityData;

        io.emit('priceUpdate', cachedPrices);
        console.log('✅ Prices updated');
    } catch (error) {
        console.error('❌ Price fetch error:', error.message);
    }
}

// Initialize with demo data
function initializeDemoData() {
    cachedNews = [
        {
            id: '1',
            title: 'Federal Reserve Signals Potential Rate Cuts in 2025',
            description: 'The Fed hints at monetary policy easing as inflation shows signs of cooling.',
            source: 'Financial Times',
            publishedAt: new Date().toISOString(),
            url: '#',
            aiAnalysis: {
                sentiment: 'bullish',
                impactScore: 8,
                affectedAssets: ['USD', 'S&P500', 'BTC'],
                opinion: 'Rate cuts could anti-grav lift equities and crypto. Expect USD to soften, potentially boosting BTC by 5-10%. Gold may see safe-haven flows.'
            }
        },
        {
            id: '2',
            title: 'OPEC+ Announces Surprise Oil Production Cut',
            description: 'Major oil producers agree to reduce output by 1 million barrels per day.',
            source: 'Reuters',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            url: '#',
            aiAnalysis: {
                sentiment: 'bullish',
                impactScore: 7,
                affectedAssets: ['OIL', 'GOLD', 'CAD'],
                opinion: 'Production cuts will levitate oil prices by 3-5% short-term. Energy stocks float higher. Watch CAD for positive correlation.'
            }
        },
        {
            id: '3',
            title: 'Major Tech Company Announces AI Breakthrough',
            description: 'New AI model demonstrates unprecedented capabilities in reasoning and problem-solving.',
            source: 'TechCrunch',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            url: '#',
            aiAnalysis: {
                sentiment: 'bullish',
                impactScore: 6,
                affectedAssets: ['NASDAQ', 'NVDA', 'META'],
                opinion: 'AI momentum continues to defy gravity. Tech heavyweights could see 2-4% pop. Semiconductor sector enters anti-grav zone.'
            }
        },
        {
            id: '4',
            title: 'European Central Bank Holds Rates Steady',
            description: 'ECB maintains current policy stance amid mixed economic signals.',
            source: 'Bloomberg',
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            url: '#',
            aiAnalysis: {
                sentiment: 'neutral',
                impactScore: 4,
                affectedAssets: ['EUR', 'DAX', 'EURUSD'],
                opinion: 'Neutral hold creates stability. EUR/USD hovering in equilibrium. European equities may drift sideways.'
            }
        },
        {
            id: '5',
            title: 'Bitcoin ETF Sees Record Inflows',
            description: 'Institutional investors pour billions into spot Bitcoin ETFs.',
            source: 'CoinDesk',
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            url: '#',
            aiAnalysis: {
                sentiment: 'bullish',
                impactScore: 9,
                affectedAssets: ['BTC', 'ETH', 'COIN'],
                opinion: 'Massive anti-gravity signal for crypto. BTC could quantum-tunnel to new ATH. ETH follows with 5-8% sympathy rally.'
            }
        }
    ];

    cachedPrices = {
        crypto: {
            BTC: { price: 98450.23, change: 2.34, symbol: 'BTC' },
            ETH: { price: 3890.45, change: 1.87, symbol: 'ETH' },
            SOL: { price: 245.67, change: -0.45, symbol: 'SOL' },
            XRP: { price: 2.34, change: 5.67, symbol: 'XRP' },
            ADA: { price: 1.12, change: -1.23, symbol: 'ADA' }
        },
        forex: {
            'USD/JPY': { price: 157.45, change: 0.23 },
            'EUR/USD': { price: 1.0345, change: -0.12 },
            'GBP/USD': { price: 1.2567, change: 0.08 },
            'USD/CHF': { price: 0.9023, change: 0.05 },
            'AUD/USD': { price: 0.6234, change: -0.34 }
        },
        commodities: {
            GOLD: { price: 4428.50, change: 0.67, name: 'Gold' },
            OIL: { price: 74.23, change: -1.23, name: 'Crude Oil' },
            SILVER: { price: 52.45, change: 1.12, name: 'Silver' }
        }
    };

    console.log('🎮 Demo data initialized');
}

// Cron Jobs for periodic updates
// Every 5 minutes - fetch news
cron.schedule('*/5 * * * *', updateNews);

// Every 30 seconds - update prices (simulated for demo)
cron.schedule('*/30 * * * * *', () => {
    // Simulate price fluctuations
    Object.keys(cachedPrices.crypto).forEach(key => {
        const item = cachedPrices.crypto[key];
        item.price *= (1 + (Math.random() - 0.5) * 0.002);
        item.change = (Math.random() - 0.5) * 5;
    });

    Object.keys(cachedPrices.forex).forEach(key => {
        const item = cachedPrices.forex[key];
        item.price *= (1 + (Math.random() - 0.5) * 0.0005);
        item.change = (Math.random() - 0.5) * 0.5;
    });

    Object.keys(cachedPrices.commodities).forEach(key => {
        const item = cachedPrices.commodities[key];
        item.price *= (1 + (Math.random() - 0.5) * 0.001);
        item.change = (Math.random() - 0.5) * 2;
    });

    io.emit('priceUpdate', cachedPrices);
});

// Start Server
httpServer.listen(PORT, async () => {
    console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🚀 TRADER HUB - Anti-Gravity Backend            ║
  ║   ───────────────────────────────────────         ║
  ║   Server running on http://localhost:${PORT}        ║
  ║   WebSocket ready for real-time connections       ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);

    // Initialize demo data on startup
    initializeDemoData();

    // Initialize Vector Store for RAG
    console.log('🧠 Initializing Vector Store...');
    try {
        await initializeVectorStore();
    } catch (error) {
        console.log('⚠️  Vector Store initialization skipped (ChromaDB not running)');
        console.log('   To enable RAG features, run: docker run -p 8000:8000 chromadb/chroma');
    }

    // Attempt initial fetch (will use demo data if APIs fail)
    updateNews().catch(() => console.log('Using demo news data'));
    updatePrices().catch(() => console.log('Using demo price data'));
});

export { io, cachedNews, cachedPrices };
