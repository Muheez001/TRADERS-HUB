import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Bitcoin, DollarSign, Gem } from 'lucide-react';

function PriceGrid({ prices }) {
    const getCryptoIcon = (symbol) => {
        const icons = { 'BTC': '₿', 'ETH': 'Ξ', 'SOL': '◎', 'XRP': '✕', 'ADA': '₳', 'BNB': 'B', 'DOGE': 'Ð' };
        return icons[symbol] || '$';
    };

    return (
        <div className="space-y-8">
            {/* Crypto Section */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Bitcoin className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Cryptocurrencies</h2>
                        <p className="text-xs text-neutral-500">Powered by CoinMarketCap</p>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Object.entries(prices.crypto || {}).map(([symbol, data], index) => (
                        <PriceCard
                            key={symbol}
                            symbol={symbol}
                            name={data.name}
                            icon={getCryptoIcon(symbol)}
                            price={data.price}
                            change={data.change}
                            prefix="$"
                            index={index}
                        />
                    ))}
                </div>
            </section>

            {/* Forex Section */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Forex Pairs</h2>
                        <p className="text-xs text-neutral-500">Major currency pairs</p>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {Object.entries(prices.forex || {}).map(([pair, data], index) => (
                        <PriceCard
                            key={pair}
                            symbol={pair}
                            price={data.price}
                            change={data.change}
                            type="forex"
                            index={index}
                        />
                    ))}
                </div>
            </section>

            {/* Commodities Section */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Gem className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Commodities</h2>
                        <p className="text-xs text-neutral-500">Precious metals & energy</p>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(prices.commodities || {}).map(([symbol, data], index) => (
                        <PriceCard
                            key={symbol}
                            symbol={symbol}
                            price={data.price}
                            change={data.change}
                            prefix="$"
                            index={index}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

function PriceCard({ symbol, name, icon, price, change, prefix = '', type, index }) {
    const isPositive = change >= 0;

    const formatPrice = (price) => {
        if (type === 'forex') return price?.toFixed(4) || '0.0000';
        if (price >= 1000) return price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
        return price?.toFixed(2) || '0.00';
    };

    return (
        <motion.div
            className="floating-card p-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {icon && (
                        <span className="text-lg font-bold text-neutral-300">{icon}</span>
                    )}
                    <div>
                        <span className="font-semibold text-white text-sm">{symbol}</span>
                        {name && <p className="text-[10px] text-neutral-500">{name}</p>}
                    </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{change?.toFixed(2)}%
                </div>
            </div>

            <div className="text-xl font-bold text-white">
                {prefix}{formatPrice(price)}
            </div>

            <div className="mt-3 h-1 rounded-full bg-neutral-800 overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(change) * 10 + 15, 100)}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                />
            </div>
        </motion.div>
    );
}

export default PriceGrid;
