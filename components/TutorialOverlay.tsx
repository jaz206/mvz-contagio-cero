
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
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ language, onComplete }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const t = translations[language].tutorial;

    // Define steps logic
    const steps: TutorialStep[] = [
        { targetId: null, translationKey: 'welcome', position: 'center' },
        { targetId: 'tutorial-bunker-btn', translationKey: 'bunker', position: 'right' },
        { targetId: 'tutorial-sidebar-missions', translationKey: 'missions', position: 'right' },
        { targetId: 'tutorial-threat-level', translationKey: 'threat', position: 'right' },
        { targetId: 'tutorial-map', translationKey: 'map', position: 'center' },
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
                    setTargetRect(null); // Element not found/rendered yet
                }
            } else {
                setTargetRect(null);
            }
        };

        // Delay slightly to ensure render
        setTimeout(updateRect, 100);
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
    }, [stepIndex, currentStep]);

    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] transition-all duration-500 ${targetRect ? 'bg-transparent' : 'bg-slate-950/80 backdrop-blur-sm'}`}>
            
            {/* 1. TARGET HIGHLIGHTER (The "Hole" or "Frame") */}
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
                    {/* Decorative Corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-400"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyan-400"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-400"></div>
                    
                    {/* Connecting Line Animation (CSS only) */}
                    <div className="absolute top-1/2 -right-20 w-20 h-[1px] bg-cyan-500 hidden md:block"></div>
                </div>
            )}

            {/* 2. TEXT BOX */}
            <div 
                className={`absolute p-6 max-w-md bg-slate-900/95 border-l-4 border-cyan-500 shadow-2xl transition-all duration-500
                    ${!targetRect ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
                `}
                style={targetRect ? {
                    // Primitive positioning logic - can be improved with libraries like Popper.js
                    top: Math.max(20, Math.min(window.innerHeight - 200, targetRect.top + (targetRect.height/2) - 50)),
                    left: targetRect.left > window.innerWidth / 2 
                        ? targetRect.left - 340 // Show on left if target is on right
                        : targetRect.right + 40 // Show on right if target is on left
                } : {}}
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
                        {stepIndex === steps.length - 1 ? t.finish : t.next}
                    </button>
                </div>
            </div>

        </div>
    );
};
