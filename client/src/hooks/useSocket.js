/**
 * useSocket Hook
 * Manages WebSocket connection for real-time data updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD
    ? window.location.origin
    : 'http://localhost:3001';

export function useSocket() {
    const [connected, setConnected] = useState(false);
    const [news, setNews] = useState([]);
    const [prices, setPrices] = useState({
        crypto: {},
        forex: {},
        commodities: {}
    });
    const [chatMessages, setChatMessages] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
            console.log('🚀 Connected to Anti-Gravity server');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('👋 Disconnected from server');
            setConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
            setConnected(false);
        });

        // Data events
        socket.on('initialData', (data) => {
            console.log('📦 Received initial data');
            if (data.news) setNews(data.news);
            if (data.prices) setPrices(data.prices);
        });

        socket.on('newsUpdate', (updatedNews) => {
            console.log('📰 News update received');
            setNews(updatedNews);
        });

        socket.on('priceUpdate', (updatedPrices) => {
            setPrices(updatedPrices);
        });

        socket.on('chatMessage', (message) => {
            setChatMessages(prev => [...prev, message]);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const sendChatMessage = useCallback((content, username = 'Trader') => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('chatMessage', {
                id: Date.now().toString(),
                content,
                username,
            });
        }
    }, []);

    return {
        connected,
        news,
        prices,
        chatMessages,
        sendChatMessage,
        socket: socketRef.current,
    };
}
