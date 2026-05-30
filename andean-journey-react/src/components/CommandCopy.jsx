import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandCopy = ({ command = "npx skills add emilkowalski/skill", isDarkMode = false }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  // Separa el primer comando (ej. npx, npm, yarn) para darle un color distinto si se desea,
  // como se ve en la imagen donde 'npx' tiene un tono ligeramente distinto.
  const parts = command.split(' ');
  const firstWord = parts[0];
  const restOfCommand = parts.slice(1).join(' ');

  return (
    <div 
      className={`relative flex items-center justify-between w-full max-w-md px-4 py-3 rounded-2xl transition-all duration-300 font-mono text-[13px] md:text-sm shadow-sm border ${
        isDarkMode 
          ? 'bg-[#162029]/80 border-white/10 text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
          : 'bg-[#f8f9fb] border-slate-200/60 text-slate-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),_0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),_0_4px_12px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide mr-4">
        <span className={isDarkMode ? 'text-purple-400' : 'text-purple-700 font-medium'}>
          {firstWord}
        </span>
        <span className="ml-1.5">
          {restOfCommand}
        </span>
      </div>

      <button
        onClick={handleCopy}
        className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
          isDarkMode 
            ? 'hover:bg-white/10 text-slate-400 hover:text-slate-200' 
            : 'hover:bg-slate-200/70 text-slate-400 hover:text-slate-600'
        }`}
        aria-label="Copy command"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isCopied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-4 h-4 text-emerald-500" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Copy className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

export default CommandCopy;
