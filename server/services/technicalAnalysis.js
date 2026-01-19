/**
 * Technical Analysis Service
 * Provides indicators-based trading signals when Gemini is unavailable.
 */

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
 */
export function analyzeTechnicals(symbol, candles, assetType, accountSize) {
    if (!candles || candles.length < 2) {
        return { signal: 'WAIT', reasoning: 'Insufficient data for technical analysis.' };
    }

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    // Indicators
    const ema9 = calculateEMA(candles.slice(-9), 9);
    const ema21 = calculateEMA(candles.slice(-21), 21);
    const rsi = calculateRSI(candles, 14);
    const atr = calculateATR(candles, 14);

    // Logic: EMA Cross
    const crossedUp = last.close > ema9 && last.close > ema21 && (prev.close <= ema9 || prev.close <= ema21);
    const crossedDown = last.close < ema9 && last.close < ema21 && (prev.close >= ema9 || prev.close >= ema21);

    let signal = 'WAIT';
    let confidence = 50;

    if (crossedUp && rsi < 70) {
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

    // Tailored setup logic
    let tailoredSetup = "";
    if (signal !== 'WAIT') {
        const riskPerTrade = accountSize * 0.02; // 2% risk
        const priceDistance = Math.abs(entry - stopLoss);

        if (assetType === 'forex') {
            const lots = (riskPerTrade / (priceDistance * 100000)).toFixed(2);
            tailoredSetup = `[TECHNICAL FALLBACK] For your $${accountSize} balance, we suggest ${Math.max(0.01, lots)} lots. EMA crossover confirmed with RSI at ${rsi.toFixed(0)}. Keep risk at $${riskPerTrade.toFixed(2)}.`;
        } else {
            const units = (riskPerTrade / (priceDistance || 1)).toFixed(4);
            tailoredSetup = `[TECHNICAL FALLBACK] With $${accountSize}, use ~${units} units. RSI is ${rsi < 40 ? 'oversold' : rsi > 60 ? 'overbought' : 'neutral'} at ${rsi.toFixed(0)}. Gravity test successful via EMA crossover.`;
        }
    }

    return {
        signal,
        confidence,
        currentPrice: last.close,
        pattern: signal === 'BUY' ? 'Golden Cross / Bullish Momentum' : signal === 'SELL' ? 'Death Cross / Bearish Momentum' : 'Consolidation',
        patternDescription: `Technical analysis based on EMA crossover and RSI momentum. Current RSI: ${rsi.toFixed(1)}.`,
        marketStructure: signal === 'BUY' ? 'Ascending structure with positive momentum.' : signal === 'SELL' ? 'Descending structure with negative momentum.' : 'Price hovering in a tight range.',
        entry: signal === 'WAIT' ? null : entry,
        stopLoss: signal === 'WAIT' ? null : stopLoss,
        takeProfit: signal === 'WAIT' ? null : takeProfit,
        riskRewardRatio: '1:2',
        keyLevels: {
            resistance: [entry + atr, entry + (atr * 2)],
            support: [entry - atr, entry - (atr * 2)]
        },
        whyEnter: `EMA indicators show ${signal === 'BUY' ? 'bullish' : 'bearish'} trajectory. RSI is at ${rsi.toFixed(1)}, showing ${signal === 'BUY' ? 'strength' : 'weakness'}. ATR volatility is ${atr.toFixed(4)}.`,
        riskFactors: [
            'Technical indicators only (No AI context)',
            'Potential lag in crossover signal',
            'Watch for news-driven volatility'
        ],
        technicalNotes: `RSI: ${rsi.toFixed(1)} | ATR: ${atr.toFixed(4)}`,
        tailoredSetup,
        reasoning: signal === 'BUY' ? 'Anti-gravity lift confirmed by technical thrusters.' : signal === 'SELL' ? 'Gravity winning the battle, structural collapse detected.' : 'Quantum entanglement detected, waiting for breakthrough.',
        timestamp: Date.now(),
        dataSource: 'technical'
    };
}
