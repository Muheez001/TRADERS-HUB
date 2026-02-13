/**
 * AI Analyst Service
 * Uses Google Gemini API to analyze news and provide market impact opinions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { searchDocuments, getStats } from './vectorStore.js';
import { analyzeTechnicals } from './technicalAnalysis.js';
import { calculateAllIndicators } from './indicators.js';

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

// === ANALYSIS CACHE ===
// Key: symbol:timeframe:assetType
// Value: { data: result, timestamp: Date.now() }
const analysisCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

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
export async function analyzeMarketStructure(symbol, currentInterval, candlesData, assetType = 'crypto', accountSize = 500, riskAmount = 50, targetGain = 100, news = []) {
    // Handle both legacy (Array) and MTC (Object) formats
    const isMTC = candlesData && candlesData.primary;
    const candles = isMTC ? candlesData.primary : candlesData;
    const secondary = isMTC ? candlesData.secondary : [];
    const tertiary = isMTC ? candlesData.tertiary : [];
    const mtcIntervals = isMTC ? candlesData.intervals : [currentInterval];

    // === CACHE CHECK ===
    const cacheKey = `${symbol}:${currentInterval}:${assetType}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        console.log(`⚡ Returning CACHED analysis for ${symbol} (${currentInterval})`);
        return cached.data;
    }

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

    // === CALCULATE ALL TECHNICAL INDICATORS ===
    const indicators = calculateAllIndicators(candles);
    console.log(`📊 Indicators calculated: Confluence Score ${indicators.confluenceScore}/100, Bias: ${indicators.confluenceBias}`);

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
        const prompt = `You are a professional trading intelligence system embedded in TRADERS-HUB — designed to deliver actionable trade setups and market analysis for Crypto, Forex, and Commodities.

Your objective is to identify trade opportunities when indicators show reasonable alignment. You should ACTIVELY LOOK FOR setups — your job is to find the best available trade, not to reject everything. Only return "no_setup" if the data genuinely shows conflicting signals with no clear directional bias.

=== CORE RULES ===

1. Generate a trade setup when confidence ≥ 65%. You should aim to find setups — most markets have tradeable opportunities.

2. A valid setup requires at least 2-3 of these confirming:
   - Price action structure (trend, key levels, candlestick patterns)
   - 2+ indicators aligning in the same direction (RSI, MACD, EMA, Stochastic, Bollinger Bands)
   - Volume supporting the move OR trending market (ADX > 20)
   - Multi-timeframe alignment is a bonus but NOT required for every setup

3. Candlestick patterns at key levels (support/resistance) with at least one confirming indicator are valid setups.

4. Risk management:
   - Stop-loss should be ATR-based or placed at nearby structure (swing high/low)
   - Reward:risk ≥ 1.5:1 minimum
   - Calculate position size based on account size and risk tolerance provided
   - Always calculate and show dollar risk

5. Be realistic but constructive:
   - Identify the best opportunity from the data provided
   - Note risks, but don't let them prevent you from giving a setup if indicators align
   - News context is supplementary — don't reject a technically sound setup due to general news uncertainty

=== CONFIDENCE SCORING GUIDE ===
- 65-70%: 2 indicators aligned + price at key level = valid setup
- 70-80%: 3+ indicators aligned + clear trend structure
- 80-90%: Strong multi-timeframe agreement + volume confirmation + multiple confluences
- 90-100%: Exceptional setup with everything aligned (rare)

=== INPUT DATA ===

ASSET: ${symbol} (${assetType.toUpperCase()})
ACCOUNT SIZE: $${accountSize}
MAX RISK PER TRADE: $${riskAmount}
TARGET GAIN: $${targetGain}
CURRENT PRICE: ${currentPrice.toFixed(4)}

=== MULTI-TIMEFRAME CANDLES ===
PRIMARY (${mtcIntervals[0]}):
${primaryData}

SECONDARY (${mtcIntervals[1] || 'N/A'}):
${secondaryData}

TERTIARY (${mtcIntervals[2] || 'N/A'}):
${tertiaryData}

=== PRE-COMPUTED INDICATORS ===
RSI(14): ${indicators.rsi.value.toFixed(1)} | Zone: ${indicators.rsi.zone}${indicators.rsi.divergence ? ` | DIVERGENCE: ${indicators.rsi.divergence}` : ''}
MACD: Line=${indicators.macd.value.toFixed(4)} | Signal=${indicators.macd.signal.toFixed(4)} | Histogram=${indicators.macd.histogram > 0 ? 'BULLISH' : 'BEARISH'}${indicators.macd.crossover ? ` | CROSSOVER: ${indicators.macd.crossover}` : ''}
Bollinger Bands: Upper=${indicators.bollingerBands.upper.toFixed(4)} | Middle=${indicators.bollingerBands.middle.toFixed(4)} | Lower=${indicators.bollingerBands.lower.toFixed(4)}${indicators.bollingerBands.squeeze ? ' | SQUEEZE DETECTED' : ''} | %B=${(indicators.bollingerBands.percentB * 100).toFixed(1)}%
Volume: Current=${indicators.volume.current.toFixed(0)} | Avg=${indicators.volume.average.toFixed(0)} | Ratio=${indicators.volume.ratio.toFixed(2)}x${indicators.volume.spike ? ' | VOLUME SPIKE' : ''}
ADX(14): ${indicators.adx.value.toFixed(1)} | Market: ${indicators.adx.trending ? 'TRENDING' : 'RANGING'} | Direction: ${indicators.adx.direction}
Stochastic(14,3,3): %K=${indicators.stochastic.k.toFixed(1)} | %D=${indicators.stochastic.d.toFixed(1)} | Zone: ${indicators.stochastic.zone}${indicators.stochastic.crossover ? ` | CROSSOVER: ${indicators.stochastic.crossover}` : ''}
ATR(14): ${indicators.atr.toFixed(4)}
EMA9: ${indicators.ema.ema9?.toFixed(4) || 'N/A'} | EMA21: ${indicators.ema.ema21?.toFixed(4) || 'N/A'}
CONFLUENCE SCORE: ${indicators.confluenceScore}/100 | BIAS: ${indicators.confluenceBias.toUpperCase()}
ALIGNED FACTORS: ${indicators.confluenceFactors.slice(0, 5).join(', ') || 'None'}

=== RECENT MARKET NEWS ===
${newsContext}

${knowledgeContext}

=== YOUR TASK ===

Analyze this data and find the best trade setup. You should STRONGLY PREFER giving a setup over returning "no_setup". Return VALID JSON ONLY with one of these two structures:

**A. Trade Setup (confidence ≥ 65%):**

{
  "status": "setup",
  "symbol": "${symbol}",
  "direction": "Long" | "Short",
  "timeframe": "${mtcIntervals[0]}",
  "confidence": 65-100,
  "entry": number,
  "stop_loss": number,
  "take_profit": number,
  "rr_ratio": number,
  "risk_percent": number,
  "position_size": number,
  "dollar_risk": number,
  "key_levels": {
    "support": [number, number],
    "resistance": [number, number]
  },
  "rationale": "Clear, concise paragraph explaining WHY this setup has edge — cite the specific indicators and price action that align.",
  "confluence_factors": [
    "Factor 1",
    "Factor 2",
    "Factor 3 (if applicable)"
  ],
  "risks": [
    "Risk 1",
    "Risk 2"
  ],
  "management": "Trade management plan"
}

**B. No Setup (ONLY when signals genuinely conflict with no clear bias):**

{
  "status": "no_setup",
  "symbol": "${symbol}",
  "reason": "Specific explanation of what is conflicting",
  "current_bias": "Slightly bullish / Neutral / Slightly bearish",
  "watch_levels": [number, number, number],
  "next_catalysts": ["Event 1", "Event 2"]
}

IMPORTANT RULES:
- Your DEFAULT should be to find and provide a setup — only return "no_setup" when data truly conflicts
- If the pre-computed confluence score shows a bias (bullish or bearish), there IS likely a setup — find it
- Use precise, professional language
- Never invent data — only use what is provided
- Calculate position_size and dollar_risk precisely based on account size and risk tolerance
- Ensure stop_loss placement is ATR-based or structure-based
- Only output valid JSON, no other text`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean markdown code blocks if present
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        const finalResult = {
            ...analysis,
            currentPrice,
            highestHigh,
            lowestLow,
            avgVolume,
            // Include computed indicators for frontend
            indicators: {
                rsi: indicators.rsi,
                macd: indicators.macd,
                bollingerBands: indicators.bollingerBands,
                volume: indicators.volume,
                adx: indicators.adx,
                stochastic: indicators.stochastic,
                atr: indicators.atr,
                ema: indicators.ema
            },
            confluenceScore: indicators.confluenceScore,
            confluenceBias: indicators.confluenceBias,
            confluenceFactors: indicators.confluenceFactors,
            timestamp: Date.now(),
            dataSource: 'live'
        };

        // Cache the result
        analysisCache.set(`${symbol}:${currentInterval}:${assetType}`, {
            data: finalResult,
            timestamp: Date.now()
        });

        return finalResult;

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
