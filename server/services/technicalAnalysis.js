/**
 * Technical Analysis Service
 * Provides indicators-based trading signals when Gemini is unavailable.
 * Enhanced with candlestick pattern detection and multi-indicator confluence
 */

import { detectPatterns } from './candlestickPatterns.js';
import { calculateAllIndicators, calculateATR, calculateEMA } from './indicators.js';

/**
 * Generate technical signal and setup
 * Now enhanced with multi-indicator confluence analysis
 */
export function analyzeTechnicals(symbol, candles, assetType, accountSize) {
    if (!candles || candles.length < 2) {
        return { signal: 'WAIT', reasoning: 'Insufficient data for technical analysis.', dataSource: 'technical' };
    }

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    // === CALCULATE ALL INDICATORS ===
    const indicators = calculateAllIndicators(candles);
    const { rsi, macd, bollingerBands, volume, adx, stochastic, atr, ema, confluenceScore, confluenceBias, confluenceFactors } = indicators;

    // === CANDLESTICK PATTERN DETECTION ===
    const patternResult = detectPatterns(candles.slice(-10));
    const detectedPattern = patternResult.pattern;
    const patternSignal = patternResult.signal;
    const allPatterns = patternResult.patterns;

    // === SIGNAL GENERATION ===
    let signal = 'WAIT';
    let confidence = 50;

    // Primary signal from confluence
    if (confluenceScore >= 40) {
        // Strong confluence - use bias as signal
        if (confluenceBias === 'bullish') {
            signal = 'BUY';
            confidence = Math.min(95, 50 + confluenceScore * 0.5);
        } else if (confluenceBias === 'bearish') {
            signal = 'SELL';
            confidence = Math.min(95, 50 + confluenceScore * 0.5);
        }
    }

    // Candlestick patterns can override or boost confidence
    if (patternSignal !== 'WAIT' && allPatterns.length > 0) {
        const strongestPattern = allPatterns[0];
        
        // If pattern aligns with confluence, boost confidence
        if ((patternSignal === 'BUY' && confluenceBias === 'bullish') ||
            (patternSignal === 'SELL' && confluenceBias === 'bearish')) {
            signal = patternSignal;
            confidence = Math.min(95, confidence + 15);
            confluenceFactors.push(`${strongestPattern.name} pattern confirms direction`);
        }
        // If no strong confluence, pattern can provide the signal
        else if (confluenceScore < 40 && strongestPattern.strength >= 3) {
            signal = patternSignal;
            confidence = 55 + (strongestPattern.strength * 8);
        }
    }

    // ADX filter: If market is ranging, reduce confidence for trend trades
    if (!adx.trending && signal !== 'WAIT') {
        confidence = Math.max(50, confidence - 10);
        if (!confluenceFactors.includes('Market is ranging - lower confidence')) {
            confluenceFactors.push('Market is ranging - lower confidence');
        }
    }

    // === RISK MANAGEMENT LEVELS ===
    const atrMultiplier = assetType === 'forex' ? 2 : 1.5;
    const tpMultiplier = 3;

    const entry = last.close;
    const stopLoss = signal === 'BUY' ? entry - (atr * atrMultiplier) : entry + (atr * atrMultiplier);
    const takeProfit = signal === 'BUY' ? entry + (atr * tpMultiplier) : entry - (atr * tpMultiplier);
    const breakEven = entry;
    const slRecommendation = signal === 'BUY'
        ? `Move SL to break-even once price reaches ${(entry + atr).toFixed(4)} (+1R). This secures a risk-free trade.`
        : `Move SL to break-even once price reaches ${(entry - atr).toFixed(4)} (+1R) to eliminate risk.`;

    // === BUILD PATTERN DESCRIPTION ===
    let patternDescription = '';
    if (allPatterns.length > 0) {
        const patternNames = allPatterns.map(p => p.name).join(', ');
        patternDescription = `Candlestick patterns: ${patternNames}. `;
    }
    patternDescription += `RSI: ${rsi.value.toFixed(1)} (${rsi.zone}) | MACD: ${macd.histogram > 0 ? 'Bullish' : 'Bearish'} | ADX: ${adx.value.toFixed(1)} (${adx.trending ? 'Trending' : 'Ranging'})`;

    // === TAILORED SETUP ===
    let tailoredSetup = "";
    if (signal !== 'WAIT') {
        const riskPerTrade = accountSize * 0.02;
        const priceDistance = Math.abs(entry - stopLoss);

        if (assetType === 'forex') {
            const lots = (riskPerTrade / (priceDistance * 100000)).toFixed(2);
            tailoredSetup = `[CONFLUENCE ENGINE] $${accountSize} account, ${Math.max(0.01, lots)} lots. Confluence Score: ${confluenceScore}/100. ${confluenceFactors.length} indicators aligned.`;
        } else {
            const units = (riskPerTrade / (priceDistance || 1)).toFixed(4);
            tailoredSetup = `[CONFLUENCE ENGINE] $${accountSize} account, ~${units} units. Confluence Score: ${confluenceScore}/100. ${confluenceFactors.length} indicators aligned.`;
        }
    }

    // === REASONING ===
    let reasoning = '';
    if (signal === 'BUY') {
        reasoning = confluenceScore >= 50
            ? `Strong bullish confluence detected (${confluenceScore}/100). Multiple indicators aligned for anti-gravity lift.`
            : `Bullish setup detected. ${detectedPattern} pattern with supporting indicators.`;
    } else if (signal === 'SELL') {
        reasoning = confluenceScore >= 50
            ? `Strong bearish confluence detected (${confluenceScore}/100). Multiple indicators aligned for gravitational pull.`
            : `Bearish setup detected. ${detectedPattern} pattern with supporting indicators.`;
    } else {
        reasoning = 'Quantum entanglement detected. Indicators not aligned - waiting for clearer setup.';
    }

    // === WHY ENTER ===
    const whyEnter = signal !== 'WAIT'
        ? `Confluence Score: ${confluenceScore}/100. Aligned factors: ${confluenceFactors.slice(0, 5).join(', ')}. ${allPatterns.length > 0 ? `${detectedPattern} pattern detected.` : ''} RSI at ${rsi.value.toFixed(1)} (${rsi.zone}), MACD ${macd.histogram > 0 ? 'bullish' : 'bearish'} momentum, ${adx.trending ? 'trending market confirms direction' : 'ranging market - trade cautiously'}.`
        : 'Indicators showing mixed signals. Waiting for confluence alignment.';

    return {
        signal,
        confidence,
        mtcAlignment: `Confluence Analysis (Score: ${confluenceScore}/100)`,
        newsSentiment: 'Neutral',
        newsImpact: 'News context unavailable in local engine mode.',
        currentPrice: last.close,
        pattern: detectedPattern,
        patternDescription,
        detectedPatterns: allPatterns,
        marketStructure: signal === 'BUY'
            ? `Bullish structure. ${adx.trending ? 'Strong uptrend' : 'Ranging with bullish bias'}.`
            : signal === 'SELL'
                ? `Bearish structure. ${adx.trending ? 'Strong downtrend' : 'Ranging with bearish bias'}.`
                : 'Price consolidating. Awaiting directional breakout.',
        entry: signal === 'WAIT' ? null : entry,
        stopLoss: signal === 'WAIT' ? null : stopLoss,
        takeProfit: signal === 'WAIT' ? null : takeProfit,
        breakEven: signal === 'WAIT' ? null : breakEven,
        slRecommendation: signal === 'WAIT' ? "" : slRecommendation,
        riskRewardRatio: '1:2',
        keyLevels: {
            resistance: [bollingerBands.upper, last.close + (atr * 2)],
            support: [bollingerBands.lower, last.close - (atr * 2)]
        },
        whyEnter,
        riskFactors: [
            'Local engine analysis (No Gemini AI)',
            `Confluence Score: ${confluenceScore}/100`,
            adx.trending ? 'Trending market' : 'Ranging market - use caution',
            volume.spike ? 'Volume spike detected' : 'Normal volume'
        ],
        technicalNotes: `RSI: ${rsi.value.toFixed(1)} | MACD: ${macd.value.toFixed(4)} | ADX: ${adx.value.toFixed(1)} | Stoch: ${stochastic.k.toFixed(1)}`,
        tailoredSetup,
        reasoning,
        // NEW: Include full indicator data
        indicators: {
            rsi: { value: rsi.value, zone: rsi.zone, divergence: rsi.divergence },
            macd: { value: macd.value, signal: macd.signal, histogram: macd.histogram, crossover: macd.crossover },
            bollingerBands: { upper: bollingerBands.upper, middle: bollingerBands.middle, lower: bollingerBands.lower, squeeze: bollingerBands.squeeze, percentB: bollingerBands.percentB },
            volume: { current: volume.current, average: volume.average, ratio: volume.ratio, spike: volume.spike },
            adx: { value: adx.value, trending: adx.trending, direction: adx.direction },
            stochastic: { k: stochastic.k, d: stochastic.d, zone: stochastic.zone, crossover: stochastic.crossover },
            atr
        },
        confluenceScore,
        confluenceBias,
        confluenceFactors,
        timestamp: Date.now(),
        dataSource: 'technical'
    };
}

