import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { HeroTemplate, HeroClass, HeroStats, ImageParams } from '../types';
import { createHeroTemplateInDB, updateHeroTemplate, getHeroTemplates } from '../services/dbService';

interface CharacterEditorProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    initialData?: HeroTemplate | null;
    onSave?: () => void;
}

const HERO_CLASSES: HeroClass[] = ['BRAWLER', 'SCOUT', 'TACTICIAN', 'BLASTER'];

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ isOpen, onClose, language, initialData, onSave }) => {
    const [name, setName] = useState('');
    const [alias, setAlias] = useState('');
    const [heroClass, setHeroClass] = useState<HeroClass>('BRAWLER');
    const [stats, setStats] = useState<HeroStats>({ strength: 5, agility: 5, intellect: 5 });
    const [bio, setBio] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [characterSheetUrl, setCharacterSheetUrl] = useState(''); // <--- NUEVO ESTADO
    const [alignment, setAlignment] = useState<'ALIVE' | 'ZOMBIE'>('ALIVE');
    const [relatedHeroId, setRelatedHeroId] = useState<string | undefined>(undefined);

    // --- ESTADOS PARA ENCUADRE DE IMAGEN ---
    const [imgScale, setImgScale] = useState(1);
    const [imgX, setImgX] = useState(0);
    const [imgY, setImgY] = useState(0);

    const [saving, setSaving] = useState(false);

    // Estados para el selector de contraparte
    const [showLinker, setShowLinker] = useState(false);
    const [allHeroes, setAllHeroes] = useState<HeroTemplate[]>([]);
    const [linkSearch, setLinkSearch] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.defaultName);
            setAlias(initialData.alias || '');
            setHeroClass(initialData.defaultClass);
            setStats(initialData.defaultStats);
            setBio(initialData.bio || '');
            setImageUrl(initialData.imageUrl);
            setCharacterSheetUrl(initialData.characterSheetUrl || ''); // <--- CARGAR DATO
            setAlignment(initialData.defaultAlignment || 'ALIVE');
            setRelatedHeroId(initialData.relatedHeroId);

            // Cargar params de imagen si existen
            if (initialData.imageParams) {
                setImgScale(initialData.imageParams.scale);
                setImgX(initialData.imageParams.x);
                setImgY(initialData.imageParams.y);
            } else {
                setImgScale(1); setImgX(0); setImgY(0);
            }
        } else {
            setName(''); setAlias(''); setHeroClass('BRAWLER');
            setStats({ strength: 5, agility: 5, intellect: 5 });
            setBio(''); setImageUrl(''); setCharacterSheetUrl(''); setAlignment('ALIVE');
            setRelatedHeroId(undefined);
            setImgScale(1); setImgX(0); setImgY(0);
        }
    }, [initialData, isOpen]);

    // Cargar todos los héroes cuando se abre el vinculador
    useEffect(() => {
        if (showLinker && allHeroes.length === 0) {
            getHeroTemplates().then(setAllHeroes);
        }
    }, [showLinker]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const imageParams: ImageParams = {
            scale: imgScale,
            x: imgX,
            y: imgY
        };

        const templateData: any = {
            defaultName: name,
            alias: alias.toUpperCase(),
            defaultClass: heroClass,
            defaultStats: stats,
            bio,
            imageUrl,
            characterSheetUrl, // <--- GUARDAR DATO
            defaultAlignment: alignment,
            objectives: initialData?.objectives || [],
            currentStory: initialData?.currentStory || '',
            relatedHeroId: relatedHeroId || null,
            imageParams // Guardamos los ajustes
        };

        try {
            if (initialData && initialData.id) {
                await updateHeroTemplate(initialData.id, templateData);
                alert("PERSONAJE ACTUALIZADO");
            } else {
                await createHeroTemplateInDB(templateData);
                alert("PERSONAJE CREADO");
            }

            if (onSave) onSave();
            onClose();
        } catch (error) {
            console.error(error);
            alert("ERROR AL GUARDAR");
        } finally {
            setSaving(false);
        }
    };

    const linkCandidates = allHeroes.filter(h => {
        const isOpposite = h.defaultAlignment !== alignment;
        const matchesSearch = h.alias.toLowerCase().includes(linkSearch.toLowerCase());
        const isNotSelf = h.id !== initialData?.id;
        return isOpposite && matchesSearch && isNotSelf;
    });

    const getRelatedStatusText = () => {
        if (relatedHeroId === 'NO_VARIANT') return "🚫 SIN VARIANTE (INMUNE/IRREVERSIBLE)";
        if (relatedHeroId) {
            const found = allHeroes.find(h => h.id === relatedHeroId);
            return found ? `VINCULADO A: ${found.alias}` : `ID: ${relatedHeroId}`;
        }
        return "SIN VINCULACIÓN";
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="w-full max-w-3xl glass-panel shadow-2xl flex flex-col max-h-[95vh] relative rounded-sm shadow-cyan-900/10">

                {/* --- MODAL INTERNO DE VINCULACIÓN --- */}
                {showLinker && (
                    <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4 border-b border-cyan-700 pb-2">
                            <h4 className="text-cyan-400 font-bold uppercase tracking-widest">SELECCIONAR CONTRAPARTE ({alignment === 'ALIVE' ? 'ZOMBIE' : 'ALIVE'})</h4>
                            <button onClick={() => setShowLinker(false)} className="text-red-500 font-bold">CERRAR</button>
                        </div>
                        <input
                            placeholder="BUSCAR POR NOMBRE..."
                            value={linkSearch}
                            onChange={e => setLinkSearch(e.target.value)}
                            className="w-full bg-black border border-cyan-800 p-2 text-cyan-200 mb-4 uppercase"
                            autoFocus
                        />
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-cyan-900">
                            {linkCandidates.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => { setRelatedHeroId(c.id); setShowLinker(false); }}
                                    className="p-3 border border-slate-700 hover:border-cyan-500 hover:bg-cyan-900/20 cursor-pointer flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={c.imageUrl} className="w-8 h-8 object-cover border border-slate-600" referrerPolicy="no-referrer" />
                                        <div>
                                            <div className="text-xs font-bold text-white group-hover:text-cyan-300">{c.alias}</div>
                                            <div className="text-[8px] text-gray-500">{c.defaultName}</div>
                                        </div>
                                    </div>
                                    <div className={`text-[9px] font-bold px-2 py-1 border ${c.defaultAlignment === 'ZOMBIE' ? 'border-lime-600 text-lime-500' : 'border-cyan-600 text-cyan-500'}`}>
                                        {c.defaultAlignment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center">
                    <h3 className="text-cyan-300 font-bold tracking-widest uppercase">
                        {initialData ? `EDITING: ${initialData.alias}` : 'CREATE NEW CHARACTER (DB)'}
                    </h3>
                    <button onClick={onClose} className="text-cyan-500 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto font-mono flex flex-col gap-4 scrollbar-thin scrollbar-thumb-cyan-900">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* COLUMNA IZQUIERDA: DATOS */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">REAL NAME</label>
                                    <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 focus:border-cyan-400 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">ALIAS (CODENAME)</label>
                                    <input value={alias} onChange={e => setAlias(e.target.value)} required className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 focus:border-cyan-400 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">CLASS</label>
                                    <select value={heroClass} onChange={e => setHeroClass(e.target.value as HeroClass)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200">
                                        {HERO_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">ALIGNMENT</label>
                                    <select value={alignment} onChange={e => setAlignment(e.target.value as any)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-white font-bold">
                                        <option value="ALIVE">🛡️ HERO (ALIVE)</option>
                                        <option value="ZOMBIE">🧟 ZOMBIE (UNDEAD)</option>
                                    </select>
                                </div>
                            </div>

                            {/* VINCULACIÓN */}
                            <div className="bg-purple-900/10 border border-purple-500/30 p-3 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-1 opacity-20 text-purple-500 text-4xl font-black pointer-events-none">∞</div>
                                <label className="text-[10px] text-purple-400 font-bold block mb-2 uppercase">VINCULACIÓN CUÁNTICA</label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex-1 bg-slate-950 border border-purple-800 p-2 text-xs text-purple-200 flex justify-between items-center">
                                        <span className={relatedHeroId === 'NO_VARIANT' ? 'text-red-400 font-bold' : ''}>
                                            {getRelatedStatusText()}
                                        </span>
                                        {relatedHeroId && (
                                            <button type="button" onClick={() => setRelatedHeroId(undefined)} className="text-red-500 hover:text-white font-bold px-2">✕</button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setShowLinker(true)} className="flex-1 bg-purple-900/50 border border-purple-600 text-purple-300 px-3 py-2 text-[10px] font-bold uppercase hover:bg-purple-800 transition-colors">BUSCAR</button>
                                        <button type="button" onClick={() => setRelatedHeroId('NO_VARIANT')} className="flex-1 bg-slate-800 border border-slate-600 text-gray-400 px-3 py-2 text-[10px] font-bold uppercase hover:bg-slate-700 hover:text-white transition-colors">SIN VARIANTE</button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-cyan-900/30 p-3">
                                <label className="text-[10px] text-cyan-500 font-bold block mb-2 uppercase">BASE STATS</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[9px] text-red-400 block">STRENGTH</label>
                                        <input type="number" min="1" max="10" value={stats.strength} onChange={e => setStats({ ...stats, strength: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-red-900 p-1 text-center text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-green-400 block">AGILITY</label>
                                        <input type="number" min="1" max="10" value={stats.agility} onChange={e => setStats({ ...stats, agility: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-green-900 p-1 text-center text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-blue-400 block">INTELLECT</label>
                                        <input type="number" min="1" max="10" value={stats.intellect} onChange={e => setStats({ ...stats, intellect: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-blue-900 p-1 text-center text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: IMAGEN Y ENCUADRE */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">IMAGE URL (RETRATO)</label>
                                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 text-xs" />
                            </div>

                            {/* --- NUEVO CAMPO: FICHA DE JUEGO --- */}
                            <div>
                                <label className="text-[10px] text-yellow-600 font-bold block mb-1 uppercase">GAME CARD URL (FICHA JUEGO)</label>
                                <input
                                    value={characterSheetUrl}
                                    onChange={e => setCharacterSheetUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-slate-950 border border-yellow-800 p-2 text-yellow-200 text-xs focus:border-yellow-500"
                                />
                                <p className="text-[8px] text-gray-500 mt-1">URL de la imagen de la carta de Zombicide/Marvel Zombies.</p>
                            </div>

                            {/* --- EDITOR DE ENCUADRE --- */}
                            <div className="bg-black border border-cyan-700 p-4">
                                <label className="text-[10px] text-cyan-400 font-bold block mb-2 uppercase text-center">AJUSTE DE ENCUADRE (PREVIEW)</label>

                                {/* Preview Box */}
                                <div className="w-32 h-32 mx-auto border-2 border-white overflow-hidden relative bg-slate-800 mb-4 shadow-lg">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="absolute w-full h-full object-cover transition-transform duration-100"
                                            style={{
                                                transform: `scale(${imgScale}) translate(${imgX}%, ${imgY}%)`
                                            }}
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">NO IMAGE</div>
                                    )}
                                    {/* Guías visuales */}
                                    <div className="absolute inset-0 border border-white/20 pointer-events-none"></div>
                                </div>

                                {/* Controles */}
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[9px] text-cyan-500 mb-1">
                                            <span>ZOOM</span>
                                            <span>{imgScale.toFixed(1)}x</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="3" step="0.1"
                                            value={imgScale} onChange={e => setImgScale(parseFloat(e.target.value))}
                                            className="w-full h-1 bg-cyan-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[9px] text-cyan-500 mb-1">
                                            <span>POSICIÓN X (Horizontal)</span>
                                            <span>{imgX}%</span>
                                        </div>
                                        <input
                                            type="range" min="-50" max="50" step="1"
                                            value={imgX} onChange={e => setImgX(parseInt(e.target.value))}
                                            className="w-full h-1 bg-cyan-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[9px] text-cyan-500 mb-1">
                                            <span>POSICIÓN Y (Vertical)</span>
                                            <span>{imgY}%</span>
                                        </div>
                                        <input
                                            type="range" min="-50" max="50" step="1"
                                            value={imgY} onChange={e => setImgY(parseInt(e.target.value))}
                                            className="w-full h-1 bg-cyan-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setImgScale(1); setImgX(0); setImgY(0); }}
                                        className="w-full text-[9px] text-red-400 border border-red-900 py-1 hover:bg-red-900/20"
                                    >
                                        RESET AJUSTES
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">BIO / LORE</label>
                                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 text-xs" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-cyan-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-red-900 text-red-500 text-xs font-bold uppercase hover:bg-red-900/20">CANCEL</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                            {saving ? 'SAVING...' : (initialData ? 'UPDATE CHARACTER' : 'CREATE CHARACTER')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};