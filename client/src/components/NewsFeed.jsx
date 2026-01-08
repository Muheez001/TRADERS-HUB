import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Clock, Sparkles, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Zap, Target } from 'lucide-react';

function NewsFeed({ news }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Market Intelligence
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        Real-time news with AI analysis
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-medium text-neutral-400">Gemini AI</span>
                </div>
            </div>

            {/* News Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {news.length === 0 ? (
                    <div className="col-span-full">
                        <div className="floating-card p-10 text-center">
                            <Sparkles className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                            <p className="text-neutral-400 font-medium">Loading market intelligence...</p>
                        </div>
                    </div>
                ) : (
                    news.map((article, index) => (
                        <NewsCard key={article.id} article={article} index={index} />
                    ))
                )}
            </div>
        </div>
    );
}

function NewsCard({ article, index }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getSentimentIcon = (sentiment) => {
        switch (sentiment) {
            case 'bullish': return <TrendingUp className="w-3 h-3" />;
            case 'bearish': return <TrendingDown className="w-3 h-3" />;
            default: return <Minus className="w-3 h-3" />;
        }
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'bullish': return 'badge-bullish';
            case 'bearish': return 'badge-bearish';
            default: return 'badge-neutral';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return date.toLocaleDateString();
    };

    const analysis = article.aiAnalysis || {};

    return (
        <motion.div
            className="floating-card p-4 cursor-pointer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-emerald-400">{article.source}</span>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(article.publishedAt)}
                </div>
            </div>

            {/* Title */}
            <h3 className="text-white font-medium mb-2 line-clamp-2 text-sm leading-snug">
                {article.title}
            </h3>

            {/* Description */}
            <p className="text-neutral-500 text-xs mb-3 line-clamp-2">
                {article.description}
            </p>

            {/* Analysis */}
            <div className="flex items-center gap-2 flex-wrap">
                {analysis.sentiment && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${getSentimentColor(analysis.sentiment)}`}>
                        {getSentimentIcon(analysis.sentiment)}
                        {analysis.sentiment}
                    </span>
                )}
                {analysis.impactScore && (
                    <span className="text-xs text-neutral-500">
                        Impact: {analysis.impactScore}/10
                    </span>
                )}
            </div>

            {/* Assets */}
            {analysis.affectedAssets && analysis.affectedAssets.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {analysis.affectedAssets.map((asset, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] font-medium rounded bg-neutral-800 text-neutral-400"
                        >
                            {asset}
                        </span>
                    ))}
                </div>
            )}

            {/* Expandable Opinion */}
            <AnimatePresence>
                {isExpanded && analysis.opinion && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 pt-3 border-t border-neutral-800">
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-900">
                                <Zap className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-neutral-300 leading-relaxed">
                                    {analysis.opinion}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800">
                <button className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Less' : 'AI Analysis'}
                </button>

                {article.url && article.url !== '#' && (
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Source
                    </a>
                )}
            </div>
        </motion.div>
    );
}

export default NewsFeed;
