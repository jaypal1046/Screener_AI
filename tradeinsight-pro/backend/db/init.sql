-- TradeInsight Pro Database Initialization Script
-- PostgreSQL Schema for User Data, Stock Metadata, and Indicator Results

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stocks table (metadata)
CREATE TABLE IF NOT EXISTS stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap BIGINT,
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OHLCV Historical Data (cached from external APIs)
CREATE TABLE IF NOT EXISTS ohlcv_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    open NUMERIC(18, 8) NOT NULL,
    high NUMERIC(18, 8) NOT NULL,
    low NUMERIC(18, 8) NOT NULL,
    close NUMERIC(18, 8) NOT NULL,
    volume BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stock_id, timestamp)
);

-- Indicator Results Cache
CREATE TABLE IF NOT EXISTS indicator_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
    indicator_name VARCHAR(100) NOT NULL,
    indicator_type VARCHAR(50) NOT NULL,
    timeframe VARCHAR(20) DEFAULT '1D',
    parameters JSONB,
    result_value NUMERIC(18, 8),
    signal VARCHAR(20), -- 'BUY', 'SELL', 'NEUTRAL'
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(stock_id, indicator_name, timeframe, calculated_at)
);

-- User Watchlists
CREATE TABLE IF NOT EXISTS watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist Items
CREATE TABLE IF NOT EXISTS watchlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(watchlist_id, stock_id)
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    default_timeframe VARCHAR(20) DEFAULT '1D',
    favorite_indicators JSONB DEFAULT '[]',
    theme VARCHAR(20) DEFAULT 'dark',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Usage Tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time_ms INTEGER,
    status_code INTEGER,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_ohlcv_stock_timestamp ON ohlcv_data(stock_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_indicator_results_stock ON indicator_results(stock_id);
CREATE INDEX IF NOT EXISTS idx_indicator_results_name ON indicator_results(indicator_name);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_stock ON watchlist_items(stock_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_requested_at ON api_usage(requested_at DESC);

-- Insert sample stocks
INSERT INTO stocks (symbol, name, exchange, sector, industry) VALUES
    ('AAPL', 'Apple Inc.', 'NASDAQ', 'Technology', 'Consumer Electronics'),
    ('GOOGL', 'Alphabet Inc.', 'NASDAQ', 'Technology', 'Internet Content & Information'),
    ('MSFT', 'Microsoft Corporation', 'NASDAQ', 'Technology', 'Software'),
    ('AMZN', 'Amazon.com Inc.', 'NASDAQ', 'Consumer Cyclical', 'Internet Retail'),
    ('TSLA', 'Tesla Inc.', 'NASDAQ', 'Consumer Cyclical', 'Auto Manufacturers'),
    ('META', 'Meta Platforms Inc.', 'NASDAQ', 'Technology', 'Internet Content & Information'),
    ('NVDA', 'NVIDIA Corporation', 'NASDAQ', 'Technology', 'Semiconductors'),
    ('JPM', 'JPMorgan Chase & Co.', 'NYSE', 'Financial Services', 'Banks'),
    ('V', 'Visa Inc.', 'NYSE', 'Financial Services', 'Credit Services'),
    ('JNJ', 'Johnson & Johnson', 'NYSE', 'Healthcare', 'Drug Manufacturers')
ON CONFLICT (symbol) DO NOTHING;
