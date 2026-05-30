import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext();

// ─── Mapeo de emails de demo ─────────────────────────────────────────────────
// El botón "Admin" usa admin@andean.travel
// El botón "Invitado" usa invitado@andean.travel
export const DEMO_USERS = {
    admin: {
        email: 'admin@andean.travel',
        password: 'andean2025',
    },
    invitado: {
        email: 'invitado@andean.travel',
        password: 'demo123',
    },
};

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [isDemo, setIsDemo]   = useState(false);
    const [loading, setLoading] = useState(true);

    // ── Detectar rol demo desde los metadatos del usuario ────────────────────
    const detectDemo = (supabaseUser) => {
        if (!supabaseUser) return false;
        const meta = supabaseUser.user_metadata ?? {};
        return meta.is_demo === true || supabaseUser.email === DEMO_USERS.invitado.email;
    };

    // ── Inicializar sesión al montar ─────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        // Obtener sesión activa (desde localStorage de Supabase)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            if (session?.user) {
                setUser(session.user);
                setIsDemo(detectDemo(session.user));
            }
            setLoading(false);
        });

        // Suscribirse a cambios de sesión (login / logout / token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!mounted) return;
                if (session?.user) {
                    setUser(session.user);
                    setIsDemo(detectDemo(session.user));
                } else {
                    setUser(null);
                    setIsDemo(false);
                }
                setLoading(false);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // ── Login con email + contraseña ─────────────────────────────────────────
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });

        if (error) {
            // Normalizar mensajes de error para español
            const msg = error.message.includes('Invalid login credentials')
                ? 'Credenciales inválidas. Verifica tu email y contraseña.'
                : error.message.includes('Email not confirmed')
                ? 'Email no confirmado. Revisa tu bandeja de entrada.'
                : error.message;
            return { success: false, message: msg };
        }

        return { success: true, user: data.user };
    };

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = async () => {
        await supabase.auth.signOut();
        // onAuthStateChange limpiará el estado automáticamente
    };

    // ── Nombre de display legible ────────────────────────────────────────────
    const displayName = useMemo(() => {
        if (!user) return null;
        const meta = user.user_metadata ?? {};
        if (meta.display_name) return meta.display_name;
        if (user.email === DEMO_USERS.admin.email)    return 'Administrador';
        if (user.email === DEMO_USERS.invitado.email) return 'Invitado';
        return user.email;
    }, [user]);

    const value = useMemo(
        () => ({ user, isDemo, displayName, login, logout, loading }),
        [user, isDemo, displayName, loading]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
