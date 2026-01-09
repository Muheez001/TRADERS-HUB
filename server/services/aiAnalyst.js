/**
 * AI Analyst Service
 * Uses Google Gemini API to analyze news and provide market impact opinions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { searchDocuments, getStats } from './vectorStore.js';

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
 * @param {string} symbol - Asset symbol
 * @param {string} timeframe - Chart timeframe
 * @param {Array} candles - Array of OHLCV data
 * @param {string} assetType - 'crypto' or 'forex'
 */
export async function analyzeMarketStructure(symbol, timeframe, candles, assetType = 'crypto') {
    // Calculate key metrics from candles
    const recentCandles = candles.slice(-30);
    const currentPrice = candles[candles.length - 1].close;
    const highestHigh = Math.max(...recentCandles.map(c => c.high));
    const lowestLow = Math.min(...recentCandles.map(c => c.low));
    const avgVolume = recentCandles.reduce((sum, c) => sum + c.volume, 0) / recentCandles.length;
    const lastCandle = candles[candles.length - 1];
    const prevCandle = candles[candles.length - 2];

    // Format candles for prompt
    const candleData = recentCandles.slice(-20).map(c =>
        `[${new Date(c.time).toISOString().substr(11, 5)}] O:${c.open.toFixed(4)} H:${c.high.toFixed(4)} L:${c.low.toFixed(4)} C:${c.close.toFixed(4)} V:${c.volume.toFixed(0)}`
    ).join('\n');

    if (!model) {
        return generateMockTradeSetup(symbol, currentPrice, assetType);
    }

    try {
        // --- RAG ENHANCEMENT: Retrieve relevant trading knowledge ---
        let knowledgeContext = '';
        try {
            const stats = await getStats();
            if (stats.initialized && stats.documentCount > 0) {
                // Search for relevant candlestick patterns and trading knowledge
                const searchQuery = `candlestick patterns ${symbol} ${assetType} trading analysis market structure`;
                const relevantDocs = await searchDocuments(searchQuery, 3);

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
        const prompt = `You are a Master Trader AI with encyclopedic knowledge of "The Candlestick Trading Bible" by Munehisa Homma and advanced Price Action analysis.
${knowledgeContext}
ASSET: ${symbol} (${assetType.toUpperCase()})
TIMEFRAME: ${timeframe}
CURRENT PRICE: ${currentPrice.toFixed(4)}
RANGE: High ${highestHigh.toFixed(4)} | Low ${lowestLow.toFixed(4)}
AVG VOLUME: ${avgVolume.toFixed(0)}

RECENT OHLCV DATA:
${candleData}

${knowledgeContext ? 'Use the trading knowledge provided above to inform your analysis. Reference specific patterns, chapters, or concepts from the documents when applicable.' : ''}

ANALYSIS REQUIREMENTS:
1. Identify Market Structure: Is price making Higher Highs/Higher Lows (uptrend), Lower Highs/Lower Lows (downtrend), or ranging?
2. Identify Candlestick Patterns from "The Candlestick Trading Bible": Engulfing, Pin Bars (Hammer/Shooting Star), Morning/Evening Star, Doji, etc.
3. Determine Support & Resistance levels from the data.
4. Calculate Risk/Reward ratio.

Return a STRICT JSON response (NO markdown, NO backticks) with this EXACT structure:
{
  "signal": "BUY" | "SELL" | "WAIT",
  "confidence": 1-100,
  "currentPrice": ${currentPrice},
  "pattern": "Specific pattern name (e.g., Bullish Engulfing at Key Support)",
  "patternDescription": "Detailed explanation of the pattern found and its significance",
  "marketStructure": "Detailed description of trend, key levels, and market phase",
  "entry": number (precise entry price based on the pattern),
  "stopLoss": number (placed below/above key structure),
  "takeProfit": number (based on next resistance/support or R:R ratio),
  "riskRewardRatio": "e.g., 1:2.5",
  "keyLevels": {
    "resistance": [number, number],
    "support": [number, number]
  },
  "whyEnter": "Detailed explanation of WHY this is a good entry. Reference specific candles, patterns${knowledgeContext ? ', knowledge from uploaded documents,' : ''} from The Candlestick Trading Bible, and market structure.",
  "riskFactors": ["List of 2-3 risk factors to watch"],
  "technicalNotes": "Any additional technical observations (divergences, volume analysis, etc.)",
  "reasoning": "One-liner summary using anti-gravity/levitation metaphors"
}

RULES:
- If signal is "WAIT", set entry/stopLoss/takeProfit to null.
- Be PRECISE with entry/SL/TP based on the actual highs/lows provided.
- Use anti-gravity metaphors: "Refueling for lift-off", "Gravity test at support successful", "Atmospheric resistance detected", "Price entering zero-gravity zone".
- Reference "The Candlestick Trading Bible" patterns explicitly.${knowledgeContext ? '\n- Cite specific sources from the knowledge base when applicable.' : ''}`;

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
        console.error('Gemini Trade Analysis Error:', error.message);
        return generateMockTradeSetup(symbol, currentPrice, assetType);
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
