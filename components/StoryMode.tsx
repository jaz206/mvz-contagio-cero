import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';

interface StoryModeProps {
  language: Language;
  onComplete: (choice: 'ALIVE' | 'ZOMBIE') => void;
  onSkip: () => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ language, onComplete, onSkip }) => {
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pageTurn, setPageTurn] = useState(''); 
  
  // Nuevo estado para manejar la animación de firma/sangre
  const [selection, setSelection] = useState<'ALIVE' | 'ZOMBIE' | null>(null);
  
  const t = translations[language].story;
  const slides = t.slides;
  const isChoiceScreen = currentIndex === slides.length;

  useEffect(() => {
      const timer = setTimeout(() => setIsFolderOpen(true), 800);
      return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setPageTurn('turning-next');
    setTimeout(() => {
        if (currentIndex < slides.length) {
            setCurrentIndex(prev => prev + 1);
            setPageTurn('');
        }
    }, 600);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
        setPageTurn('turning-prev');
        setTimeout(() => {
            setCurrentIndex(prev => prev - 1);
            setPageTurn('');
        }, 600);
    }
  };

  // Manejador de la elección con retraso para la animación
  const handleChoice = (choice: 'ALIVE' | 'ZOMBIE') => {
      setSelection(choice);
      // Esperar 2 segundos para ver la firma o la sangre antes de entrar
      setTimeout(() => {
          onComplete(choice);
      }, 2000);
  };

  const renderContent = () => {
      if (isChoiceScreen) {
          return (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10"></div>
                  
                  <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Protocol Selection</h2>
                  <div className="w-24 h-1 bg-red-600 mb-8"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl z-10">
                      
                      {/* --- OPCIÓN ALIVE (SHIELD) --- */}
                      <button 
                          onClick={() => handleChoice('ALIVE')}
                          disabled={selection !== null}
                          className={`group relative h-64 bg-white border border-slate-300 shadow-xl transition-all overflow-hidden flex flex-col
                              ${selection === 'ZOMBIE' ? 'opacity-50 grayscale blur-sm' : 'hover:shadow-2xl hover:-translate-y-2'}
                          `}
                      >
                          <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors"></div>
                          <div className="h-2 w-full bg-blue-600"></div>
                          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                              <span className="text-5xl mb-4 filter drop-shadow-md">🛡️</span>
                              <h3 className="text-2xl font-bold text-slate-800">S.H.I.E.L.D. INITIATIVE</h3>
                              <p className="text-xs text-slate-500 mt-2 font-mono">"Save what remains."</p>
                          </div>
                          <div className="p-3 bg-slate-50 border-t border-slate-200 w-full text-center">
                              <span className="text-[10px] font-bold text-blue-700 tracking-widest">AUTHORIZE DEPLOYMENT</span>
                          </div>

                          {/* EFECTO DE FIRMA Y SELLO (Solo si se selecciona ALIVE) */}
                          {selection === 'ALIVE' && (
                              <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-[1px]">
                                  {/* Sello */}
                                  <div className="border-4 border-blue-900 text-blue-900 rounded-full w-40 h-40 flex flex-col items-center justify-center rotate-[-15deg] opacity-0 animate-[stamp_0.3s_ease-in_forwards] shadow-xl" style={{maskImage: 'url(https://www.transparenttextures.com/patterns/grunge-wall.png)'}}>
                                      <span className="text-3xl font-black tracking-tighter">APPROVED</span>
                                      <span className="text-[10px] font-bold tracking-widest mt-1">DIRECTOR FURY</span>
                                      <div className="w-full h-px bg-blue-900 my-1"></div>
                                      <span className="text-[8px] font-mono">LEVEL 10 CLEARANCE</span>
                                  </div>
                                  {/* Firma */}
                                  <div className="absolute bottom-16 right-10 text-4xl text-blue-800 font-bold opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]" style={{ fontFamily: '"Brush Script MT", cursive' }}>
                                      Nick Fury
                                  </div>
                              </div>
                          )}
                      </button>

                      {/* --- OPCIÓN ZOMBIE (HIVE) --- */}
                      <button 
                           onClick={() => handleChoice('ZOMBIE')}
                           disabled={selection !== null}
                          className={`group relative h-64 bg-white border border-slate-300 shadow-xl transition-all overflow-hidden flex flex-col
                              ${selection === 'ALIVE' ? 'opacity-50 grayscale blur-sm' : 'hover:shadow-2xl hover:-translate-y-2'}
                          `}
                      >
                          <div className="absolute inset-0 bg-green-600/5 group-hover:bg-green-600/10 transition-colors"></div>
                          <div className="h-2 w-full bg-green-600"></div>
                          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                              <span className="text-5xl mb-4 filter drop-shadow-md">🧟</span>
                              <h3 className="text-2xl font-bold text-slate-800">THE HUNGER</h3>
                              <p className="text-xs text-slate-500 mt-2 font-mono">"Consume everything."</p>
                          </div>
                          <div className="p-3 bg-slate-50 border-t border-slate-200 w-full text-center">
                              <span className="text-[10px] font-bold text-green-700 tracking-widest">UNLEASH PATHOGEN</span>
                          </div>

                          {/* EFECTO DE SANGRE (Solo si se selecciona ZOMBIE) */}
                          {selection === 'ZOMBIE' && (
                              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                                  {/* Mancha de sangre SVG */}
                                  <svg viewBox="0 0 200 200" className="w-full h-full opacity-0 animate-[splatter_0.2s_ease-in_forwards] mix-blend-multiply">
                                      <path fill="#8a0303" d="M98.6,18.5c-2.6,0.9-6.6,4.8-6.6,8.9c0,5.6-2.6,12.8-6.9,12.8c-2.3,0-4.6-2.6-5.6-5.9c-1.3-4.3-5.3-6.3-8.6-4.6
                                      c-3.6,1.6-4.3,7.3-1.3,10.6c2.3,2.6,2.3,6.3,0,8.9c-3.3,3.6-9.6,2.6-11.9-1.7c-1.6-3.3-6.3-4.3-9.6-2c-3.6,2.3-3.6,7.9,0,10.2
                                      c4.3,2.6,4.3,8.9,0,11.6c-2.6,1.6-6.3,1.3-8.6-1.3c-3.3-3.6-9.2-2.3-10.9,2.3c-1.3,3.6,1.3,7.6,5,7.6c4.6,0,7.3,4.6,5.3,8.6
                                      c-1.3,2.6-5.3,3.6-8.3,2c-4.3-2.3-9.2,1.3-8.9,6.3c0.3,3.6,4,6.3,7.6,5.3c4.6-1.3,8.9,2.3,8.3,6.9c-0.3,3.3-4,5.6-7.3,4.6
                                      c-4.6-1.3-8.9,2.6-7.9,7.3c0.7,3.3,4.6,5.3,7.9,4c4.3-1.6,8.9,1.6,8.9,6.3c0,3.3-3.3,6.3-6.6,5.6c-4.6-0.7-8.3,3.6-6.6,7.9
                                      c1.3,3.3,5.6,4.3,8.6,2.3c3.6-2.3,8.3,0.3,8.3,4.6c0,3.3-3.3,6.3-6.6,5.6c-4.6-0.7-8.3,3.6-6.6,7.9c1.3,3.3,5.6,4.3,8.6,2.3
                                      c3.6-2.3,8.3,0.3,8.3,4.6c0,3.3-3.3,6.3-6.6,5.6c-4.6-0.7-8.3,3.6-6.6,7.9c1.3,3.3,5.6,4.3,8.6,2.3c3.6-2.3,8.3,0.3,8.3,4.6
                                      c0,3.3-3.3,6.3-6.6,5.6c-4.6-0.7-8.3,3.6-6.6,7.9c1.6,4,6.9,4.6,9.9,1.3c2.6-3,7.6-2.3,9.6,1.3c1.6,3,6.3,3.6,9.2,1.3
                                      c3.6-3,9.2-0.7,9.9,4c0.7,3.6,5.3,5.6,8.9,3.6c4-2.3,8.9,0.7,8.9,5.3c0,3.6,4,6.3,7.6,5.3c4.6-1.3,8.9,2.3,8.3,6.9
                                      c-0.3,3.3,3.3,6.3,6.6,5.3c4.3-1.3,8.3,2.3,7.3,6.6c-0.7,3.3,2.3,6.6,5.6,5.9c4.3-0.7,7.9,3,6.6,7.3c-1.3,4.3,2.3,8.3,6.6,7.3
                                      c4.3-1,7.9,2.6,6.6,6.9c-1.3,4.3,2.3,8.3,6.6,7.3c4.3-1,7.9,2.6,6.6,6.9c-1.3,4.3,2.3,8.3,6.6,7.3c4.3-1,7.9,2.6,6.6,6.9
                                      c-1.3,4.3,2.3,8.3,6.6,7.3c4.3-1,7.9,2.6,6.6,6.9c-1.3,4.3,2.3,8.3,6.6,7.3c4.3-1,7.9,2.6,6.6,6.9c-1.3,4.3,2.3,8.3,6.6,7.3
                                      c4.3-1,7.9,2.6,6.6,6.9"/>
                                  </svg>
                                  {/* Texto de infección */}
                                  <div className="absolute text-4xl font-black text-red-900 tracking-widest rotate-12 border-4 border-red-900 p-4 opacity-0 animate-[stamp_0.3s_ease-in_0.2s_forwards]">
                                      INFECTED
                                  </div>
                              </div>
                          )}
                      </button>
                  </div>
              </div>
          );
      }

      const slide = slides[currentIndex];

      return (
          <div className="flex flex-col md:flex-row h-full w-full bg-white shadow-inner">
              
              {/* IZQUIERDA: VISOR DE IMAGEN (55%) */}
              <div className="w-full md:w-[55%] h-1/2 md:h-full relative bg-[#0a0a0a] border-r border-slate-300 flex items-center justify-center overflow-hidden">
                  
                  {/* Fondo de cuadrícula técnica */}
                  <div className="absolute inset-0 opacity-20" 
                       style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                  </div>

                  {/* La Imagen en sí (Ajustada para verse entera) */}
                  <img 
                    src={slide.image} 
                    alt="Visual Intel" 
                    className="max-w-full max-h-full object-contain shadow-2xl relative z-10" 
                  />
                  
                  {/* Overlay Digital (HUD) */}
                  <div className="absolute inset-0 pointer-events-none z-20">
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/30"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/30"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/30"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/30"></div>
                      
                      <div className="absolute top-4 left-14 text-[8px] text-cyan-400 font-mono bg-black/80 px-2 py-0.5 rounded border border-cyan-900/50">
                          IMG_SRC: SAT_V4 // RES: 8K // NO_CROP
                      </div>
                      <div className="absolute bottom-4 right-14 text-[8px] text-red-500 font-mono font-bold animate-pulse bg-black/80 px-2 py-0.5 rounded border border-red-900/50">
                          ● LIVE FEED RECORDING
                      </div>
                  </div>
              </div>

              {/* DERECHA: TEXTO DEL INFORME (45%) */}
              <div className="w-full md:w-[45%] h-1/2 md:h-full p-6 md:p-10 flex flex-col bg-[#f8f9fa] relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg" className="w-3/4 rotate-[-30deg]" />
                  </div>

                  <div className="relative z-10 flex-1 overflow-y-auto pr-2">
                      <div className="flex justify-between items-end border-b-2 border-slate-800 pb-2 mb-6">
                          <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Incident Report</h4>
                              <h2 className="text-xl font-black text-slate-900 font-mono">FILE #{1024 + currentIndex}</h2>
                          </div>
                          <div className="text-right">
                              <div className="text-[10px] font-mono text-slate-400">DATE: 2025-10-31</div>
                              <div className="text-xs font-bold text-red-700 border border-red-700 px-1 inline-block mt-1">CLASSIFIED</div>
                          </div>
                      </div>

                      <div className="font-mono text-sm md:text-base text-slate-800 leading-relaxed space-y-4 text-justify">
                          {slide.text.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                          ))}
                      </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-300 flex justify-between items-center">
                      <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800 animate-pulse"></div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 tracking-widest">
                          S.H.I.E.L.D. GLOBAL DATABASE
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#0f172a] flex items-center justify-center perspective-[1500px] overflow-hidden">
      
      {/* Estilos para las animaciones personalizadas */}
      <style>{`
        @keyframes stamp {
          0% { opacity: 0; transform: scale(2) rotate(-15deg); }
          100% { opacity: 0.8; transform: scale(1) rotate(-15deg); }
        }
        @keyframes splatter {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 0.9; transform: scale(1.2); }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)]"></div>
      <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

      <button 
        onClick={onSkip} 
        className="absolute top-8 right-8 z-50 text-cyan-500 text-xs font-bold tracking-[0.2em] hover:text-white transition-colors border border-cyan-900 px-4 py-2 bg-slate-900/80 backdrop-blur"
      >
        SKIP INTRO >>
      </button>

      <div 
        className={`relative w-[95%] h-[85%] max-w-6xl bg-[#e2e8f0] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-out transform-style-3d
            ${isFolderOpen ? 'rotate-x-0 translate-y-0 opacity-100' : 'rotate-x-20 translate-y-[100px] opacity-0'}
        `}
      >
          <div className="absolute -top-6 left-0 w-48 h-8 bg-[#cbd5e1] rounded-t-lg border-t border-x border-white/50 flex items-center px-4">
              <span className="text-[10px] font-bold text-slate-600 tracking-widest">PROJECT: LAZARUS</span>
          </div>

          <div className="w-full h-full bg-white relative overflow-hidden flex">
              {renderContent()}
              
              {pageTurn && (
                  <div className={`absolute inset-0 bg-black/10 z-50 transition-opacity duration-500 ${pageTurn ? 'opacity-100' : 'opacity-0'}`}></div>
              )}
          </div>

          {!isChoiceScreen && isFolderOpen && (
              <div className="absolute -bottom-16 w-full flex justify-center gap-4">
                  <button 
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className={`w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-white hover:bg-cyan-600 transition-all ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                      ←
                  </button>
                  <div className="h-12 px-6 bg-slate-900/90 border border-slate-700 rounded-full flex items-center justify-center text-cyan-400 font-mono text-xs tracking-widest">
                      SLIDE {currentIndex + 1} / {slides.length}
                  </div>
                  <button 
                      onClick={handleNext}
                      className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-white hover:bg-cyan-600 transition-all"
                  >
                      →
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};