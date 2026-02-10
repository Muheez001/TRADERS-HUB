/**
 * Authentication Context
 * Provides Supabase Auth state to all components
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [preferences, setPreferences] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Fetch user preferences from DB
    const fetchPreferences = useCallback(async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (!error && data) {
                setPreferences(data);
            }
        } catch (err) {
            console.log('Fetch preferences:', err.message);
        }
    }, []);

    // Create default preferences for new users
    const createDefaultPreferences = useCallback(async (userData) => {
        try {
            const { data: existing } = await supabase
                .from('user_preferences')
                .select('id')
                .eq('user_id', userData.id)
                .single();

            if (!existing) {
                await supabase.from('user_preferences').insert({
                    user_id: userData.id,
                    email: userData.email,
                    notify_crypto: true,
                    notify_forex: true,
                    email_alerts: true,
                    scan_interval: '15m',
                    min_confidence: 75,
                    sound_enabled: true
                });
            }
        } catch (err) {
            // Ignore - might be duplicate or permission issue
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        let timeoutId;

        // Safety timeout - ensure loading state never gets stuck
        timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.log('Auth timeout - forcing loading complete');
                setLoading(false);
                setInitialized(true);
            }
        }, 5000);

        // Get initial session
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    if (session?.user) {
                        setUser(session.user);
                        fetchPreferences(session.user.id);
                    }
                    setLoading(false);
                    setInitialized(true);
                }
            } catch (err) {
                console.error('Auth init error:', err);
                if (mounted) {
                    setLoading(false);
                    setInitialized(true);
                }
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('Auth event:', event);

            if (event === 'SIGNED_IN') {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await createDefaultPreferences(session.user);
                    await fetchPreferences(session.user.id);
                }
                setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setPreferences(null);
                setLoading(false);
            } else if (event === 'TOKEN_REFRESHED') {
                setUser(session?.user ?? null);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [fetchPreferences, createDefaultPreferences]);

    // Update preferences
    async function updatePreferences(updates) {
        if (!user) return null;

        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .update({ ...updates })
                .eq('user_id', user.id)
                .select()
                .single();

            if (!error && data) {
                setPreferences(data);
                return data;
            }
        } catch (err) {
            console.error('Update preferences error:', err.message);
        }
        return null;
    }

    // Sign in with Google
    async function signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            console.error('Auth error:', error.message);
            return { error };
        }
        return { data };
    }

    // Sign out
    async function signOut() {
        await supabase.auth.signOut();
        setUser(null);
        setPreferences(null);
    }

    const value = {
        user,
        loading,
        preferences,
        signInWithGoogle,
        signOut,
        updatePreferences,
        isAuthenticated: !!user,
        initialized
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
