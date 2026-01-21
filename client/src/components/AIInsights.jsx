import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, TrendingUp, TrendingDown, AlertTriangle, Terminal, Target, Shield, Zap,
    Activity, Clock, DollarSign, Layers, AlertCircle, XCircle, Wallet, Globe, Search, Sparkles,
    History, CheckCircle2, Trophy, Info
} from 'lucide-react';
import RiskCalculator from './RiskCalculator';

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
    const [accountSize, setAccountSize] = useState(() => {
        const saved = localStorage.getItem('tradingCapital');
        return saved ? parseFloat(saved) : 500;
    });

    // Sync accountSize with localStorage
    useEffect(() => {
        localStorage.setItem('tradingCapital', accountSize.toString());
    }, [accountSize]);

    // Paper Trading State
    const [paperTrades, setPaperTrades] = useState(() => {
        const saved = localStorage.getItem('paperTrades');
        return saved ? JSON.parse(saved) : [];
    });

    const [paperWallet, setPaperWallet] = useState(() => {
        const saved = localStorage.getItem('paperWallet');
        return saved ? parseFloat(saved) : 10000; // Default $10k paper money
    });

    useEffect(() => {
        localStorage.setItem('paperTrades', JSON.stringify(paperTrades));
        localStorage.setItem('paperWallet', paperWallet.toString());
    }, [paperTrades, paperWallet]);

    const executeVirtualTrade = (setup) => {
        const newTrade = {
            id: Date.now(),
            symbol: selectedAsset,
            type: data.analysis.signal,
            entry: data.analysis.entry,
            tp: data.analysis.takeProfit,
            sl: data.analysis.stopLoss,
            timestamp: new Date().toLocaleString(),
            status: 'OPEN'
        };
        setPaperTrades([newTrade, ...paperTrades]);
        alert(`🚀 Virtual Trade Placed: ${data.analysis.signal} ${selectedAsset} at ${data.analysis.entry}`);
    };

    const assets = assetType === 'crypto' ? CRYPTO_ASSETS : FOREX_PAIRS;

    useEffect(() => {
        setSelectedAsset(assetType === 'crypto' ? 'BTC' : 'EUR-USD');
        setData(null);
    }, [assetType]);

    const [loadingStep, setLoadingStep] = useState(0);
    const loadingSteps = [
        "Initializing Quantum Core...",
        "Scanning Multi-Timeframe Structure...",
        "Cross-Referencing Global News Sentiment...",
        "Calculating Risk-Adjusted Entry Vectors...",
        "Finalizing Institutional-Grade Setup..."
    ];

    useEffect(() => {
        let interval;
        if (loading) {
            setLoadingStep(0);
            interval = setInterval(() => {
                setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
            }, 800);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const [layout, setLayout] = useState('BALANCED'); // BALANCED, DATA, CHART
    const [activeTab, setActiveTab] = useState('STRUCTURE'); // STRUCTURE, LOGIC, HISTORY

    // Save/Load layout
    useEffect(() => {
        const saved = localStorage.getItem('workspaceLayout');
        if (saved) setLayout(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem('workspaceLayout', layout);
    }, [layout]);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `http://localhost:3001/api/insights/${selectedAsset}/${selectedTimeframe}?type=${assetType}&accountSize=${accountSize}`;
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

    const getSignalBg = (signal, dataSource) => {
        if (dataSource === 'technical') return 'bg-blue-500/10 border-blue-500/30';
        switch (signal) {
            case 'BUY': return 'bg-emerald-500/10 border-emerald-500/30';
            case 'SELL': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-yellow-500/10 border-yellow-500/30';
        }
    };

    return (
        <div className="hud-canvas w-full min-h-screen p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Unified Terminal Navigation */}
                <div className="glass-panel p-2 flex flex-col lg:flex-row items-center justify-between gap-4 overflow-x-auto ring-1 ring-white/5">
                    <div className="flex items-center gap-6 px-4">
                        <div className="flex items-center gap-3 border-r border-white/10 pr-6 mr-2">
                            <div className="bg-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                                <Terminal className="text-purple-400 w-5 h-5" />
                            </div>
                            <div className="hidden sm:block">
                                <h2 className="text-sm font-black text-white tracking-widest uppercase">Architect</h2>
                                <p className="hud-label !text-[8px] opacity-60">Quantum Alpha v3.5</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Asset Selectors */}
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                                {['crypto', 'forex'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setAssetType(type)}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${assetType === type ? 'bg-white/10 text-white' : 'text-dim hover:text-white'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <select
                                value={selectedAsset}
                                onChange={(e) => setSelectedAsset(e.target.value)}
                                className="bg-white/5 border border-white/5 text-white text-[10px] font-black uppercase tracking-wider rounded-lg px-4 py-2 hover:bg-white/10 outline-none transition-all cursor-pointer"
                            >
                                {assets.map(a => (
                                    <option key={a} value={a} className="bg-bg-deep">{assetType === 'crypto' ? `${a}/USDT` : a}</option>
                                ))}
                            </select>

                            <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                                {['15m', '1h', '4h'].map(tf => (
                                    <button
                                        key={tf}
                                        onClick={() => setSelectedTimeframe(tf)}
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${selectedTimeframe === tf ? 'bg-purple-500 text-white' : 'text-dim hover:text-white'
                                            }`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 px-4">
                        {/* Capital Config */}
                        <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
                            <span className="hud-label">Capital Input</span>
                            <div className="flex items-center bg-white/5 border border-white/5 rounded-lg px-3 py-1">
                                <span className="text-dim text-[10px] mr-2">$</span>
                                <input
                                    type="number"
                                    value={accountSize}
                                    onChange={(e) => setAccountSize(Math.max(0, parseFloat(e.target.value) || 0))}
                                    className="bg-transparent text-white font-mono text-xs w-20 focus:outline-none text-right"
                                />
                            </div>
                        </div>

                        <button
                            onClick={fetchAnalysis}
                            disabled={loading}
                            className="hud-button-primary disabled:opacity-50"
                        >
                            {loading ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            Execute Analysis
                        </button>
                    </div>
                </div>

                {/* Error / Empty States */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {!data && !loading && !error && (
                    <div className="text-center py-32 glass-panel border-dashed border-white/5 opacity-50">
                        <Sparkles className="w-16 h-16 mx-auto mb-6 text-dim" />
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Architect Idle</h3>
                        <p className="text-dim text-sm mt-2">Initialize quantum scanning engine to begin market reconstruction.</p>
                    </div>
                )}

                {/* Main Workspace Grid */}
                {data && data.analysis && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Wing: Visual Intel (Cols 1-8) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Chart HUD */}
                            <div className="glass-panel overflow-hidden border-white/5">
                                <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{selectedAsset} LIVE STREAM</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {['BALANCED', 'CHART', 'DATA'].map(l => (
                                            <button
                                                key={l}
                                                onClick={() => setLayout(l)}
                                                className={`p-1.5 rounded transition-all ${layout === l ? 'bg-white/10 text-white' : 'text-dim hover:text-white'}`}
                                            >
                                                {l === 'CHART' ? <BarChart2 className="w-3.5 h-3.5" /> : l === 'DATA' ? <Layers className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className={`transition-all duration-500 ${layout === 'CHART' ? 'h-[600px]' : 'h-[450px]'}`}>
                                    <iframe
                                        key={`${selectedAsset}-${selectedTimeframe}`}
                                        src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${getTradingViewSymbol()}&interval=${selectedTimeframe === '15m' ? '15' : selectedTimeframe === '30m' ? '30' : selectedTimeframe === '1h' ? '60' : '240'}&hidesidetoolbar=0&symboledit=0&saveimage=0&toolbarbg=1a1a2e&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=en`}
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                    />
                                </div>
                            </div>

                            {/* Intelligence Tabs */}
                            <div className="glass-panel overflow-hidden border-white/5 bg-black/20">
                                <div className="flex border-b border-white/5 bg-white/[0.01]">
                                    {[
                                        { id: 'STRUCTURE', label: 'Market Structure', icon: Layers },
                                        { id: 'LOGIC', label: 'Strategy Logic', icon: Sparkles },
                                        { id: 'OPERATIONS', label: 'Operations', icon: Trophy },
                                        { id: 'HISTORY', label: 'Signals', icon: History }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-dim hover:text-white'
                                                }`}
                                        >
                                            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-purple-400' : 'text-dim'}`} />
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6">
                                    {activeTab === 'STRUCTURE' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div>
                                                    <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block mb-2">Primary Pattern</span>
                                                    <p className="text-xl font-bold text-white font-mono">{data.analysis.pattern}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-dim font-black uppercase tracking-widest block mb-1">Architecture Narrative</span>
                                                    <p className="text-xs text-dim leading-relaxed">{data.analysis.marketStructure}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                                                        <span className="hud-label !text-red-400">Resistance Node</span>
                                                        <div className="hud-value text-lg mt-1">
                                                            ${data.analysis.keyLevels?.resistance?.[0]?.toFixed(2) || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                                        <span className="hud-label !text-emerald-400">Support Node</span>
                                                        <div className="hud-value text-lg mt-1">
                                                            ${data.analysis.keyLevels?.support?.[0]?.toFixed(2) || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quantum Confluence Indicators */}
                                                <div className="space-y-3 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="hud-label">Quantum Alignment</span>
                                                        <span className="text-[10px] font-mono text-purple-400">{data.analysis.mtcAlignment || 'Analyzing Layers...'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {[1, 2, 3].map(lvl => (
                                                            <div key={lvl} className="space-y-1.5">
                                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: '100%' }}
                                                                        transition={{ delay: 0.1 * lvl }}
                                                                        className={`h-full ${data.analysis.signal === 'BUY' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                                    />
                                                                </div>
                                                                <span className="text-[8px] font-black text-dim uppercase tracking-tighter block text-center">Layer {lvl}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'LOGIC' && (
                                        <div className="space-y-6">
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                                    <Info className="w-16 h-16" />
                                                </div>
                                                <h4 className="text-[10px] text-dim font-black uppercase tracking-widest mb-4">The Convergence Thesis</h4>
                                                <p className="text-white text-sm leading-relaxed italic z-10 relative">"{data.analysis.whyEnter}"</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <span className="text-[10px] text-red-500 font-black uppercase tracking-widest block mb-3">Alpha Risk Vectors</span>
                                                    <ul className="space-y-2">
                                                        {data.analysis.riskFactors?.map((risk, i) => (
                                                            <li key={i} className="flex items-center gap-3 text-xs text-dim">
                                                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                                                {risk}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {data.analysis.tailoredSetup && (
                                                    <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                                                        <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block mb-2">Capital Calibration</span>
                                                        <p className="text-xs text-white leading-relaxed">{data.analysis.tailoredSetup}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'OPERATIONS' && (
                                        <div className="space-y-6">
                                            {/* Operation Performance Strip */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <span className="hud-label block mb-1">Vault Status</span>
                                                    <div className="hud-value text-xl">${paperWallet.toLocaleString()}</div>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <span className="hud-label block mb-1">Active Vectors</span>
                                                    <div className="hud-value text-xl">{paperTrades.filter(t => t.status === 'OPEN').length}</div>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <span className="hud-label block mb-1">Refined PNL</span>
                                                    <div className="hud-value text-xl text-dim">$0.00</div>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <span className="hud-label block mb-1">Efficiency</span>
                                                    <div className="hud-value text-xl text-emerald-400">---</div>
                                                </div>
                                            </div>

                                            {/* Active Operations Table */}
                                            <div className="overflow-x-auto rounded-xl border border-white/5">
                                                <table className="w-full">
                                                    <thead className="text-[10px] text-dim uppercase font-black bg-white/[0.01]">
                                                        <tr>
                                                            <th className="text-left px-6 py-4">Asset Node</th>
                                                            <th className="text-left py-4">Protocol</th>
                                                            <th className="text-left py-4">Entry</th>
                                                            <th className="text-left py-4">TP / SL Bounds</th>
                                                            <th className="text-right px-6 py-4">Override</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-xs">
                                                        {paperTrades.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="5" className="py-12 text-center text-dim italic">
                                                                    No active virtual operations detected.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            paperTrades.map((trade) => (
                                                                <tr key={trade.id} className="border-t border-white/5 group hover:bg-white/[0.01] transition-colors">
                                                                    <td className="px-6 py-4 font-bold text-white uppercase tracking-wider">{trade.symbol}</td>
                                                                    <td className="py-4">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                                            }`}>
                                                                            {trade.type}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 font-mono text-dim">${trade.entry?.toFixed(4)}</td>
                                                                    <td className="py-4">
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="text-[9px] text-emerald-500/60 font-mono">EXTRACT: {trade.tp?.toFixed(4)}</span>
                                                                            <span className="text-[9px] text-red-500/60 font-mono">ABSORB: {trade.sl?.toFixed(4)}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <button
                                                                            onClick={() => setPaperTrades(paperTrades.filter(t => t.id !== trade.id))}
                                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-dim hover:text-red-400"
                                                                        >
                                                                            <XCircle className="w-4 h-4" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    onClick={() => { if (confirm('Wipe all operations?')) { setPaperTrades([]); setPaperWallet(10000); } }}
                                                    className="hud-label hover:text-red-400 transition-colors"
                                                >
                                                    Emergency Reset Terminal
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'HISTORY' && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="text-[10px] text-dim uppercase font-black">
                                                    <tr>
                                                        <th className="text-left pb-4">Asset Node</th>
                                                        <th className="text-left pb-4">Vector</th>
                                                        <th className="text-left pb-4">Exec Price</th>
                                                        <th className="text-right pb-4">Timestamp</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-xs">
                                                    {data.history?.slice(0, 5).map((h, i) => (
                                                        <tr key={i} className="border-t border-white/5">
                                                            <td className="py-4 font-bold text-white uppercase tracking-wider">{h.symbol}</td>
                                                            <td className="py-4">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${h.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                    {h.signal}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 font-mono text-dim">${h.price?.toFixed(2)}</td>
                                                            <td className="py-4 text-right text-dim">{new Date(h.timestamp).toLocaleTimeString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Wing: Command Stack (Cols 9-12) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Signal Strength Block */}
                            <div className={`glass-panel p-8 relative overflow-hidden transition-all duration-700 ${data.analysis.signal === 'BUY' ? 'border-emerald-500/30 shadow-[inset_0_0_100px_rgba(16,185,129,0.05)]' :
                                data.analysis.signal === 'SELL' ? 'border-red-500/30 shadow-[inset_0_0_100px_rgba(239,68,68,0.05)]' :
                                    'border-yellow-500/30'
                                }`}>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] text-dim font-black uppercase tracking-widest">Quantum Verdict</span>
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${data.analysis.dataSource === 'live' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                        {data.analysis.dataSource} Engine
                                    </div>
                                </div>

                                <h3 className={`text-7xl font-black tracking-tighter mb-4 ${data.analysis.signal === 'BUY' ? 'text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]' :
                                    data.analysis.signal === 'SELL' ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]' :
                                        'text-yellow-500'
                                    }`}>
                                    {data.analysis.signal}
                                </h3>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-dim font-black uppercase tracking-widest">Confidence Index</span>
                                        <span className="text-white font-mono font-bold">{data.analysis.confidence}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${data.analysis.confidence}%` }}
                                            className={`h-full ${data.analysis.signal === 'BUY' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Execution Coordinates */}
                            <div className="glass-panel p-6 space-y-4 border-white/5">
                                <h4 className="text-[10px] text-dim font-black uppercase tracking-[0.2em] mb-4">Execution Coordinates</h4>

                                <div className="space-y-2">
                                    {[
                                        { label: 'Market Entry', value: data.analysis.entry, color: 'text-white' },
                                        { label: 'Risk Barrier (SL)', value: data.analysis.stopLoss, color: 'text-red-400' },
                                        { label: 'Extraction Node (TP)', value: data.analysis.takeProfit, color: 'text-emerald-400' }
                                    ].map((coord, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                            <span className="text-[10px] text-dim font-bold uppercase tracking-widest">{coord.label}</span>
                                            <span className={`font-mono text-sm font-bold ${coord.color}`}>${coord.value?.toFixed(4)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-center pt-2">
                                    <span className="text-[9px] text-dim uppercase tracking-widest">Efficiency Multiplier</span>
                                    <div className="text-xl font-black text-purple-400 italic font-mono">{data.analysis.riskRewardRatio} R:R</div>
                                </div>
                            </div>

                            {/* Integrated Radar */}
                            <div className="glass-panel p-6 border-white/5 relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-[10px] text-dim font-black uppercase tracking-[0.2em]">Institutional Zones</h4>
                                    <Target className="w-4 h-4 text-cyan-500" />
                                </div>
                                <div className="relative h-32 flex items-center justify-center">
                                    <div className="absolute inset-0 border border-white/5 rounded-full flex items-center justify-center">
                                        <div className="absolute inset-8 border border-white/10 rounded-full" />
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            className="absolute w-full h-full rounded-full border-t border-cyan-500/20"
                                        />
                                    </div>
                                    <div className="z-10 w-full px-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] text-dim uppercase font-bold">Resistance</span>
                                            <span className="text-[9px] text-red-400 font-mono">${data.analysis.keyLevels?.resistance?.[0]?.toFixed(2)}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500/30 w-[85%]" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] text-dim uppercase font-bold">Support</span>
                                            <span className="text-[9px] text-emerald-400 font-mono">${data.analysis.keyLevels?.support?.[0]?.toFixed(2)}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500/30 w-[92%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Execution Trigger */}
                            <div className="space-y-3">
                                <button
                                    onClick={executeVirtualTrade}
                                    disabled={data.analysis.signal === 'WAIT'}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-all shadow-2xl ${data.analysis.signal === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' :
                                        data.analysis.signal === 'SELL' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' :
                                            'bg-dim/20 cursor-not-allowed text-dim'
                                        }`}
                                >
                                    <Zap className="w-4 h-4" />
                                    Launch Virtual Operation
                                </button>
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[9px] text-dim uppercase font-bold tracking-widest">Vault Balance</span>
                                    <span className="text-xs text-white font-mono">${paperWallet.toLocaleString()}</span>
                                </div>
                            </div>

                            <RiskCalculator
                                entry={data.analysis.entry}
                                stopLoss={data.analysis.stopLoss}
                                takeProfit={data.analysis.takeProfit}
                                symbol={selectedAsset}
                                assetType={assetType}
                                currentPrice={data.analysis.currentPrice}
                                signal={data.analysis.signal}
                            />
                        </div>
                    </div>
                )}

                {/* Loading Sequence */}
                {loading && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
                        <div className="text-center space-y-8 max-w-sm w-full p-8">
                            <div className="relative w-32 h-32 mx-auto">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-b-2 border-purple-500 rounded-full"
                                />
                                <div className="absolute inset-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <Terminal className="text-purple-400 w-10 h-10 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-white uppercase tracking-[0.3em]">RECONSTRUCTING</h2>
                                <p className="text-dim font-mono text-[10px] uppercase tracking-widest h-4">
                                    {loadingSteps[loadingStep]}
                                </p>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInsights;
