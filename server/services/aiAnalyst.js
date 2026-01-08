/**
 * AI Analyst Service
 * Uses Google Gemini API to analyze news and provide market impact opinions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

// Initialize Gemini if API key is available
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });
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

export { generateRuleBasedAnalysis };
