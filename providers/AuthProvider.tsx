import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { login as apiLogin, setUnauthorizedHandler } from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/auth';

type SignOutReason = 'manual' | 'expired';

type AuthContextType = {
    isLoading: boolean;
    isAuthed: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: (reason?: SignOutReason) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoading, setLoading] = useState(true);
    const [isAuthed, setAuthed] = useState(false);

    // guards against multiple 401s triggering multiple signOuts/alerts
    const signingOutRef = useRef(false);
    const authedRef = useRef(false);

    useEffect(() => {
        authedRef.current = isAuthed;
    }, [isAuthed]);

    useEffect(() => {
        (async () => {
            const tok = await getToken();
            setAuthed(!!tok);
            setLoading(false);
        })();
    }, []);

    async function signIn(email: string, password: string) {
        const data = await apiLogin(email, password); // { user, token }
        await setToken(data.token);
        setAuthed(true);
    }

    const signOut = useCallback(async (reason: SignOutReason = 'manual') => {
        if (signingOutRef.current) return;
        signingOutRef.current = true;

        const wasAuthed = authedRef.current;

        try {
            await clearToken();
            setAuthed(false);
        } finally {
            signingOutRef.current = false;
        }

        // Only show "expired" if they were actually logged in.
        if (reason === 'expired' && wasAuthed) {
            Alert.alert('Session expired', 'Please log in again.');
        }
    }, []);

    // Subscribe api.ts -> 401 handler
    useEffect(() => {
        setUnauthorizedHandler(() => {
            // If you’re not authed, don’t spam signOut/alerts.
            if (!authedRef.current) return;
            void signOut('expired');
        });

        return () => setUnauthorizedHandler(null);
    }, [signOut]);

    return (
        <AuthContext.Provider value={{ isLoading, isAuthed, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
