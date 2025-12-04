import React from 'react';

interface NewsTickerProps {
    alignment: 'ALIVE' | 'ZOMBIE';
}

const NEWS_ALIVE = [
    "⚠ ALERTA: Horda masiva detectada moviéndose hacia la Costa Este.",
    "📡 COMUNICACIONES: La señal del Helicarrier es débil pero constante.",
    "🧪 CIENCIA: Reed Richards solicita muestras de tejido necrótico nivel 5.",
    "🛡️ SHIELD: Se buscan reclutas con inmunidad psíquica para operación en Genosha.",
    "⚠ URGENTE: Evacuar sector 7, Hulk ha sido avistado.",
    "👁️ VIGILANCIA: Satélites detectan actividad inusual en Latveria.",
    "💊 SUMINISTROS: Convoy de medicinas emboscado en la Ruta 66."
];

const NEWS_ZOMBIE = [
    "🧠 HAMBRE: La reserva de carne en Nueva York se agota.",
    "🍖 CAZA: Detectado asentamiento humano en los túneles de Morlock.",
    "👑 KINGPIN: Ofrece recompensa por la cabeza de Punisher (preferiblemente cruda).",
    "⚠ PELIGRO: Magneto está fortificando la atmósfera. Difícil acceso aéreo.",
    "💀 COLMENA: La señal de Galactus se intensifica. El plato principal se acerca.",
    "🩸 FESTÍN: Buffet libre detectado en la Mansión X.",
    "🧟 EVOLUCIÓN: Nuevas cepas detectadas. El virus se adapta."
];

export const NewsTicker: React.FC<NewsTickerProps> = ({ alignment }) => {
    const news = alignment === 'ALIVE' ? NEWS_ALIVE : NEWS_ZOMBIE;
    const colorClass = alignment === 'ALIVE' ? 'text-cyan-400 bg-cyan-950/90 border-cyan-800' : 'text-lime-400 bg-lime-950/90 border-lime-800';

    return (
        <div className={`fixed bottom-0 left-0 right-0 h-8 ${colorClass} border-t flex items-center overflow-hidden z-50 select-none shadow-[0_-5px_20px_rgba(0,0,0,0.5)]`}>
            <div className="flex items-center gap-2 px-4 bg-slate-900 h-full z-10 border-r border-inherit shrink-0">
                <span className="animate-pulse text-red-500">●</span>
                <span className="text-[10px] font-bold tracking-widest">LIVE FEED</span>
            </div>
            <div className="whitespace-nowrap overflow-hidden flex-1 relative">
                <div className="inline-block animate-[ticker_60s_linear_infinite] pl-[100%]">
                    {news.map((item, i) => (
                        <span key={i} className="mx-8 text-xs font-mono tracking-wide uppercase">
                            {item} <span className="opacity-50 mx-2">///</span>
                        </span>
                    ))}
                    {/* Duplicamos para asegurar continuidad */}
                    {news.map((item, i) => (
                        <span key={`dup-${i}`} className="mx-8 text-xs font-mono tracking-wide uppercase">
                            {item} <span className="opacity-50 mx-2">///</span>
                        </span>
                    ))}
                </div>
            </div>
            
            <style>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};