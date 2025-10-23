"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    name: any;
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone?: string;
    role: string;
    department?: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    last_login?: string;
}

interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    department?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
    updateUser: (userData: Partial<User>) => void;
    checkAuth: () => Promise<boolean>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Ensure API_BASE has a robust fallback for local development
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

    const clearAuth = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }, []);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedToken = localStorage.getItem('auth_token');
                const storedUser = localStorage.getItem('auth_user');
        
                console.log('Initializing auth...', { hasToken: !!storedToken, hasUser: !!storedUser });
        
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    console.log('Auth state restored from localStorage');
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                clearAuth();
            } finally {
                console.log('Auth initialization complete');
                setLoading(false); 
            }
        };
        
        initAuth();
    }, [clearAuth]); // Added clearAuth to dependency array

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('🔄 Attempting login to:', `${API_BASE}/auth/login`); // Debug log
            
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
        
            let data;
            try {
                data = await response.json();
            } catch (e) {
                // If response is not valid JSON (e.g., HTML error page or raw text)
                console.error('Failed to parse JSON response:', e);
                return { success: false, error: 'Server returned an invalid response (not JSON).' };
            }
            
            console.log('📡 Login response:', { status: response.status, data }); // Debug log
        
            if (response.ok) {
                console.log('✅ Login successful, setting auth state...'); // Debug log
                setToken(data.token);
                setUser(data.user);
                
                // Store in localStorage
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('auth_user', JSON.stringify(data.user));
                
                console.log('💾 Auth state saved to localStorage'); // Debug log
                return { success: true };
            } else {
                console.log('❌ Login failed:', data.error); // Debug log
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch (error) {
            // FIX 2: This block catches "Failed to fetch" (server down, network issue)
            console.error('🚨 Login network/fetch error:', error);
            return { success: false, error: 'Cannot connect to server. Please ensure the backend is running.' };
        }
    };

    const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration network error:', error);
            return { success: false, error: 'Cannot connect to server. Please try again.' };
        }
    };

    const logout = async () => {
        console.log('Simple logout test');
        // Clear auth state immediately (optional: call API in background)
        clearAuth();
        // Redirect after clearing state
        router.replace('/login'); 
    };

    const checkAuth = async (): Promise<boolean> => {
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                localStorage.setItem('auth_user', JSON.stringify(data.user));
                return true;
            } else {
                clearAuth();
                return false;
            }
        } catch (error) {
            console.error('Auth check network error:', error);
            clearAuth();
            return false;
        }
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        register,
        updateUser,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
