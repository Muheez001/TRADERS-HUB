/**
 * Technical Indicators Service
 * Provides comprehensive indicator calculations for confluence-based trading signals
 */

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} data - Array of candles with 'close' property
 * @param {number} period - Number of periods
 * @returns {number} SMA value
 */
export function calculateSMA(data, period) {
    if (!data || data.length < period) return null;
    const slice = data.slice(-period);
    const sum = slice.reduce((acc, candle) => acc + candle.close, 0);
    return sum / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} data - Array of candles with 'close' property
 * @param {number} period - Number of periods
 * @returns {number} EMA value
 */
export function calculateEMA(data, period) {
    if (!data || data.length === 0) return null;
    const k = 2 / (period + 1);
    let ema = data[0].close;
    for (let i = 1; i < data.length; i++) {
        ema = data[i].close * k + ema * (1 - k);
    }
    return ema;
}

/**
 * Calculate EMA series (returns array of EMA values)
 */
function calculateEMASeries(data, period) {
    if (!data || data.length < period) return [];
    const k = 2 / (period + 1);
    const emas = [];
    let ema = data[0].close;
    emas.push(ema);

    for (let i = 1; i < data.length; i++) {
        ema = data[i].close * k + ema * (1 - k);
        emas.push(ema);
    }
    return emas;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} data - Array of candles
 * @param {number} period - RSI period (default 14)
 * @returns {Object} RSI value and zone classification
 */
export function calculateRSI(data, period = 14) {
    if (!data || data.length <= period) {
        return { value: 50, zone: 'neutral', divergence: null };
    }

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain/loss
    for (let i = data.length - period; i < data.length; i++) {
        const diff = data[i].close - data[i - 1].close;
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) {
        return { value: 100, zone: 'overbought', divergence: null };
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // Determine zone
    let zone = 'neutral';
    if (rsi >= 70) zone = 'overbought';
    else if (rsi <= 30) zone = 'oversold';

    // Check for divergence (simplified)
    const divergence = detectRSIDivergence(data, period);

    return { value: rsi, zone, divergence };
}

/**
 * Detect RSI Divergence
 * Bullish divergence: Price makes lower low, RSI makes higher low
 * Bearish divergence: Price makes higher high, RSI makes lower high
 */
function detectRSIDivergence(data, period = 14) {
    if (data.length < period * 2) return null;

    // Get RSI values for recent periods
    const recentData = data.slice(-20);
    const rsiValues = [];

    for (let i = period; i < recentData.length; i++) {
        const slice = recentData.slice(0, i + 1);
        let gains = 0, losses = 0;
        for (let j = slice.length - period; j < slice.length; j++) {
            const diff = slice[j].close - slice[j - 1].close;
            if (diff >= 0) gains += diff;
            else losses -= diff;
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiValues.push(100 - (100 / (1 + rs)));
    }

    if (rsiValues.length < 5) return null;

    // Find recent swing points
    const priceNow = data[data.length - 1].close;
    const pricePrev = data[data.length - 5].close;
    const rsiNow = rsiValues[rsiValues.length - 1];
    const rsiPrev = rsiValues[rsiValues.length - 5];

    // Bullish divergence: price lower, RSI higher
    if (priceNow < pricePrev && rsiNow > rsiPrev) {
        return 'bullish';
    }
    // Bearish divergence: price higher, RSI lower
    if (priceNow > pricePrev && rsiNow < rsiPrev) {
        return 'bearish';
    }

    return null;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array} data - Array of candles
 * @param {number} fastPeriod - Fast EMA period (default 12)
 * @param {number} slowPeriod - Slow EMA period (default 26)
 * @param {number} signalPeriod - Signal line period (default 9)
 * @returns {Object} MACD line, signal line, histogram, crossover
 */
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (!data || data.length < slowPeriod + signalPeriod) {
        return { value: 0, signal: 0, histogram: 0, crossover: null };
    }

    // Calculate MACD line (fast EMA - slow EMA)
    const fastEMAs = calculateEMASeries(data, fastPeriod);
    const slowEMAs = calculateEMASeries(data, slowPeriod);

    const macdLine = [];
    for (let i = 0; i < data.length; i++) {
        if (i >= slowPeriod - 1) {
            macdLine.push(fastEMAs[i] - slowEMAs[i]);
        }
    }

    if (macdLine.length < signalPeriod) {
        return { value: 0, signal: 0, histogram: 0, crossover: null };
    }

    // Calculate signal line (EMA of MACD line)
    const k = 2 / (signalPeriod + 1);
    let signalLine = macdLine[0];
    for (let i = 1; i < macdLine.length; i++) {
        signalLine = macdLine[i] * k + signalLine * (1 - k);
    }

    const currentMACD = macdLine[macdLine.length - 1];
    const prevMACD = macdLine[macdLine.length - 2] || currentMACD;
    const histogram = currentMACD - signalLine;

    // Detect crossover
    let crossover = null;
    if (macdLine.length >= 2) {
        const prevSignal = signalLine - (currentMACD - prevMACD) * k / (1 - k); // Approximate
        if (prevMACD < prevSignal && currentMACD > signalLine) {
            crossover = 'bullish';
        } else if (prevMACD > prevSignal && currentMACD < signalLine) {
            crossover = 'bearish';
        }
    }

    return {
        value: currentMACD,
        signal: signalLine,
        histogram,
        crossover
    };
}

/**
 * Calculate Bollinger Bands
 * @param {Array} data - Array of candles
 * @param {number} period - SMA period (default 20)
 * @param {number} stdDev - Standard deviation multiplier (default 2)
 * @returns {Object} Upper, middle, lower bands, squeeze detection
 */
export function calculateBollingerBands(data, period = 20, stdDev = 2) {
    if (!data || data.length < period) {
        const price = data?.[data.length - 1]?.close || 0;
        return { upper: price, middle: price, lower: price, squeeze: false, percentB: 50 };
    }

    const slice = data.slice(-period);
    const closes = slice.map(c => c.close);

    // Calculate SMA (middle band)
    const middle = closes.reduce((a, b) => a + b, 0) / period;

    // Calculate standard deviation
    const squaredDiffs = closes.map(c => Math.pow(c - middle, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const sd = Math.sqrt(variance);

    const upper = middle + (sd * stdDev);
    const lower = middle - (sd * stdDev);

    const currentPrice = data[data.length - 1].close;

    // %B: Where price is relative to bands (0 = lower, 1 = upper)
    const percentB = (upper - lower) !== 0 ? (currentPrice - lower) / (upper - lower) : 0.5;

    // Bandwidth for squeeze detection
    const bandwidth = (upper - lower) / middle * 100;

    // Calculate historical bandwidth to detect squeeze
    const avgBandwidth = bandwidth; // Simplified - could compare to historical
    const squeeze = bandwidth < 4; // Narrow bands indicate squeeze (volatility contraction)

    return { upper, middle, lower, squeeze, percentB, bandwidth };
}

/**
 * Calculate Volume Analysis
 * @param {Array} data - Array of candles with volume
 * @param {number} period - Lookback period for average (default 20)
 * @returns {Object} Current volume, average, ratio, spike detection
 */
export function calculateVolumeAnalysis(data, period = 20) {
    if (!data || data.length < 2) {
        return { current: 0, average: 0, ratio: 1, spike: false, trend: 'neutral' };
    }

    const currentVolume = data[data.length - 1].volume || 0;

    // Calculate average volume
    const lookback = Math.min(period, data.length);
    const volumeSlice = data.slice(-lookback);
    const avgVolume = volumeSlice.reduce((sum, c) => sum + (c.volume || 0), 0) / lookback;

    const ratio = avgVolume > 0 ? currentVolume / avgVolume : 1;

    // Spike detection (volume > 1.5x average)
    const spike = ratio > 1.5;

    // Volume trend (increasing or decreasing over last 5 candles)
    let trend = 'neutral';
    if (data.length >= 5) {
        const recentVols = data.slice(-5).map(c => c.volume || 0);
        const firstHalf = (recentVols[0] + recentVols[1]) / 2;
        const secondHalf = (recentVols[3] + recentVols[4]) / 2;
        if (secondHalf > firstHalf * 1.2) trend = 'increasing';
        else if (secondHalf < firstHalf * 0.8) trend = 'decreasing';
    }

    // Check if volume confirms price movement
    const priceChange = data[data.length - 1].close - data[data.length - 2].close;
    const volumeConfirms = (priceChange > 0 && spike) || (priceChange < 0 && spike);

    return { current: currentVolume, average: avgVolume, ratio, spike, trend, confirms: volumeConfirms };
}

/**
 * Calculate Average Directional Index (ADX)
 * Measures trend strength regardless of direction
 * @param {Array} data - Array of candles
 * @param {number} period - ADX period (default 14)
 * @returns {Object} ADX value and trend classification
 */
export function calculateADX(data, period = 14) {
    if (!data || data.length < period * 2) {
        return { value: 25, trending: false, direction: 'neutral' };
    }

    const trueRanges = [];
    const plusDMs = [];
    const minusDMs = [];

    for (let i = 1; i < data.length; i++) {
        const high = data[i].high;
        const low = data[i].low;
        const prevHigh = data[i - 1].high;
        const prevLow = data[i - 1].low;
        const prevClose = data[i - 1].close;

        // True Range
        const tr = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        trueRanges.push(tr);

        // Directional Movement
        const upMove = high - prevHigh;
        const downMove = prevLow - low;

        const plusDM = (upMove > downMove && upMove > 0) ? upMove : 0;
        const minusDM = (downMove > upMove && downMove > 0) ? downMove : 0;

        plusDMs.push(plusDM);
        minusDMs.push(minusDM);
    }

    if (trueRanges.length < period) {
        return { value: 25, trending: false, direction: 'neutral' };
    }

    // Smooth TR, +DM, -DM using Wilder's smoothing
    const smoothTR = trueRanges.slice(-period).reduce((a, b) => a + b, 0);
    const smoothPlusDM = plusDMs.slice(-period).reduce((a, b) => a + b, 0);
    const smoothMinusDM = minusDMs.slice(-period).reduce((a, b) => a + b, 0);

    // Calculate +DI and -DI
    const plusDI = smoothTR > 0 ? (smoothPlusDM / smoothTR) * 100 : 0;
    const minusDI = smoothTR > 0 ? (smoothMinusDM / smoothTR) * 100 : 0;

    // Calculate DX
    const diSum = plusDI + minusDI;
    const dx = diSum > 0 ? (Math.abs(plusDI - minusDI) / diSum) * 100 : 0;

    // ADX is smoothed DX (simplified - using current DX)
    const adx = dx;

    const trending = adx > 25;
    let direction = 'neutral';
    if (plusDI > minusDI) direction = 'bullish';
    else if (minusDI > plusDI) direction = 'bearish';

    return { value: adx, trending, direction, plusDI, minusDI };
}

/**
 * Calculate Stochastic Oscillator
 * @param {Array} data - Array of candles
 * @param {number} kPeriod - %K period (default 14)
 * @param {number} dPeriod - %D smoothing period (default 3)
 * @returns {Object} %K, %D values and zone
 */
export function calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
    if (!data || data.length < kPeriod + dPeriod) {
        return { k: 50, d: 50, zone: 'neutral', crossover: null };
    }

    // Calculate %K values
    const kValues = [];
    for (let i = kPeriod - 1; i < data.length; i++) {
        const slice = data.slice(i - kPeriod + 1, i + 1);
        const highest = Math.max(...slice.map(c => c.high));
        const lowest = Math.min(...slice.map(c => c.low));
        const current = slice[slice.length - 1].close;

        const k = highest !== lowest ? ((current - lowest) / (highest - lowest)) * 100 : 50;
        kValues.push(k);
    }

    // Calculate %D (SMA of %K)
    const dValues = [];
    for (let i = dPeriod - 1; i < kValues.length; i++) {
        const slice = kValues.slice(i - dPeriod + 1, i + 1);
        const d = slice.reduce((a, b) => a + b, 0) / dPeriod;
        dValues.push(d);
    }

    const currentK = kValues[kValues.length - 1];
    const currentD = dValues[dValues.length - 1];
    const prevK = kValues[kValues.length - 2] || currentK;
    const prevD = dValues[dValues.length - 2] || currentD;

    // Determine zone
    let zone = 'neutral';
    if (currentK >= 80) zone = 'overbought';
    else if (currentK <= 20) zone = 'oversold';

    // Detect crossover
    let crossover = null;
    if (prevK < prevD && currentK > currentD) crossover = 'bullish';
    else if (prevK > prevD && currentK < currentD) crossover = 'bearish';

    return { k: currentK, d: currentD, zone, crossover };
}

/**
 * Calculate Average True Range (ATR)
 * @param {Array} data - Array of candles
 * @param {number} period - ATR period (default 14)
 * @returns {number} ATR value
 */
export function calculateATR(data, period = 14) {
    if (!data || data.length <= period) {
        return data?.[data.length - 1]?.close * 0.01 || 0;
    }

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
 * Calculate all indicators and generate confluence score
 * @param {Array} data - Array of candles
 * @returns {Object} All indicators and confluence analysis
 */
export function calculateAllIndicators(data) {
    const rsi = calculateRSI(data, 14);
    const macd = calculateMACD(data, 12, 26, 9);
    const bollingerBands = calculateBollingerBands(data, 20, 2);
    const volume = calculateVolumeAnalysis(data, 20);
    const adx = calculateADX(data, 14);
    const stochastic = calculateStochastic(data, 14, 3);
    const atr = calculateATR(data, 14);
    const ema9 = calculateEMA(data?.slice(-9) || [], 9);
    const ema21 = calculateEMA(data?.slice(-21) || [], 21);
    const ema200 = calculateEMA(data?.slice(-200) || [], 200);
    const mfi = calculateMFI(data, 14);
    const ms = detectMarketStructure(data);
    const orderBlocks = detectOrderBlocks(data);
    const fvg = detectFVG(data);
    const sweeps = detectLiquiditySweeps(data);

    // Calculate confluence
    const confluenceFactors = [];
    let bullishPoints = 0;
    let bearishPoints = 0;

    // Market Structure (SMC)
    if (ms.lastEvent) {
        confluenceFactors.push(`Market Structure: ${ms.lastEvent} (${ms.trend})`);
        if (ms.trend === 'bullish') bullishPoints += 20;
        else if (ms.trend === 'bearish') bearishPoints += 20;
    }

    // Liquidity Sweeps
    if (sweeps.length > 0) {
        const lastSweep = sweeps[sweeps.length - 1];
        confluenceFactors.push(`Liquidity Sweep: ${lastSweep.type}`);
        if (lastSweep.type === 'bullish_reversal') bullishPoints += 25;
        else if (lastSweep.type === 'bearish_reversal') bearishPoints += 25;
    }

    // Trend filter (Adam Khoo)
    if (ema200 && data.length > 0) {
        const currentPrice = data[data.length - 1].close;
        if (currentPrice > ema200) {
            confluenceFactors.push('Above 200 EMA (Long-term Bullish)');
            bullishPoints += 10;
        } else {
            confluenceFactors.push('Below 200 EMA (Long-term Bearish)');
            bearishPoints += 10;
        }
    }

    // MFI signals (Trade Confident / Whale activity)
    if (mfi) {
        if (mfi.value < 20) {
            confluenceFactors.push('MFI oversold (Whale accumulation?)');
            bullishPoints += 15;
        } else if (mfi.value > 80) {
            confluenceFactors.push('MFI overbought (Whale distribution?)');
            bearishPoints += 15;
        }
    }

    // SMC signals
    if (fvg.length > 0) {
        const lastFVG = fvg[fvg.length - 1];
        confluenceFactors.push(`Fair Value Gap detected (${lastFVG.type})`);
        if (lastFVG.type === 'bullish') bullishPoints += 10;
        else bearishPoints += 10;
    }

    if (orderBlocks.bullish.length > 0) {
        confluenceFactors.push('Bullish Order Block detected');
        bullishPoints += 15;
    }
    if (orderBlocks.bearish.length > 0) {
        confluenceFactors.push('Bearish Order Block detected');
        bearishPoints += 15;
    }

    // RSI signals
    if (rsi.zone === 'oversold') {
        confluenceFactors.push('RSI oversold (<30)');
        bullishPoints += 15;
    } else if (rsi.zone === 'overbought') {
        confluenceFactors.push('RSI overbought (>70)');
        bearishPoints += 15;
    }
    if (rsi.divergence === 'bullish') {
        confluenceFactors.push('Bullish RSI divergence');
        bullishPoints += 20;
    } else if (rsi.divergence === 'bearish') {
        confluenceFactors.push('Bearish RSI divergence');
        bearishPoints += 20;
    }

    // MACD signals
    if (macd.crossover === 'bullish') {
        confluenceFactors.push('MACD bullish crossover');
        bullishPoints += 15;
    } else if (macd.crossover === 'bearish') {
        confluenceFactors.push('MACD bearish crossover');
        bearishPoints += 15;
    }
    if (macd.histogram > 0) {
        confluenceFactors.push('MACD histogram positive');
        bullishPoints += 10;
    } else if (macd.histogram < 0) {
        confluenceFactors.push('MACD histogram negative');
        bearishPoints += 10;
    }

    // Bollinger Bands signals
    if (bollingerBands.percentB <= 0.05) {
        confluenceFactors.push('Price at lower Bollinger Band');
        bullishPoints += 10;
    } else if (bollingerBands.percentB >= 0.95) {
        confluenceFactors.push('Price at upper Bollinger Band');
        bearishPoints += 10;
    }
    if (bollingerBands.squeeze) {
        confluenceFactors.push('Bollinger squeeze (breakout imminent)');
    }

    // Volume signals
    if (volume.spike && volume.confirms) {
        confluenceFactors.push('Volume spike confirms price action');
        bullishPoints += 10;
        bearishPoints += 10; // Neutral confirmation
    }

    // ADX signals
    if (adx.trending) {
        confluenceFactors.push(`Strong trend (ADX: ${adx.value.toFixed(1)})`);
        if (adx.direction === 'bullish') bullishPoints += 10;
        else if (adx.direction === 'bearish') bearishPoints += 10;
    }

    // Stochastic signals
    if (stochastic.zone === 'oversold') {
        confluenceFactors.push('Stochastic oversold (<20)');
        bullishPoints += 10;
    } else if (stochastic.zone === 'overbought') {
        confluenceFactors.push('Stochastic overbought (>80)');
        bearishPoints += 10;
    }
    if (stochastic.crossover === 'bullish') {
        confluenceFactors.push('Stochastic bullish crossover');
        bullishPoints += 10;
    } else if (stochastic.crossover === 'bearish') {
        confluenceFactors.push('Stochastic bearish crossover');
        bearishPoints += 10;
    }

    // EMA trend
    if (ema9 && ema21) {
        if (ema9 > ema21) {
            confluenceFactors.push('EMA9 above EMA21 (bullish trend)');
            bullishPoints += 10;
        } else if (ema9 < ema21) {
            confluenceFactors.push('EMA9 below EMA21 (bearish trend)');
            bearishPoints += 10;
        }
    }

    // Calculate final confluence score (0-100)
    const totalPoints = Math.max(bullishPoints, bearishPoints);
    const confluenceScore = Math.min(100, totalPoints);
    const confluenceBias = bullishPoints > bearishPoints ? 'bullish' :
        bearishPoints > bullishPoints ? 'bearish' : 'neutral';

    return {
        rsi,
        macd,
        bollingerBands,
        volume,
        adx,
        stochastic,
        atr,
        ema: { ema9, ema21, ema200 },
        mfi,
        orderBlocks,
        fvg,
        marketStructure: ms,
        liquiditySweeps: sweeps,
        confluenceScore,
        confluenceBias,
        confluenceFactors
    };
}

/**
 * Calculate Money Flow Index (MFI) - Uses Volume and Price
 * @param {Array} data - Array of candles
 * @param {number} period - default 14
 */
export function calculateMFI(data, period = 14) {
    if (!data || data.length <= period) return { value: 50 };

    let posMoneyFlow = 0;
    let negMoneyFlow = 0;

    for (let i = data.length - period; i < data.length; i++) {
        const current = data[i];
        const prev = data[i - 1];
        
        const typicalPrice = (current.high + current.low + current.close) / 3;
        const prevTypicalPrice = (prev.high + prev.low + prev.close) / 3;
        const moneyFlow = typicalPrice * current.volume;

        if (typicalPrice > prevTypicalPrice) posMoneyFlow += moneyFlow;
        else if (typicalPrice < prevTypicalPrice) negMoneyFlow += moneyFlow;
    }

    if (negMoneyFlow === 0) return { value: 100 };
    const moneyRatio = posMoneyFlow / negMoneyFlow;
    const mfi = 100 - (100 / (1 + moneyRatio));

    return { value: mfi };
}

/**
 * Detect Fair Value Gaps (FVG) / Imbalances (SMC Concept)
 */
export function detectFVG(data) {
    if (!data || data.length < 3) return [];
    const fvgs = [];
    
    // Check last 20 candles for gaps
    for (let i = data.length - 20; i < data.length - 1; i++) {
        if (i < 1) continue;
        const c1 = data[i - 1];
        const c2 = data[i];
        const c3 = data[i + 1];

        // Bullish FVG: Low of candle 3 is above high of candle 1
        if (c3.low > c1.high) {
            fvgs.push({
                type: 'bullish',
                top: c3.low,
                bottom: c1.high,
                index: i
            });
        }
        // Bearish FVG: High of candle 3 is below low of candle 1
        else if (c3.high < c1.low) {
            fvgs.push({
                type: 'bearish',
                top: c1.low,
                bottom: c3.high,
                index: i
            });
        }
    }
    return fvgs;
}

/**
 * Detect Order Blocks (Institutional Supply/Demand)
 * Simple logic: Last opposite candle before a strong move (Break of Structure)
 */
export function detectOrderBlocks(data) {
    if (!data || data.length < 5) return { bullish: [], bearish: [] };
    
    const bullishOBs = [];
    const bearishOBs = [];

    // Look back 20 candles for potential OBs
    for (let i = data.length - 20; i < data.length - 3; i++) {
        const c1 = data[i];     // Possible OB
        const c2 = data[i+1];   // Start of displacement
        const c3 = data[i+2];   // Confirmation
        
        // Bullish OB: Bearish candle followed by 2 strong bullish candles
        if (c1.close < c1.open && c2.close > c2.open && c3.close > c3.open) {
            const bodySize = Math.abs(c2.close - c2.open) + Math.abs(c3.close - c3.open);
            if (bodySize > Math.abs(c1.close - c1.open) * 2) {
                bullishOBs.push({ price: c1.low, high: c1.high });
            }
        }
        
        // Bearish OB: Bullish candle followed by 2 strong bearish candles
        if (c1.close > c1.open && c2.close < c2.open && c3.close < c3.open) {
            const bodySize = Math.abs(c2.close - c2.open) + Math.abs(c3.close - c3.open);
            if (bodySize > Math.abs(c1.close - c1.open) * 2) {
                bearishOBs.push({ price: c1.high, low: c1.low });
            }
        }
    }

    return { 
        bullish: bullishOBs.slice(-2), 
        bearish: bearishOBs.slice(-2) 
    };
}

/**
 * Detect Swing Highs and Lows
 * @param {Array} data - Array of candles
 * @param {number} strength - Number of candles on each side to confirm a swing point
 */
export function detectSwingPoints(data, strength = 3) {
    if (!data || data.length < strength * 2 + 1) return { highs: [], lows: [] };
    
    const highs = [];
    const lows = [];

    for (let i = strength; i < data.length - strength; i++) {
        const current = data[i];
        let isHigh = true;
        let isLow = true;

        for (let j = 1; j <= strength; j++) {
            if (data[i - j].high >= current.high || data[i + j].high > current.high) isHigh = false;
            if (data[i - j].low <= current.low || data[i + j].low < current.low) isLow = false;
        }

        if (isHigh) highs.push({ price: current.high, index: i, time: current.time });
        if (isLow) lows.push({ price: current.low, index: i, time: current.time });
    }

    return { highs, lows };
}

/**
 * Detect Market Structure: Break of Structure (BOS) and Change of Character (CHoCH)
 */
export function detectMarketStructure(data) {
    if (!data || data.length < 50) return { trend: 'neutral', lastEvent: null };

    const { highs, lows } = detectSwingPoints(data, 3);
    if (highs.length < 2 || lows.length < 2) return { trend: 'neutral', lastEvent: null };

    let trend = 'neutral';
    let lastEvent = null;

    // Simplified logic for BOS/CHoCH
    const lastHigh = highs[highs.length - 1];
    const prevHigh = highs[highs.length - 2];
    const lastLow = lows[lows.length - 1];
    const prevLow = lows[lows.length - 2];

    const currentPrice = data[data.length - 1].close;

    // Check for BOS (Trend Continuation)
    if (currentPrice > lastHigh.price) {
        trend = 'bullish';
        lastEvent = 'BOS (Bullish)';
    } else if (currentPrice < lastLow.price) {
        trend = 'bearish';
        lastEvent = 'BOS (Bearish)';
    }

    // Check for CHoCH (Trend Reversal)
    // If we were in a bearish trend (LL, LH) and we break a LH -> Bullish CHoCH
    if (lastHigh.price > prevHigh.price && currentPrice > lastHigh.price) {
        lastEvent = 'CHoCH (Bullish)';
        trend = 'bullish';
    }
    // If we were in a bullish trend (HH, HL) and we break a HL -> Bearish CHoCH
    if (lastLow.price < prevLow.price && currentPrice < lastLow.price) {
        lastEvent = 'CHoCH (Bearish)';
        trend = 'bearish';
    }

    return { trend, lastEvent, lastHigh, lastLow };
}

/**
 * Detect Liquidity Sweeps
 * Price spikes below/above swing points then reverses
 */
export function detectLiquiditySweeps(data) {
    if (!data || data.length < 20) return [];
    
    const { highs, lows } = detectSwingPoints(data.slice(0, -5), 3);
    const recentCandles = data.slice(-5);
    const sweeps = [];

    if (highs.length > 0) {
        const keyHigh = highs[highs.length - 1];
        for (const candle of recentCandles) {
            // Price went above swing high but closed below it
            if (candle.high > keyHigh.price && candle.close < keyHigh.price) {
                sweeps.push({ type: 'bearish_reversal', level: keyHigh.price, time: candle.time });
                break;
            }
        }
    }

    if (lows.length > 0) {
        const keyLow = lows[lows.length - 1];
        for (const candle of recentCandles) {
            // Price went below swing low but closed above it
            if (candle.low < keyLow.price && candle.close > keyLow.price) {
                sweeps.push({ type: 'bullish_reversal', level: keyLow.price, time: candle.time });
                break;
            }
        }
    }

    return sweeps;
}
