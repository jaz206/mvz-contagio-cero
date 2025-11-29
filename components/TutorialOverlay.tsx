
import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';

interface TutorialStep {
    targetId: string | null; // Null for center screen message
    translationKey: keyof typeof translations.es.tutorial;
    position?: 'left' | 'right' | 'top' | 'bottom' | 'center';
}

interface TutorialOverlayProps {
    language: Language;
    onComplete: () => void;
    onStepChange?: (stepKey: string) => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ language, onComplete, onStepChange }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const t = translations[language].tutorial;

    // Define steps logic - EXTENDED FOR FULL ONBOARDING
    const steps: TutorialStep[] = [
        { targetId: null, translationKey: 'welcome', position: 'center' },
        { targetId: 'tutorial-map', translationKey: 'map_zones', position: 'center' },
        { targetId: 'hulk-token', translationKey: 'hulk', position: 'center' }, 
        { targetId: 'tutorial-sidebar-missions', translationKey: 'missions', position: 'right' },
        { targetId: 'tutorial-bunker-btn', translationKey: 'bunker_entry', position: 'right' },
        { targetId: 'tutorial-bunker-roster', translationKey: 'roster', position: 'right' },
        { targetId: 'tutorial-bunker-file', translationKey: 'file', position: 'left' },
        { targetId: 'tutorial-recruit-btn', translationKey: 'recruit', position: 'left' }, // Changed to left to avoid edge overflow
        { targetId: null, translationKey: 'finish', position: 'center' },
    ];

    const currentStep = steps[stepIndex];
    // Helper to get text safe from key
    const stepText = t[currentStep.translationKey as keyof typeof t] as { title: string, text: string };

    useEffect(() => {
        const updateRect = () => {
            if (currentStep.targetId) {
                const element = document.getElementById(currentStep.targetId);
                if (element) {
                    setTargetRect(element.getBoundingClientRect());
                } else {
                    setTargetRect(null); 
                }
            } else {
                setTargetRect(null);
            }
        };

        setTimeout(updateRect, 300); // Delay for transitions
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
    }, [stepIndex, currentStep]);

    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            const nextIndex = stepIndex + 1;
            setStepIndex(nextIndex);
            if (onStepChange) {
                onStepChange(steps[nextIndex].translationKey);
            }
        } else {
            onComplete();
        }
    };

    // Advanced Positioning Logic
    const getBoxStyle = (): React.CSSProperties => {
        // 1. Center Position (Default or Forced)
        if (!targetRect || !currentStep.targetId || currentStep.position === 'center') {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '450px'
            };
        }

        // 2. Mobile Fallback (Force Bottom Sheet style if screen is narrow)
        if (window.innerWidth < 768) {
            return {
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '400px'
            };
        }

        // 3. Dynamic Positioning relative to Target
        const gap = 20;
        const verticalCenter = targetRect.top + (targetRect.height / 2) - 100; // Shift up slightly
        const safeTop = Math.max(20, Math.min(window.innerHeight - 300, verticalCenter));

        // Position: LEFT (Anchored to the right side of the screen relative to target)
        if (currentStep.position === 'left') {
            return {
                top: `${safeTop}px`,
                right: `${window.innerWidth - targetRect.left + gap}px`, // Push from right edge
                width: '350px'
            };
        }

        // Position: RIGHT (Anchored to the left side relative to target)
        return {
            top: `${safeTop}px`,
            left: `${targetRect.right + gap}px`,
            width: '350px'
        };
    };

    return (
        <div className={`fixed inset-0 z-[100] transition-all duration-500 ${targetRect ? 'bg-transparent' : 'bg-slate-950/80 backdrop-blur-sm'}`}>
            
            {/* 1. TARGET HIGHLIGHTER (Giant Shadow Cutout) */}
            {targetRect && (
                <div 
                    className="absolute border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-all duration-300 pointer-events-none"
                    style={{
                        top: targetRect.top - 5,
                        left: targetRect.left - 5,
                        width: targetRect.width + 10,
                        height: targetRect.height + 10,
                        // This giant shadow creates the "dimmed" background effect everywhere EXCEPT inside this box
                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.85)' 
                    }}
                >
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-400"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyan-400"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-400"></div>
                    
                    {/* Connector Line */}
                    <div className={`absolute top-1/2 w-10 h-[1px] bg-cyan-500 hidden md:block ${currentStep.position === 'left' ? '-right-10' : '-left-10'}`}></div>
                </div>
            )}

            {/* 2. TEXT BOX */}
            <div 
                className="absolute p-6 bg-slate-900/95 border-l-4 border-cyan-500 shadow-2xl transition-all duration-500"
                style={getBoxStyle()}
            >
                <h3 className="text-xl font-bold text-cyan-300 mb-2 tracking-widest border-b border-cyan-800 pb-2">
                    {stepText.title}
                </h3>
                <p className="text-sm text-cyan-100/90 leading-relaxed font-mono mb-6">
                    {stepText.text}
                </p>

                <div className="flex justify-between items-center gap-4">
                    <button 
                        onClick={onComplete}
                        className="text-xs text-gray-500 hover:text-cyan-400 underline"
                    >
                        {t.skip}
                    </button>
                    <button 
                        onClick={handleNext}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                        {stepIndex === steps.length - 1 ? t.finishBtn : t.next}
                    </button>
                </div>
            </div>

        </div>
    );
};
