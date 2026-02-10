-- ==========================================
-- TRADERS-HUB Database Schema
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. SIGNALS TABLE
-- Stores all trading signals with outcomes
CREATE TABLE IF NOT EXISTS signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    
    -- Signal Info
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    signal_type VARCHAR(10) NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'WAIT')),
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    
    -- Confluence Data
    confluence_score INTEGER DEFAULT 0,
    confluence_bias VARCHAR(10) DEFAULT 'neutral',
    confluence_factors JSONB DEFAULT '[]'::jsonb,
    
    -- Trade Levels
    entry_price DECIMAL(20, 8),
    stop_loss DECIMAL(20, 8),
    take_profit DECIMAL(20, 8),
    current_price DECIMAL(20, 8),
    exit_price DECIMAL(20, 8),
    
    -- Analysis Context
    pattern VARCHAR(100),
    data_source VARCHAR(20) DEFAULT 'ai',
    mtc_alignment TEXT,
    news_sentiment VARCHAR(20),
    indicators JSONB DEFAULT '{}'::jsonb,
    why_enter TEXT,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    
    -- Outcome
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
    outcome VARCHAR(20) CHECK (outcome IN ('WIN', 'LOSS', 'BREAKEVEN')),
    actual_pnl DECIMAL(20, 2) DEFAULT 0
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_closed ON signals(closed_at DESC);

-- 2. TRADING SESSIONS TABLE
-- Daily summary of trading activity
CREATE TABLE IF NOT EXISTS trading_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    signals_generated INTEGER DEFAULT 0,
    trades_taken INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    
    daily_pnl DECIMAL(20, 2) DEFAULT 0,
    max_drawdown DECIMAL(20, 2) DEFAULT 0,
    
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON trading_sessions(date DESC);

-- 3. RISK SETTINGS TABLE
-- User risk preferences
CREATE TABLE IF NOT EXISTS risk_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    min_confidence_threshold INTEGER DEFAULT 70,
    max_risk_percent DECIMAL(5, 2) DEFAULT 2.0,
    max_consecutive_losses INTEGER DEFAULT 3,
    max_daily_loss_percent DECIMAL(5, 2) DEFAULT 5.0,
    
    trading_paused BOOLEAN DEFAULT FALSE,
    pause_reason TEXT,
    pause_until TIMESTAMPTZ
);

-- Insert default settings
INSERT INTO risk_settings (min_confidence_threshold, max_risk_percent, max_consecutive_losses)
VALUES (70, 2.0, 3)
ON CONFLICT DO NOTHING;

-- 4. PERFORMANCE VIEW
-- Aggregated performance metrics
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    COUNT(*) as total_signals,
    COUNT(*) FILTER (WHERE status = 'CLOSED') as closed_trades,
    COUNT(*) FILTER (WHERE outcome = 'WIN') as wins,
    COUNT(*) FILTER (WHERE outcome = 'LOSS') as losses,
    ROUND(
        COUNT(*) FILTER (WHERE outcome = 'WIN')::DECIMAL / 
        NULLIF(COUNT(*) FILTER (WHERE status = 'CLOSED'), 0) * 100, 2
    ) as win_rate,
    COALESCE(SUM(actual_pnl), 0) as total_pnl,
    ROUND(AVG(actual_pnl) FILTER (WHERE outcome = 'WIN'), 2) as avg_win,
    ROUND(AVG(actual_pnl) FILTER (WHERE outcome = 'LOSS'), 2) as avg_loss
FROM signals;

-- 5. Enable Row Level Security (optional but recommended)
-- ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trading_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE risk_settings ENABLE ROW LEVEL SECURITY;

-- 6. Real-time subscriptions (automatic with Supabase)
-- Clients can subscribe to signals table changes

-- ==========================================
-- DONE! Tables created successfully.
-- ==========================================
