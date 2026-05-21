import React, { useEffect, useRef, useState } from 'react';

interface DraggablePdfWindowProps {
    url: string;
    title: string;
    onClose: () => void;
}

const getGitHubDirectFileUrl = (originalUrl: string) => {
    try {
        const parsedUrl = new URL(originalUrl);

        if (parsedUrl.hostname === 'raw.githubusercontent.com') {
            return originalUrl;
        }

        if (parsedUrl.hostname !== 'github.com') {
            return originalUrl;
        }

        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathParts.length < 5) {
            return originalUrl;
        }

        const [owner, repo, mode, branch, ...fileParts] = pathParts;
        if ((mode !== 'blob' && mode !== 'raw') || fileParts.length === 0) {
            return originalUrl;
        }

        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fileParts.join('/')}`;
    } catch {
        return originalUrl;
    }
};

const getEmbedUrl = (originalUrl: string) => {
    if (originalUrl.includes('drive.google.com')) {
        return originalUrl.replace(/\/view.*/, '/preview').replace(/\/edit.*/, '/preview');
    }

    if (originalUrl.includes('dropbox.com')) {
        return originalUrl.replace('?dl=0', '').replace('?dl=1', '') + '?raw=1';
    }

    if (originalUrl.includes('github.com') || originalUrl.includes('raw.githubusercontent.com')) {
        return getGitHubDirectFileUrl(originalUrl);
    }

    return originalUrl;
};

export const DraggablePdfWindow: React.FC<DraggablePdfWindowProps> = ({ url, title, onClose }) => {
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [size, setSize] = useState({ w: 600, h: 500 });
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [viewerUrl, setViewerUrl] = useState(() => getEmbedUrl(url));
    const [isLoadingViewer, setIsLoadingViewer] = useState(false);

    const prevBounds = useRef({ x: 50, y: 50, w: 600, h: 500 });

    const embedUrl = getEmbedUrl(url);
    const isGoogleDrive = embedUrl.includes('drive.google.com');
    const isGitHubPdf = embedUrl.includes('raw.githubusercontent.com');

    useEffect(() => {
        let objectUrl: string | null = null;

        const prepareViewer = async () => {
            setViewerUrl(embedUrl);

            if (!isGitHubPdf) {
                setIsLoadingViewer(false);
                return;
            }

            setIsLoadingViewer(true);

            try {
                const response = await fetch(embedUrl);
                if (!response.ok) {
                    throw new Error('No se pudo cargar el PDF.');
                }

                const pdfBlob = await response.blob();
                objectUrl = URL.createObjectURL(pdfBlob);
                setViewerUrl(objectUrl);
            } catch {
                setViewerUrl(embedUrl);
            } finally {
                setIsLoadingViewer(false);
            }
        };

        prepareViewer();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [embedUrl, isGitHubPdf]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return;

        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleResizeDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y,
                });
            }

            if (isResizing) {
                setSize({
                    w: Math.max(300, e.clientX - position.x),
                    h: Math.max(200, e.clientY - position.y),
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
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        };
    }, [dragOffset, isDragging, isResizing, position]);

    const toggleMaximize = () => {
        if (isMaximized) {
            setPosition({ x: prevBounds.current.x, y: prevBounds.current.y });
            setSize({ w: prevBounds.current.w, h: prevBounds.current.h });
        } else {
            prevBounds.current = { ...position, ...size };
            setPosition({ x: 0, y: 0 });
        }

        setIsMaximized(!isMaximized);
        setIsMinimized(false);
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
        if (isMaximized) setIsMaximized(false);
    };

    const windowStyle: React.CSSProperties = {
        left: position.x,
        top: position.y,
        width: isMaximized ? '100vw' : size.w,
        height: isMinimized ? 'auto' : isMaximized ? '100vh' : size.h,
        position: 'fixed',
        zIndex: 1000,
    };

    return (
        <div
            style={windowStyle}
            className={`flex flex-col bg-slate-900 border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden transition-all duration-75 ${isMaximized ? 'rounded-none border-0' : ''}`}
        >
            <div
                onMouseDown={handleMouseDown}
                className={`flex justify-between items-center p-2 bg-slate-800 border-b border-cyan-700 select-none ${isMaximized ? '' : 'cursor-move'}`}
            >
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-widest overflow-hidden">
                    <span>[PDF]</span>
                    <span className="truncate max-w-[200px]">{title}</span>
                </div>
                <div className="flex gap-1 items-center">
                    <a
                        href={embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-cyan-800 text-cyan-300 text-xs border border-slate-600 mr-2"
                        title="Abrir en pestana nueva"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        ↗
                    </a>

                    <button onClick={toggleMinimize} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-cyan-800 text-white text-xs border border-slate-600">
                        _
                    </button>
                    <button onClick={toggleMaximize} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-cyan-800 text-white text-xs border border-slate-600">
                        {isMaximized ? '❐' : '□'}
                    </button>
                    <button onClick={onClose} className="w-6 h-6 flex items-center justify-center bg-red-900 hover:bg-red-700 text-white text-xs border border-red-700">
                        ✕
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <div className="flex-1 relative bg-gray-800 flex flex-col">
                    {(isDragging || isResizing) && <div className="absolute inset-0 z-50 bg-transparent"></div>}

                    {isGoogleDrive ? (
                        <iframe
                            src={embedUrl}
                            className="w-full h-full border-0 bg-white"
                            title="PDF Viewer"
                            allow="autoplay"
                        />
                    ) : isLoadingViewer ? (
                        <div className="flex items-center justify-center h-full text-cyan-300 text-sm tracking-wide">
                            Cargando anexo...
                        </div>
                    ) : (
                        <iframe
                            src={viewerUrl}
                            className="w-full h-full border-0 bg-white"
                            title="PDF Viewer"
                        />
                    )}

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
