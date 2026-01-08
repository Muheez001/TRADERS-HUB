import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, TrendingUp, Maximize2, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Organized trading pairs by category
const SYMBOL_CATEGORIES = {
    forex: [
        { id: 'FX:XAUUSD', label: 'XAU/USD', name: 'Gold' },
        { id: 'FX:XAGUSD', label: 'XAG/USD', name: 'Silver' },
        { id: 'FX:GBPUSD', label: 'GBP/USD', name: 'British Pound' },
        { id: 'FX:EURUSD', label: 'EUR/USD', name: 'Euro' },
        { id: 'FX:USDJPY', label: 'USD/JPY', name: 'Japanese Yen' },
        { id: 'FX:AUDUSD', label: 'AUD/USD', name: 'Australian Dollar' },
        { id: 'FX:USDCHF', label: 'USD/CHF', name: 'Swiss Franc' },
        { id: 'FX:USDCAD', label: 'USD/CAD', name: 'Canadian Dollar' },
    ],
    crypto: [
        { id: 'BINANCE:BTCUSDT', label: 'BTC/USDT', name: 'Bitcoin' },
        { id: 'BINANCE:ETHUSDT', label: 'ETH/USDT', name: 'Ethereum' },
        { id: 'BINANCE:SOLUSDT', label: 'SOL/USDT', name: 'Solana' },
        { id: 'BINANCE:XRPUSDT', label: 'XRP/USDT', name: 'XRP' },
        { id: 'BINANCE:ADAUSDT', label: 'ADA/USDT', name: 'Cardano' },
        { id: 'BINANCE:DOGEUSDT', label: 'DOGE/USDT', name: 'Dogecoin' },
        { id: 'BINANCE:AVAXUSDT', label: 'AVAX/USDT', name: 'Avalanche' },
        { id: 'BINANCE:LINKUSDT', label: 'LINK/USDT', name: 'Chainlink' },
    ],
    indices: [
        { id: 'SP:SPX', label: 'S&P 500', name: 'S&P 500' },
        { id: 'TVC:DXY', label: 'DXY', name: 'US Dollar Index' },
        { id: 'TVC:US10Y', label: 'US10Y', name: 'US 10Y Yield' },
    ]
};

const ALL_SYMBOLS = [...SYMBOL_CATEGORIES.forex, ...SYMBOL_CATEGORIES.crypto, ...SYMBOL_CATEGORIES.indices];

const INTERVALS = [
    { id: '1', label: '1m' },
    { id: '5', label: '5m' },
    { id: '15', label: '15m' },
    { id: '60', label: '1H' },
    { id: '240', label: '4H' },
    { id: 'D', label: '1D' },
    { id: 'W', label: '1W' },
];

function TradingViewChart() {
    const containerRef = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState('forex');
    const [selectedSymbol, setSelectedSymbol] = useState(SYMBOL_CATEGORIES.forex[0]);
    const [selectedInterval, setSelectedInterval] = useState(INTERVALS[3]);
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme();

    const currentSymbols = SYMBOL_CATEGORIES[selectedCategory] || SYMBOL_CATEGORIES.forex;

    useEffect(() => {
        if (!containerRef.current) return;

        setIsLoading(true);

        // Clear any existing widget
        containerRef.current.innerHTML = '';

        // Create TradingView widget
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: selectedSymbol.id,
            interval: selectedInterval.id,
            timezone: "Etc/UTC",
            theme: theme === 'light' ? "light" : "dark",
            style: "1",
            locale: "en",
            enable_publishing: false,
            backgroundColor: theme === 'light' ? "rgba(255, 255, 255, 1)" : "rgba(15, 15, 15, 1)",
            gridColor: theme === 'light' ? "rgba(0, 0, 0, 0.06)" : "rgba(40, 40, 40, 0.5)",
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            calendar: false,
            hide_volume: false,
            support_host: "https://www.tradingview.com"
        });

        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container__widget';
        widgetContainer.style.height = '100%';
        widgetContainer.style.width = '100%';

        containerRef.current.appendChild(widgetContainer);
        containerRef.current.appendChild(script);

        script.onload = () => setIsLoading(false);

        // Fallback timeout for loading state
        const timeout = setTimeout(() => setIsLoading(false), 3000);

        return () => {
            clearTimeout(timeout);
        };
    }, [selectedSymbol.id, selectedInterval.id, theme]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <LineChart className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Live Charts</h2>
                        <p className="text-xs text-neutral-500">Powered by TradingView</p>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-900 border border-neutral-800">
                    {Object.keys(SYMBOL_CATEGORIES).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setSelectedCategory(cat);
                                setSelectedSymbol(SYMBOL_CATEGORIES[cat][0]);
                            }}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${selectedCategory === cat
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Symbol Selector */}
            <div className="flex items-center gap-2 flex-wrap">
                {currentSymbols.slice(0, 6).map((symbol) => (
                    <button
                        key={symbol.id}
                        onClick={() => setSelectedSymbol(symbol)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedSymbol.id === symbol.id
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            }`}
                    >
                        {symbol.label}
                    </button>
                ))}
                <select
                    value={selectedSymbol.id}
                    onChange={(e) => setSelectedSymbol(ALL_SYMBOLS.find(s => s.id === e.target.value) || currentSymbols[0])}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700 focus:outline-none focus:border-purple-500"
                >
                    {currentSymbols.map((symbol) => (
                        <option key={symbol.id} value={symbol.id}>
                            {symbol.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Interval Selector */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Timeframe:</span>
                {INTERVALS.map((interval) => (
                    <button
                        key={interval.id}
                        onClick={() => setSelectedInterval(interval)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${selectedInterval.id === interval.id
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-800/50 text-neutral-500 hover:text-neutral-300'
                            }`}
                    >
                        {interval.label}
                    </button>
                ))}
            </div>

            {/* Chart Container - BIGGER */}
            <motion.div
                className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900/80">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                            <span className="text-sm text-neutral-400">Loading chart...</span>
                        </div>
                    </div>
                )}

                {/* TradingView Widget Container - Large chart height */}
                <div
                    ref={containerRef}
                    className="tradingview-widget-container"
                    style={{ height: 'calc(100vh - 280px)', minHeight: '500px', width: '100%' }}
                />
            </motion.div>

            {/* Info Cards - Compact row */}
            <div className="grid grid-cols-3 gap-3">
                <InfoCard
                    icon={<TrendingUp className="w-3.5 h-3.5" />}
                    title="Real-Time Data"
                />
                <InfoCard
                    icon={<LineChart className="w-3.5 h-3.5" />}
                    title="Technical Analysis"
                />
                <InfoCard
                    icon={<Maximize2 className="w-3.5 h-3.5" />}
                    title="Full Featured"
                />
            </div>
        </div>
    );
}

function InfoCard({ icon, title }) {
    return (
        <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 flex items-center gap-2">
            <span className="text-purple-400">{icon}</span>
            <span className="text-xs font-medium text-white">{title}</span>
        </div>
    );
}

export default TradingViewChart;
