/**
 * Technical Analysis Service
 * Provides indicators-based trading signals when Gemini is unavailable.
 * Enhanced with candlestick pattern detection from "The Candlestick Trading Bible"
 */

import { detectPatterns } from './candlestickPatterns.js';

/**
 * Calculate Exponential Moving Average (EMA)
 */
function calculateEMA(data, period) {
    if (!data || data.length === 0) return 0;
    const k = 2 / (period + 1);
    let ema = data[0].close;
    for (let i = 1; i < data.length; i++) {
        ema = data[i].close * k + ema * (1 - k);
    }
    return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
function calculateRSI(data, period = 14) {
    if (data.length <= period) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = data.length - period; i < data.length; i++) {
        const diff = data[i].close - data[i - 1].close;
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

/**
 * Calculate Average True Range (ATR)
 */
function calculateATR(data, period = 14) {
    if (data.length <= period) return (data[data.length - 1]?.close || 0) * 0.01;

    let trSum = 0;
    for (let i = data.length - period; i < data.length; i++) {
        const high = data[i].high;
        const low = data[i].low;
        const prevClose = data[i - 1].close;
        const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        trSum += tr;
    }
    return trSum / period;
}

/**
 * Generate technical signal and setup
 * Now enhanced with candlestick pattern detection
 */
export function analyzeTechnicals(symbol, candles, assetType, accountSize) {
    if (!candles || candles.length < 2) {
        return { signal: 'WAIT', reasoning: 'Insufficient data for technical analysis.', dataSource: 'technical' };
    }

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    // Indicators
    const ema9 = calculateEMA(candles.slice(-9), 9);
    const ema21 = calculateEMA(candles.slice(-21), 21);
    const rsi = calculateRSI(candles, 14);
    const atr = calculateATR(candles, 14);

    // === CANDLESTICK PATTERN DETECTION ===
    const patternResult = detectPatterns(candles.slice(-10)); // Last 10 candles for pattern detection
    const detectedPattern = patternResult.pattern;
    const patternSignal = patternResult.signal;
    const allPatterns = patternResult.patterns;

    // Logic: EMA Cross
    const crossedUp = last.close > ema9 && last.close > ema21 && (prev.close <= ema9 || prev.close <= ema21);
    const crossedDown = last.close < ema9 && last.close < ema21 && (prev.close >= ema9 || prev.close >= ema21);

    let signal = 'WAIT';
    let confidence = 50;

    // Candlestick patterns take priority if detected
    if (patternSignal !== 'WAIT' && allPatterns.length > 0) {
        signal = patternSignal;
        // Higher confidence for stronger patterns
        const strongestPattern = allPatterns[0];
        confidence = 55 + (strongestPattern.strength * 10); // 65-95% based on pattern strength

        // Boost confidence if EMA confirms the pattern
        if ((signal === 'BUY' && crossedUp) || (signal === 'SELL' && crossedDown)) {
            confidence = Math.min(95, confidence + 10);
        }
    } else if (crossedUp && rsi < 70) {
        signal = 'BUY';
        confidence = rsi < 30 ? 85 : 65;
    } else if (crossedDown && rsi > 30) {
        signal = 'SELL';
        confidence = rsi > 70 ? 85 : 65;
    }

    // Levels based on ATR
    const slMultiplier = assetType === 'forex' ? 2 : 1.5;
    const tpMultiplier = 3; // 1:2 or 1:3 RR

    const entry = last.close;
    const stopLoss = signal === 'BUY' ? entry - (atr * slMultiplier) : entry + (atr * slMultiplier);
    const takeProfit = signal === 'BUY' ? entry + (atr * tpMultiplier) : entry - (atr * tpMultiplier);
    const breakEven = entry; // Simple break even is entry price
    const slRecommendation = signal === 'BUY'
        ? `Move SL to break-even once price reaches ${(entry + (atr * 1)).toFixed(4)} (+1R). This secures the trade for a win-win scenario.`
        : `Move SL to break-even once price reaches ${(entry - (atr * 1)).toFixed(4)} (+1R) to eliminate risk.`;

    // Build pattern description
    let patternDescription = '';
    if (allPatterns.length > 0) {
        const patternNames = allPatterns.map(p => p.name).join(', ');
        patternDescription = `Candlestick patterns detected: ${patternNames}. `;
    }
    patternDescription += `RSI: ${rsi.toFixed(1)} | EMA9: ${ema9.toFixed(4)} | EMA21: ${ema21.toFixed(4)}`;

    // Tailored setup logic
    let tailoredSetup = "";
    if (signal !== 'WAIT') {
        const riskPerTrade = accountSize * 0.02; // 2% risk
        const priceDistance = Math.abs(entry - stopLoss);

        if (assetType === 'forex') {
            const lots = (riskPerTrade / (priceDistance * 100000)).toFixed(2);
            tailoredSetup = `[LOCAL ENGINE] For your $${accountSize} balance, ${Math.max(0.01, lots)} lots recommended. ${detectedPattern} pattern detected with RSI at ${rsi.toFixed(0)}.`;
        } else {
            const units = (riskPerTrade / (priceDistance || 1)).toFixed(4);
            tailoredSetup = `[LOCAL ENGINE] With $${accountSize}, use ~${units} units. ${detectedPattern} detected. RSI is ${rsi < 40 ? 'oversold' : rsi > 60 ? 'overbought' : 'neutral'} at ${rsi.toFixed(0)}.`;
        }
    }

    // Generate reasoning based on pattern
    let reasoning = '';
    if (signal === 'BUY') {
        reasoning = allPatterns.length > 0
            ? `${detectedPattern} detected - Anti-gravity lift initiated at support zone.`
            : 'Anti-gravity lift confirmed by technical thrusters.';
    } else if (signal === 'SELL') {
        reasoning = allPatterns.length > 0
            ? `${detectedPattern} detected - Gravity reclaiming control at resistance.`
            : 'Gravity winning the battle, structural collapse detected.';
    } else {
        reasoning = 'Quantum entanglement detected, waiting for breakthrough.';
    }

    return {
        signal,
        confidence,
        mtcAlignment: allPatterns.length > 0
            ? `Pattern-Based Analysis (${allPatterns.length} patterns detected)`
            : 'Indicator Crossover (Single Timeframe Fallback)',
        newsSentiment: 'Neutral',
        newsImpact: 'News context unavailable in local engine mode.',
        currentPrice: last.close,
        pattern: detectedPattern,
        patternDescription,
        detectedPatterns: allPatterns, // Include all detected patterns for UI
        marketStructure: signal === 'BUY'
            ? 'Ascending structure with positive momentum.'
            : signal === 'SELL'
                ? 'Descending structure with negative momentum.'
                : 'Price hovering in a tight range.',
        entry: signal === 'WAIT' ? null : entry,
        stopLoss: signal === 'WAIT' ? null : stopLoss,
        takeProfit: signal === 'WAIT' ? null : takeProfit,
        breakEven: signal === 'WAIT' ? null : breakEven,
        slRecommendation: signal === 'WAIT' ? "" : slRecommendation,
        riskRewardRatio: '1:2',
        keyLevels: {
            resistance: [entry + atr, entry + (atr * 2)],
            support: [entry - atr, entry - (atr * 2)]
        },
        whyEnter: allPatterns.length > 0
            ? `${detectedPattern} pattern identified. This structure suggests a powerful ${signal === 'BUY' ? 'upward' : 'downward'} propulsion. EMA${crossedUp || crossedDown ? ' crossover confirms direction.' : ' alignment neutral.'} RSI at ${rsi.toFixed(1)} confirms momentum.`
            : `EMA indicators show ${signal === 'BUY' ? 'bullish' : 'bearish'} trajectory. RSI is at ${rsi.toFixed(1)}, showing ${signal === 'BUY' ? 'strength' : 'weakness'}. ATR volatility is ${atr.toFixed(4)}, providing optimal orbital window.`,
        riskFactors: [
            'Local engine analysis (No Gemini AI)',
            allPatterns.length > 0 ? 'Pattern-based signal' : 'Indicator-based signal',
            'Watch for news-driven volatility'
        ],
        technicalNotes: `RSI: ${rsi.toFixed(1)} | ATR: ${atr.toFixed(4)} | Patterns: ${allPatterns.length}`,
        tailoredSetup,
        reasoning,
        timestamp: Date.now(),
        dataSource: 'technical'
    };
}

