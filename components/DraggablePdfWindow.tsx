import React, { useState, useEffect, useRef } from 'react';

interface DraggablePdfWindowProps {
    url: string;
    title: string;
    onClose: () => void;
}

export const DraggablePdfWindow: React.FC<DraggablePdfWindowProps> = ({ url, title, onClose }) => {
    // Estado de la ventana
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [size, setSize] = useState({ w: 600, h: 500 });
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    
    // Estados para arrastrar/redimensionar
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Referencias para guardar estado previo al maximizar
    const prevBounds = useRef({ x: 50, y: 50, w: 600, h: 500 });

    // Lógica de Arrastre (Drag)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    // Lógica de Redimensión (Resize)
    const handleResizeDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
    };

    // Efecto global para el movimiento del ratón
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
            if (isResizing) {
                setSize({
                    w: Math.max(300, e.clientX - position.x),
                    h: Math.max(200, e.clientY - position.y)
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, position]);

    const toggleMaximize = () => {
        if (isMaximized) {
            // Restaurar
            setPosition({ x: prevBounds.current.x, y: prevBounds.current.y });
            setSize({ w: prevBounds.current.w, h: prevBounds.current.h });
        } else {
            // Guardar estado actual y Maximizar
            prevBounds.current = { ...position, ...size };
            setPosition({ x: 0, y: 0 });
            // Usamos CSS para el tamaño full, pero reseteamos posición
        }
        setIsMaximized(!isMaximized);
        setIsMinimized(false);
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
        if (isMaximized) setIsMaximized(false);
    };

    // URL del visor de Google
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

    // Estilos dinámicos
    const windowStyle: React.CSSProperties = {
        left: position.x,
        top: position.y,
        width: isMaximized ? '100vw' : size.w,
        height: isMinimized ? 'auto' : (isMaximized ? '100vh' : size.h),
        position: 'fixed',
        zIndex: 1000,
    };

    return (
        <div 
            style={windowStyle} 
            className={`flex flex-col bg-slate-900 border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden transition-all duration-75 ${isMaximized ? 'rounded-none border-0' : ''}`}
        >
            {/* --- BARRA DE TÍTULO (HEADER) --- */}
            <div 
                onMouseDown={handleMouseDown}
                className={`flex justify-between items-center p-2 bg-slate-800 border-b border-cyan-700 select-none ${isMaximized ? '' : 'cursor-move'}`}
            >
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-widest">
                    <span>📄</span>
                    <span className="truncate max-w-[200px]">{title}</span>
                </div>
                <div className="flex gap-1">
                    {/* Botón Minimizar */}
                    <button onClick={toggleMinimize} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-cyan-800 text-white text-xs border border-slate-600">
                        _
                    </button>
                    {/* Botón Maximizar/Restaurar */}
                    <button onClick={toggleMaximize} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-cyan-800 text-white text-xs border border-slate-600">
                        {isMaximized ? '❐' : '□'}
                    </button>
                    {/* Botón Cerrar */}
                    <button onClick={onClose} className="w-6 h-6 flex items-center justify-center bg-red-900 hover:bg-red-700 text-white text-xs border border-red-700">
                        ✕
                    </button>
                </div>
            </div>

            {/* --- CONTENIDO (IFRAME) --- */}
            {!isMinimized && (
                <div className="flex-1 relative bg-gray-800">
                    {/* Capa protectora para que el iframe no capture el ratón al arrastrar */}
                    {(isDragging || isResizing) && <div className="absolute inset-0 z-50 bg-transparent"></div>}
                    
                    <iframe 
                        src={viewerUrl} 
                        className="w-full h-full border-0" 
                        title="PDF Viewer"
                    />

                    {/* --- MANIJA DE REDIMENSIÓN (RESIZE HANDLE) --- */}
                    {!isMaximized && (
                        <div 
                            onMouseDown={handleResizeDown}
                            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 bg-cyan-500/50 hover:bg-cyan-400 clip-triangle"
                            style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
                        ></div>
                    )}
                </div>
            )}
        </div>
    );
};