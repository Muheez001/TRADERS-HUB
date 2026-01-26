/**
 * AI Analyst Service
 * Uses Google Gemini API to analyze news and provide market impact opinions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { searchDocuments, getStats } from './vectorStore.js';
import { analyzeTechnicals } from './technicalAnalysis.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

// Initialize Gemini if API key is available
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Upgraded to Gemini 3 Flash (preview) for 2x faster performance and Pro-level reasoning
    model = genAI.getGenerativeModel({ model: 'models/gemini-3-flash-preview' });
    console.log('✅ Gemini 3 Flash (Preview) initialized successfully');
}

/**
 * Analyze news headline and generate market impact opinion
 * @param {string} title - News headline
 * @param {string} description - News description/summary
 * @returns {Object} Analysis with sentiment, impact score, affected assets, and opinion
 */
export async function analyzeNewsImpact(title, description) {
    // If no API key, use rule-based fallback
    if (!model) {
        return generateRuleBasedAnalysis(title, description);
    }

    try {
        const prompt = `You are an anti-gravity financial analyst providing quick market insights. 
    
Analyze this news and provide a JSON response with EXACTLY this format:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "impactScore": 1-10,
  "affectedAssets": ["ASSET1", "ASSET2", "ASSET3"],
  "opinion": "One sentence using anti-gravity/levitation metaphors about market impact"
}

News Title: ${title}
Description: ${description || 'No description'}

Rules:
- Use terms like "levitate", "float", "anti-gravity lift", "defy gravity", "quantum-tunnel" in opinions
- Keep opinion under 50 words
- Only output valid JSON, no other text

DISCLAIMER: This is AI-generated vibecode, not financial advice.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            return {
                sentiment: analysis.sentiment || 'neutral',
                impactScore: Math.min(10, Math.max(1, analysis.impactScore || 5)),
                affectedAssets: analysis.affectedAssets || ['USD'],
                opinion: analysis.opinion || 'Market dynamics in equilibrium.'
            };
        }

        throw new Error('Could not parse Gemini response');
    } catch (error) {
        console.error('Gemini Analysis Error:', error.message);
        return generateRuleBasedAnalysis(title, description);
    }
}

/**
 * Rule-based fallback when Gemini API is unavailable
 */
function generateRuleBasedAnalysis(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    // Keyword detection for sentiment
    const bullishKeywords = ['surge', 'rally', 'gain', 'rise', 'bullish', 'growth', 'profit', 'record high', 'breakthrough', 'inflows'];
    const bearishKeywords = ['crash', 'plunge', 'fall', 'drop', 'bearish', 'loss', 'decline', 'crisis', 'outflows', 'selloff'];

    let bullishScore = bullishKeywords.filter(kw => text.includes(kw)).length;
    let bearishScore = bearishKeywords.filter(kw => text.includes(kw)).length;

    let sentiment = 'neutral';
    if (bullishScore > bearishScore) sentiment = 'bullish';
    else if (bearishScore > bullishScore) sentiment = 'bearish';

    // Asset detection
    const assetKeywords = {
        'BTC': ['bitcoin', 'btc', 'crypto'],
        'ETH': ['ethereum', 'eth'],
        'GOLD': ['gold', 'precious metal'],
        'OIL': ['oil', 'petroleum', 'opec'],
        'USD': ['dollar', 'usd', 'fed', 'federal reserve'],
        'EUR': ['euro', 'ecb', 'european'],
        'GBP': ['pound', 'gbp', 'uk', 'britain'],
        'NASDAQ': ['nasdaq', 'tech stock'],
        'S&P500': ['s&p', 'stock market']
    };

    const affectedAssets = [];
    for (const [asset, keywords] of Object.entries(assetKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
            affectedAssets.push(asset);
        }
    }

    if (affectedAssets.length === 0) affectedAssets.push('USD');

    // Generate opinion based on sentiment
    const opinions = {
        bullish: [
            `This could anti-grav lift ${affectedAssets[0]} prices, defying market gravity.`,
            `Positive momentum may levitate ${affectedAssets[0]} to new heights.`,
            `${affectedAssets[0]} enters anti-gravity zone with potential upside.`
        ],
        bearish: [
            `Gravity pulls on ${affectedAssets[0]}, potential downside pressure ahead.`,
            `${affectedAssets[0]} may face turbulence, watch for support levels.`,
            `Market drag could weigh on ${affectedAssets[0]} short-term.`
        ],
        neutral: [
            `${affectedAssets[0]} hovers in equilibrium, awaiting catalysts.`,
            `Market forces balanced for ${affectedAssets[0]}, sideways drift expected.`,
            `${affectedAssets[0]} in holding pattern, monitor for breakout.`
        ]
    };

    const opinionList = opinions[sentiment];
    const opinion = opinionList[Math.floor(Math.random() * opinionList.length)];

    const impactScore = Math.min(10, Math.max(1, bullishScore + bearishScore + 3));

    return {
        sentiment,
        impactScore,
        affectedAssets: affectedAssets.slice(0, 3),
        opinion
    };
}

/**
 * Analyze market structure and generate trade setup (ENHANCED)
 * @param {Object} candlesData - Object containing primary, secondary, tertiary candles and intervals
 * @param {string} assetType - 'crypto' or 'forex'
 * @param {number} accountSize - User's trading capital
 * @param {Array} news - Latest news headlines
 */
export async function analyzeMarketStructure(symbol, currentInterval, candlesData, assetType = 'crypto', accountSize = 500, news = []) {
    // Handle both legacy (Array) and MTC (Object) formats
    const isMTC = candlesData && candlesData.primary;
    const candles = isMTC ? candlesData.primary : candlesData;
    const secondary = isMTC ? candlesData.secondary : [];
    const tertiary = isMTC ? candlesData.tertiary : [];
    const mtcIntervals = isMTC ? candlesData.intervals : [currentInterval];

    // Calculate key metrics from primary candles with guardrails
    if (!candles || candles.length === 0) {
        console.log('⚠️ No candles provided for analysis');
        return analyzeTechnicals(symbol, candles, assetType, accountSize);
    }

    const recentCandles = candles.slice(-30);
    const currentPrice = candles[candles.length - 1].close;
    const highestHigh = Math.max(...recentCandles.map(c => c.high));
    const lowestLow = Math.min(...recentCandles.map(c => c.low));

    let avgVolume = 0;
    if (recentCandles.length > 0) {
        const sumVol = recentCandles.reduce((sum, c) => sum + (c.volume || 0), 0);
        avgVolume = sumVol / recentCandles.length;
    }

    const lastCandle = candles[candles.length - 1];
    const prevCandle = candles[candles.length - 2];

    console.log(`🔍 [${assetType.toUpperCase()}] Analyzing ${symbol} | Price: ${currentPrice} | MTC Enabled: ${isMTC}`);

    // Helper: Format candles for prompt
    const formatCandles = (data) => {
        if (!data || data.length === 0) return "No data available";
        return data.slice(-15).map(c =>
            `[${new Date(c.time).toISOString().substr(11, 5)}] O:${c.open.toFixed(4)} H:${c.high.toFixed(4)} L:${c.low.toFixed(4)} C:${c.close.toFixed(4)}`
        ).join('\n');
    };

    const primaryData = formatCandles(candles);
    const secondaryData = formatCandles(secondary);
    const tertiaryData = formatCandles(tertiary);

    const newsContext = news.length > 0
        ? news.map((n, i) => `${i + 1}. ${n.title}`).join('\n')
        : "No recent news available.";

    if (!model) {
        return analyzeTechnicals(symbol, candles, assetType, accountSize);
    }

    try {
        // --- RAG ENHANCEMENT: Retrieve relevant trading knowledge ---
        let knowledgeContext = '';
        try {
            const stats = await getStats();
            if (stats.initialized && stats.documentCount > 0) {
                // Search for relevant candlestick patterns and trading knowledge
                const searchQuery = `candlestick patterns ${symbol} ${assetType} trading analysis market structure AxiTrader Hat-Trick strategy 13 Pro Tips chart setups`;
                const relevantDocs = await searchDocuments(searchQuery, 10); // Increase count for better context

                if (relevantDocs && relevantDocs.length > 0) {
                    knowledgeContext = '\n=== RELEVANT TRADING KNOWLEDGE ===\n';
                    relevantDocs.forEach((doc, idx) => {
                        knowledgeContext += `Document ${idx + 1} (Source: ${doc.metadata?.source || 'Unknown'}):\n${doc.text}\n\n`;
                    });
                    knowledgeContext += '=== END KNOWLEDGE ===\n';
                    console.log(`✨ RAG Enhanced: Retrieved ${relevantDocs.length} knowledge chunks`);
                }
            }
        } catch (ragError) {
            // RAG is optional - continue without it if it fails
            console.log('⚠️  RAG retrieval skipped:', ragError.message);
        }
        const prompt = `You are a Master Trader AI with encyclopedic knowledge of "The Candlestick Trading Bible", AxiTrader's "13 Pro Tips for Chart Setups", and the "Hat-Trick" entry/exit strategies.

Your goal is MULTI-TIMEFRAME CONFLUENCE (MTC) analysis. Look for alignments across different time intervals.

ASSET: ${symbol} (${assetType.toUpperCase()})
USER ACCOUNT SIZE: $${accountSize}

=== PRIMARY: ${mtcIntervals[0]} ===
CURRENT PRICE: ${currentPrice.toFixed(4)}
${primaryData}

=== SECONDARY: ${mtcIntervals[1] || 'N/A'} ===
${secondaryData}

=== TERTIARY: ${mtcIntervals[2] || 'N/A'} ===
${tertiaryData}

=== RECENT MARKET NEWS ===
${newsContext}

${knowledgeContext}

Task description:
1. Identify Market Structure across all timeframes. High timeframe (HTF) trend is DOMINANT.
2. Look for "Quantum Alignment": If all timeframes point in the same direction, confidence is HIGH.
3. Apply AxiTrader's "13 Pro Tips": Look for specific chart setups, volume clusters, and institutional footprints.
4. Utilize "Hat-Trick" Strategies: If a Hat-Trick setup (e.g., 3-candle confirmation, specific RSI/Price divergence) is detected, prioritize it.
5. Evaluate News Impact: Does the news support or conflict with technicals?
6. Provide a TAILORED TRADE SETUP for $${accountSize}.
7. Categorize the signal: BUY, SELL, or WAIT.

Return STRICT JSON:
{
  "signal": "BUY|SELL|WAIT",
  "confidence": 0-100,
  "mtcAlignment": "Description of alignment (e.g., '15m/1h/4h Bullish Alignment')",
  "newsSentiment": "Bullish|Bearish|Neutral",
  "newsImpact": "Short explanation of how news affects this setup",
  "currentPrice": number,
  "pattern": "Primary candlestick pattern name",
  "patternDescription": "Detailed analysis of structure and alignment",
  "marketStructure": "Description of trend/range across timeframes",
  "entry": number|null,
  "stopLoss": number|null,
  "takeProfit": number|null,
  "breakEven": number|null,
  "slRecommendation": "Why and when to move SL to break-even or specific level",
  "riskRewardRatio": "X:Y",
  "keyLevels": { "resistance": [], "support": [] },
  "whyEnter": "Detailed reasoning based on Confluence, Candles, and News",
  "riskFactors": ["List of risk factors"],
  "tailoredSetup": "Specific instruction for $${accountSize}",
  "reasoning": "Anti-gravity/levitation metaphor summary"
}

RULES:
- If signal is "WAIT", set entry/stopLoss/takeProfit/breakEven to null.
- Be PRECISE with entry/SL/TP/BreakEven based on the actual highs/lows provided.
- Break Even should usually be the entry price or slightly above/below depending on the spread.
- slRecommendation must be very specific for the user.
- Use anti-gravity metaphors: "Refueling for lift-off", "Gravity test at support successful", "Atmospheric resistance detected", "Price entering zero-gravity zone".
- Reference "The Candlestick Trading Bible" patterns explicitly.
- Provide a BETTER analysis on the entry point, explaining specifically why this entry is high-probability.
- Ensure whyEnter is more detailed as per user request.${knowledgeContext ? '\n- Cite specific sources from the knowledge base when applicable.' : ''}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean markdown code blocks if present
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        return {
            ...analysis,
            currentPrice,
            highestHigh,
            lowestLow,
            avgVolume,
            timestamp: Date.now(),
            dataSource: 'live'
        };

    } catch (error) {
        console.error(`❌ Gemini Error for ${symbol}:`, error.message);
        console.log('🔄 Falling back to technical analysis engine...');
        return analyzeTechnicals(symbol, candles, assetType, accountSize);
    }
}

function generateMockTradeSetup(symbol, price, assetType = 'crypto') {
    const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const range = assetType === 'forex' ? price * 0.005 : price * 0.02;

    return {
        signal: type,
        confidence: Math.floor(Math.random() * 30) + 60,
        currentPrice: price,
        pattern: type === 'BUY' ? 'Bullish Engulfing at Support' : 'Bearish Engulfing at Resistance',
        patternDescription: `Simulated ${type === 'BUY' ? 'bullish' : 'bearish'} pattern detected at key level.`,
        marketStructure: type === 'BUY'
            ? 'Price is creating Higher Highs and Higher Lows, indicating an uptrend. Currently retesting previous resistance as new support.'
            : 'Price is making Lower Highs and Lower Lows, indicating a downtrend. Currently retesting previous support as new resistance.',
        entry: price,
        stopLoss: type === 'BUY' ? price - range : price + range,
        takeProfit: type === 'BUY' ? price + (range * 2) : price - (range * 2),
        riskRewardRatio: '1:2',
        keyLevels: {
            resistance: [price + range, price + (range * 1.5)],
            support: [price - range, price - (range * 1.5)]
        },
        whyEnter: `[SIMULATION MODE] This is a demonstration trade setup. In live mode, the AI would analyze the actual candlestick patterns from The Candlestick Trading Bible and provide specific entry reasoning based on market structure.`,
        riskFactors: [
            'High volatility environment',
            'Potential news events pending',
            'Volume divergence observed'
        ],
        technicalNotes: 'Simulated analysis - enable Gemini API for live AI insights.',
        reasoning: type === 'BUY'
            ? 'Price has refueled at support and is preparing for anti-gravity lift-off.'
            : 'Gravity is pulling price down, atmospheric resistance broken.',
        timestamp: Date.now(),
        dataSource: 'simulation'
    };
}

export { generateRuleBasedAnalysis };
