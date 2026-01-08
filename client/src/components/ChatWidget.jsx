import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, MessageCircle, Users } from 'lucide-react';

function ChatWidget({ messages, onSendMessage }) {
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && username) {
            onSendMessage(input.trim(), username);
            setInput('');
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (usernameInput.trim()) {
            setUsername(usernameInput.trim());
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="floating-card overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/[0.06] bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-['Outfit'] text-white">
                                    Trading Floor
                                </h2>
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Real-time community discussions
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-400">{messages.length} messages</span>
                        </div>
                    </div>
                </div>

                {/* Username Input */}
                {!username && (
                    <div className="p-6 border-b border-white/[0.06] bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                        <form onSubmit={handleJoin} className="flex gap-3">
                            <input
                                type="text"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                placeholder="Choose your trader name..."
                                className="input-premium flex-1"
                            />
                            <motion.button
                                type="submit"
                                className="btn-primary px-6"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Join Chat
                            </motion.button>
                        </form>
                    </div>
                )}

                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                                    <User className="w-8 h-8 text-gray-500" />
                                </div>
                                <p className="text-gray-400 font-medium">No messages yet</p>
                                <p className="text-gray-500 text-sm mt-1">Be the first to share your insights!</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <motion.div
                                key={message.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-blue-500/10">
                                    {message.username?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-3">
                                        <span className="font-semibold text-white text-sm">
                                            {message.username || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1.5 leading-relaxed break-words">
                                        {message.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-6 border-t border-white/[0.06] bg-[#0a0e17]">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={username ? "Share your market insights..." : "Join chat first..."}
                            disabled={!username}
                            className="input-premium flex-1"
                        />
                        <motion.button
                            type="submit"
                            disabled={!input.trim() || !username}
                            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    </div>
                    {username && (
                        <p className="text-xs text-gray-500 mt-3">
                            Chatting as <span className="text-blue-400 font-medium">{username}</span>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

export default ChatWidget;
