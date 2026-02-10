import { motion } from 'framer-motion';
import { Newspaper, BarChart3, MessageCircle, Rocket, Menu, X, LineChart, Sun, Moon, BrainCircuit, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const tabs = [
    { id: 'news', label: 'News Feed', icon: Newspaper },
    { id: 'prices', label: 'Live Prices', icon: BarChart3 },
    { id: 'charts', label: 'Charts', icon: LineChart },
    { id: 'insights', label: 'AI Insights', icon: BrainCircuit },
    { id: 'chat', label: 'Community', icon: MessageCircle },
];

function Navbar({ activeTab, setActiveTab }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, signOut, loading } = useAuth();

    return (
        <>
            <nav className="sticky top-0 z-40 glass">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Rocket className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-white">
                                    Trader Hub
                                </h1>
                                <p className="text-[10px] text-neutral-500 tracking-wider uppercase">
                                    Live Markets
                                </p>
                            </div>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-neutral-900 border border-neutral-800">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {/* Auth Section */}
                            {loading ? (
                                <div className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse" />
                            ) : isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    {/* User Avatar */}
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700">
                                        {user?.user_metadata?.avatar_url ? (
                                            <img
                                                src={user.user_metadata.avatar_url}
                                                alt=""
                                                className="w-6 h-6 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                {user?.email?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-300 max-w-[120px] truncate">
                                            {user?.user_metadata?.name || user?.email?.split('@')[0]}
                                        </span>
                                    </div>
                                    <button
                                        onClick={signOut}
                                        className="p-2 rounded-lg bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 transition-colors text-neutral-400"
                                        title="Sign out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <motion.button
                                    onClick={() => setLoginModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span className="hidden sm:inline">Sign In</span>
                                </motion.button>
                            )}

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-400 hover:text-white"
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <button
                                className="md:hidden p-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <motion.div
                            className="md:hidden py-3 border-t border-neutral-800"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex flex-col gap-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? 'bg-emerald-500 text-white'
                                                : 'text-neutral-400 hover:bg-neutral-800'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>
            </nav>

            {/* Login Modal */}
            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </>
    );
}

export default Navbar;
