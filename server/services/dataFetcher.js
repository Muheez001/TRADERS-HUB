/**
 * Data Fetcher Service
 * Handles fetching data from external APIs (News, Crypto via CoinGecko, Forex)
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;
const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';
const NEWSDATA_API_BASE = 'https://newsdata.io/api/1';
const CMC_API_BASE = 'https://pro-api.coinmarketcap.com/v1';
const TWELVE_DATA_BASE = 'https://api.twelvedata.com';

/**
 * Fetch crypto news from NewsData.io (Primary - Free tier: 200 req/day)
 */
export async function fetchNews() {
    try {
        console.log('📰 Trying NewsData.io for crypto news...');

        const response = await axios.get(`${NEWSDATA_API_BASE}/news`, {
            params: {
                apikey: NEWSDATA_API_KEY,
                q: 'crypto OR bitcoin OR ethereum OR cryptocurrency',
                language: 'en',
                category: 'business,technology'
            },
            timeout: 15000
        });

        if (response.data.status === 'success' && response.data.results) {
            console.log('✅ NewsData.io data fetched successfully');
            return response.data.results.map((article, index) => ({
                id: `news-${Date.now()}-${index}`,
                title: article.title,
                description: article.description || article.content || 'No description available',
                source: article.source_id || 'Unknown',
                publishedAt: article.pubDate,
                url: article.link,
                imageUrl: article.image_url
            }));
        }

        throw new Error('Invalid NewsData.io response');
    } catch (error) {
        console.error('NewsData.io Error:', error.message);
        // Fallback to NewsAPI
        return fetchNewsFallback();
    }
}

/**
 * Fallback: Fetch news from NewsAPI
 */
async function fetchNewsFallback() {
    try {
        console.log('📰 Falling back to NewsAPI...');
        const keywords = 'cryptocurrency OR "federal reserve" OR forex OR "stock market" OR trading OR bitcoin OR inflation';

        const response = await axios.get(`${NEWS_API_BASE}/everything`, {
            params: {
                q: keywords,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 20,
                apiKey: NEWS_API_KEY
            },
            timeout: 10000
        });

        if (response.data.status === 'ok') {
            console.log('✅ NewsAPI fallback data fetched successfully');
            return response.data.articles.map((article, index) => ({
                id: `news-${Date.now()}-${index}`,
                title: article.title,
                description: article.description || 'No description available',
                source: article.source?.name || 'Unknown',
                publishedAt: article.publishedAt,
                url: article.url,
                imageUrl: article.urlToImage
            }));
        }

        throw new Error('Failed to fetch news');
    } catch (error) {
        console.error('NewsAPI Fallback Error:', error.message);
        return [];
    }
}

/**
 * Fetch cryptocurrency prices from CoinGecko (Primary - FREE, no API key required)
 */
export async function fetchCryptoPrices() {
    try {
        console.log('💰 Fetching prices from CoinGecko (free)...');

        const coins = [
            'bitcoin', 'ethereum', 'solana', 'ripple', 'cardano',
            'binancecoin', 'dogecoin', 'avalanche-2', 'chainlink',
            'polkadot', 'polygon', 'cosmos'
        ];

        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: coins.join(','),
                vs_currencies: 'usd',
                include_24hr_change: true,
                include_market_cap: true,
                include_24hr_vol: true
            },
            timeout: 10000
        });

        const symbolMap = {
            bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
            ethereum: { symbol: 'ETH', name: 'Ethereum' },
            solana: { symbol: 'SOL', name: 'Solana' },
            ripple: { symbol: 'XRP', name: 'XRP' },
            cardano: { symbol: 'ADA', name: 'Cardano' },
            binancecoin: { symbol: 'BNB', name: 'BNB' },
            dogecoin: { symbol: 'DOGE', name: 'Dogecoin' },
            'avalanche-2': { symbol: 'AVAX', name: 'Avalanche' },
            chainlink: { symbol: 'LINK', name: 'Chainlink' },
            polkadot: { symbol: 'DOT', name: 'Polkadot' },
            polygon: { symbol: 'MATIC', name: 'Polygon' },
            cosmos: { symbol: 'ATOM', name: 'Cosmos' }
        };

        const prices = {};
        for (const [coin, data] of Object.entries(response.data)) {
            const info = symbolMap[coin];
            if (info) {
                prices[info.symbol] = {
                    price: data.usd,
                    change: data.usd_24h_change || 0,
                    symbol: info.symbol,
                    name: info.name,
                    marketCap: data.usd_market_cap,
                    volume24h: data.usd_24h_vol
                };
            }
        }

        console.log('✅ CoinGecko data fetched successfully');
        return prices;
    } catch (error) {
        console.error('CoinGecko Error:', error.message);
        // Fallback to CoinMarketCap if available
        return fetchCryptoPricesFallback();
    }
}

/**
 * Fallback: Fetch crypto prices from CoinMarketCap
 */
async function fetchCryptoPricesFallback() {
    try {
        if (!CMC_API_KEY) {
            console.log('No CMC API key, using demo data');
            return null;
        }

        console.log('💰 Falling back to CoinMarketCap...');
        const response = await axios.get(`${CMC_API_BASE}/cryptocurrency/quotes/latest`, {
            headers: {
                'X-CMC_PRO_API_KEY': CMC_API_KEY,
                'Accept': 'application/json'
            },
            params: {
                symbol: 'BTC,ETH,SOL,XRP,ADA,BNB,DOGE',
                convert: 'USD'
            },
            timeout: 10000
        });

        if (response.data && response.data.data) {
            const prices = {};

            for (const [symbol, coinData] of Object.entries(response.data.data)) {
                const quote = coinData.quote?.USD;
                if (quote) {
                    prices[symbol] = {
                        price: quote.price,
                        change: quote.percent_change_24h || 0,
                        symbol: symbol,
                        name: coinData.name,
                        marketCap: quote.market_cap,
                        volume24h: quote.volume_24h
                    };
                }
            }

            console.log('✅ CoinMarketCap fallback data fetched successfully');
            return prices;
        }

        throw new Error('Invalid CoinMarketCap response');
    } catch (error) {
        console.error('CoinMarketCap Fallback Error:', error.message);
        return null;
    }
}

/**
 * Fetch forex prices (simulated - real implementation would use OANDA/Alpha Vantage)
 */
export async function fetchForexPrices() {
    const pairs = {
        'USD/JPY': { basePrice: 157.50 },
        'EUR/USD': { basePrice: 1.0350 },
        'GBP/USD': { basePrice: 1.2580 },
        'USD/CHF': { basePrice: 0.9030 },
        'AUD/USD': { basePrice: 0.6240 }
    };

    const prices = {};
    for (const [pair, config] of Object.entries(pairs)) {
        const fluctuation = (Math.random() - 0.5) * 0.002;
        prices[pair] = {
            price: +(config.basePrice * (1 + fluctuation)).toFixed(4),
            change: +((Math.random() - 0.5) * 0.5).toFixed(2)
        };
    }

    return prices;
}

/**
 * Fetch commodity prices from Yahoo Finance (FREE, no API key required)
 * Uses Yahoo Finance quote API for Gold (GC=F), Silver (SI=F), Oil (CL=F)
 */
export async function fetchCommodityPrices() {
    try {
        console.log('💎 Fetching real commodity prices from Yahoo Finance...');

        const symbols = ['GC=F', 'SI=F', 'CL=F']; // Gold, Silver, Crude Oil futures

        const response = await axios.get('https://query1.finance.yahoo.com/v7/finance/quote', {
            params: {
                symbols: symbols.join(','),
                fields: 'regularMarketPrice,regularMarketChangePercent,shortName'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        if (response.data?.quoteResponse?.result) {
            const prices = {};
            const symbolMap = {
                'GC=F': { key: 'GOLD', name: 'Gold' },
                'SI=F': { key: 'SILVER', name: 'Silver' },
                'CL=F': { key: 'OIL', name: 'Crude Oil' }
            };

            for (const quote of response.data.quoteResponse.result) {
                const info = symbolMap[quote.symbol];
                if (info) {
                    prices[info.key] = {
                        price: quote.regularMarketPrice || 0,
                        change: quote.regularMarketChangePercent || 0,
                        name: info.name
                    };
                }
            }

            console.log('✅ Yahoo Finance commodity data fetched successfully');
            return prices;
        }

        throw new Error('Invalid Yahoo Finance response');
    } catch (error) {
        console.error('Yahoo Finance Error:', error.message);
        // Fallback to simulated data if API fails
        return fetchCommodityPricesFallback();
    }
}

/**
 * Fallback: Simulated commodity prices when API fails
 */
function fetchCommodityPricesFallback() {
    console.log('⚠️ Using fallback commodity prices');
    const commodities = {
        GOLD: { basePrice: 4400, name: 'Gold' },
        SILVER: { basePrice: 52, name: 'Silver' },
        OIL: { basePrice: 75, name: 'Crude Oil' }
    };

    const prices = {};
    for (const [key, config] of Object.entries(commodities)) {
        const fluctuation = (Math.random() - 0.5) * 0.01;
        prices[key] = {
            price: +(config.basePrice * (1 + fluctuation)).toFixed(2),
            change: +((Math.random() - 0.5) * 2).toFixed(2),
            name: config.name
        };
    }

    return prices;
}


/**
 * Fetch OHLCV Candle data - tries Binance first, then CoinGecko as fallback
 * @param {string} symbol - Crypto symbol (e.g., 'BTC')
 * @param {string} interval - Timeframe (e.g., '1h', '4h', '15m')
 */
export async function fetchCandles(symbol, interval = '1h') {
    const upperSymbol = symbol.toUpperCase();

    // Try Binance first
    try {
        const binanceSymbol = `${upperSymbol}USDT`;
        console.log(`🕯️ Trying Binance for ${binanceSymbol} ${interval}...`);

        const response = await axios.get('https://api.binance.com/api/v3/klines', {
            params: {
                symbol: binanceSymbol,
                interval: interval,
                limit: 60
            },
            timeout: 8000
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
            console.log('✅ Binance candles fetched successfully');
            return response.data.map(c => ({
                time: c[0],
                open: parseFloat(c[1]),
                high: parseFloat(c[2]),
                low: parseFloat(c[3]),
                close: parseFloat(c[4]),
                volume: parseFloat(c[5])
            }));
        }
        throw new Error('Empty Binance response');
    } catch (binanceError) {
        console.error('Binance Error:', binanceError.message);
    }

    // Fallback to CoinGecko OHLC
    try {
        console.log(`🕯️ Trying CoinGecko OHLC for ${upperSymbol}...`);

        // Map symbol to CoinGecko ID
        const coinGeckoIds = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'SOL': 'solana',
            'XRP': 'ripple',
            'ADA': 'cardano',
            'BNB': 'binancecoin',
            'DOGE': 'dogecoin',
            'AVAX': 'avalanche-2',
            'LINK': 'chainlink',
            'DOT': 'polkadot'
        };

        const coinId = coinGeckoIds[upperSymbol] || upperSymbol.toLowerCase();

        // CoinGecko OHLC: days parameter (1=30min, 7=4h, 14=4h, 30=4h, 90=4h, 180=4d, 365=4d, max=4d)
        // We'll use 1 day for 1h-ish data, 7 days for 4h
        const days = interval === '4h' ? 7 : 1;

        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`, {
            params: {
                vs_currency: 'usd',
                days: days
            },
            timeout: 10000
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
            console.log('✅ CoinGecko OHLC fetched successfully');
            // CoinGecko OHLC format: [timestamp, open, high, low, close]
            return response.data.slice(-60).map(c => ({
                time: c[0],
                open: c[1],
                high: c[2],
                low: c[3],
                close: c[4],
                volume: 0 // CoinGecko OHLC doesn't include volume
            }));
        }
        throw new Error('Empty CoinGecko response');
    } catch (geckoError) {
        console.error('CoinGecko OHLC Error:', geckoError.message);
    }

    // Last resort: Get current price and generate realistic mock data
    console.log('⚠️ All APIs failed, generating mock data with current price...');
    return await generateRealisticMockCandles(upperSymbol, interval);
}

/**
 * Fallback: Generate realistic mock candles using current price from CoinGecko
 */
async function generateRealisticMockCandles(symbol, interval) {
    // Try to get current price first
    let currentPrice = 50000; // Default fallback

    try {
        const coinGeckoIds = {
            'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
            'ADA': 'cardano', 'BNB': 'binancecoin', 'DOGE': 'dogecoin',
            'AVAX': 'avalanche-2', 'LINK': 'chainlink', 'DOT': 'polkadot'
        };
        const coinId = coinGeckoIds[symbol] || 'bitcoin';

        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: { ids: coinId, vs_currencies: 'usd' },
            timeout: 5000
        });

        if (response.data && response.data[coinId]) {
            currentPrice = response.data[coinId].usd;
            console.log(`📊 Got current ${symbol} price: $${currentPrice}`);
        }
    } catch (e) {
        console.log('Could not fetch current price, using default');
    }

    const candles = [];
    let price = currentPrice * 0.98; // Start slightly below current
    const now = Date.now();
    const intervalMs = {
        '15m': 15 * 60 * 1000,
        '30m': 30 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000
    }[interval] || 60 * 60 * 1000;

    for (let i = 59; i >= 0; i--) {
        const volatility = price * 0.008; // 0.8% volatility
        const trend = (currentPrice - price) / 60 * (60 - i); // Trend towards current
        const change = (Math.random() - 0.5) * volatility + trend * 0.1;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * (volatility * 0.3);
        const low = Math.min(open, close) - Math.random() * (volatility * 0.3);
        const volume = Math.random() * 1000000;

        candles.push({
            time: now - (i * intervalMs),
            open, high, low, close, volume
        });

        price = close;
    }

    return candles;
}

/**
 * Fetch Forex OHLCV Candle data from Twelve Data API
 * @param {string} pair - Forex pair (e.g., 'EUR/USD')
 * @param {string} interval - Timeframe (e.g., '1h', '4h', '15min')
 */
export async function fetchForexCandles(pair, interval = '1h') {
    // Map interval to Twelve Data format
    const intervalMap = {
        '15m': '15min',
        '30m': '30min',
        '1h': '1h',
        '4h': '4h'
    };
    const tdInterval = intervalMap[interval] || '1h';

    // Format pair for Twelve Data (EUR/USD -> EUR/USD)
    const formattedPair = pair.replace('/', '/');

    try {
        if (!TWELVE_DATA_API_KEY) {
            console.log('⚠️ No Twelve Data API key, using mock forex data');
            return generateMockForexCandles(pair, interval);
        }

        console.log(`💱 Fetching forex candles for ${formattedPair} ${tdInterval}...`);

        const response = await axios.get(`${TWELVE_DATA_BASE}/time_series`, {
            params: {
                symbol: formattedPair,
                interval: tdInterval,
                outputsize: 60,
                apikey: TWELVE_DATA_API_KEY
            },
            timeout: 15000
        });

        if (response.data?.values && Array.isArray(response.data.values)) {
            // Twelve Data returns newest first, so reverse it
            const candles = response.data.values.reverse().map(c => ({
                time: new Date(c.datetime).getTime(),
                open: parseFloat(c.open),
                high: parseFloat(c.high),
                low: parseFloat(c.low),
                close: parseFloat(c.close),
                volume: parseFloat(c.volume) || 0
            }));

            console.log('✅ Twelve Data forex candles fetched successfully');
            return candles;
        }

        throw new Error('Invalid Twelve Data response');

    } catch (error) {
        console.error('Twelve Data Error:', error.message);
        return generateMockForexCandles(pair, interval);
    }
}

/**
 * Fallback: Generate mock forex candles
 */
function generateMockForexCandles(pair, interval) {
    console.log('⚠️ Generating mock forex candles for', pair);
    const candles = [];

    // Base prices for common forex pairs
    const basePrices = {
        'EUR/USD': 1.0350,
        'GBP/USD': 1.2580,
        'USD/JPY': 157.50,
        'USD/CHF': 0.9030,
        'AUD/USD': 0.6240,
        'USD/CAD': 1.3600,
        'NZD/USD': 0.5650
    };

    let price = basePrices[pair] || 1.0000;
    const now = Date.now();
    const intervalMs = {
        '15m': 15 * 60 * 1000,
        '30m': 30 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000
    }[interval] || 60 * 60 * 1000;

    for (let i = 59; i >= 0; i--) {
        const volatility = price * 0.001; // 0.1% volatility for forex
        const change = (Math.random() - 0.5) * volatility;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
        const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
        const volume = Math.random() * 10000;

        candles.push({
            time: now - (i * intervalMs),
            open, high, low, close, volume
        });

        price = close;
    }

    return candles;
}
