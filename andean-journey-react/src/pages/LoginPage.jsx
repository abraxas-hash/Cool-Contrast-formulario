import { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Mountain, Loader2, MailIcon, LockIcon, EyeIcon, EyeOffIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Prism from '../components/ui/Prism.jsx';
import ElectricBorder from '../components/ui/ElectricBorder.jsx';

const LoginPage = () => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [activeDemo, setActiveDemo] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSetDemo = (role) => {
        setActiveDemo(role);
        setEmail(DEMO_USERS[role].email);
        setPassword(DEMO_USERS[role].password);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor ingresa tu correo y contraseña');
            return;
        }

        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020b12] flex items-center justify-center px-4 relative overflow-hidden font-sans text-white">
            {/* Prism WebGL Background */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <Prism
                    animationType="rotate"
                    timeScale={0.25}
                    height={3.5}
                    baseWidth={5.5}
                    scale={3.2}
                    hueShift={-0.2}
                    colorFrequency={0.8}
                    noise={0.3}
                    glow={0.9}
                    bloom={1.2}
                    transparent={true}
                />
            </div>
            {/* Dark overlay for maximum readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020b12] via-[#020b12]/80 to-transparent pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[400px] z-10"
            >
                <ElectricBorder color="#f97316" speed={1.8} chaos={0.1} borderRadius={32} className="w-full">
                    <div className="bg-[#030e17]/95 border border-white/10 backdrop-blur-3xl p-8 sm:p-10 shadow-2xl rounded-[32px] text-left space-y-6">
                        
                        {/* Elegant Minimalist Header */}
                        <div className="flex items-center gap-3.5 pb-2 border-b border-white/10">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Mountain className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <h1 className="text-xl font-black font-outfit uppercase tracking-widest text-white leading-none">
                                    Andean Journey
                                </h1>
                                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                                    Portal de Operaciones
                                </span>
                            </div>
                        </div>

                        {/* Error Notification */}
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 overflow-hidden"
                                >
                                    <span className="shrink-0 text-base">⚠️</span>
                                    <span className="flex-1">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Quick-fill Pills */}
                        <div className="flex items-center justify-between gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl text-xs">
                            <span className="text-[10px] uppercase font-black text-slate-400 pl-2.5">
                                Acceso Rápido
                            </span>
                            <div className="flex gap-1">
                                <button 
                                    type="button" 
                                    onClick={() => handleSetDemo('admin')}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                                        activeDemo === 'admin'
                                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    Admin
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleSetDemo('invitado')}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                                        activeDemo === 'invitado'
                                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    Invitado
                                </button>
                            </div>
                        </div>

                        {/* Minimalist Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                                        Usuario / Correo
                                    </label>
                                    <div className="relative group">
                                    <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setActiveDemo(null); }}
                                            className="w-full h-[48px] bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 text-white text-base placeholder:text-slate-600 focus:outline-none focus:border-orange-500 font-medium transition-all"
                                            placeholder="admin@andean.travel"
                                            autoComplete="email"
                                            required
                                        />
                                        <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                                        Contraseña
                                    </label>
                                    <div className="relative group">
                                        <input 
                                            type={isVisible ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-[48px] bg-black/40 border border-white/10 rounded-2xl pl-10 pr-10 text-white text-base placeholder:text-slate-600 focus:outline-none focus:border-orange-500 font-medium transition-all"
                                            placeholder="••••••••••••"
                                            required
                                        />
                                        <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                                        <button
                                            type="button"
                                            onClick={() => setIsVisible(!isVisible)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-white rounded-xl transition-colors cursor-pointer"
                                        >
                                            {isVisible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="h-14 w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-2xl font-extrabold text-base shadow-lg shadow-orange-500/10 border border-orange-400/20 cursor-pointer flex items-center justify-center gap-2 transform active:scale-[0.97] transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Autenticando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 animate-pulse" />
                                        <span>Entrar al Sistema</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-4 border-t border-white/5 text-center">
                            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                                Andean Journey Travel Agency © 2026
                            </span>
                        </div>

                    </div>
                </ElectricBorder>
            </motion.div>
        </div>
    );
};

export default LoginPage;
