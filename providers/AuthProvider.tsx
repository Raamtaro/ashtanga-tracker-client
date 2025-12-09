import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { login as apiLogin } from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/auth';

type AuthContextType = {
    isLoading: boolean;
    isAuthed: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoading, setLoading] = useState(true);
    const [isAuthed, setAuthed] = useState(false);

    useEffect(() => {
        (async () => {
            const tok = await getToken();
            setAuthed(!!tok);
            setLoading(false);
        })();
    }, []);

    async function signIn(email: string, password: string) {
        const data = await apiLogin(email, password); // expects { token }
        await setToken(data.token);
        setAuthed(true);
    }

    async function signOut() {
        await clearToken();
        setAuthed(false);
    }

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
