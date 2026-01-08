import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, TrendingUp, TrendingDown, AlertTriangle, Terminal, Target, Shield, Zap,
    Activity, Clock, DollarSign, Layers, AlertCircle, XCircle
} from 'lucide-react';

const CRYPTO_ASSETS = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'BNB', 'AVAX', 'LINK', 'DOT'];
const FOREX_PAIRS = [
    // Major Pairs
    'EUR-USD', 'GBP-USD', 'USD-JPY', 'USD-CHF', 'AUD-USD', 'USD-CAD', 'NZD-USD',
    // Crosses
    'EUR-GBP', 'EUR-JPY', 'GBP-JPY', 'AUD-JPY', 'EUR-AUD',
    // Commodities / Metals
    'XAU-USD', 'XAG-USD',  // Gold, Silver
    // Exotic
    'USD-ZAR', 'USD-MXN', 'EUR-TRY'
];
const TIMEFRAMES = ['15m', '30m', '1h', '4h'];

const AIInsights = () => {
    const [assetType, setAssetType] = useState('crypto');
    const [selectedAsset, setSelectedAsset] = useState('BTC');
    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const assets = assetType === 'crypto' ? CRYPTO_ASSETS : FOREX_PAIRS;

    useEffect(() => {
        setSelectedAsset(assetType === 'crypto' ? 'BTC' : 'EUR-USD');
        setData(null);
    }, [assetType]);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `http://localhost:3001/api/insights/${selectedAsset}/${selectedTimeframe}?type=${assetType}`;
            console.log('Fetching:', url);
            const response = await fetch(url);
            const result = await response.json();

            console.log('API Response:', result);

            if (result.success && result.data && result.data.analysis) {
                setData(result.data);
                console.log('Data set successfully:', result.data);
            } else {
                console.error('Invalid response structure:', result);
                setError(result.message || 'Failed to fetch analysis data.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Connection error. Ensure server is running.');
        } finally {
            setLoading(false);
        }
    };

    const getTradingViewSymbol = () => {
        if (assetType === 'crypto') {
            return `BINANCE:${selectedAsset}USDT`;
        } else {
            return `FX:${selectedAsset.replace('-', '')}`;
        }
    };

    const getSignalColor = (signal) => {
        switch (signal) {
            case 'BUY': return 'from-emerald-500 to-teal-400';
            case 'SELL': return 'from-red-500 to-orange-400';
            default: return 'from-yellow-500 to-amber-400';
        }
    };

    const getSignalBg = (signal) => {
        switch (signal) {
            case 'BUY': return 'bg-emerald-500/10 border-emerald-500/30';
            case 'SELL': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-yellow-500/10 border-yellow-500/30';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header / Controls */}
            <div className="glass-panel p-6 rounded-2xl">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-purple-500/20">
                            <Terminal className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">AI Market Architect</h2>
                            <p className="text-gray-400 text-sm">Powered by Gemini 2.0 // Candlestick Bible Analysis</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                        {/* Asset Type Toggle */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setAssetType('crypto')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${assetType === 'crypto' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Crypto
                            </button>
                            <button
                                onClick={() => setAssetType('forex')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${assetType === 'forex' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Forex
                            </button>
                        </div>

                        <select
                            value={selectedAsset}
                            onChange={(e) => setSelectedAsset(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:border-purple-500 outline-none min-w-[140px]"
                        >
                            {assets.map(a => (
                                <option key={a} value={a}>
                                    {assetType === 'crypto' ? `${a} / USDT` : a.replace('-', '/')}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedTimeframe}
                            onChange={(e) => setSelectedTimeframe(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:border-purple-500 outline-none"
                        >
                            {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <button
                            onClick={fetchAnalysis}
                            disabled={loading}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(124,58,237,0.3)]"
                        >
                            {loading ? (
                                <><span className="animate-spin">⚡</span> Analyzing...</>
                            ) : (
                                <><Zap className="w-5 h-5" /> Generate Insight</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-20 glass-panel rounded-2xl">
                    <div className="animate-pulse">
                        <Zap className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                        <p className="text-xl text-white mb-2">Analyzing Market Structure...</p>
                        <p className="text-sm text-gray-500">Fetching candle data and generating AI insights</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!data && !loading && !error && (
                <div className="text-center py-20 text-gray-500 glass-panel rounded-2xl border-2 border-dashed border-white/5">
                    <BarChart2 className="w-20 h-20 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-2">Select an asset and timeframe</p>
                    <p className="text-sm text-gray-600">Click "Generate Insight" to initialize quantum analysis</p>
                </div>
            )}

            {/* Results */}
            {data && data.analysis && (
                <div className="space-y-6">
                    {/* Main Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* TradingView Chart */}
                        <div className="xl:col-span-2 glass-panel rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-bold text-white">Live Chart</h3>
                                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">• Live</span>
                                </div>
                                <span className="text-sm text-gray-400">{getTradingViewSymbol()}</span>
                            </div>
                            <div className="h-[450px]">
                                <iframe
                                    key={`${selectedAsset}-${selectedTimeframe}`}
                                    src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${getTradingViewSymbol()}&interval=${selectedTimeframe === '15m' ? '15' : selectedTimeframe === '30m' ? '30' : selectedTimeframe === '1h' ? '60' : '240'}&hidesidetoolbar=0&symboledit=0&saveimage=0&toolbarbg=1a1a2e&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=en`}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Signal Card */}
                        <div className="space-y-4">
                            <div className={`glass-panel p-6 rounded-2xl border-l-4 ${data.analysis.signal === 'BUY' ? 'border-l-emerald-500' :
                                data.analysis.signal === 'SELL' ? 'border-l-red-500' : 'border-l-yellow-500'
                                }`}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Signal</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${data.analysis.dataSource === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {data.analysis.dataSource === 'live' ? 'AI Live' : 'Simulation'}
                                    </span>
                                </div>

                                <h3 className={`text-5xl font-black tracking-tight bg-gradient-to-r ${getSignalColor(data.analysis.signal)} bg-clip-text text-transparent`}>
                                    {data.analysis.signal}
                                </h3>

                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">Confidence:</span>
                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${getSignalColor(data.analysis.signal)}`}
                                            style={{ width: `${data.analysis.confidence}%` }}
                                        />
                                    </div>
                                    <span className="text-white font-bold">{data.analysis.confidence}%</span>
                                </div>
                            </div>

                            {/* Trade Levels */}
                            <div className="glass-panel p-5 rounded-2xl space-y-3">
                                <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Trade Setup</h4>

                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <DollarSign className="w-4 h-4 text-blue-400" /> Current
                                    </div>
                                    <span className="font-mono text-white text-lg font-bold">
                                        {data.analysis.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? '---'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <div className="flex items-center gap-2 text-blue-300">
                                        <TrendingUp className="w-4 h-4" /> Entry
                                    </div>
                                    <span className="font-mono text-white text-lg">
                                        {data.analysis.entry?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? '---'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                    <div className="flex items-center gap-2 text-red-300">
                                        <Shield className="w-4 h-4" /> Stop Loss
                                    </div>
                                    <span className="font-mono text-white text-lg">
                                        {data.analysis.stopLoss?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? '---'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <div className="flex items-center gap-2 text-emerald-300">
                                        <Target className="w-4 h-4" /> Take Profit
                                    </div>
                                    <span className="font-mono text-white text-lg">
                                        {data.analysis.takeProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? '---'}
                                    </span>
                                </div>

                                {data.analysis.riskRewardRatio && (
                                    <div className="text-center pt-2">
                                        <span className="text-xs text-gray-500">Risk/Reward</span>
                                        <div className="text-lg font-bold text-purple-400">{data.analysis.riskRewardRatio}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Analysis Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pattern & Structure */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-purple-400" />
                                Market Structure
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-purple-400 uppercase tracking-wider">Pattern Detected</span>
                                    <div className="mt-1 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white font-medium">
                                        {data.analysis.pattern}
                                    </div>
                                </div>

                                {data.analysis.patternDescription && (
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Pattern Significance</span>
                                        <p className="mt-1 text-gray-300 text-sm leading-relaxed">
                                            {data.analysis.patternDescription}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Structure Analysis</span>
                                    <p className="mt-1 text-gray-300 text-sm leading-relaxed">
                                        {data.analysis.marketStructure}
                                    </p>
                                </div>

                                {data.analysis.keyLevels && (
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                                            <span className="text-xs text-red-400">Resistance</span>
                                            <div className="font-mono text-white text-sm mt-1">
                                                {data.analysis.keyLevels.resistance?.map((r, i) => (
                                                    <div key={i}>{r?.toFixed(4)}</div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                                            <span className="text-xs text-emerald-400">Support</span>
                                            <div className="font-mono text-white text-sm mt-1">
                                                {data.analysis.keyLevels.support?.map((s, i) => (
                                                    <div key={i}>{s?.toFixed(4)}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Why Enter & Risks */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                {data.analysis.signal === 'BUY' ? (
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                ) : data.analysis.signal === 'SELL' ? (
                                    <TrendingDown className="w-5 h-5 text-red-400" />
                                ) : (
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                )}
                                {data.analysis.signal === 'BUY' ? 'Why Long?' : data.analysis.signal === 'SELL' ? 'Why Short?' : 'Why Wait?'}
                            </h3>

                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl border ${getSignalBg(data.analysis.signal)}`}>
                                    <p className="text-gray-200 text-sm leading-relaxed">
                                        {data.analysis.whyEnter}
                                    </p>
                                </div>

                                {data.analysis.riskFactors && data.analysis.riskFactors.length > 0 && (
                                    <div>
                                        <span className="text-xs text-red-400 uppercase tracking-wider flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Risk Factors
                                        </span>
                                        <ul className="mt-2 space-y-2">
                                            {data.analysis.riskFactors.map((risk, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    {risk}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {data.analysis.technicalNotes && (
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Technical Notes</span>
                                        <p className="mt-1 text-gray-400 text-sm">
                                            {data.analysis.technicalNotes}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-purple-300 italic text-sm">
                                        "{data.analysis.reasoning}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="glass-panel p-4 rounded-xl">
                        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-white">{data.symbol}</div>
                                <div className="text-xs text-gray-500">{data.assetType?.toUpperCase()}</div>
                            </div>
                            <div className="w-px h-8 bg-white/10 hidden sm:block" />
                            <div>
                                <div className="text-2xl font-bold text-white">{data.timeframe}</div>
                                <div className="text-xs text-gray-500">Timeframe</div>
                            </div>
                            <div className="w-px h-8 bg-white/10 hidden sm:block" />
                            <div>
                                <div className="text-2xl font-bold text-white">{data.candles?.length}</div>
                                <div className="text-xs text-gray-500">Candles Analyzed</div>
                            </div>
                            <div className="w-px h-8 bg-white/10 hidden sm:block" />
                            <div>
                                <div className="text-2xl font-bold text-purple-400">
                                    {new Date(data.analysis.timestamp).toLocaleTimeString()}
                                </div>
                                <div className="text-xs text-gray-500">Generated At</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInsights;
