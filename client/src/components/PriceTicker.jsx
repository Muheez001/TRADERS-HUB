import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function PriceTicker({ prices }) {
    const tickerItems = useMemo(() => {
        const items = [];

        if (prices.crypto) {
            Object.entries(prices.crypto).forEach(([symbol, data]) => {
                items.push({ symbol, price: data.price, change: data.change, type: 'crypto', prefix: '$' });
            });
        }

        if (prices.forex) {
            Object.entries(prices.forex).forEach(([pair, data]) => {
                items.push({ symbol: pair, price: data.price, change: data.change, type: 'forex', prefix: '' });
            });
        }

        if (prices.commodities) {
            Object.entries(prices.commodities).forEach(([symbol, data]) => {
                items.push({ symbol, price: data.price, change: data.change, type: 'commodity', prefix: '$' });
            });
        }

        return items;
    }, [prices]);

    const formatPrice = (price, type) => {
        if (type === 'forex') return price?.toFixed(4) || '0.0000';
        if (price >= 1000) return price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
        return price?.toFixed(2) || '0.00';
    };

    if (tickerItems.length === 0) return null;

    const doubledItems = [...tickerItems, ...tickerItems];

    return (
        <div className="overflow-hidden bg-neutral-950 border-b border-neutral-800 py-2.5">
            <div className="ticker-scroll">
                {doubledItems.map((item, index) => (
                    <div
                        key={`${item.symbol}-${index}`}
                        className="flex items-center gap-3 px-6 border-r border-neutral-800 whitespace-nowrap"
                    >
                        <span className="text-sm font-bold text-white">{item.symbol}</span>
                        <span className="text-sm text-neutral-300">
                            {item.prefix}{formatPrice(item.price, item.type)}
                        </span>
                        <span className={`flex items-center gap-1 text-xs font-semibold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PriceTicker;
