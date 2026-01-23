/**
 * Candlestick Pattern Detection Service
 * Programmatic detection of key candlestick patterns from "The Candlestick Trading Bible"
 */

/**
 * Helper: Calculate candle body size
 */
function bodySize(candle) {
    return Math.abs(candle.close - candle.open);
}

/**
 * Helper: Calculate total candle range (high - low)
 */
function candleRange(candle) {
    return candle.high - candle.low;
}

/**
 * Helper: Calculate upper wick size
 */
function upperWick(candle) {
    return candle.high - Math.max(candle.open, candle.close);
}

/**
 * Helper: Calculate lower wick size
 */
function lowerWick(candle) {
    return Math.min(candle.open, candle.close) - candle.low;
}

/**
 * Helper: Check if candle is bullish
 */
function isBullish(candle) {
    return candle.close > candle.open;
}

/**
 * Helper: Check if candle is bearish
 */
function isBearish(candle) {
    return candle.close < candle.open;
}

/**
 * Detect Doji Pattern
 * Body is very small relative to the range (< 10% of range)
 */
function detectDoji(candle) {
    const range = candleRange(candle);
    if (range === 0) return false;
    return bodySize(candle) < range * 0.1;
}

/**
 * Detect Hammer / Bullish Pin Bar
 * Small body at top, long lower wick (> 2x body), minimal upper wick
 */
function detectHammer(candle) {
    const body = bodySize(candle);
    const range = candleRange(candle);
    const lWick = lowerWick(candle);
    const uWick = upperWick(candle);

    if (range === 0 || body === 0) return false;

    return (
        lWick > body * 2 &&           // Lower wick at least 2x body
        uWick < body * 0.5 &&         // Small upper wick
        body < range * 0.4            // Body is small relative to range
    );
}

/**
 * Detect Shooting Star / Bearish Pin Bar
 * Small body at bottom, long upper wick (> 2x body), minimal lower wick
 */
function detectShootingStar(candle) {
    const body = bodySize(candle);
    const range = candleRange(candle);
    const lWick = lowerWick(candle);
    const uWick = upperWick(candle);

    if (range === 0 || body === 0) return false;

    return (
        uWick > body * 2 &&           // Upper wick at least 2x body
        lWick < body * 0.5 &&         // Small lower wick
        body < range * 0.4            // Body is small relative to range
    );
}

/**
 * Detect Bullish Engulfing Pattern
 * Current bullish candle completely engulfs previous bearish candle's body
 */
function detectBullishEngulfing(current, previous) {
    if (!previous) return false;

    return (
        isBearish(previous) &&
        isBullish(current) &&
        current.open < previous.close &&      // Current opens below prev close
        current.close > previous.open         // Current closes above prev open
    );
}

/**
 * Detect Bearish Engulfing Pattern
 * Current bearish candle completely engulfs previous bullish candle's body
 */
function detectBearishEngulfing(current, previous) {
    if (!previous) return false;

    return (
        isBullish(previous) &&
        isBearish(current) &&
        current.open > previous.close &&      // Current opens above prev close
        current.close < previous.open         // Current closes below prev open
    );
}

/**
 * Detect Morning Star Pattern (3-candle bullish reversal)
 * 1. Large bearish candle
 * 2. Small body candle (gap down)
 * 3. Large bullish candle closing into first candle's body
 */
function detectMorningStar(candles) {
    if (candles.length < 3) return false;

    const first = candles[candles.length - 3];
    const second = candles[candles.length - 2];
    const third = candles[candles.length - 1];

    const firstBody = bodySize(first);
    const secondBody = bodySize(second);
    const thirdBody = bodySize(third);

    return (
        isBearish(first) &&
        firstBody > secondBody * 2 &&         // First candle is large
        secondBody < candleRange(second) * 0.3 && // Second is small/indecision
        isBullish(third) &&
        thirdBody > secondBody * 2 &&         // Third candle is large
        third.close > (first.open + first.close) / 2  // Closes into first's body
    );
}

/**
 * Detect Evening Star Pattern (3-candle bearish reversal)
 * 1. Large bullish candle
 * 2. Small body candle (gap up)
 * 3. Large bearish candle closing into first candle's body
 */
function detectEveningStar(candles) {
    if (candles.length < 3) return false;

    const first = candles[candles.length - 3];
    const second = candles[candles.length - 2];
    const third = candles[candles.length - 1];

    const firstBody = bodySize(first);
    const secondBody = bodySize(second);
    const thirdBody = bodySize(third);

    return (
        isBullish(first) &&
        firstBody > secondBody * 2 &&         // First candle is large
        secondBody < candleRange(second) * 0.3 && // Second is small/indecision
        isBearish(third) &&
        thirdBody > secondBody * 2 &&         // Third candle is large
        third.close < (first.open + first.close) / 2  // Closes into first's body
    );
}

/**
 * Detect Three White Soldiers (Strong bullish continuation)
 * Three consecutive bullish candles with higher closes
 */
function detectThreeWhiteSoldiers(candles) {
    if (candles.length < 3) return false;

    const c1 = candles[candles.length - 3];
    const c2 = candles[candles.length - 2];
    const c3 = candles[candles.length - 1];

    return (
        isBullish(c1) && isBullish(c2) && isBullish(c3) &&
        c2.close > c1.close &&
        c3.close > c2.close &&
        bodySize(c1) > candleRange(c1) * 0.5 &&
        bodySize(c2) > candleRange(c2) * 0.5 &&
        bodySize(c3) > candleRange(c3) * 0.5
    );
}

/**
 * Detect Three Black Crows (Strong bearish continuation)
 * Three consecutive bearish candles with lower closes
 */
function detectThreeBlackCrows(candles) {
    if (candles.length < 3) return false;

    const c1 = candles[candles.length - 3];
    const c2 = candles[candles.length - 2];
    const c3 = candles[candles.length - 1];

    return (
        isBearish(c1) && isBearish(c2) && isBearish(c3) &&
        c2.close < c1.close &&
        c3.close < c2.close &&
        bodySize(c1) > candleRange(c1) * 0.5 &&
        bodySize(c2) > candleRange(c2) * 0.5 &&
        bodySize(c3) > candleRange(c3) * 0.5
    );
}

/**
 * Detect Tweezer Top (Bearish reversal at resistance)
 * Two candles with nearly identical highs
 */
function detectTweezerTop(current, previous) {
    if (!previous) return false;

    const tolerance = candleRange(current) * 0.05;
    return (
        isBullish(previous) &&
        isBearish(current) &&
        Math.abs(current.high - previous.high) < tolerance
    );
}

/**
 * Detect Tweezer Bottom (Bullish reversal at support)
 * Two candles with nearly identical lows
 */
function detectTweezerBottom(current, previous) {
    if (!previous) return false;

    const tolerance = candleRange(current) * 0.05;
    return (
        isBearish(previous) &&
        isBullish(current) &&
        Math.abs(current.low - previous.low) < tolerance
    );
}

/**
 * Main pattern detection function
 * Returns detected patterns with signal and description
 */
export function detectPatterns(candles) {
    if (!candles || candles.length < 3) {
        return { pattern: 'Insufficient Data', signal: 'WAIT', patterns: [] };
    }

    const current = candles[candles.length - 1];
    const previous = candles[candles.length - 2];
    const detectedPatterns = [];
    let primarySignal = 'WAIT';
    let primaryPattern = 'No Clear Pattern';

    // Single candle patterns
    if (detectDoji(current)) {
        detectedPatterns.push({ name: 'Doji', type: 'neutral', strength: 1 });
    }

    if (detectHammer(current)) {
        detectedPatterns.push({ name: 'Hammer / Bullish Pin Bar', type: 'bullish', strength: 2 });
        primarySignal = 'BUY';
        primaryPattern = 'Hammer / Bullish Pin Bar';
    }

    if (detectShootingStar(current)) {
        detectedPatterns.push({ name: 'Shooting Star / Bearish Pin Bar', type: 'bearish', strength: 2 });
        primarySignal = 'SELL';
        primaryPattern = 'Shooting Star / Bearish Pin Bar';
    }

    // Two candle patterns
    if (detectBullishEngulfing(current, previous)) {
        detectedPatterns.push({ name: 'Bullish Engulfing', type: 'bullish', strength: 3 });
        primarySignal = 'BUY';
        primaryPattern = 'Bullish Engulfing';
    }

    if (detectBearishEngulfing(current, previous)) {
        detectedPatterns.push({ name: 'Bearish Engulfing', type: 'bearish', strength: 3 });
        primarySignal = 'SELL';
        primaryPattern = 'Bearish Engulfing';
    }

    if (detectTweezerTop(current, previous)) {
        detectedPatterns.push({ name: 'Tweezer Top', type: 'bearish', strength: 2 });
        primarySignal = 'SELL';
        primaryPattern = 'Tweezer Top';
    }

    if (detectTweezerBottom(current, previous)) {
        detectedPatterns.push({ name: 'Tweezer Bottom', type: 'bullish', strength: 2 });
        primarySignal = 'BUY';
        primaryPattern = 'Tweezer Bottom';
    }

    // Three candle patterns (higher priority)
    if (detectMorningStar(candles)) {
        detectedPatterns.push({ name: 'Morning Star', type: 'bullish', strength: 4 });
        primarySignal = 'BUY';
        primaryPattern = 'Morning Star';
    }

    if (detectEveningStar(candles)) {
        detectedPatterns.push({ name: 'Evening Star', type: 'bearish', strength: 4 });
        primarySignal = 'SELL';
        primaryPattern = 'Evening Star';
    }

    if (detectThreeWhiteSoldiers(candles)) {
        detectedPatterns.push({ name: 'Three White Soldiers', type: 'bullish', strength: 4 });
        primarySignal = 'BUY';
        primaryPattern = 'Three White Soldiers';
    }

    if (detectThreeBlackCrows(candles)) {
        detectedPatterns.push({ name: 'Three Black Crows', type: 'bearish', strength: 4 });
        primarySignal = 'SELL';
        primaryPattern = 'Three Black Crows';
    }

    // Sort patterns by strength (highest first)
    detectedPatterns.sort((a, b) => b.strength - a.strength);

    // Use highest strength pattern as primary
    if (detectedPatterns.length > 0) {
        const strongest = detectedPatterns[0];
        primaryPattern = strongest.name;
        primarySignal = strongest.type === 'bullish' ? 'BUY' :
            strongest.type === 'bearish' ? 'SELL' : 'WAIT';
    }

    return {
        pattern: primaryPattern,
        signal: primarySignal,
        patterns: detectedPatterns,
        patternCount: detectedPatterns.length
    };
}

export {
    detectDoji,
    detectHammer,
    detectShootingStar,
    detectBullishEngulfing,
    detectBearishEngulfing,
    detectMorningStar,
    detectEveningStar,
    detectThreeWhiteSoldiers,
    detectThreeBlackCrows,
    detectTweezerTop,
    detectTweezerBottom
};
