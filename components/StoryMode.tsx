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
  
  // NUEVO: Estado para bloquear clics rápidos
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [selection, setSelection] = useState<'ALIVE' | 'ZOMBIE' | null>(null);
  
  const t = translations[language].story;
  const slides = t.slides;
  
  // CORRECCIÓN: Aseguramos que si el índice se pasa, se quede en la pantalla de elección
  const isChoiceScreen = currentIndex >= slides.length;

  useEffect(() => {
      const timer = setTimeout(() => setIsFolderOpen(true), 800);
      return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    // BLOQUEO: Si ya se está animando o estamos al final, ignorar clic
    if (isAnimating || isChoiceScreen) return;

    setIsAnimating(true);
    setPageTurn('turning-next');
    
    setTimeout(() => {
        setCurrentIndex(prev => {
            // Doble seguridad para no pasarnos del array
            const next = prev + 1;
            return next > slides.length ? slides.length : next;
        });
        setPageTurn('');
        setIsAnimating(false);
    }, 600);
  };

  const handlePrev = () => {
    // BLOQUEO: Si ya se está animando o estamos al principio
    if (isAnimating || currentIndex === 0) return;

    setIsAnimating(true);
    setPageTurn('turning-prev');
    
    setTimeout(() => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
        setPageTurn('');
        setIsAnimating(false);
    }, 600);
  };

  const handleChoice = (choice: 'ALIVE' | 'ZOMBIE') => {
      if (selection) return; // Evitar doble selección
      setSelection(choice);
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
                      {/* ALIVE */}
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
                          {selection === 'ALIVE' && (
                              <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-[1px]">
                                  <div className="border-4 border-blue-900 text-blue-900 rounded-full w-40 h-40 flex flex-col items-center justify-center rotate-[-15deg] opacity-0 animate-[stamp_0.3s_ease-in_forwards] shadow-xl" style={{maskImage: 'url(https://www.transparenttextures.com/patterns/grunge-wall.png)'}}>
                                      <span className="text-3xl font-black tracking-tighter">APPROVED</span>
                                      <span className="text-[10px] font-bold tracking-widest mt-1">DIRECTOR FURY</span>
                                  </div>
                              </div>
                          )}
                      </button>

                      {/* ZOMBIE */}
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
                          {selection === 'ZOMBIE' && (
                              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
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

      // SEGURIDAD: Si por alguna razón el índice falla, no renderizar nada para evitar crash
      const slide = slides[currentIndex];
      if (!slide) return null;

      const rotation = currentIndex % 2 === 0 ? '-rotate-2' : 'rotate-1';

      return (
          <div className="flex flex-col md:flex-row h-full w-full bg-white shadow-inner">
              
              {/* IZQUIERDA: SUPERFICIE DE LA CARPETA CON FOTO SUJETA */}
              <div className="w-full md:w-[55%] h-1/2 md:h-full relative bg-[#2d3748] border-r border-slate-400 flex items-center justify-center overflow-hidden shadow-[inset_-10px_0_20px_rgba(0,0,0,0.3)]">
                  
                  {/* Textura de la carpeta interior */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>

                  {/* CONTENEDOR DE LA FOTO (POLAROID / PAPEL FOTOGRÁFICO) */}
                  <div className={`relative bg-white p-3 pb-8 shadow-2xl transform transition-all duration-500 ease-out hover:rotate-0 hover:scale-105 cursor-zoom-in group ${rotation} max-w-[85%] max-h-[85%] flex flex-col`}>
                      
                      {/* CLIP METÁLICO (CSS PURO) */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-16 rounded-full border-4 border-gray-300 z-20 shadow-md bg-transparent pointer-events-none"></div>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-10 bg-[#2d3748] z-10 pointer-events-none"></div> {/* Tapa la parte trasera del clip */}

                      {/* IMAGEN */}
                      <div className="relative overflow-hidden border border-gray-200 bg-black">
                          <img 
                            src={slide.image} 
                            alt="Evidence" 
                            className="w-full h-full object-contain max-h-[60vh]" 
                          />
                          
                          {/* Efecto Glossy (Brillo de papel fotográfico) */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
                      </div>

                      {/* PIE DE FOTO (Escrito a mano o máquina) */}
                      <div className="mt-3 flex justify-between items-end px-2">
                          <div className="font-mono text-[10px] text-gray-500">FIG. {currentIndex + 1}A</div>
                          <div className="font-handwriting text-sm text-blue-900 rotate-[-1deg]" style={{ fontFamily: '"Courier New", monospace' }}>
                              Evidence #{1024 + currentIndex}
                          </div>
                      </div>
                  </div>
              </div>

              {/* DERECHA: INFORME MECANOGRAFIADO */}
              <div className="w-full md:w-[45%] h-1/2 md:h-full p-6 md:p-10 flex flex-col bg-[#fdfbf7] relative">
                  {/* Textura de papel */}
                  <div className="absolute inset-0 opacity-40 pointer-events-none" style={{backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 2rem'}}></div>

                  <div className="relative z-10 flex-1 overflow-y-auto pr-2">
                      <div className="flex justify-between items-end border-b-2 border-slate-800 pb-2 mb-6">
                          <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Incident Report</h4>
                              <h2 className="text-xl font-black text-slate-900 font-mono">FILE #{1024 + currentIndex}</h2>
                          </div>
                          <div className="text-right">
                              <div className="text-[10px] font-mono text-slate-400">DATE: 2025-10-31</div>
                              <div className="text-xs font-bold text-red-700 border-2 border-red-700 px-1 inline-block mt-1 rotate-[-2deg] opacity-80">TOP SECRET</div>
                          </div>
                      </div>

                      <div className="font-mono text-sm md:text-base text-slate-900 leading-relaxed space-y-4 text-justify font-medium">
                          {slide.text.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                          ))}
                      </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-300 flex justify-between items-center">
                      <div className="text-[10px] font-bold text-slate-400 tracking-widest">
                          S.H.I.E.L.D. ARCHIVES // DO NOT COPY
                      </div>
                      <div className="text-xs font-mono text-slate-500">
                          PG. {currentIndex + 1}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#0f172a] flex items-center justify-center perspective-[1500px] overflow-hidden">
      
      <style>{`
        @keyframes stamp {
          0% { opacity: 0; transform: scale(2) rotate(-15deg); }
          100% { opacity: 0.8; transform: scale(1) rotate(-15deg); }
        }
      `}</style>

      {/* Mesa de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)]"></div>
      <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

      <button 
        onClick={onSkip} 
        className="absolute top-8 right-8 z-50 text-cyan-500 text-xs font-bold tracking-[0.2em] hover:text-white transition-colors border border-cyan-900 px-4 py-2 bg-slate-900/80 backdrop-blur"
      >
        SKIP INTRO &gt;&gt;
      </button>

      {/* CARPETA PRINCIPAL */}
      <div 
        className={`relative w-[95%] h-[85%] max-w-6xl bg-[#d1d5db] shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-1000 ease-out transform-style-3d rounded-r-md border-l-8 border-slate-400
            ${isFolderOpen ? 'rotate-x-0 translate-y-0 opacity-100' : 'rotate-x-20 translate-y-[100px] opacity-0'}
        `}
      >
          {/* Pestaña de la carpeta */}
          <div className="absolute -top-6 left-0 w-48 h-8 bg-[#9ca3af] rounded-t-lg border-t border-x border-white/20 flex items-center px-4 shadow-inner">
              <span className="text-[10px] font-bold text-slate-800 tracking-widest">PROJECT: LAZARUS</span>
          </div>

          <div className="w-full h-full bg-white relative overflow-hidden flex rounded-r-sm">
              {renderContent()}
              
              {pageTurn && (
                  <div className={`absolute inset-0 bg-black/10 z-50 transition-opacity duration-500 ${pageTurn ? 'opacity-100' : 'opacity-0'}`}></div>
              )}
          </div>

          {!isChoiceScreen && isFolderOpen && (
              <div className="absolute -bottom-16 w-full flex justify-center gap-4">
                  <button 
                      onClick={handlePrev}
                      disabled={currentIndex === 0 || isAnimating}
                      className={`w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-white hover:bg-cyan-600 transition-all ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                      ←
                  </button>
                  <div className="h-12 px-6 bg-slate-900/90 border border-slate-700 rounded-full flex items-center justify-center text-cyan-400 font-mono text-xs tracking-widest shadow-lg">
                      SLIDE {currentIndex + 1} / {slides.length}
                  </div>
                  <button 
                      onClick={handleNext}
                      disabled={isAnimating}
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