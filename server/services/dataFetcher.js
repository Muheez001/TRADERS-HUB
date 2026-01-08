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
const NEWS_API_BASE = 'https://newsapi.org/v2';
const NEWSDATA_API_BASE = 'https://newsdata.io/api/1';
const CMC_API_BASE = 'https://pro-api.coinmarketcap.com/v1';

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

