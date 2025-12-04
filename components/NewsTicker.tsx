import React, { useEffect, useState } from 'react';
import { WorldStage } from '../types';

interface NewsTickerProps {
    alignment: 'ALIVE' | 'ZOMBIE';
    worldStage: WorldStage;
    urgentMessage?: string | null; // Nueva prop para noticias en tiempo real
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

const NEWS_GALACTUS = [
    "🌌 ALERTA OMEGA: ENTIDAD CÓSMICA EN LA ATMÓSFERA.",
    "💀 CIELOS PÚRPURAS: La radiación cósmica aumenta un 500%.",
    "⚠ PRIORIDAD ABSOLUTA: Todas las hostilidades deben cesar. Enfocad fuego en el Gigante.",
    "🌍 FIN DEL MUNDO: El devorador ha comenzado el proceso de conversión.",
    "🛡️ SHIELD: Protocolo 'Juicio Final' activado. No hay evacuación posible.",
    "⚡ ENERGÍA: Lecturas de poder infinito detectadas en Kansas.",
    "🚫 MISIONES BLOQUEADAS: Todo el personal redirigido a la defensa planetaria."
];

export const NewsTicker: React.FC<NewsTickerProps> = ({ alignment, worldStage, urgentMessage }) => {
    // Estado local para manejar la visualización del mensaje urgente
    const [displayMessage, setDisplayMessage] = useState<string | null>(null);

    // Efecto para mostrar el mensaje urgente durante unos segundos
    useEffect(() => {
        if (urgentMessage) {
            setDisplayMessage(urgentMessage);
            // El mensaje urgente se queda fijo 10 segundos y luego vuelve al feed normal
            const timer = setTimeout(() => setDisplayMessage(null), 10000);
            return () => clearTimeout(timer);
        }
    }, [urgentMessage]);

    // Lógica de selección de noticias base
    let activeNews = alignment === 'ALIVE' ? NEWS_ALIVE : NEWS_ZOMBIE;
    let colorClass = alignment === 'ALIVE' ? 'text-cyan-400 bg-cyan-950/90 border-cyan-800' : 'text-lime-400 bg-lime-950/90 border-lime-800';
    let label = "LIVE FEED";
    let dotColor = "text-red-500";

    // PRIORIDAD GALACTUS (Sobrescribe todo si no hay mensaje urgente puntual)
    if (worldStage === 'GALACTUS') {
        activeNews = NEWS_GALACTUS;
        colorClass = 'text-purple-300 bg-purple-950/95 border-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.5)]';
        label = "OMEGA THREAT";
        dotColor = "text-purple-500";
    }

    // Si hay un mensaje urgente (ej: Héroe curado), cambiamos el estilo temporalmente
    if (displayMessage) {
        colorClass = 'text-white bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.8)]';
        label = "BREAKING NEWS";
        dotColor = "text-white";
    }

    return (
        <div className={`fixed bottom-0 left-0 right-0 h-8 ${colorClass} border-t flex items-center overflow-hidden z-50 select-none shadow-[0_-5px_20px_rgba(0,0,0,0.5)] transition-all duration-500`}>
            <div className="flex items-center gap-2 px-4 bg-slate-900 h-full z-10 border-r border-inherit shrink-0">
                <span className={`animate-pulse ${dotColor}`}>●</span>
                <span className="text-[10px] font-bold tracking-widest">{label}</span>
            </div>
            <div className="whitespace-nowrap overflow-hidden flex-1 relative flex items-center">
                {displayMessage ? (
                    // MODO MENSAJE URGENTE (Texto fijo centrado o deslizante rápido)
                    <div className="w-full text-center font-bold tracking-[0.2em] text-xs animate-pulse">
                        {displayMessage}
                    </div>
                ) : (
                    // MODO FEED NORMAL
                    <div className="inline-block animate-[ticker_120s_linear_infinite] pl-[100%]">
                        {activeNews.map((item, i) => (
                            <span key={i} className="mx-8 text-xs font-mono tracking-wide uppercase">
                                {item} <span className="opacity-50 mx-2">///</span>
                            </span>
                        ))}
                        {/* Duplicamos para asegurar continuidad */}
                        {activeNews.map((item, i) => (
                            <span key={`dup-${i}`} className="mx-8 text-xs font-mono tracking-wide uppercase">
                                {item} <span className="opacity-50 mx-2">///</span>
                            </span>
                        ))}
                    </div>
                )}
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