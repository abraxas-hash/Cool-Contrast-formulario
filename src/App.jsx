import React, { useState, useEffect, useRef, forwardRef, useCallback, useImperativeHandle, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import confetti from "canvas-confetti";
import "./index.css";
const { Bot, ArrowRight, ArrowLeft, Send, Sparkles, CheckCircle2, ChevronRight, Settings, Zap, Users, BarChart3, Clock, Rocket, RefreshCw, Cpu, Brain, Network, Database } = LucideIcons;

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}


        // Adapted RotatingText Component from React Bits
        const RotatingText = forwardRef((props, ref) => {
            const {
                texts,
                transition = { type: 'spring', damping: 25, stiffness: 300 },
                initial = { y: '100%', opacity: 0 },
                animate = { y: 0, opacity: 1 },
                exit = { y: '-120%', opacity: 0 },
                animatePresenceMode = 'wait',
                animatePresenceInitial = false,
                rotationInterval = 2000,
                staggerDuration = 0,
                staggerFrom = 'first',
                loop = true,
                auto = true,
                splitBy = 'characters',
                onNext,
                mainClassName,
                splitLevelClassName,
                elementLevelClassName,
                ...rest
            } = props;

            const [currentTextIndex, setCurrentTextIndex] = useState(0);

            const splitIntoCharacters = text => {
                if (typeof Intl !== 'undefined' && Intl.Segmenter) {
                    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
                    return Array.from(segmenter.segment(text), segment => segment.segment);
                }
                return Array.from(text);
            };

            const elements = useMemo(() => {
                const currentText = texts[currentTextIndex];
                if (splitBy === 'characters') {
                    const words = currentText.split(' ');
                    return words.map((word, i) => ({
                        characters: splitIntoCharacters(word),
                        needsSpace: i !== words.length - 1
                    }));
                }
                if (splitBy === 'words') {
                    return currentText.split(' ').map((word, i, arr) => ({
                        characters: [word],
                        needsSpace: i !== arr.length - 1
                    }));
                }
                if (splitBy === 'lines') {
                    return currentText.split('\n').map((line, i, arr) => ({
                        characters: [line],
                        needsSpace: i !== arr.length - 1
                    }));
                }

                return currentText.split(splitBy).map((part, i, arr) => ({
                    characters: [part],
                    needsSpace: i !== arr.length - 1
                }));
            }, [texts, currentTextIndex, splitBy]);

            const getStaggerDelay = useCallback(
                (index, totalChars) => {
                    const total = totalChars;
                    if (staggerFrom === 'first') return index * staggerDuration;
                    if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
                    if (staggerFrom === 'center') {
                        const center = Math.floor(total / 2);
                        return Math.abs(center - index) * staggerDuration;
                    }
                    if (staggerFrom === 'random') {
                        const randomIndex = Math.floor(Math.random() * total);
                        return Math.abs(randomIndex - index) * staggerDuration;
                    }
                    return Math.abs(staggerFrom - index) * staggerDuration;
                },
                [staggerFrom, staggerDuration]
            );

            const handleIndexChange = useCallback(
                newIndex => {
                    setCurrentTextIndex(newIndex);
                    if (onNext) onNext(newIndex);
                },
                [onNext]
            );

            const next = useCallback(() => {
                const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
                if (nextIndex !== currentTextIndex) {
                    handleIndexChange(nextIndex);
                }
            }, [currentTextIndex, texts.length, loop, handleIndexChange]);

            const previous = useCallback(() => {
                const prevIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
                if (prevIndex !== currentTextIndex) {
                    handleIndexChange(prevIndex);
                }
            }, [currentTextIndex, texts.length, loop, handleIndexChange]);

            const jumpTo = useCallback(
                index => {
                    const validIndex = Math.max(0, Math.min(index, texts.length - 1));
                    if (validIndex !== currentTextIndex) {
                        handleIndexChange(validIndex);
                    }
                },
                [texts.length, currentTextIndex, handleIndexChange]
            );

            const reset = useCallback(() => {
                if (currentTextIndex !== 0) {
                    handleIndexChange(0);
                }
            }, [currentTextIndex, handleIndexChange]);

            useImperativeHandle(
                ref,
                () => ({
                    next,
                    previous,
                    jumpTo,
                    reset
                }),
                [next, previous, jumpTo, reset]
            );

            useEffect(() => {
                if (!auto) return;
                const intervalId = setInterval(next, rotationInterval);
                return () => clearInterval(intervalId);
            }, [next, rotationInterval, auto]);

            return (
                <motion.span className={cn('text-rotate', mainClassName)} {...rest} layout transition={transition}>
                    <span className="text-rotate-sr-only">{texts[currentTextIndex]}</span>
                    <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
                        <motion.span
                            key={currentTextIndex}
                            className={cn(splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate')}
                            layout
                            aria-hidden="true"
                        >
                            {elements.map((wordObj, wordIndex, array) => {
                                const previousCharsCount = array.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0);
                                return (
                                    <span key={wordIndex} className={cn('text-rotate-word', splitLevelClassName)}>
                                        {wordObj.characters.map((char, charIndex) => (
                                            <motion.span
                                                key={charIndex}
                                                initial={initial}
                                                animate={animate}
                                                exit={exit}
                                                transition={{
                                                    ...transition,
                                                    delay: getStaggerDelay(
                                                        previousCharsCount + charIndex,
                                                        array.reduce((sum, word) => sum + word.characters.length, 0)
                                                    )
                                                }}
                                                className={cn('text-rotate-element', elementLevelClassName)}
                                            >
                                                {char}
                                            </motion.span>
                                        ))}
                                        {wordObj.needsSpace && <span className="text-rotate-space"> </span>}
                                    </span>
                                );
                            })}
                        </motion.span>
                    </AnimatePresence>
                </motion.span>
            );
        });

        RotatingText.displayName = 'RotatingText';

        // Adapted GlitchText Component from React Bits
        const GlitchText = ({ children, speed = 1, enableShadows = true, enableOnHover = true, className = '' }) => {
            const inlineStyles = {
                '--after-duration': `${speed * 3}s`,
                '--before-duration': `${speed * 2}s`,
                '--after-shadow': enableShadows ? '-3px 0 var(--primary)' : 'none',
                '--before-shadow': enableShadows ? '3px 0 var(--secondary)' : 'none'
            };

            const hoverClass = enableOnHover ? 'enable-on-hover' : '';

            return (
                <div 
                    className={`glitch ${hoverClass} ${className}`} 
                    style={inlineStyles} 
                    data-text={children}
                >
                    {children}
                </div>
            );
        };

        // Reusable Electric Border Component
        function ElectricBorder() {
            return <div className="electric-border" />;
        }

        // SVG Diagram Component for various option choices
        function SvgDiagram({ type }) {
            if (type === 'meta-whatsapp') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <rect x="20" y="22" width="40" height="32" rx="8" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble"/>
                        <path d="M 32 54 L 24 62 L 24 54 Z" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble"/>
                        <circle cx="34" cy="36" r="3" fill="var(--primary)" className="floating-bubble"/>
                        <circle cx="46" cy="36" r="3" fill="var(--primary)" className="floating-bubble"/>
                        <line x1="32" y1="44" x2="48" y2="44" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" className="floating-bubble"/>
                        <line x1="40" y1="22" x2="40" y2="12" stroke="#6366f1" strokeWidth="2" className="floating-bubble"/>
                        <circle cx="40" cy="12" r="4" fill="#6366f1" className="floating-bubble"/>
                    </svg>
                );
            }
            if (type === 'meta-apis') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="25" cy="40" r="10" fill="none" stroke="#6366f1" strokeWidth="2" className="floating-bubble"/>
                        <circle cx="55" cy="25" r="8" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble-delay"/>
                        <circle cx="55" cy="55" r="8" fill="none" stroke="#f59e0b" strokeWidth="2" className="floating-bubble"/>
                        <line x1="35" y1="35" x2="47" y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" className="pulse-line"/>
                        <line x1="35" y1="45" x2="47" y2="52" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" className="pulse-line"/>
                    </svg>
                );
            }
            if (type === 'meta-agents') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <path d="M 40 15 C 22 15, 20 38, 30 52 C 34 58, 40 68, 40 68 C 40 68, 46 58, 50 52 C 60 38, 58 15, 40 15 Z" fill="none" stroke="#f59e0b" strokeWidth="2" className="pulse-circle"/>
                        <circle cx="40" cy="30" r="5" fill="#f59e0b"/>
                        <circle cx="28" cy="40" r="4" fill="var(--primary)"/>
                        <circle cx="52" cy="40" r="4" fill="var(--primary)"/>
                        <line x1="40" y1="30" x2="28" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                        <line x1="40" y1="30" x2="52" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                    </svg>
                );
            }
            if (type === 'api-direct') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <rect x="15" y="32" width="16" height="16" rx="4" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble"/>
                        <rect x="49" y="32" width="16" height="16" rx="4" fill="none" stroke="#6366f1" strokeWidth="2" className="floating-bubble-delay"/>
                        <line x1="31" y1="40" x2="49" y2="40" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" className="pulse-line"/>
                        <circle cx="40" cy="40" r="5" fill="#f59e0b" className="pulse-circle"/>
                    </svg>
                );
            }
            if (type === 'api-n8n') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <rect x="12" y="15" width="14" height="14" rx="3" fill="none" stroke="var(--primary)" strokeWidth="2"/>
                        <circle cx="40" cy="40" r="8" fill="none" stroke="#6366f1" strokeWidth="2"/>
                        <rect x="54" y="51" width="14" height="14" rx="3" fill="none" stroke="#f59e0b" strokeWidth="2"/>
                        <path d="M 26 22 Q 40 22 40 32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" className="pulse-line"/>
                        <path d="M 40 48 Q 40 58 54 58" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" className="pulse-line"/>
                    </svg>
                );
            }
            if (type === 'api-simple') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <path d="M 20 30 L 60 30 L 60 54 L 20 54 Z" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble"/>
                        <path d="M 20 30 L 40 42 L 60 30" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble"/>
                        <circle cx="40" cy="47" r="4" fill="#10b981" className="pulse-circle"/>
                    </svg>
                );
            }
            if (type === 'server-vps') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <rect x="20" y="16" width="40" height="12" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble"/>
                        <rect x="20" y="34" width="40" height="12" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble-delay"/>
                        <rect x="20" y="52" width="40" height="12" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble"/>
                        <circle cx="28" cy="22" r="2" fill="#10b981"/>
                        <circle cx="28" cy="40" r="2" fill="#10b981"/>
                        <circle cx="28" cy="58" r="2" fill="#10b981"/>
                    </svg>
                );
            }
            if (type === 'server-shared') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <path d="M 25 45 A 12 12 0 0 1 45 35 A 16 16 0 0 1 70 45 A 10 10 0 0 1 65 60 L 25 60 A 10 10 0 0 1 25 45 Z" fill="none" stroke="#6366f1" strokeWidth="2" className="pulse-circle"/>
                        <circle cx="45" cy="48" r="3" fill="var(--primary)"/>
                    </svg>
                );
            }
            if (type === 'server-local') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <rect x="25" y="20" width="30" height="40" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                        <line x1="25" y1="45" x2="55" y2="45" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                        <circle cx="40" cy="52" r="3" fill="rgba(255,255,255,0.2)"/>
                    </svg>
                );
            }
            if (type === 'web-active') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <rect x="15" y="20" width="50" height="40" rx="6" fill="none" stroke="var(--primary)" strokeWidth="2" className="floating-bubble"/>
                        <line x1="15" y1="32" x2="65" y2="32" stroke="var(--primary)" strokeWidth="1.5" className="floating-bubble"/>
                        <circle cx="22" cy="26" r="2" fill="#10b981"/>
                        <circle cx="28" cy="26" r="2" fill="#f59e0b"/>
                        <circle cx="34" cy="26" r="2" fill="#ef4444"/>
                    </svg>
                );
            }
            if (type === 'web-domain') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <path d="M 20 25 L 60 25 L 60 55 L 20 55 Z" fill="none" stroke="#6366f1" strokeWidth="2" className="floating-bubble-delay"/>
                        <path d="M 20 25 L 40 40 L 60 25" fill="none" stroke="#6366f1" strokeWidth="2" className="floating-bubble-delay"/>
                    </svg>
                );
            }
            if (type === 'web-design') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="22" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" className="rotating-gear"/>
                        <line x1="40" y1="30" x2="40" y2="50" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
                        <line x1="30" y1="40" x2="50" y2="40" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                );
            }
            if (type === 'budget-basic') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <rect x="25" y="25" width="30" height="30" rx="6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                        <circle cx="40" cy="40" r="4" fill="rgba(255,255,255,0.2)"/>
                    </svg>
                );
            }
            if (type === 'budget-pro') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <rect x="20" y="20" width="40" height="40" rx="8" fill="none" stroke="var(--primary)" strokeWidth="2"/>
                        <rect x="30" y="30" width="20" height="20" rx="4" fill="none" stroke="#6366f1" strokeWidth="1.5"/>
                    </svg>
                );
            }
            if (type === 'budget-corp') {
                return (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <rect x="15" y="15" width="50" height="50" rx="10" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="pulse-circle"/>
                        <circle cx="40" cy="40" r="12" fill="none" stroke="#10b981" strokeWidth="2"/>
                    </svg>
                );
            }
            return null;
        }

        // Reusable Step Grid Component representing cards selection
        function StepOptionGrid({ title, subtitle, tag, options, selectedValue, onSelect, onBack }) {
            return (
                <div className="glass-card">
                    <ElectricBorder />
                    <div className="question-header">
                        <span className="question-tag">{tag}</span>
                        <h2 className="question-title" dangerouslySetInnerHTML={{ __html: title }} />
                        <p className="question-subtitle">{subtitle}</p>
                    </div>

                    <div className="cards-grid">
                        {options.map((opt, i) => (
                            <div 
                                key={i} 
                                className={`option-card ${selectedValue === opt.value ? 'selected' : ''}`}
                                onClick={() => onSelect(opt.value)}
                            >
                                <ElectricBorder />
                                <div className="select-dot"><i data-lucide="check"></i></div>
                                <div className="diagram-box">
                                    <SvgDiagram type={opt.diagramType} />
                                </div>
                                <div className="option-content">
                                    <h3 className="opt-title">{opt.label}</h3>
                                    <p className="opt-desc">{opt.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="nav-controls">
                        <button type="button" className="btn-back" onClick={onBack}>
                            <i data-lucide="arrow-left"></i> Volver
                        </button>
                    </div>
                </div>
            );
        }

        // Reusable Welcome Slide Component
        function StepWelcome({ onStart }) {
            return (
                <div className="glass-card">
                    <ElectricBorder />
                    <div className="welcome-content">
                        <div className="welcome-left">
                            <span className="question-tag">Diagnóstico Estratégico</span>
                            <h1 className="glow-title">
                                Diseña tu Motor de{' '}
                                <RotatingText
                                    texts={['Crecimiento', 'Automatización', 'Sistemas', 'Agentes']}
                                    elementLevelClassName="italic-glow"
                                    staggerFrom="last"
                                    initial={{ y: "100%", opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: "-120%", opacity: 0 }}
                                    staggerDuration={0.02}
                                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                                    rotationInterval={2500}
                                />
                            </h1>
                            <p className="welcome-p">Responde este breve diagnóstico visual para analizar el potencial de automatización de tu negocio, identificar cuellos de botella y filtrar tus requerimientos técnicos en menos de 2 minutos.</p>
                            <button type="button" className="btn-action" onClick={onStart}>
                                Iniciar Diagnóstico <i data-lucide="play" size="18"></i>
                            </button>
                        </div>
                        <div className="welcome-right">
                            {/* High-End Animated SVG Robot Controller */}
                            <svg width="280" height="280" viewBox="0 0 280 280" style={{ filter: 'drop-shadow(0 0 20px rgba(255,94,30,0.15))' }}>
                                <circle cx="140" cy="140" r="110" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="2"/>
                                <circle cx="140" cy="140" r="85" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="6 6" className="rotating-gear"/>

                                <path d="M 140 100 Q 90 90 60 70" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="4 4" className="pulse-line"/>
                                <path d="M 140 100 Q 190 90 220 70" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" className="pulse-line" style={{ animationDelay: '0.5s' }}/>
                                <path d="M 140 180 Q 90 190 60 210" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" className="pulse-line" style={{ animationDelay: '0.2s' }}/>
                                <path d="M 140 180 Q 190 190 220 210" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" className="pulse-line" style={{ animationDelay: '0.7s' }}/>

                                <g className="floating-bubble" style={{ animationDuration: '4s' }}>
                                    <circle cx="60" cy="70" r="22" fill="#0d0d15" stroke="var(--primary)" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 8px rgba(255,94,30,0.3))' }}/>
                                    <path d="M 52 66 H 68 V 76 H 58 L 52 81 V 66 Z" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinejoin="round"/>
                                    <line x1="56" y1="71" x2="64" y2="71" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                                </g>

                                <g className="floating-bubble-delay" style={{ animationDuration: '4.5s' }}>
                                    <circle cx="220" cy="70" r="22" fill="#0d0d15" stroke="#6366f1" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.3))' }}/>
                                    <ellipse cx="220" cy="62" rx="8" ry="2.5" fill="none" stroke="#6366f1" strokeWidth="1.5"/>
                                    <path d="M 212 62 V 68 A 8 2.5 0 0 0 228 68 V 62" fill="none" stroke="#6366f1" strokeWidth="1.5"/>
                                    <path d="M 212 68 V 74 A 8 2.5 0 0 0 228 74 V 68" fill="none" stroke="#6366f1" strokeWidth="1.5"/>
                                </g>

                                <g className="floating-bubble-delay" style={{ animationDuration: '5s' }}>
                                    <circle cx="60" cy="210" r="22" fill="#0d0d15" stroke="#f59e0b" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.3))' }}/>
                                    <rect x="52" y="206" width="10" height="8" rx="1" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
                                    <line x1="62" y1="210" x2="68" y2="210" stroke="#f59e0b" strokeWidth="1.5"/>
                                    <circle cx="68" cy="210" r="1.5" fill="#f59e0b"/>
                                </g>

                                <g className="floating-bubble" style={{ animationDuration: '5.5s' }}>
                                    <circle cx="220" cy="210" r="22" fill="#0d0d15" stroke="#10b981" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}/>
                                    <path d="M 210 214 A 4 4 0 0 1 210 206 A 6 6 0 0 1 224 204 A 5 5 0 0 1 228 214 Z" fill="none" stroke="#10b981" strokeWidth="1.5"/>
                                </g>

                                <g transform="translate(0, 5)" className="floating-bubble" style={{ animationDuration: '3.5s' }}>
                                    <path d="M 130 162 L 150 162 L 145 174 L 135 174 Z" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5"/>
                                    <ellipse cx="140" cy="165" rx="7" ry="2" fill="var(--primary)" className="pulse-circle"/>
                                    <path d="M 112 178 C 112 178, 118 190, 140 190 C 162 190, 168 178, 168 178" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2"/>

                                    <rect x="110" y="118" width="8" height="24" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                                    <rect x="162" y="118" width="8" height="24" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                                    
                                    <line x1="140" y1="102" x2="140" y2="88" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                                    <circle cx="140" cy="86" r="4.5" fill="var(--primary)" className="pulse-circle"/>

                                    <rect x="116" y="102" width="48" height="56" rx="20" fill="#0c0c14" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}/>
                                    <rect x="122" y="114" width="36" height="20" rx="6" fill="#040406" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1"/>
                                    
                                    <g className="pulse-circle" style={{ animationDuration: '2.5s' }}>
                                        <rect x="127" y="121" width="8" height="4" rx="2" fill="var(--primary-light)"/>
                                        <rect x="145" y="121" width="8" height="4" rx="2" fill="var(--primary-light)"/>
                                    </g>
                                    
                                    <path d="M 124 142 L 132 146 L 148 146 L 156 142" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            );
        }

        // Global React Form Application
        function App() {
            const [currentStep, setCurrentStep] = useState(1);
            const [showGameAlert, setShowGameAlert] = useState(false);
            const totalSteps = 9;
            const [answers, setAnswers] = useState({
                meta: '',
                api: '',
                server: '',
                web: '',
                companyName: '',
                companyContact: '',
                companyWebsite: '',
                budget: '',
                problem: ''
            });

            // Handle track slide transitions with sound feedback
            const navigateTo = (step) => {
                try {
                    // Play whoosh transition sound
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(250, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.08, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.18);
                } catch (e) {}

                setCurrentStep(step);
            };

            // Synthetic UI Audio Playback
            const audioClick = () => {
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.04);
                    gain.gain.setValueAtTime(0.06, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.05);
                } catch (e) {}
            };

            // Option selection auto-advancing logic
            const handleSelectOption = (category, value) => {
                audioClick();
                setAnswers(prev => ({ ...prev, [category]: value }));
                setTimeout(() => {
                    navigateTo(currentStep + 1);
                }, 400);
            };

            // Trigger Lucide icons refresh and electric border seed animation
            useEffect(() => {
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }, [currentStep]);

            useEffect(() => {
                if (showGameAlert && window.lucide) {
                    setTimeout(() => {
                        window.lucide.createIcons();
                    }, 50);
                }
            }, [showGameAlert]);

            useEffect(() => {
                let electricSeed = 1;
                const turb = document.querySelector('#electric-border-filter feTurbulence');
                const interval = setInterval(() => {
                    if (turb) {
                        electricSeed = (electricSeed % 100) + 1;
                        turb.setAttribute('seed', electricSeed);
                    }
                }, 80);
                return () => clearInterval(interval);
            }, []);

            // Diagnostic score computer & tailored message generator
            const calculateViability = () => {
                let score = 30; // base score

                // APIs
                if (answers.api === 'Sincronización Directa por APIs') score += 25;
                else if (answers.api === 'Automatización con n8n/Make') score += 20;
                else score += 10;

                // Servers
                if (answers.server === 'Servidor Cloud Privado (VPS)') score += 25;
                else if (answers.server === 'Servidor Compartido Symcron') score += 20;
                else score -= 15; // low budget filter penalty

                // Web
                if (answers.web === 'Dominio y Web Activos') score += 10;
                else if (answers.web === 'Solo Dominio / Correo') score += 5;
                else score += 10; // build website is highly valued!

                // Budget
                if (answers.budget === 'Corporativo (Más de $2,500 USD)') score += 10;
                else if (answers.budget === 'Profesional ($800 - $2,500 USD)') score += 5;
                else score -= 10; // budget filter penalty

                return Math.max(10, Math.min(100, score));
            };

            const getDiagnosticMessage = (score) => {
                if (score >= 75) {
                    return {
                        title: '¡Proyecto Altamente Viable!',
                        color: '#10b981',
                        text: 'Tu perfil tecnológico es ideal. Cuentas con la visión e infraestructura necesarias para automatizaciones de alto rendimiento en servidores VPS dedicados. Agenda tu entrevista para detallar la arquitectura.'
                    };
                } else if (score >= 50) {
                    return {
                        title: 'Viabilidad Favorable',
                        color: '#f59e0b',
                        text: 'Tu proyecto es realizable. Recomendamos un esquema de Hosting Gestionado Symcron para que no te preocupes de servidores o mantenimiento. En la llamada estructuraremos tu flujo operativo principal.'
                    };
                } else {
                    return {
                        title: 'Requiere Alineación Técnica',
                        color: '#ef4444',
                        text: 'Para que la automatización sea estable y genere ventas reales, es fundamental alinear el presupuesto e infraestructura base. Agenda la reunión estratégica para evaluar alternativas de optimización de costos.'
                    };
                }
            };

            const score = calculateViability();
            const diag = getDiagnosticMessage(score);

            // Final Submit Action
            const submitFinalForm = () => {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#ff5e1e', '#6366f1', '#10b981']
                });

                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.55);
                } catch(e) {}

                // Send data to n8n webhook
                const payload = {
                    score: score,
                    diagnostic: diag.title,
                    companyName: answers.companyName,
                    companyContact: answers.companyContact,
                    companyWebsite: answers.companyWebsite,
                    objective: answers.meta,
                    apiPreference: answers.api,
                    hostingPreference: answers.server,
                    websiteStatus: answers.web,
                    budgetRange: answers.budget,
                    detailedProblem: answers.problem,
                    submittedAt: new Date().toISOString()
                };

                // Send to local CORS proxy which relays it as application/json to both n8n endpoints on the backend!
                fetch('/api/webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Webhook successfully triggered via local proxy:', data);
                })
                .catch(error => {
                    console.error('Webhook trigger error via local proxy:', error);
                });

                // Show the gaming console modal alert
                setShowGameAlert(true);
            };

            const handleGameClose = () => {
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
                    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
                    gain.gain.setValueAtTime(0.08, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.12);
                } catch(e) {}
                
                setShowGameAlert(false);
                setTimeout(() => {
                    location.reload();
                }, 300);
            };

            // Progress computations
            const progressPct = (currentStep / totalSteps) * 100;
            const stepLabel = currentStep === 1 ? 'Bienvenida' : currentStep === totalSteps ? 'Diagnóstico' : `Paso ${currentStep - 1} / 7`;

            return (
                <React.Fragment>
                    <header>
                        <div className="brand">
                            <div className="brand-logo">S</div>
                            <GlitchText 
                                speed={1.2} 
                                enableShadows={true} 
                                enableOnHover={true} 
                                className="brand-name brand-glitch"
                            >
                                SYMCRON
                            </GlitchText>
                        </div>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="step-counter">{stepLabel}</div>
                    </header>

                    <div className="slider-wrapper">
                        <div className="slider-track" style={{ transform: `translateX(${(currentStep - 1) * -100}vw)` }}>
                            
                            {/* Slide 1: Welcome */}
                            <div className="slide">
                                <StepWelcome onStart={() => { audioClick(); navigateTo(2); }} />
                            </div>

                            {/* Slide 2: Goal Priority */}
                            <div className="slide">
                                <StepOptionGrid 
                                    tag="Paso 02 / Objetivo"
                                    title="¿Cuál es tu <span class='italic-glow'>prioridad</span> número uno hoy?"
                                    subtitle="Selecciona el área en la que más tiempo o dinero deseas optimizar."
                                    selectedValue={answers.meta}
                                    onSelect={(val) => handleSelectOption('meta', val)}
                                    onBack={() => { audioClick(); navigateTo(1); }}
                                    options={[
                                        { value: 'Ventas WhatsApp AI', label: 'Automatizar WhatsApp', desc: 'Clasificar clientes, responder dudas y agendar citas 24/7 con Inteligencia Artificial.', diagramType: 'meta-whatsapp' },
                                        { value: 'Conectar Aplicaciones/APIs', label: 'Integrar Mis Apps (APIs)', desc: 'Conectar CRM, Hojas de cálculo, pasarelas de pago y ERP para eliminar la digitación manual.', diagramType: 'meta-apis' },
                                        { value: 'Agentes Autónomos IA', label: 'Agentes de IA', desc: 'Darle autonomía a la IA para que tome decisiones complejas y procese bases de datos.', diagramType: 'meta-agents' }
                                    ]}
                                />
                            </div>

                            {/* Slide 3: APIs */}
                            <div className="slide">
                                <StepOptionGrid 
                                    tag="Paso 03 / Conectividad"
                                    title="¿Cómo imaginas la <span class='italic-glow'>comunicación</span> de tu sistema?"
                                    subtitle="Esto nos ayuda a medir discretamente tu madurez técnica para hablar en tu mismo idioma."
                                    selectedValue={answers.api}
                                    onSelect={(val) => handleSelectOption('api', val)}
                                    onBack={() => { audioClick(); navigateTo(2); }}
                                    options={[
                                        { value: 'Sincronización Directa por APIs', label: 'Conexión Directa por APIs', desc: 'Quiero sincronización en tiempo real mediante APIs directas y Webhooks.', diagramType: 'api-direct' },
                                        { value: 'Automatización con n8n/Make', label: 'Flujos Visuales (n8n/Make)', desc: 'He escuchado o usado n8n/Make y busco optimizar o crear nuevos flujos visuales.', diagramType: 'api-n8n' },
                                        { value: 'Simple / Llave en Mano', label: 'Simple (Llave en Mano)', desc: 'No conozco de código, solo quiero que los datos se muevan solos de forma confiable.', diagramType: 'api-simple' }
                                    ]}
                                />
                            </div>

                            {/* Slide 4: Servers */}
                            <div className="slide">
                                <StepOptionGrid 
                                    tag="Paso 04 / Infraestructura"
                                    title="¿Dónde prefieres hospedar tus <span class='italic-glow'>robots</span>?"
                                    subtitle="Un motor inteligente (n8n) requiere estar encendido 24/7. ¿Cuál es tu visión?"
                                    selectedValue={answers.server}
                                    onSelect={(val) => handleSelectOption('server', val)}
                                    onBack={() => { audioClick(); navigateTo(3); }}
                                    options={[
                                        { value: 'Servidor Cloud Privado (VPS)', label: 'Servidor Propio Dedicado', desc: 'Instalado en una VPS (Ubuntu/Docker) de $10-15 USD/mes. Control total, privacidad y ejecuciones ilimitadas.', diagramType: 'server-vps' },
                                        { value: 'Servidor Compartido Symcron', label: 'Hosting Gestionado Symcron', desc: 'Ustedes se encargan del mantenimiento, respaldos y hosting. Pago una tarifa mensual unificada.', diagramType: 'server-shared' },
                                        { value: 'Sin Costo / Local', label: 'Sin Servidores Mensuales', desc: 'Prefiero soluciones locales sin costo de servidor, aunque el robot no funcione apagando mi PC.', diagramType: 'server-local' }
                                    ]}
                                />
                            </div>

                            {/* Slide 5: Web Assets */}
                            <div className="slide">
                                <StepOptionGrid 
                                    tag="Paso 05 / Activos Digitales"
                                    title="¿Cuál es el estado de tu <span class='italic-glow'>ecosistema</span> web?"
                                    subtitle="Tener dominio y sitio web acelera el despliegue de correos automatizados e integraciones."
                                    selectedValue={answers.web}
                                    onSelect={(val) => handleSelectOption('web', val)}
                                    onBack={() => { audioClick(); navigateTo(4); }}
                                    options={[
                                        { value: 'Dominio y Web Activos', label: 'Tenemos Dominio y Web', desc: 'Contamos con sitio activo (ej. WordPress, Shopify, React) y correos profesionales.', diagramType: 'web-active' },
                                        { value: 'Solo Dominio / Correo', label: 'Solo Dominio o Redes', desc: 'Tenemos el nombre registrado y redes, pero no un sitio web estructurado o funcional.', diagramType: 'web-domain' },
                                        { value: 'Necesito Web y Dominio', label: 'Quiero que lo Diseñen', desc: 'No tengo sitio web ni dominio. Deseo un sitio premium integrado desde cero con mis bots.', diagramType: 'web-design' }
                                    ]}
                                />
                            </div>

                            {/* Slide 6: Identity inputs */}
                            <div className="slide">
                                <div className="glass-card">
                                    <ElectricBorder />
                                    <div className="question-header">
                                        <span className="question-tag">Paso 06 / Identificación</span>
                                        <h2 className="question-title">¿Quién está <span className="italic-glow">detrás</span> de este proyecto?</h2>
                                        <p className="question-subtitle">Queremos estudiar tu empresa y tu sector antes de reunirnos contigo.</p>
                                    </div>

                                    <div className="inputs-wrapper">
                                        <div className="floating-input">
                                            <input 
                                                type="text" 
                                                id="companyName" 
                                                placeholder="Nombre de tu negocio" 
                                                value={answers.companyName}
                                                onChange={(e) => setAnswers(prev => ({ ...prev, companyName: e.target.value }))}
                                                autoComplete="off"
                                            />
                                            <label htmlFor="companyName">Nombre de tu Empresa / Negocio *</label>
                                        </div>

                                        <div className="floating-input">
                                            <input 
                                                type="text" 
                                                id="companyContact" 
                                                placeholder="Tu nombre" 
                                                value={answers.companyContact}
                                                onChange={(e) => setAnswers(prev => ({ ...prev, companyContact: e.target.value }))}
                                                autoComplete="off"
                                            />
                                            <label htmlFor="companyContact">Tu Nombre Completo *</label>
                                        </div>

                                        <div className="floating-input">
                                            <input 
                                                type="text" 
                                                id="companyWebsite" 
                                                placeholder="Web o redes sociales" 
                                                value={answers.companyWebsite}
                                                onChange={(e) => setAnswers(prev => ({ ...prev, companyWebsite: e.target.value }))}
                                                autoComplete="off"
                                            />
                                            <label htmlFor="companyWebsite">Web o Enlace de Redes Sociales (Opcional)</label>
                                        </div>
                                    </div>

                                    <div className="nav-controls">
                                        <button type="button" className="btn-back" onClick={() => { audioClick(); navigateTo(5); }}>
                                            <i data-lucide="arrow-left"></i> Volver
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`btn-action ${(!answers.companyName.trim() || !answers.companyContact.trim()) ? 'disabled' : ''}`}
                                            onClick={() => { audioClick(); navigateTo(7); }}
                                        >
                                            Siguiente <i data-lucide="arrow-right" size="16"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Slide 7: Budget */}
                            <div className="slide">
                                <StepOptionGrid 
                                    tag="Paso 07 / Inversión"
                                    title="Inversión estimada para la <span class='italic-glow'>infraestructura</span>"
                                    subtitle="Selecciona el rango de inversión asignado para el desarrollo y optimización de tu sistema."
                                    selectedValue={answers.budget}
                                    onSelect={(val) => handleSelectOption('budget', val)}
                                    onBack={() => { audioClick(); navigateTo(6); }}
                                    options={[
                                        { value: 'Inicial (Menos de $800 USD)', label: 'Menos de $800 USD', desc: 'Automatizaciones directas sencillas o una landing page inicial de prospección rápida.', diagramType: 'budget-basic' },
                                        { value: 'Profesional ($800 - $2,500 USD)', label: '$800 - $2,500 USD', desc: 'Sistema integral: bots de WhatsApp AI, CRM conectado y flujos en servidores activos dedicados.', diagramType: 'budget-pro' },
                                        { value: 'Corporativo (Más de $2,500 USD)', label: 'Más de $2,500 USD', desc: 'Arquitectura multiserver empresarial, agentes cognitivos con bases vectoriales y soporte.', diagramType: 'budget-corp' }
                                    ]}
                                />
                            </div>

                            {/* Slide 8: The Problem Text Area */}
                            <div className="slide">
                                <div className="glass-card">
                                    <ElectricBorder />
                                    <div className="question-header">
                                        <span className="question-tag">Paso 08 / Cuello de Botella</span>
                                        <h2 className="question-title">Describe el proceso que quieres <span className="italic-glow">delegar</span></h2>
                                        <p className="question-subtitle">Explica brevemente qué tarea repetitiva le delegarías a un robot si lo construyéramos hoy mismo.</p>
                                    </div>

                                    <div className="textarea-box">
                                        <textarea 
                                            id="problemDesc" 
                                            placeholder="Ejemplo: Todos los días recibo unos 30 mensajes por Marketplace. Tengo que preguntarles su nombre, qué producto quieren, cotizar el envío en una plantilla de Excel y agendar su cita en Google Calendar de forma manual. Pierdo unas 3 horas al día en esto..."
                                            value={answers.problem}
                                            onChange={(e) => setAnswers(prev => ({ ...prev, problem: e.target.value }))}
                                        />
                                        <div className="textarea-footer">
                                            <span>{answers.problem.length} / 400 caracteres recomendados</span>
                                            <span>Mínimo 15 caracteres</span>
                                        </div>
                                    </div>

                                    <div className="nav-controls">
                                        <button type="button" className="btn-back" onClick={() => { audioClick(); navigateTo(7); }}>
                                            <i data-lucide="arrow-left"></i> Volver
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`btn-action ${(answers.problem.trim().length < 15) ? 'disabled' : ''}`}
                                            onClick={() => { audioClick(); navigateTo(9); }}
                                        >
                                            Analizar Viabilidad <i data-lucide="activity" size="16"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Slide 9: Results Dashboard & Dial */}
                            <div className="slide">
                                <div className="glass-card">
                                    <ElectricBorder />
                                    <div className="question-header">
                                        <span className="question-tag">Diagnóstico Generado</span>
                                        <h2 className="question-title">Resultados de tu Diagnóstico <span className="italic-glow">Estratégico</span></h2>
                                        <p className="question-subtitle">Hemos evaluado tu madurez operativa. Este mapa guiará nuestra entrevista técnica.</p>
                                    </div>

                                    <div className="results-container">
                                        <div className="results-left">
                                            <div className="result-panel">
                                                <div className="panel-icon"><i data-lucide="building-2" size="20"></i></div>
                                                <div className="panel-content">
                                                    <span className="panel-label">Empresa</span>
                                                    <span className="panel-value">{answers.companyName || 'Tu Negocio'}</span>
                                                    <span className="panel-desc">Contacto: {answers.companyContact}</span>
                                                </div>
                                            </div>
                                            <div className="result-panel">
                                                <div className="panel-icon"><i data-lucide="rocket" size="20"></i></div>
                                                <div className="panel-content">
                                                    <span className="panel-label">Objetivo Principal</span>
                                                    <span className="panel-value">{answers.meta || 'No indicado'}</span>
                                                </div>
                                            </div>
                                            <div className="result-panel">
                                                <div className="panel-icon"><i data-lucide="cpu" size="20"></i></div>
                                                <div className="panel-content">
                                                    <span className="panel-label">Canal Técnico & Servers</span>
                                                    <span className="panel-value">{answers.api || 'No indicado'}</span>
                                                    <span className="panel-desc">{answers.server || 'No indicado'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="results-right">
                                            <div className="meter-box">
                                                <svg className="meter-svg" viewBox="0 0 160 160">
                                                    <defs>
                                                        <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#ff5e1e" />
                                                            <stop offset="100%" stopColor="#6366f1" />
                                                        </linearGradient>
                                                    </defs>
                                                    <circle className="meter-bg-circle" cx="80" cy="80" r="70"/>
                                                    {/* Circumference of r=70 is 440. Dynamic strokeDashoffset formula handles the fill bar. */}
                                                    <circle 
                                                        className="meter-fill-circle" 
                                                        cx="80" 
                                                        cy="80" 
                                                        r="70"
                                                        style={{ strokeDasharray: 440, strokeDashoffset: 440 - (score / 100) * 440 }}
                                                    />
                                                </svg>
                                                <div className="meter-value-txt">
                                                    {score}%
                                                    <span className="meter-value-sub">Viable</span>
                                                </div>
                                            </div>

                                            <span className="score-headline" style={{ color: diag.color }}>{diag.title}</span>
                                            <p className="score-explanation">{diag.text}</p>
                                            
                                            <button type="button" className="btn-submit-form" style={{ background: `linear-gradient(135deg, ${diag.color}, rgba(0,0,0,0.3))` }} onClick={submitFinalForm}>
                                                Solicitar Entrevista Técnica <i data-lucide="send" size="16"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="nav-controls">
                                        <button type="button" className="btn-back" onClick={() => { audioClick(); navigateTo(8); }}>
                                            <i data-lucide="arrow-left"></i> Volver a editar
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {showGameAlert && (
                        <div className="game-alert-backdrop">
                            <div className="game-alert-container">
                                <div className="game-alert-header">
                                    <div className="game-alert-title">[ SYSTEM DIAGNOSTIC COMPLETED ]</div>
                                    <div className="game-alert-dots">
                                        <span className="dot dot-red"></span>
                                        <span className="dot dot-yellow"></span>
                                        <span className="dot dot-green"></span>
                                    </div>
                                </div>
                                <div className="game-alert-body">
                                    <div className="game-alert-icon-box">
                                        <i data-lucide="check-circle-2" className="game-success-icon"></i>
                                    </div>
                                    <h3 className="game-alert-headline">DIAGNÓSTICO ENVIADO</h3>
                                    <div className="game-alert-msg">
                                        Gracias <span className="game-highlight">{answers.companyContact}</span>. Hemos recibido tus datos de <span className="game-highlight">{answers.companyName}</span> y nos pondremos en contacto contigo por Facebook/WhatsApp para agendar tu llamada técnica estratégica.
                                    </div>
                                </div>
                                <div className="game-alert-footer">
                                    <button type="button" className="game-btn-ok" onClick={handleGameClose}>
                                        PRESS START / CONTINUAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </React.Fragment>
            );
        }

        // Render application inside virtual DOM root
        
export default App;
