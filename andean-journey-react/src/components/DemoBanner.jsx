import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FlaskConical, X } from 'lucide-react';

const DemoBanner = () => {
    const { isDemo } = useAuth();
    const [dismissed, setDismissed] = useState(false);

    if (!isDemo || dismissed) return null;

    return (
        <div className="relative w-full bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-amber-950/90 border-b border-amber-500/20 backdrop-blur-sm z-[9999]">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 relative">
                <FlaskConical className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <p className="text-[11px] font-semibold text-amber-200/90 tracking-wide">
                    <span className="font-black text-amber-400 uppercase tracking-wider">Demo</span>
                    {' '}— Los datos son ficticios y no afectan el sistema real.
                </p>
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-amber-500/60 hover:text-amber-300 transition-colors cursor-pointer rounded"
                    title="Cerrar"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default DemoBanner;
