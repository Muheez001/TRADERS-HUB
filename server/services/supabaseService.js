/**
 * Supabase Database Service
 * Handles all database operations for signal tracking, outcomes, and analytics
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase credentials not found - database features disabled');
}

// Initialize Supabase client
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// ==========================================
// SIGNAL MANAGEMENT
// ==========================================

/**
 * Log a new trading signal to the database
 * @param {Object} signal - The analysis/signal object
 * @param {string} symbol - Trading symbol
 * @param {string} timeframe - Chart timeframe
 * @returns {Object|null} The created signal record
 */
export async function logSignalToDb(signal, symbol, timeframe) {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('signals')
            .insert({
                symbol,
                timeframe,
                signal_type: signal.signal,
                confidence: signal.confidence,
                confluence_score: signal.confluenceScore || 0,
                confluence_bias: signal.confluenceBias || 'neutral',
                entry_price: signal.entry,
                stop_loss: signal.stopLoss,
                take_profit: signal.takeProfit,
                current_price: signal.currentPrice,
                pattern: signal.pattern,
                data_source: signal.dataSource || 'ai',
                mtc_alignment: signal.mtcAlignment,
                news_sentiment: signal.newsSentiment,
                indicators: signal.indicators || {},
                confluence_factors: signal.confluenceFactors || [],
                why_enter: signal.whyEnter,
                risk_factors: signal.riskFactors || [],
                status: 'OPEN'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Failed to log signal to DB:', error.message);
            return null;
        }

        console.log(`✅ Signal logged to Supabase: ${symbol} [${signal.signal}] ID: ${data.id}`);
        return data;
    } catch (err) {
        console.error('❌ Supabase error:', err.message);
        return null;
    }
}

/**
 * Update signal outcome when TP/SL is hit
 * @param {string} signalId - The signal ID
 * @param {string} outcome - 'WIN', 'LOSS', or 'BREAKEVEN'
 * @param {number} exitPrice - The exit price
 * @param {number} actualPnl - Actual profit/loss in dollars
 */
export async function updateSignalOutcome(signalId, outcome, exitPrice, actualPnl) {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('signals')
            .update({
                status: 'CLOSED',
                outcome,
                exit_price: exitPrice,
                actual_pnl: actualPnl,
                closed_at: new Date().toISOString()
            })
            .eq('id', signalId)
            .select()
            .single();

        if (error) throw error;
        console.log(`📊 Signal ${signalId} closed: ${outcome} (${actualPnl >= 0 ? '+' : ''}$${actualPnl.toFixed(2)})`);
        return data;
    } catch (err) {
        console.error('❌ Failed to update signal outcome:', err.message);
        return null;
    }
}

/**
 * Get recent signals with optional filters
 * @param {Object} filters - { symbol, status, limit }
 */
export async function getRecentSignals(filters = {}) {
    if (!supabase) return [];

    try {
        let query = supabase
            .from('signals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(filters.limit || 50);

        if (filters.symbol) query = query.eq('symbol', filters.symbol);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.signalType) query = query.eq('signal_type', filters.signalType);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('❌ Failed to fetch signals:', err.message);
        return [];
    }
}

// ==========================================
// STREAK & RISK MANAGEMENT
// ==========================================

/**
 * Get current consecutive win/loss streak for a symbol
 * @param {string} symbol - Trading symbol (optional, null for global)
 */
export async function getConsecutiveStreak(symbol = null) {
    if (!supabase) return { wins: 0, losses: 0, streak: 0, type: 'neutral' };

    try {
        let query = supabase
            .from('signals')
            .select('outcome')
            .eq('status', 'CLOSED')
            .not('outcome', 'is', null)
            .order('closed_at', { ascending: false })
            .limit(20);

        if (symbol) query = query.eq('symbol', symbol);

        const { data, error } = await query;
        if (error) throw error;

        if (!data || data.length === 0) {
            return { wins: 0, losses: 0, streak: 0, type: 'neutral' };
        }

        // Calculate consecutive streak
        let streak = 0;
        const firstOutcome = data[0].outcome;

        for (const signal of data) {
            if (signal.outcome === firstOutcome) {
                streak++;
            } else {
                break;
            }
        }

        // Count total wins/losses in last 20
        const wins = data.filter(s => s.outcome === 'WIN').length;
        const losses = data.filter(s => s.outcome === 'LOSS').length;

        return {
            wins,
            losses,
            streak,
            type: firstOutcome === 'WIN' ? 'winning' : firstOutcome === 'LOSS' ? 'losing' : 'neutral',
            winRate: data.length > 0 ? ((wins / data.length) * 100).toFixed(1) : 0
        };
    } catch (err) {
        console.error('❌ Failed to get streak:', err.message);
        return { wins: 0, losses: 0, streak: 0, type: 'neutral' };
    }
}

/**
 * Check if trading should be paused due to consecutive losses
 * @param {number} maxConsecutiveLosses - Threshold (default 3)
 */
export async function shouldPauseTrading(maxConsecutiveLosses = 3) {
    const streak = await getConsecutiveStreak();

    if (streak.type === 'losing' && streak.streak >= maxConsecutiveLosses) {
        return {
            shouldPause: true,
            reason: `${streak.streak} consecutive losses detected`,
            streak: streak.streak,
            recommendation: 'Take a break. Review your recent trades before continuing.'
        };
    }

    return { shouldPause: false, streak: streak.streak };
}

// ==========================================
// ANALYTICS
// ==========================================

/**
 * Get performance statistics
 * @param {string} timeRange - 'day', 'week', 'month', 'all'
 */
export async function getPerformanceStats(timeRange = 'all') {
    if (!supabase) return null;

    try {
        let query = supabase
            .from('signals')
            .select('*')
            .eq('status', 'CLOSED')
            .not('outcome', 'is', null);

        // Apply time filter
        if (timeRange !== 'all') {
            const now = new Date();
            let startDate;

            switch (timeRange) {
                case 'day':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
            }

            if (startDate) {
                query = query.gte('closed_at', startDate.toISOString());
            }
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!data || data.length === 0) {
            return {
                totalTrades: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                totalPnl: 0,
                avgWin: 0,
                avgLoss: 0,
                profitFactor: 0,
                bestTrade: null,
                worstTrade: null
            };
        }

        const wins = data.filter(s => s.outcome === 'WIN');
        const losses = data.filter(s => s.outcome === 'LOSS');

        const totalPnl = data.reduce((sum, s) => sum + (s.actual_pnl || 0), 0);
        const totalWinPnl = wins.reduce((sum, s) => sum + (s.actual_pnl || 0), 0);
        const totalLossPnl = Math.abs(losses.reduce((sum, s) => sum + (s.actual_pnl || 0), 0));

        return {
            totalTrades: data.length,
            wins: wins.length,
            losses: losses.length,
            winRate: ((wins.length / data.length) * 100).toFixed(1),
            totalPnl: totalPnl.toFixed(2),
            avgWin: wins.length > 0 ? (totalWinPnl / wins.length).toFixed(2) : 0,
            avgLoss: losses.length > 0 ? (totalLossPnl / losses.length).toFixed(2) : 0,
            profitFactor: totalLossPnl > 0 ? (totalWinPnl / totalLossPnl).toFixed(2) : totalWinPnl > 0 ? '∞' : 0,
            bestTrade: wins.sort((a, b) => b.actual_pnl - a.actual_pnl)[0] || null,
            worstTrade: losses.sort((a, b) => a.actual_pnl - b.actual_pnl)[0] || null
        };
    } catch (err) {
        console.error('❌ Failed to get performance stats:', err.message);
        return null;
    }
}

/**
 * Get signal quality metrics by confidence level
 */
export async function getConfidenceAnalysis() {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('signals')
            .select('confidence, outcome, actual_pnl')
            .eq('status', 'CLOSED')
            .not('outcome', 'is', null);

        if (error) throw error;
        if (!data || data.length === 0) return null;

        // Group by confidence brackets
        const brackets = {
            'low': { range: '0-49%', signals: [], wins: 0, losses: 0 },
            'medium': { range: '50-69%', signals: [], wins: 0, losses: 0 },
            'high': { range: '70-84%', signals: [], wins: 0, losses: 0 },
            'veryHigh': { range: '85-100%', signals: [], wins: 0, losses: 0 }
        };

        data.forEach(signal => {
            let bracket;
            if (signal.confidence < 50) bracket = 'low';
            else if (signal.confidence < 70) bracket = 'medium';
            else if (signal.confidence < 85) bracket = 'high';
            else bracket = 'veryHigh';

            brackets[bracket].signals.push(signal);
            if (signal.outcome === 'WIN') brackets[bracket].wins++;
            else if (signal.outcome === 'LOSS') brackets[bracket].losses++;
        });

        // Calculate win rates
        Object.keys(brackets).forEach(key => {
            const total = brackets[key].signals.length;
            brackets[key].total = total;
            brackets[key].winRate = total > 0
                ? ((brackets[key].wins / total) * 100).toFixed(1)
                : 0;
        });

        return brackets;
    } catch (err) {
        console.error('❌ Failed to get confidence analysis:', err.message);
        return null;
    }
}

// ==========================================
// TRADING SESSION MANAGEMENT
// ==========================================

/**
 * Record a trading session summary
 */
export async function recordTradingSession(sessionData) {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('trading_sessions')
            .insert({
                date: sessionData.date || new Date().toISOString().split('T')[0],
                signals_generated: sessionData.signalsGenerated || 0,
                trades_taken: sessionData.tradesTaken || 0,
                wins: sessionData.wins || 0,
                losses: sessionData.losses || 0,
                daily_pnl: sessionData.dailyPnl || 0,
                max_drawdown: sessionData.maxDrawdown || 0,
                notes: sessionData.notes || ''
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('❌ Failed to record session:', err.message);
        return null;
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if Supabase is connected and tables exist
 */
export async function checkDatabaseHealth() {
    if (!supabase) {
        return { connected: false, reason: 'Supabase credentials not configured' };
    }

    try {
        const { data, error } = await supabase
            .from('signals')
            .select('id')
            .limit(1);

        if (error) {
            return { connected: false, reason: error.message };
        }

        return { connected: true, signalsCount: data?.length || 0 };
    } catch (err) {
        return { connected: false, reason: err.message };
    }
}

export default supabase;
