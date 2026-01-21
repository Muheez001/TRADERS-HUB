import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HISTORY_FILE = path.join(__dirname, '../data/signalHistory.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure signalHistory.json exists
if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
}

/**
 * Log a new signal to history
 * @param {Object} signal - The signal object returned by aiAnalyst or technicalAnalysis
 * @param {string} symbol - The symbol analyzed
 * @param {string} interval - The primary timeframe
 */
export function logSignal(signal, symbol, interval) {
    try {
        const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));

        const signalToLog = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            timestamp: Date.now(),
            symbol,
            interval,
            signal: signal.signal,
            confidence: signal.confidence,
            price: signal.currentPrice || signal.entry,
            entry: signal.entry,
            stopLoss: signal.stopLoss,
            takeProfit: signal.takeProfit,
            pattern: signal.pattern,
            dataSource: signal.dataSource || 'ai',
            mtcAlignment: signal.mtcAlignment,
            newsSentiment: signal.newsSentiment
        };

        // Add to history (limit to last 100 for now)
        history.unshift(signalToLog);
        const limitedHistory = history.slice(0, 100);

        fs.writeFileSync(HISTORY_FILE, JSON.stringify(limitedHistory, null, 2));
        console.log(`✅ Signal logged for ${symbol} [${signal.signal}]`);
        return true;
    } catch (error) {
        console.error('❌ Failed to log signal:', error.message);
        return false;
    }
}

/**
 * Get all signal history
 */
export function getSignalHistory() {
    try {
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (error) {
        console.error('❌ Failed to read signals:', error.message);
        return [];
    }
}

/**
 * Get signals for a specific symbol
 */
export function getHistoryBySymbol(symbol) {
    const history = getSignalHistory();
    return history.filter(s => s.symbol === symbol).slice(0, 5);
}
