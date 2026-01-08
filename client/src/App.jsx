import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import PriceTicker from './components/PriceTicker';
import NewsFeed from './components/NewsFeed';
import PriceGrid from './components/PriceGrid';
import ChatWidget from './components/ChatWidget';
import ParticleBackground from './components/ParticleBackground';
import TradingViewChart from './components/TradingViewChart';
import AIInsights from './components/AIInsights';
import { useSocket } from './hooks/useSocket';

function App() {
    const [activeTab, setActiveTab] = useState('news');
    const { news, prices, connected, sendChatMessage, chatMessages } = useSocket();

    return (
        <div className="cosmic-bg min-h-screen pb-16">
            <ParticleBackground />

            {/* Connection Status */}
            <motion.div
                className={`fixed top-20 right-4 z-50 ${connected ? 'status-live' : 'status-offline'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
                {connected ? 'Live' : 'Reconnecting...'}
            </motion.div>

            {/* Navbar */}
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Price Ticker */}
            <PriceTicker prices={prices} />

            {/* Main Content */}
            <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'news' && (
                        <motion.div
                            key="news"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <NewsFeed news={news} />
                        </motion.div>
                    )}

                    {activeTab === 'prices' && (
                        <motion.div
                            key="prices"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <PriceGrid prices={prices} />
                        </motion.div>
                    )}

                    {activeTab === 'charts' && (
                        <motion.div
                            key="charts"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TradingViewChart />
                        </motion.div>
                    )}

                    {activeTab === 'insights' && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AIInsights />
                        </motion.div>
                    )}
                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChatWidget
                                messages={chatMessages}
                                onSendMessage={sendChatMessage}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 py-3 text-center footer-premium z-40">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                    <span className="text-amber-500">⚠️</span>
                    AI opinions are vibecode estimates, not financial advice—DYOR (Do Your Own Research)
                </p>
            </footer>
        </div>
    );
}

export default App;
