
import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';

interface StoryModeProps {
  language: Language;
  onComplete: (choice: 'ALIVE' | 'ZOMBIE') => void;
  onSkip: () => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ language, onComplete, onSkip }) => {
  const [introStep, setIntroStep] = useState(0); // 0: line1, 1: line2, 2: line3, 3: line4, 4: content
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const t = translations[language].story;
  const loadingText = translations[language].story.loading;
  const slides = t.slides;
  
  // INTRO SEQUENCE LOGIC
  useEffect(() => {
      const step1 = setTimeout(() => setIntroStep(1), 1500);
      const step2 = setTimeout(() => setIntroStep(2), 3000);
      const step3 = setTimeout(() => setIntroStep(3), 4500);
      const step4 = setTimeout(() => setIntroStep(4), 6000);
      
      return () => {
          clearTimeout(step1);
          clearTimeout(step2);
          clearTimeout(step3);
          clearTimeout(step4);
      };
  }, []);

  const currentSlide = slides[currentIndex];
  
  // Typewriter effect for slides
  useEffect(() => {
    if (introStep < 4 || !currentSlide) return;
    
    let charIndex = 0;
    setDisplayText('');
    
    const intervalId = setInterval(() => {
      if (charIndex < currentSlide.text.length) {
        setDisplayText(prev => prev + currentSlide.text[charIndex]);
        charIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 30); // Speed of typing

    return () => clearInterval(intervalId);
  }, [currentIndex, currentSlide, introStep]);

  const handleNext = () => {
    if (currentIndex < slides.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const isChoiceScreen = currentIndex === slides.length;

  // RENDER INTRO SEQUENCE
  if (introStep < 4) {
      return (
          <div className="fixed inset-0 z-[60] bg-black text-green-500 font-mono flex flex-col items-center justify-center p-8 text-xs md:text-sm tracking-widest leading-loose">
              <div className="w-full max-w-md">
                  <div className="mb-2">
                      <span className="text-green-700 mr-2">{'>'}</span> 
                      {loadingText.line1} 
                      {introStep === 0 && <span className="animate-pulse">_</span>}
                  </div>
                  
                  {introStep >= 1 && (
                      <div className="mb-2">
                          <span className="text-green-700 mr-2">{'>'}</span> 
                          {loadingText.line2}
                          {introStep === 1 && <span className="animate-pulse">_</span>}
                      </div>
                  )}

                  {introStep >= 2 && (
                      <div className="mb-2">
                          <span className="text-green-700 mr-2">{'>'}</span> 
                          {loadingText.line3}
                          {introStep === 2 && <span className="animate-pulse">_</span>}
                      </div>
                  )}

                  {introStep >= 3 && (
                      <div className="mb-2 text-green-300 font-bold border-b border-green-700 pb-2">
                          <span className="text-green-700 mr-2">{'>'}</span> 
                          {loadingText.line4}
                          <span className="animate-pulse">_</span>
                      </div>
                  )}
                  
                  {/* Decorative Scanline */}
                  <div className="fixed top-0 left-0 w-full h-1 bg-green-500/20 opacity-20 animate-scanline pointer-events-none"></div>
              </div>
          </div>
      );
  }

  // RENDER MAIN STORY
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 text-cyan-400 font-mono flex flex-col animate-fade-in">
      
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '30px 30px'}}>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-4 border-b border-cyan-800 bg-slate-900/90">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-cyan-500 rounded-full flex items-center justify-center font-bold">S.H.</div>
            <span className="tracking-[0.3em] text-xs">ARCHIVE // FILE 0-Z</span>
        </div>
        <button onClick={onSkip} className="text-xs border border-cyan-800 px-3 py-1 hover:bg-cyan-900/50">
            {t.skip}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 overflow-hidden">
        
        {!isChoiceScreen ? (
            <div className="max-w-4xl w-full flex flex-col gap-8">
                {/* Visual Placeholder / Image */}
                <div className="w-full aspect-video bg-slate-900 border-2 border-cyan-900 relative flex items-center justify-center group shadow-[0_0_50px_rgba(6,182,212,0.1)] overflow-hidden">
                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyan-600 z-20"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-cyan-600 z-20"></div>
                    
                    {/* Render Image or Placeholder */}
                    {currentSlide?.image.startsWith('http') ? (
                        <img 
                            src={currentSlide.image} 
                            alt="Visual Record" 
                            className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-all duration-700 ease-in-out"
                        />
                    ) : (
                        <div className="text-center opacity-50">
                            <svg className="w-24 h-24 mx-auto mb-2 text-cyan-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs tracking-widest text-cyan-800">VISUAL RECORD: {currentSlide?.image.toUpperCase()}</p>
                        </div>
                    )}

                    {/* Scanline overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-full w-full animate-scanline pointer-events-none z-10"></div>
                </div>

                {/* Text Area */}
                <div className="min-h-[150px] bg-slate-900/80 p-6 border-l-4 border-cyan-500 shadow-lg">
                    <p className="text-lg md:text-xl leading-relaxed whitespace-pre-line drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                        {displayText}<span className="animate-pulse">_</span>
                    </p>
                </div>
            </div>
        ) : (
            /* CHOICE SCREEN */
            <div className="max-w-4xl w-full animate-fade-in">
                <h2 className="text-3xl font-bold text-center mb-12 tracking-[0.5em] text-white">{t.choose}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Option A: ALIVE */}
                    <button 
                        onClick={() => onComplete('ALIVE')}
                        className="group relative p-8 border-2 border-cyan-600 bg-slate-900 hover:bg-cyan-900/20 transition-all hover:scale-105"
                    >
                        <div className="text-4xl mb-4 text-cyan-500 group-hover:text-white transition-colors">🛡️</div>
                        <h3 className="text-xl font-bold mb-4 tracking-widest text-cyan-300">{t.optionA}</h3>
                        <p className="text-sm text-gray-400 italic">
                            "Aún respiro. Aún sangro... Saquearé las ruinas de S.H.I.E.L.D..."
                        </p>
                    </button>

                    {/* Option B: ZOMBIE */}
                    <button 
                         onClick={() => onComplete('ZOMBIE')}
                        className="group relative p-8 border-2 border-lime-600 bg-slate-900 hover:bg-lime-900/20 transition-all hover:scale-105"
                    >
                        <div className="text-4xl mb-4 text-lime-500 group-hover:text-white transition-colors">🧟</div>
                        <h3 className="text-xl font-bold mb-4 tracking-widest text-lime-300">{t.optionB}</h3>
                        <p className="text-sm text-gray-400 italic">
                            "El dolor ha desaparecido... Solo queda el Hambre. Y el Poder."
                        </p>
                    </button>
                </div>
            </div>
        )}

      </div>

      {/* Footer Controls */}
      {!isChoiceScreen && (
          <div className="p-6 flex justify-between items-center bg-slate-900/90 border-t border-cyan-800">
            <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className={`px-4 py-2 border border-cyan-700 ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-cyan-900/50'}`}
            >
                {t.prev}
            </button>

            <div className="text-xs text-cyan-700">
                SLIDE {currentIndex + 1} / {slides.length}
            </div>

            <button 
                onClick={handleNext} 
                className="px-6 py-2 bg-cyan-900/50 border border-cyan-500 text-white font-bold hover:bg-cyan-800 transition-colors"
            >
                {t.next}
            </button>
          </div>
      )}

    </div>
  );
};
