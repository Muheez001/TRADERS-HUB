import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, TrendingUp, TrendingDown, AlertTriangle, Terminal, Target, Shield, Zap,
    Activity, Clock, DollarSign, Layers, AlertCircle, XCircle, Wallet, Globe, Search, Sparkles,
    History, CheckCircle2, Trophy, Info, Radar, ChevronDown, ChevronUp, Timer, X
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
    'USD-ZAR', 'USD-MXN', 'EUR-TRY',
    // Crypto Forex
    'BTC-USD'
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
    const [riskAmount, setRiskAmount] = useState(() => {
        const saved = localStorage.getItem('tradingRiskAmount');
        return saved ? parseFloat(saved) : 50;
    });
    const [targetGain, setTargetGain] = useState(() => {
        const saved = localStorage.getItem('tradingTargetGain');
        return saved ? parseFloat(saved) : 100;
    });

    // Sync state with localStorage
    useEffect(() => {
        localStorage.setItem('tradingCapital', accountSize.toString());
        localStorage.setItem('tradingRiskAmount', riskAmount.toString());
        localStorage.setItem('tradingTargetGain', targetGain.toString());
    }, [accountSize, riskAmount, targetGain]);

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
    const [activeSubTab, setActiveSubTab] = useState('STRUCTURE'); // STRUCTURE, LOGIC, HISTORY

    // === HIGH CONFLUENCE SCANNER STATE ===
    const [scannerOpen, setScannerOpen] = useState(false);
    const [scannerLoading, setScannerLoading] = useState(false);
    const [scannerResults, setScannerResults] = useState(null);
    const [scannerProgress, setScannerProgress] = useState({ current: 0, total: 0, currentPair: '' });
    const [scannerError, setScannerError] = useState(null);
    const [fullScan, setFullScan] = useState(false);
    const [cooldownEnd, setCooldownEnd] = useState(null);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    // Cooldown timer
    useEffect(() => {
        if (!cooldownEnd) return;
        const interval = setInterval(() => {
            const remaining = Math.max(0, new Date(cooldownEnd).getTime() - Date.now());
            setCooldownRemaining(remaining);
            if (remaining <= 0) {
                setCooldownEnd(null);
                setCooldownRemaining(0);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldownEnd]);

    const formatCooldown = (ms) => {
        const totalSec = Math.ceil(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const startScan = async () => {
        setScannerLoading(true);
        setScannerError(null);
        setScannerResults(null);
        setScannerOpen(true);

        const totalPairs = fullScan ? 28 : 8;
        setScannerProgress({ current: 0, total: totalPairs, currentPair: 'Initializing...' });

        // Simulate progress updates since the API is one long request
        const pairs = fullScan
            ? ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'BNB', 'AVAX', 'LINK', 'DOT', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'EUR/AUD', 'XAU/USD', 'XAG/USD', 'USD/ZAR', 'USD/MXN', 'EUR/TRY', 'BTC/USD']
            : ['BTC', 'ETH', 'SOL', 'XRP', 'EUR/USD', 'GBP/USD', 'XAU/USD', 'USD/JPY'];

        let progressIdx = 0;
        const progressInterval = setInterval(() => {
            if (progressIdx < pairs.length) {
                setScannerProgress({ current: progressIdx + 1, total: totalPairs, currentPair: pairs[progressIdx] });
                progressIdx++;
            }
        }, 4000); // ~4s per pair estimate

        try {
            const response = await fetch('http://localhost:3001/api/scanner/high-confluence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timeframe: selectedTimeframe,
                    accountSize,
                    riskAmount,
                    targetGain,
                    fullScan
                })
            });

            const result = await response.json();

            if (response.status === 429) {
                setScannerError(`Scanner on cooldown. Next scan in ${formatCooldown(result.cooldownRemaining)}`);
                setCooldownEnd(result.nextScanAvailable);
            } else if (result.success) {
                setScannerResults(result.data);
                setCooldownEnd(result.data.nextScanAvailable);
            } else {
                setScannerError(result.message || 'Scanner failed');
            }
        } catch (err) {
            setScannerError('Connection error. Ensure server is running.');
        } finally {
            clearInterval(progressInterval);
            setScannerProgress({ current: totalPairs, total: totalPairs, currentPair: 'Complete' });
            setScannerLoading(false);
        }
    };

    const [pendingScanLoad, setPendingScanLoad] = useState(null);

    const loadSetupFromScan = (setup) => {
        // Set the selectors first, then trigger fetch via useEffect
        setAssetType(setup.assetType);
        setSelectedAsset(setup.displaySymbol);
        setSelectedTimeframe(setup.timeframe);
        setScannerOpen(false);
        setPendingScanLoad(setup.displaySymbol + setup.timeframe); // Trigger key
    };

    // Effect: when a scan result is selected and state has updated, fetch analysis
    useEffect(() => {
        if (pendingScanLoad) {
            setPendingScanLoad(null);
            fetchAnalysis();
        }
    }, [pendingScanLoad, selectedAsset, selectedTimeframe]);

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
            const url = `http://localhost:3001/api/insights/${selectedAsset}/${selectedTimeframe}?type=${assetType}&accountSize=${accountSize}&riskAmount=${riskAmount}&targetGain=${targetGain}`;
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
                                    <option key={a} value={a} className="bg-neutral-900 text-white">{assetType === 'crypto' ? `${a}/USDT` : a}</option>
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

                            {/* Trading Account (Capital) */}
                            <div className="flex flex-col gap-0.5 group relative">
                                <div className="flex items-center gap-1 cursor-help hover:text-white transition-colors duration-200">
                                    <span className="hud-label group-hover:text-white">Trading Account</span>
                                    <Info className="w-3 h-3 text-dim group-hover:text-purple-400 transition-colors" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                        <span className="font-semibold text-white block mb-1">💰 Your Total Capital</span>
                                        The total amount in your trading account. Position sizes will be calculated based on this.
                                    </div>
                                </div>
                                <div className="flex items-center bg-white/5 border border-white/5 rounded-lg px-2 py-0.5 group-hover:border-purple-500/30 transition-colors">
                                    <span className="text-dim text-[10px] mr-1">$</span>
                                    <input
                                        type="number"
                                        value={accountSize}
                                        onChange={(e) => setAccountSize(Math.max(0, parseFloat(e.target.value) || 0))}
                                        className="bg-transparent text-white font-mono text-[10px] w-16 focus:outline-none text-right"
                                        placeholder="1000"
                                    />
                                </div>
                            </div>

                            {/* Risk Per Trade */}
                            <div className="flex flex-col gap-0.5 group relative">
                                <div className="flex items-center gap-1 cursor-help hover:text-white transition-colors duration-200">
                                    <span className="hud-label group-hover:text-white">Risk Per Trade</span>
                                    <Info className="w-3 h-3 text-dim group-hover:text-red-400 transition-colors" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                        <span className="font-semibold text-red-400 block mb-1">⚠️ Max Loss Per Trade</span>
                                        The maximum amount you're willing to lose if the trade hits your stop loss. Pros risk 1-2% of capital per trade.
                                    </div>
                                </div>
                                <div className="flex items-center bg-white/5 border border-red-500/20 rounded-lg px-2 py-0.5 group-hover:border-red-500/40 transition-colors">
                                    <span className="text-dim text-[10px] mr-1">$</span>
                                    <input
                                        type="number"
                                        value={riskAmount}
                                        onChange={(e) => setRiskAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                        className="bg-transparent font-mono text-[10px] w-12 focus:outline-none text-right text-red-400"
                                        placeholder="20"
                                    />
                                </div>
                            </div>

                            {/* Target Profit */}
                            <div className="flex flex-col gap-0.5 group relative">
                                <div className="flex items-center gap-1 cursor-help hover:text-white transition-colors duration-200">
                                    <span className="hud-label group-hover:text-white">Target Profit</span>
                                    <Info className="w-3 h-3 text-dim group-hover:text-emerald-400 transition-colors" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                        <span className="font-semibold text-emerald-400 block mb-1">🎯 Your Profit Goal</span>
                                        The amount you want to make on this trade. Aim for at least 2x your risk (e.g., risk $20 to make $40).
                                    </div>
                                </div>
                                <div className="flex items-center bg-white/5 border border-emerald-500/20 rounded-lg px-2 py-0.5 group-hover:border-emerald-500/40 transition-colors">
                                    <span className="text-dim text-[10px] mr-1">$</span>
                                    <input
                                        type="number"
                                        value={targetGain}
                                        onChange={(e) => setTargetGain(Math.max(0, parseFloat(e.target.value) || 0))}
                                        className="bg-transparent font-mono text-[10px] w-12 focus:outline-none text-right text-emerald-400"
                                        placeholder="40"
                                    />
                                </div>
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

                        <button
                            onClick={startScan}
                            disabled={scannerLoading || cooldownRemaining > 0}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] active:scale-95"
                        >
                            {scannerLoading ? (
                                <Radar className="w-3.5 h-3.5 animate-spin" />
                            ) : cooldownRemaining > 0 ? (
                                <Timer className="w-3.5 h-3.5" />
                            ) : (
                                <Radar className="w-3.5 h-3.5" />
                            )}
                            {scannerLoading ? 'Scanning...' : cooldownRemaining > 0 ? `Cooldown ${formatCooldown(cooldownRemaining)}` : 'Scan for Setups'}
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

                {/* ═══ HIGH CONFLUENCE SCANNER RESULTS PANEL ═══ */}
                {scannerOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel border-amber-500/20 overflow-hidden"
                    >
                        {/* Scanner Header */}
                        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-amber-500/[0.03]">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-500/20 p-2 rounded-lg border border-amber-500/30">
                                    <Radar className="text-amber-400 w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">
                                        High Confluence Scanner
                                    </h3>
                                    <p className="text-[9px] text-dim">
                                        {scannerResults
                                            ? `${scannerResults.qualifyingSetups.length} setups found ≥${scannerResults.threshold}% · Scanned ${scannerResults.scannedCount} pairs in ${scannerResults.scanDuration}`
                                            : scannerLoading ? `Scanning ${scannerProgress.current}/${scannerProgress.total}...` : 'Ready to scan'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Full Scan Toggle */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-[9px] text-dim uppercase tracking-widest font-bold">Full Scan</span>
                                    <div
                                        onClick={() => setFullScan(!fullScan)}
                                        className={`w-8 h-4 rounded-full transition-all cursor-pointer relative ${fullScan ? 'bg-amber-500' : 'bg-white/10'
                                            }`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${fullScan ? 'left-4' : 'left-0.5'
                                            }`} />
                                    </div>
                                </label>
                                <button
                                    onClick={() => { setScannerOpen(false); setScannerResults(null); setScannerError(null); }}
                                    className="p-1.5 text-dim hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Scanner Loading State */}
                        {scannerLoading && (
                            <div className="p-8">
                                <div className="flex items-center justify-center gap-6 mb-6">
                                    <div className="relative w-20 h-20">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 border-2 border-transparent border-t-amber-500 rounded-full"
                                        />
                                        <motion.div
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-2 border border-transparent border-b-amber-400/50 rounded-full"
                                        />
                                        <div className="absolute inset-4 bg-amber-500/10 rounded-full flex items-center justify-center">
                                            <Radar className="text-amber-400 w-6 h-6 animate-pulse" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Scanning Markets</h4>
                                        <p className="text-amber-400 font-mono text-xs mt-1">
                                            {scannerProgress.current}/{scannerProgress.total} · {scannerProgress.currentPair}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(scannerProgress.current / Math.max(scannerProgress.total, 1)) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Scanner Error */}
                        {scannerError && (
                            <div className="p-6 flex items-center gap-3 bg-red-500/5">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                <span className="text-sm text-red-300">{scannerError}</span>
                            </div>
                        )}

                        {/* Scanner Results */}
                        {scannerResults && !scannerLoading && (
                            <div className="p-4">
                                {scannerResults.qualifyingSetups.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                            <Search className="w-8 h-8 text-dim" />
                                        </div>
                                        <h4 className="text-white font-bold mb-2">No High-Confluence Setups Found</h4>
                                        <p className="text-dim text-sm">No setups meeting the {scannerResults.threshold}% threshold were found. Try a different timeframe or wait for better conditions.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {scannerResults.qualifyingSetups.map((setup, i) => (
                                            <motion.button
                                                key={`${setup.symbol}-${i}`}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.08 }}
                                                onClick={() => loadSetupFromScan(setup)}
                                                className={`group relative p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${setup.signal === 'BUY'
                                                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                                    : 'bg-red-500/5 border-red-500/20 hover:border-red-400/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                                                    }`}
                                            >
                                                {/* Confidence Badge */}
                                                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black ${setup.confidence >= 85
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {setup.confidence}%
                                                </div>

                                                {/* Symbol & Signal */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`text-base font-black uppercase tracking-wider ${setup.signal === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                                                        }`}>
                                                        {setup.displaySymbol}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${setup.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {setup.signal}
                                                    </span>
                                                </div>

                                                {/* Trade Details */}
                                                <div className="space-y-1.5 mb-3">
                                                    <div className="flex justify-between text-[9px]">
                                                        <span className="text-dim uppercase">Entry</span>
                                                        <span className="text-white font-mono">${setup.entry?.toFixed(setup.assetType === 'forex' ? 5 : 2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[9px]">
                                                        <span className="text-dim uppercase">R:R</span>
                                                        <span className="text-purple-400 font-mono font-bold">{setup.riskRewardRatio}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[9px]">
                                                        <span className="text-dim uppercase">Type</span>
                                                        <span className="text-dim font-mono">{setup.assetType}</span>
                                                    </div>
                                                </div>

                                                {/* Rationale Preview */}
                                                <p className="text-[9px] text-dim leading-relaxed line-clamp-2">
                                                    {setup.rationale}
                                                </p>

                                                {/* Hover CTA */}
                                                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-center gap-1 text-[9px] text-dim uppercase tracking-widest group-hover:text-white transition-colors">
                                                    <Zap className="w-3 h-3" />
                                                    Load Full Analysis
                                                </div>

                                                {/* Data Source */}
                                                {setup.dataSource && (
                                                    <div className="absolute bottom-3 right-3">
                                                        {setup.dataSource === 'live' ? (
                                                            <Sparkles className="w-3 h-3 text-purple-400/50" />
                                                        ) : (
                                                            <Zap className="w-3 h-3 text-blue-400/50" />
                                                        )}
                                                    </div>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {!data && !loading && !error && !scannerOpen && (
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
                                <div className={`transition-all duration-500 relative ${layout === 'CHART' ? 'h-[600px]' : 'h-[450px]'}`}>
                                    <AIChartWidget symbol={getTradingViewSymbol()} timeframe={selectedTimeframe} theme="dark" />
                                </div>
                            </div>
                            {/* Chart HUD */}


                            {/* Intelligence Tabs */}
                            <div className="glass-panel overflow-hidden border-white/5 bg-black/20">
                                <div className="flex border-b border-white/5 bg-white/[0.01]">
                                    {[
                                        { id: 'STRUCTURE', label: 'Market Structure', icon: Layers },
                                        { id: 'INDICATORS', label: 'Indicators', icon: Activity },
                                        { id: 'LOGIC', label: 'Strategy Logic', icon: Sparkles },
                                        { id: 'OPERATIONS', label: 'Operations', icon: Trophy },
                                        { id: 'HISTORY', label: 'Signals', icon: History }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveSubTab(tab.id)}
                                            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeSubTab === tab.id ? 'text-white' : 'text-dim hover:text-white'
                                                }`}
                                        >
                                            <tab.icon className={`w-3.5 h-3.5 ${activeSubTab === tab.id ? 'text-purple-400' : 'text-dim'}`} />
                                            {tab.label}
                                            {activeSubTab === tab.id && (
                                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6">
                                    {data.analysis.status === 'no_setup' ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                                            <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                                <TrendingUp className="w-10 h-10 text-yellow-500/50" />
                                            </div>
                                            <div className="max-w-md space-y-2">
                                                <h3 className="text-xl font-bold text-white">No High-Conviction Setup</h3>
                                                <p className="text-gray-400 text-sm leading-relaxed">{data.analysis.reason}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                    <span className="text-xs text-dim uppercase tracking-wider font-bold">Current Bias</span>
                                                    <div className="text-white font-mono mt-1">{data.analysis.current_bias}</div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                    <span className="text-xs text-dim uppercase tracking-wider font-bold">Watch Levels</span>
                                                    <div className="text-white font-mono mt-1 text-sm">
                                                        {data.analysis.watch_levels?.map(l => l.toFixed(2)).join(', ')}
                                                    </div>
                                                </div>
                                            </div>
                                            {data.analysis.next_catalysts && (
                                                <div className="w-full max-w-sm p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 text-left">
                                                    <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold mb-2 block">Upcoming Catalysts</span>
                                                    <ul className="list-disc list-inside text-xs text-blue-300 space-y-1">
                                                        {data.analysis.next_catalysts.map((c, i) => (
                                                            <li key={i}>{c}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : activeSubTab === 'STRUCTURE' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block mb-2">
                                                        High-Conviction Setup ({data.analysis.confidence}%)
                                                    </span>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className={`text-3xl font-bold font-mono ${data.analysis.direction === 'Long' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {data.analysis.direction ? data.analysis.direction.toUpperCase() : 'WAIT'}
                                                        </span>
                                                        <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-white">
                                                            {data.analysis.timeframe}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-white/10 pl-4">
                                                        {data.analysis.rationale}
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    <span className="text-[10px] text-dim font-black uppercase tracking-widest block">Confluence Factors</span>
                                                    <ul className="space-y-2">
                                                        {data.analysis.confluence_factors?.map((factor, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                                                                <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                                                {factor}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Trade Plan HUD */}
                                                <div className="bg-white/[0.02] rounded-xl border border-white/5 p-5 space-y-4">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div>
                                                            <span className="hud-label">Entry</span>
                                                            <div className="hud-value text-white">${data.analysis.entry?.toFixed(2)}</div>
                                                        </div>
                                                        <div>
                                                            <span className="hud-label">Stop Loss</span>
                                                            <div className="hud-value text-red-400">${data.analysis.stop_loss?.toFixed(2)}</div>
                                                        </div>
                                                        <div>
                                                            <span className="hud-label">Take Profit</span>
                                                            <div className="hud-value text-emerald-400">${data.analysis.take_profit?.toFixed(2)}</div>
                                                        </div>
                                                        <div>
                                                            <span className="hud-label">Risk/Reward</span>
                                                            <div className="hud-value text-purple-400">{data.analysis.rr_ratio}R</div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-[10px] text-dim uppercase">Position Size</span>
                                                            <div className="text-sm font-mono text-white">{data.analysis.position_size} Units</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-dim uppercase">Risk ($)</span>
                                                            <div className="text-sm font-mono text-red-300">${data.analysis.dollar_risk}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Risk Management */}
                                                <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertTriangle className="w-3 h-3 text-red-400" />
                                                        <span className="text-[10px] text-red-400 font-bold uppercase">Risks</span>
                                                    </div>
                                                    <ul className="space-y-1">
                                                        {data.analysis.risks?.map((r, i) => (
                                                            <li key={i} className="text-[10px] text-red-300/80">• {r}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Shield className="w-3 h-3 text-blue-400" />
                                                        <span className="text-[10px] text-blue-400 font-bold uppercase">Active Management</span>
                                                    </div>
                                                    <p className="text-xs text-blue-300/80 leading-relaxed">
                                                        {data.analysis.management}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {activeSubTab === 'INDICATORS' && (
                                        <div className="space-y-6">
                                            {/* Confluence Score Hero */}
                                            <div className={`p-6 rounded-2xl border relative overflow-hidden ${(data.analysis.confluenceScore || 0) >= 60
                                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                                : (data.analysis.confluenceScore || 0) >= 40
                                                    ? 'bg-yellow-500/5 border-yellow-500/20'
                                                    : 'bg-white/[0.02] border-white/5'
                                                }`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="text-[10px] text-dim font-black uppercase tracking-widest block mb-1">Confluence Score</span>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className={`text-5xl font-black ${(data.analysis.confluenceScore || 0) >= 60 ? 'text-emerald-400' :
                                                                (data.analysis.confluenceScore || 0) >= 40 ? 'text-yellow-400' : 'text-dim'
                                                                }`}>
                                                                {data.analysis.confluenceScore || 0}
                                                            </span>
                                                            <span className="text-xl text-dim">/100</span>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${data.analysis.confluenceBias === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        data.analysis.confluenceBias === 'bearish' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-white/10 text-dim'
                                                        }`}>
                                                        {data.analysis.confluenceBias || 'Neutral'} Bias
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${data.analysis.confluenceScore || 0}%` }}
                                                        className={`h-full ${(data.analysis.confluenceScore || 0) >= 60 ? 'bg-emerald-500' :
                                                            (data.analysis.confluenceScore || 0) >= 40 ? 'bg-yellow-500' : 'bg-white/30'
                                                            }`}
                                                    />
                                                </div>
                                                {/* Confluence Factors */}
                                                {data.analysis.confluenceFactors?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.analysis.confluenceFactors.slice(0, 6).map((factor, i) => (
                                                            <span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[9px] text-dim">
                                                                {factor}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Indicator Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {/* RSI */}
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] text-dim font-black uppercase tracking-widest">RSI (14)</span>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded ${data.analysis.indicators?.rsi?.zone === 'oversold' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            data.analysis.indicators?.rsi?.zone === 'overbought' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-white/10 text-dim'
                                                            }`}>
                                                            {data.analysis.indicators?.rsi?.zone || 'neutral'}
                                                        </span>
                                                    </div>
                                                    <div className="text-2xl font-mono font-bold text-white">
                                                        {data.analysis.indicators?.rsi?.value?.toFixed(1) || '--'}
                                                    </div>
                                                    {data.analysis.indicators?.rsi?.divergence && (
                                                        <span className={`text-[9px] ${data.analysis.indicators.rsi.divergence === 'bullish' ? 'text-emerald-400' : 'text-red-400'
                                                            }`}>
                                                            {data.analysis.indicators.rsi.divergence} divergence
                                                        </span>
                                                    )}
                                                </div>

                                                {/* MACD */}
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] text-dim font-black uppercase tracking-widest">MACD</span>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded ${data.analysis.indicators?.macd?.histogram > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {data.analysis.indicators?.macd?.histogram > 0 ? 'Bullish' : 'Bearish'}
                                                        </span>
                                                    </div>
                                                    <div className="text-lg font-mono font-bold text-white">
                                                        {data.analysis.indicators?.macd?.histogram?.toFixed(4) || '--'}
                                                    </div>
                                                    {data.analysis.indicators?.macd?.crossover && (
                                                        <span className={`text-[9px] ${data.analysis.indicators.macd.crossover === 'bullish' ? 'text-emerald-400' : 'text-red-400'
                                                            }`}>
                                                            {data.analysis.indicators.macd.crossover} crossover
                                                        </span>
                                                    )}
                                                </div>

                                                {/* ADX */}
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] text-dim font-black uppercase tracking-widest">ADX (14)</span>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded ${data.analysis.indicators?.adx?.trending ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-dim'
                                                            }`}>
                                                            {data.analysis.indicators?.adx?.trending ? 'Trending' : 'Ranging'}
                                                        </span>
                                                    </div>
                                                    <div className="text-2xl font-mono font-bold text-white">
                                                        {data.analysis.indicators?.adx?.value?.toFixed(1) || '--'}
                                                    </div>
                                                    <span className="text-[9px] text-dim">
                                                        {data.analysis.indicators?.adx?.direction || 'neutral'} direction
                                                    </span>
                                                </div>

                                                {/* Stochastic */}
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] text-dim font-black uppercase tracking-widest">Stochastic</span>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded ${data.analysis.indicators?.stochastic?.zone === 'oversold' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            data.analysis.indicators?.stochastic?.zone === 'overbought' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-white/10 text-dim'
                                                            }`}>
                                                            {data.analysis.indicators?.stochastic?.zone || 'neutral'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <div>
                                                            <span className="text-[9px] text-dim">%K</span>
                                                            <div className="text-lg font-mono font-bold text-white">
                                                                {data.analysis.indicators?.stochastic?.k?.toFixed(1) || '--'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] text-dim">%D</span>
                                                            <div className="text-lg font-mono font-bold text-white">
                                                                {data.analysis.indicators?.stochastic?.d?.toFixed(1) || '--'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Volume */}
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] text-dim font-black uppercase tracking-widest">Volume</span>
                                                        {data.analysis.indicators?.volume?.spike && (
                                                            <span className="text-[9px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                                                                SPIKE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-2xl font-mono font-bold text-white">
                                                        {data.analysis.indicators?.volume?.ratio?.toFixed(2) || '1.00'}x
                                                    </div>
                                                    <span className="text-[9px] text-dim">vs avg volume</span>
                                                </div>

                                                {/* Bollinger Bands */}
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] text-dim font-black uppercase tracking-widest">Bollinger</span>
                                                        {data.analysis.indicators?.bollingerBands?.squeeze && (
                                                            <span className="text-[9px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                                                                SQUEEZE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-lg font-mono font-bold text-white">
                                                        {((data.analysis.indicators?.bollingerBands?.percentB || 0.5) * 100).toFixed(0)}% B
                                                    </div>
                                                    <div className="text-[9px] text-dim space-y-0.5 mt-1">
                                                        <div>Upper: {data.analysis.indicators?.bollingerBands?.upper?.toFixed(2) || '--'}</div>
                                                        <div>Lower: {data.analysis.indicators?.bollingerBands?.lower?.toFixed(2) || '--'}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ATR & EMA Row */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <span className="text-[10px] text-dim font-black uppercase tracking-widest block mb-1">ATR (14)</span>
                                                    <div className="text-xl font-mono font-bold text-white">
                                                        {data.analysis.indicators?.atr?.toFixed(4) || '--'}
                                                    </div>
                                                    <span className="text-[9px] text-dim">Volatility measure</span>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <span className="text-[10px] text-dim font-black uppercase tracking-widest block mb-1">EMA Trend</span>
                                                    <div className={`text-xl font-mono font-bold ${(data.analysis.indicators?.ema?.ema9 || 0) > (data.analysis.indicators?.ema?.ema21 || 0)
                                                        ? 'text-emerald-400' : 'text-red-400'
                                                        }`}>
                                                        {(data.analysis.indicators?.ema?.ema9 || 0) > (data.analysis.indicators?.ema?.ema21 || 0) ? 'Bullish' : 'Bearish'}
                                                    </div>
                                                    <span className="text-[9px] text-dim">EMA9 vs EMA21</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeSubTab === 'LOGIC' && (
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

                                    {activeSubTab === 'OPERATIONS' && (
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

                                    {activeSubTab === 'HISTORY' && (
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
                                    {/* Data Source Badge */}
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 ${data.analysis.dataSource === 'live'
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        : data.analysis.dataSource === 'technical'
                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                                        }`}>
                                        {data.analysis.dataSource === 'live' ? (
                                            <>
                                                <Sparkles className="w-3 h-3" />
                                                Gemini AI
                                            </>
                                        ) : data.analysis.dataSource === 'technical' ? (
                                            <>
                                                <Zap className="w-3 h-3" />
                                                Local Engine
                                            </>
                                        ) : (
                                            <>
                                                <Activity className="w-3 h-3" />
                                                Simulation
                                            </>
                                        )}
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
                                        { label: 'Stop Loss (SL)', value: data.analysis.stopLoss, color: 'text-red-400' },
                                        { label: 'Take Profit (TP)', value: data.analysis.takeProfit, color: 'text-emerald-400' },
                                        { label: 'Break Even', value: data.analysis.breakEven, color: 'text-purple-400' }
                                    ].map((coord, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                            <span className="text-[10px] text-dim font-bold uppercase tracking-widest">{coord.label}</span>
                                            <span className={`font-mono text-sm font-bold ${coord.color}`}>${coord.value?.toFixed(4)}</span>
                                        </div>
                                    ))}
                                </div>

                                {data.analysis.slRecommendation && (
                                    <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-3.5 h-3.5 text-purple-400" />
                                            <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Protocol Recommendation</span>
                                        </div>
                                        <p className="text-[11px] text-white leading-relaxed italic">"{data.analysis.slRecommendation}"</p>
                                    </div>
                                )}

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
                                userRiskAmount={riskAmount}
                                userTargetGain={targetGain}
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

// Optimized Chart Component
const AIChartWidget = ({ symbol, timeframe, theme }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear existing
        containerRef.current.innerHTML = '';

        // Map timeframe to TradingView intervals
        const intervalMap = {
            '15m': '15',
            '30m': '30',
            '1h': '60',
            '4h': '240',
            '1d': 'D',
            '1w': 'W'
        };

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: symbol,
            interval: intervalMap[timeframe] || "60",
            timezone: "Etc/UTC",
            theme: theme,
            style: "1",
            locale: "en",
            enable_publishing: false,
            backgroundColor: "rgba(10, 14, 23, 1)",
            gridColor: "rgba(255, 255, 255, 0.05)",
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

    }, [symbol, timeframe, theme]);

    return (
        <div className="tradingview-widget-container h-full w-full" ref={containerRef} />
    );
};

export default AIInsights;
