import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, Calculator, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
    Percent, Target, Shield, Info, Wallet, Scale, Sparkles, ArrowRight, ArrowDown, ArrowUp
} from 'lucide-react';

// Pip values for different asset types
const PIP_VALUES = {
    // Forex pairs - standard lot (100,000 units)
    'EUR-USD': { pipSize: 0.0001, pipCost: 10 },
    'GBP-USD': { pipSize: 0.0001, pipCost: 10 },
    'AUD-USD': { pipSize: 0.0001, pipCost: 10 },
    'NZD-USD': { pipSize: 0.0001, pipCost: 10 },
    'USD-CHF': { pipSize: 0.0001, pipCost: 10 },
    'USD-CAD': { pipSize: 0.0001, pipCost: 10 },
    'EUR-GBP': { pipSize: 0.0001, pipCost: 12.50 },
    'EUR-JPY': { pipSize: 0.01, pipCost: 8.50 },
    'USD-JPY': { pipSize: 0.01, pipCost: 8.50 },
    'GBP-JPY': { pipSize: 0.01, pipCost: 8.50 },
    'AUD-JPY': { pipSize: 0.01, pipCost: 8.50 },
    'EUR-AUD': { pipSize: 0.0001, pipCost: 10 },
    'EUR-TRY': { pipSize: 0.0001, pipCost: 10 },
    'USD-ZAR': { pipSize: 0.0001, pipCost: 10 },
    'USD-MXN': { pipSize: 0.0001, pipCost: 10 },
    // Metals
    'XAU-USD': { pipSize: 0.01, pipCost: 1 },  // Gold - 1 pip = $1 per 1oz
    'XAG-USD': { pipSize: 0.001, pipCost: 50 }, // Silver
    // Crypto Forex
    'BTC-USD': { pipSize: 0.01, pipCost: 0.01 }, // 1 Lot = 1 BTC. $1 move = 100 pips * 0.01 cost = $1.
    // Default fallback
    'DEFAULT': { pipSize: 0.0001, pipCost: 10 }
};

// Crypto pip values (based on price movement)
const getCryptoPipValue = (symbol, price) => {
    return {
        pipSize: 0.01,
        pipCost: price * 0.01
    };
};

const RISK_PRESETS = [
    { label: '1%', value: 1, color: 'emerald', description: 'Conservative' },
    { label: '2%', value: 2, color: 'blue', description: 'Moderate' },
    { label: '3%', value: 3, color: 'yellow', description: 'Aggressive' },
    { label: '5%', value: 5, color: 'red', description: 'High Risk' }
];

const RiskCalculator = ({
    entry,
    stopLoss,
    takeProfit,
    symbol,
    assetType = 'crypto',
    currentPrice,
    signal
}) => {
    const [capital, setCapital] = useState(() => {
        const saved = localStorage.getItem('tradingCapital');
        return saved ? parseFloat(saved) : 500;
    });
    const [riskPercent, setRiskPercent] = useState(() => {
        const saved = localStorage.getItem('tradingRiskPercent');
        return saved ? parseFloat(saved) : 2;
    });
    const [customRisk, setCustomRisk] = useState(false);
    const [isMarginMode, setIsMarginMode] = useState(false);
    const [leverage, setLeverage] = useState(10);

    // Save to localStorage when values change
    useEffect(() => {
        localStorage.setItem('tradingCapital', capital.toString());
    }, [capital]);

    useEffect(() => {
        localStorage.setItem('tradingRiskPercent', riskPercent.toString());
    }, [riskPercent]);

    // Calculate all risk metrics
    const calculations = useMemo(() => {
        if (!entry || !stopLoss || signal === 'WAIT') {
            return null;
        }

        // Risk amount in dollars
        const riskAmount = capital * (riskPercent / 100);

        const slDistance = Math.abs(entry - stopLoss);
        const tpDistance = takeProfit ? Math.abs(takeProfit - entry) : 0;

        let lotSize, actualRiskAmount, potentialProfit, slDisplay, tpDisplay, lotType, distanceUnit;

        if (assetType === 'crypto') {
            if (isMarginMode) {
                // MARGIN BASED CALCULATION
                // Risk Amount is used as MARGIN
                // Position Size = (Margin * Leverage) / Entry Price
                const marginalPositionSize = (riskAmount * leverage) / entry;
                lotSize = marginalPositionSize;

                // Rounding
                if (lotSize >= 1) lotSize = Math.round(lotSize * 100) / 100;
                else lotSize = Math.round(lotSize * 10000) / 10000;

                actualRiskAmount = slDistance * lotSize;
                potentialProfit = tpDistance * lotSize;
            } else {
                // DISTANCE BASED CALCULATION (Current)
                lotSize = riskAmount / slDistance;

                // Round to sensible precision (crypto can have fractional units)
                if (lotSize >= 1) {
                    lotSize = Math.round(lotSize * 1000) / 1000; // 0.001 precision
                } else if (lotSize >= 0.01) {
                    lotSize = Math.round(lotSize * 10000) / 10000; // 0.0001 precision
                } else {
                    lotSize = Math.round(lotSize * 100000) / 100000; // 0.00001 precision
                }

                // Minimum is 0.0001 for crypto (fractional trading)
                if (lotSize < 0.0001 && lotSize > 0) {
                    lotSize = 0.0001;
                }

                // Recalculate actual amounts with rounded lot size
                actualRiskAmount = slDistance * lotSize;
                potentialProfit = tpDistance * lotSize;
            }

            // For display, show actual dollar amounts (clearer than %)
            slDisplay = `$${slDistance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
            tpDisplay = `$${tpDistance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
            distanceUnit = 'price move';

            // Determine lot type for display
            if (lotSize >= 1) {
                lotType = 'Units';
            } else {
                lotType = 'Fractional';
            }

        } else {
            // For FOREX: Use traditional pip-based calculation
            const pipInfo = PIP_VALUES[symbol] || PIP_VALUES['DEFAULT'];

            const slPips = slDistance / pipInfo.pipSize;
            const tpPips = tpDistance / pipInfo.pipSize;

            // Lot Size = Risk Amount / (SL Pips × Pip Cost)
            const rawLotSize = riskAmount / (slPips * pipInfo.pipCost);

            // Round to 0.01 precision (minimum standard lot size is 0.01)
            lotSize = Math.round(rawLotSize * 100) / 100;

            // MINIMUM LOT SIZE is 0.01 for forex
            if (lotSize < 0.01) {
                lotSize = 0.01;
            }

            // Recalculate actual risk with rounded lot size
            actualRiskAmount = slPips * pipInfo.pipCost * lotSize;
            potentialProfit = tpPips * pipInfo.pipCost * lotSize;

            // Display pips
            slDisplay = Math.round(slPips).toString();
            tpDisplay = Math.round(tpPips).toString();
            distanceUnit = 'pips';

            // Lot type
            if (lotSize >= 1) lotType = 'Standard Lot';
            else if (lotSize >= 0.1) lotType = 'Mini Lot';
            else lotType = 'Micro Lot';
        }

        // Calculate account impact percentages
        const accountRiskPercent = (actualRiskAmount / capital) * 100;
        const accountGainPercent = (potentialProfit / capital) * 100;

        // New account balance projections
        const balanceAfterLoss = capital - actualRiskAmount;
        const balanceAfterWin = capital + potentialProfit;

        // Risk/Reward ratio
        const riskReward = tpDistance > 0 ? (tpDistance / slDistance).toFixed(2) : 'N/A';

        // Minimum capital estimate
        const minCapitalNeeded = assetType === 'crypto'
            ? (slDistance * 0.00001) / (riskPercent / 100) // Min for micro position
            : 50; // Rough estimate for forex

        // Risk assessment
        let riskLevel = 'low';
        let riskMessage = 'This trade fits your account well';
        let recommendation = 'safe';

        if (accountRiskPercent > 10) {
            riskLevel = 'extreme';
            riskMessage = 'This trade is too risky for your capital';
            recommendation = 'not_recommended';
        } else if (accountRiskPercent > 5) {
            riskLevel = 'high';
            riskMessage = 'Consider using smaller position or more capital';
            recommendation = 'caution';
        } else if (accountRiskPercent > 3) {
            riskLevel = 'moderate';
            riskMessage = 'Acceptable for experienced traders';
            recommendation = 'moderate';
        }

        // Check if capital is sufficient for minimum trade
        const capitalSufficient = capital >= minCapitalNeeded;

        return {
            lotSize,
            lotType,
            riskAmount: actualRiskAmount,
            potentialProfit,
            riskReward,
            slDisplay,
            tpDisplay,
            distanceUnit,
            riskLevel,
            riskMessage,
            recommendation,
            capitalSufficient,
            minCapitalNeeded: Math.round(minCapitalNeeded),
            accountRiskPercent: accountRiskPercent.toFixed(1),
            accountGainPercent: accountGainPercent.toFixed(1),
            balanceAfterLoss: balanceAfterLoss.toFixed(2),
            balanceAfterWin: balanceAfterWin.toFixed(2),
            isCrypto: assetType === 'crypto',
            requiredMargin: (lotSize * entry) / leverage,
            liquidationPrice: signal === 'BUY'
                ? entry * (1 - (1 / leverage))
                : entry * (1 + (1 / leverage)),
            liquidationDistance: (1 / leverage) * 100
        };
    }, [capital, riskPercent, entry, stopLoss, takeProfit, symbol, assetType, currentPrice, signal, isMarginMode, leverage]);

    if (signal === 'WAIT') {
        return (
            <div className="glass-panel p-6 rounded-2xl border border-yellow-500/20">
                <div className="flex items-center gap-3 text-yellow-400">
                    <Info className="w-5 h-5" />
                    <span>Trade recommendations available when there's a BUY or SELL signal</span>
                </div>
            </div>
        );
    }

    const getRecommendationColor = (rec) => {
        switch (rec) {
            case 'safe': return 'from-emerald-500 to-teal-500';
            case 'moderate': return 'from-yellow-500 to-amber-500';
            case 'caution': return 'from-orange-500 to-red-500';
            case 'not_recommended': return 'from-red-600 to-pink-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getRecommendationBg = (rec) => {
        switch (rec) {
            case 'safe': return 'bg-emerald-500/10 border-emerald-500/30';
            case 'moderate': return 'bg-yellow-500/10 border-yellow-500/30';
            case 'caution': return 'bg-orange-500/10 border-orange-500/30';
            case 'not_recommended': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-gray-500/10 border-gray-500/30';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-2xl space-y-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg shadow-purple-500/20">
                        <Sparkles className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">AI Trade Recommendation</h3>
                        <p className="text-xs text-gray-500">Personalized for your account size</p>
                    </div>
                </div>
            </div>

            {/* Capital Input - Prominent */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5">
                <label className="text-sm text-blue-300 flex items-center gap-2 mb-3">
                    <Wallet className="w-4 h-4" /> How much are you trading with?
                </label>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
                        <input
                            type="number"
                            value={capital}
                            onChange={(e) => setCapital(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full bg-black/60 border-2 border-white/10 rounded-xl px-4 py-4 pl-10 text-white text-2xl font-bold focus:border-blue-500 focus:outline-none"
                            placeholder="500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        {[100, 500, 1000, 5000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setCapital(amount)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${capital === amount
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                ${amount}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Risk % Selector */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500">Risk per trade:</label>
                        {assetType === 'crypto' && (
                            <button
                                onClick={() => setIsMarginMode(!isMarginMode)}
                                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${isMarginMode
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                    : 'bg-white/5 border-white/10 text-gray-500'
                                    }`}
                            >
                                {isMarginMode ? 'Margin Based' : 'Distance Based'}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {RISK_PRESETS.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => {
                                    setRiskPercent(preset.value);
                                    setCustomRisk(false);
                                }}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${riskPercent === preset.value && !customRisk
                                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                                    : 'bg-black/40 border border-white/10 text-gray-400 hover:border-white/30'
                                    }`}
                            >
                                <div>{preset.label}</div>
                                <div className="text-[10px] opacity-60">{preset.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leverage Slider for Crypto Margin Mode */}
                {assetType === 'crypto' && isMarginMode && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4 pt-4 border-t border-white/5"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs text-gray-400">Leverage: <span className="text-blue-400 font-bold">{leverage}x</span></label>
                            <div className="flex gap-1">
                                {[5, 10, 20, 50].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setLeverage(v)}
                                        className={`text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 ${leverage === v ? 'text-blue-400 border-blue-500/50' : 'text-gray-500'}`}
                                    >
                                        {v}x
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={leverage}
                            onChange={(e) => setLeverage(parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </motion.div>
                )}

                {/* Forex Info Box */}
                {assetType === 'forex' && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-[11px] text-blue-300 leading-relaxed">
                            <p className="font-bold mb-1">How Forex Risk Works:</p>
                            Risk % is the portion of your <span className="text-white">${capital}</span> you're willing to lose.
                            If you risk <span className="text-white">{riskPercent}%</span>, your max loss is <span className="text-white">${(capital * riskPercent / 100).toFixed(2)}</span>.
                            Lot sizes are calculated based on your SL distance in pips.
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {calculations && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${capital}-${riskPercent}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {/* AI Recommendation Banner */}
                        <div className={`relative overflow-hidden rounded-xl p-5 border ${getRecommendationBg(calculations.recommendation)}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-20 rounded-full blur-2xl -mr-10 -mt-10 ${getRecommendationColor(calculations.recommendation)}" />

                            <div className="relative">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm font-medium text-purple-300">Based on your ${capital} capital:</span>
                                </div>

                                <div className="text-2xl font-bold text-white mb-2">
                                    {calculations.recommendation === 'not_recommended' ? (
                                        <>⚠️ Trade with extreme caution</>
                                    ) : calculations.recommendation === 'caution' ? (
                                        <>📊 Consider a smaller position</>
                                    ) : (
                                        <>✅ We recommend <span className="text-purple-400">{calculations.lotSize}</span> {calculations.lotType} {assetType === 'forex' ? 'lot' : 'units'}</>
                                    )}
                                </div>

                                <p className="text-gray-400 text-sm">{calculations.riskMessage}</p>
                            </div>
                        </div>

                        {/* Win/Lose Scenarios - THE KEY FEATURE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* If Trade Wins */}
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                                    <TrendingUp className="w-5 h-5" />
                                    <span className="font-medium">If trade hits TP</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">You'd make:</span>
                                        <span className="text-2xl font-bold text-emerald-400">
                                            +${calculations.potentialProfit.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Account grows to:</span>
                                        <span className="text-lg font-medium text-white">
                                            ${calculations.balanceAfterWin}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400/70 text-sm">
                                        <span>Account gain:</span>
                                        <span className="flex items-center gap-1">
                                            <ArrowUp className="w-3 h-3" />
                                            {calculations.accountGainPercent}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* If Trade Loses */}
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                                <div className="flex items-center gap-2 text-red-400 mb-3">
                                    <TrendingDown className="w-5 h-5" />
                                    <span className="font-medium">If trade hits SL</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">You'd lose:</span>
                                        <span className="text-2xl font-bold text-red-400">
                                            -${calculations.riskAmount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Account drops to:</span>
                                        <span className="text-lg font-medium text-white">
                                            ${calculations.balanceAfterLoss}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-red-400/70 text-sm">
                                        <span>Account loss:</span>
                                        <span className="flex items-center gap-1">
                                            <ArrowDown className="w-3 h-3" />
                                            {calculations.accountRiskPercent}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Liquidation Guard - NEW */}
                        {calculations.isCrypto && isMarginMode && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <AlertTriangle className="w-12 h-12 text-orange-500" />
                                </div>
                                <div className="relative">
                                    <div className="flex items-center gap-2 text-orange-400 mb-3">
                                        <Shield className="w-5 h-5 text-orange-500" />
                                        <span className="font-bold uppercase tracking-widest text-[11px]">Liquidation Guard Active</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mb-1">Theoretical Liquidation</div>
                                            <div className="text-2xl font-mono text-white font-black">${calculations.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        </div>
                                        <div className="flex-1 max-w-[200px]">
                                            <div className="flex justify-between text-[10px] mb-1">
                                                <span className="text-gray-500">Distance:</span>
                                                <span className={`${calculations.liquidationDistance < (calculations.riskPercent * 2) ? 'text-red-400' : 'text-orange-400'} font-bold`}>
                                                    {calculations.liquidationDistance.toFixed(2)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${calculations.liquidationDistance < 5 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-orange-500'}`}
                                                    style={{ width: `${Math.min(100, calculations.liquidationDistance * 2)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {Math.abs(entry - stopLoss) > Math.abs(entry - calculations.liquidationPrice) && (
                                        <div className="mt-3 text-[10px] text-red-400 font-bold flex items-center gap-1 animate-pulse">
                                            <AlertTriangle className="w-3 h-3" /> WARNING: Stop Loss is past Liquidation Price!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Lot Size</div>
                                    <div className="text-lg font-bold text-purple-400">{calculations.lotSize}</div>
                                    <div className="text-[10px] text-gray-600">{calculations.lotType}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Risk:Reward</div>
                                    <div className="text-lg font-bold text-white">1:{calculations.riskReward}</div>
                                    <div className="text-[10px] text-gray-600">
                                        {parseFloat(calculations.riskReward) >= 2 ? '✓ Great' : parseFloat(calculations.riskReward) >= 1.5 ? '○ OK' : '× Low'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">SL Distance</div>
                                    <div className="text-lg font-bold text-red-400">{calculations.slDisplay}</div>
                                    <div className="text-[10px] text-gray-600">{calculations.distanceUnit}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">TP Distance</div>
                                    <div className="text-lg font-bold text-emerald-400">{calculations.tpDisplay}</div>
                                    <div className="text-[10px] text-gray-600">{calculations.distanceUnit}</div>
                                </div>
                            </div>
                        </div>

                        {/* Capital Warning if needed */}
                        {!calculations.capitalSufficient && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-orange-300 font-medium">Very Small Position Size</p>
                                    <p className="text-orange-400/70 text-sm mt-1">
                                        With ${capital}, your position will be extremely small. Consider saving more capital
                                        (minimum ~${calculations.minCapitalNeeded}) for better trade management.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Disclaimer */}
                        <p className="text-xs text-gray-600 text-center italic">
                            ⚠️ These are AI recommendations only. Not financial advice. Past performance ≠ future results. Always use proper risk management.
                        </p>
                    </motion.div>
                </AnimatePresence>
            )}
        </motion.div>
    );
};

export default RiskCalculator;
