import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { HeroTemplate, HeroClass, HeroStats, ImageParams } from '../types';
import { createHeroTemplateInDB, updateHeroTemplate, getHeroTemplates } from '../services/heroService';

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
    const [bioEs, setBioEs] = useState('');
    const [bioEn, setBioEn] = useState('');
    const [originEs, setOriginEs] = useState('');
    const [originEn, setOriginEn] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [characterSheetUrl, setCharacterSheetUrl] = useState('');
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

            // Bio i18n
            if (initialData.bio && typeof initialData.bio === 'object') {
                setBioEs(initialData.bio.es);
                setBioEn(initialData.bio.en);
            } else {
                setBioEs((initialData.bio as string) || '');
                setBioEn((initialData.bio as string) || '');
            }

            // Origin i18n
            if (initialData.origin && typeof initialData.origin === 'object') {
                setOriginEs(initialData.origin.es);
                setOriginEn(initialData.origin.en);
            } else {
                setOriginEs((initialData.origin as string) || '');
                setOriginEn((initialData.origin as string) || '');
            }

            setImageUrl(initialData.imageUrl);
            setCharacterSheetUrl(initialData.characterSheetUrl || '');
            setAlignment(initialData.defaultAlignment || 'ALIVE');
            setRelatedHeroId(initialData.relatedHeroId);

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
            setBioEs(''); setBioEn(''); setOriginEs(''); setOriginEn('');
            setImageUrl(''); setCharacterSheetUrl(''); setAlignment('ALIVE');
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
            bio: { es: bioEs, en: bioEn },
            origin: { es: originEs, en: originEn },
            imageUrl,
            characterSheetUrl,
            defaultAlignment: alignment,
            objectives: initialData?.objectives || [],
            currentStory: initialData?.currentStory || '',
            relatedHeroId: relatedHeroId || null,
            imageParams
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

    const isZombie = alignment === 'ZOMBIE';
    const themeColor = isZombie ? 'lime' : 'cyan';
    const accentClass = isZombie ? 'text-lime-500' : 'text-cyan-500';
    const borderClass = isZombie ? 'border-lime-800' : 'border-cyan-800';
    const focusClass = isZombie ? 'focus:border-lime-400' : 'focus:border-cyan-400';
    const bgHeaderClass = isZombie ? 'bg-lime-900/40' : 'bg-cyan-900/40';
    const buttonClass = isZombie ? 'bg-lime-600 hover:bg-lime-500' : 'bg-cyan-600 hover:bg-cyan-500';
    const shadowClass = isZombie ? 'shadow-lime-900/20' : 'shadow-cyan-900/20';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in overflow-hidden">
            <div className={`w-full max-w-6xl glass-panel shadow-2xl flex flex-col max-h-[95vh] relative rounded-sm ${shadowClass} border-t-2 ${isZombie ? 'border-lime-500' : 'border-cyan-500'}`}>

                {/* --- MODAL INTERNO DE VINCULACIÓN --- */}
                {showLinker && (
                    <div className="absolute inset-0 z-[130] bg-slate-950/98 flex flex-col p-8 animate-fade-in">
                        <div className={`flex justify-between items-center mb-6 border-b ${isZombie ? 'border-cyan-700' : 'border-lime-700'} pb-2`}>
                            <h4 className={`${isZombie ? 'text-cyan-400' : 'text-lime-400'} font-black uppercase tracking-[0.3em] text-xl`}>
                                VINCULAR CONTRAPARTE {alignment === 'ALIVE' ? 'ZOMBIE' : 'HUMANA'}
                            </h4>
                            <button onClick={() => setShowLinker(false)} className="text-red-500 font-black hover:bg-red-900/20 px-4 py-2 border border-red-900">ESC :: CANCELAR</button>
                        </div>
                        <input
                            placeholder="ESCRIBA CODENAME O NOMBRE REAL..."
                            value={linkSearch}
                            onChange={e => setLinkSearch(e.target.value)}
                            className={`w-full bg-black border ${isZombie ? 'border-cyan-800 focus:border-cyan-400' : 'border-lime-800 focus:border-lime-400'} p-4 text-xl outline-none mb-6 uppercase`}
                            autoFocus
                        />
                        <div className="flex-1 overflow-y-auto space-y-3 pr-4 scrollbar-thin scrollbar-thumb-slate-800">
                            {linkCandidates.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => { setRelatedHeroId(c.id); setShowLinker(false); }}
                                    className="p-4 border border-slate-800 hover:border-white/50 hover:bg-white/5 cursor-pointer flex justify-between items-center group transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-black border border-slate-700 overflow-hidden">
                                            <img src={c.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-white group-hover:text-cyan-400 uppercase tracking-tighter">{c.alias}</div>
                                            <div className="text-[10px] text-gray-500 font-mono italic">{c.defaultName}</div>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-black px-4 py-1 border ${c.defaultAlignment === 'ZOMBIE' ? 'border-lime-600 text-lime-500' : 'border-cyan-600 text-cyan-500'}`}>
                                        {c.defaultAlignment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`${bgHeaderClass} p-4 border-b ${isZombie ? 'border-lime-600' : 'border-cyan-600'} flex justify-between items-center`}>
                    <div className="flex items-center gap-4">
                        <div className={`text-2xl ${accentClass} animate-pulse`}>
                            {isZombie ? '☣' : '🛡️'}
                        </div>
                        <h3 className={`${accentClass} font-black tracking-[0.2em] uppercase text-sm`}>
                            {initialData ? `MODIFICANDO ARCHIVO AGENTE: ${initialData.alias}` : 'REGISTRAR NUEVO ACTIVO EN BASE DE DATOS'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <span className="text-xs mr-2 font-mono">[ESC]</span> ✕
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto font-mono flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-800 border-r border-slate-800">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>NOMBRE REAL</label>
                                <input value={name} onChange={e => setName(e.target.value)} required className={`w-full bg-slate-950 border ${borderClass} p-2 text-white ${focusClass} outline-none transition-all`} />
                            </div>
                            <div>
                                <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>CODENAME (ALIAS)</label>
                                <input value={alias} onChange={e => setAlias(e.target.value)} required className={`w-full bg-slate-950 border ${borderClass} p-2 text-white ${focusClass} outline-none transition-all uppercase`} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>CLASE TÁCTICA</label>
                                <select value={heroClass} onChange={e => setHeroClass(e.target.value as HeroClass)} className={`w-full bg-slate-950 border ${borderClass} p-2 text-white outline-none cursor-pointer`}>
                                    {HERO_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>ESTADO BIOLÓGICO</label>
                                <select value={alignment} onChange={e => setAlignment(e.target.value as any)} className={`w-full bg-slate-950 border ${borderClass} p-2 text-white font-black outline-none cursor-pointer`}>
                                    <option value="ALIVE">🔵 HUMANO (SUPERVIVIENTE)</option>
                                    <option value="ZOMBIE">🟢 ZOMBIE (INFECTADO)</option>
                                </select>
                            </div>
                        </div>

                        {/* VINCULACIÓN */}
                        <div className={`${isZombie ? 'bg-lime-900/10' : 'bg-purple-900/10'} border ${isZombie ? 'border-lime-500/30' : 'border-purple-500/30'} p-4 relative overflow-hidden group`}>
                            <div className={`absolute -top-2 -right-2 p-1 opacity-10 ${isZombie ? 'text-lime-500' : 'text-purple-500'} text-6xl font-black pointer-events-none group-hover:scale-125 transition-transform duration-1000 uppercase`}>
                                {isZombie ? 'BIO' : 'LINK'}
                            </div>
                            <label className={`text-[10px] ${isZombie ? 'text-lime-400' : 'text-purple-400'} font-black block mb-3 uppercase tracking-[0.2em]`}>
                                VINCULACIÓN DE VARIANTE (PROTOTIPO)
                            </label>
                            <div className="flex flex-col gap-3">
                                <div className={`flex-1 bg-black border ${isZombie ? 'border-lime-900' : 'border-purple-900'} p-3 text-sm flex justify-between items-center shadow-inner`}>
                                    <span className={`font-mono ${relatedHeroId === 'NO_VARIANT' ? 'text-red-500 line-through' : (isZombie ? 'text-lime-200' : 'text-purple-200')}`}>
                                        {getRelatedStatusText()}
                                    </span>
                                    {relatedHeroId && (
                                        <button type="button" onClick={() => setRelatedHeroId(undefined)} className="text-red-500 hover:text-white transition-colors px-2">✕</button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowLinker(true)} className={`flex-1 ${isZombie ? 'bg-cyan-900/40 border-cyan-800 text-cyan-400' : 'bg-purple-900/40 border-purple-800 text-purple-400'} border px-4 py-2 text-[10px] font-black uppercase hover:brightness-125 transition-all`}>
                                        SELECCIONAR CONTRAPARTE
                                    </button>
                                    <button type="button" onClick={() => setRelatedHeroId('NO_VARIANT')} className="flex-1 bg-slate-900 border border-slate-700 text-gray-500 px-4 py-2 text-[10px] font-black uppercase hover:bg-red-900/20 hover:text-red-400 hover:border-red-900 transition-all">
                                        ANULAR VARIANTE
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* STATS */}
                        <div className="bg-slate-900/30 border border-slate-800 p-4">
                            <label className={`text-[10px] ${accentClass} font-black block mb-4 uppercase tracking-widest text-center border-b ${borderClass} pb-2`}>PROTOCOLOS FÍSICOS (ESTADÍSTICAS)</label>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center group">
                                    <label className="text-[9px] text-red-500 block mb-2 font-black tracking-tighter">STRENGTH</label>
                                    <div className="flex items-center justify-center gap-2">
                                        <button type="button" onClick={() => setStats({ ...stats, strength: Math.max(1, stats.strength - 1) })} className="w-6 h-6 border border-red-900 text-red-800 hover:text-red-500 hover:border-red-500">-</button>
                                        <span className="text-xl font-black text-white w-8">{stats.strength}</span>
                                        <button type="button" onClick={() => setStats({ ...stats, strength: Math.min(10, stats.strength + 1) })} className="w-6 h-6 border border-red-900 text-red-800 hover:text-red-500 hover:border-red-500">+</button>
                                    </div>
                                </div>
                                <div className="text-center group">
                                    <label className="text-[9px] text-emerald-500 block mb-2 font-black tracking-tighter">AGILITY</label>
                                    <div className="flex items-center justify-center gap-2">
                                        <button type="button" onClick={() => setStats({ ...stats, agility: Math.max(1, stats.agility - 1) })} className="w-6 h-6 border border-emerald-900 text-emerald-800 hover:text-emerald-500 hover:border-emerald-500">-</button>
                                        <span className="text-xl font-black text-white w-8">{stats.agility}</span>
                                        <button type="button" onClick={() => setStats({ ...stats, agility: Math.min(10, stats.agility + 1) })} className="w-6 h-6 border border-emerald-900 text-emerald-800 hover:text-emerald-500 hover:border-emerald-500">+</button>
                                    </div>
                                </div>
                                <div className="text-center group">
                                    <label className="text-[9px] text-cyan-500 block mb-2 font-black tracking-tighter">INTELLECT</label>
                                    <div className="flex items-center justify-center gap-2">
                                        <button type="button" onClick={() => setStats({ ...stats, intellect: Math.max(1, stats.intellect - 1) })} className="w-6 h-6 border border-cyan-900 text-cyan-800 hover:text-cyan-500 hover:border-cyan-500">-</button>
                                        <span className="text-xl font-black text-white w-8">{stats.intellect}</span>
                                        <button type="button" onClick={() => setStats({ ...stats, intellect: Math.min(10, stats.intellect + 1) })} className="w-6 h-6 border border-cyan-900 text-cyan-800 hover:text-cyan-500 hover:border-cyan-500">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* URLS */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>URL RETRATO (BIOMETRÍA)</label>
                                    <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className={`w-full bg-slate-950 border ${borderClass} p-2 text-white text-[10px] ${focusClass} outline-none overflow-hidden`} />
                                </div>
                                <div>
                                    <label className={`text-[10px] text-yellow-600 font-black block mb-1 uppercase tracking-widest`}>URL FICHA DE JUEGO (ANALÓGICO)</label>
                                    <input value={characterSheetUrl} onChange={e => setCharacterSheetUrl(e.target.value)} placeholder="https://..." className={`w-full bg-slate-950 border border-yellow-950 p-2 text-yellow-200 text-[10px] focus:border-yellow-500 outline-none overflow-hidden`} />
                                </div>
                            </div>

                            {/* ADJUSTER VISTA PREVIA */}
                            <div className="bg-black border border-slate-800 p-3 flex flex-col gap-2">
                                <label className={`text-[9px] ${accentClass} font-black uppercase text-center mb-1`}>AJUSTE DE ENCUADRE</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] text-gray-500 uppercase">Zoom</span>
                                        <input type="range" min="1" max="3" step="0.1" value={imgScale} onChange={e => setImgScale(parseFloat(e.target.value))} className="w-full accent-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] text-gray-500 uppercase">Offset X</span>
                                        <input type="range" min="-50" max="50" value={imgX} onChange={e => setImgX(parseInt(e.target.value))} className="w-full accent-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] text-gray-500 uppercase">Offset Y</span>
                                        <input type="range" min="-50" max="50" value={imgY} onChange={e => setImgY(parseInt(e.target.value))} className="w-full accent-white" />
                                    </div>
                                </div>
                                <button type="button" onClick={() => { setImgScale(1); setImgX(0); setImgY(0); }} className="text-[8px] text-red-900 hover:text-red-500 uppercase font-black">RESET</button>
                            </div>
                        </div>

                        {/* LORE */}
                        <div className="space-y-4">
                            <div>
                                <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>ANTECEDENTES DEL ACTIVO (ORÍGEN)</label>
                                <textarea value={originEs} onChange={e => setOriginEs(e.target.value)} rows={2} className={`w-full bg-slate-950 border ${borderClass} p-2 text-white text-xs ${focusClass} outline-none resize-none`} />
                            </div>
                            <div>
                                <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>INTELIGENCIA RECOPILADA (BIO / LORE)</label>
                                <textarea value={bioEs} onChange={e => setBioEs(e.target.value)} rows={4} className={`w-full bg-slate-950 border ${borderClass} p-2 text-white text-xs ${focusClass} outline-none resize-none`} />
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                            <button type="button" onClick={onClose} className="px-6 py-2 border border-red-900 text-red-500 text-[10px] font-black uppercase hover:bg-red-900/20 transition-all">CANCELAR</button>
                            <button type="submit" disabled={saving} className={`px-10 py-2 ${buttonClass} text-white text-[10px] font-black uppercase shadow-lg transition-all active:scale-95 disabled:opacity-50`}>
                                {saving ? 'TRANSMITIENDO...' : (initialData ? 'ACTUALIZAR REGISTRO' : 'CREAR NUEVO ARCHIVO')}
                            </button>
                        </div>
                    </form>

                    {/* PREVIEW PANEL */}
                    <div className="hidden lg:flex w-80 bg-black/40 p-6 flex-col items-center justify-center gap-6 border-l border-slate-900 select-none">
                        <h4 className={`text-[10px] ${accentClass} font-black uppercase tracking-[0.4em] mb-4`}>VISTA PREVIA TÁCTICA</h4>

                        {/* SIMULACIÓN CARDE DEL BÚNKER */}
                        <div className={`w-48 h-64 bg-slate-900 border-2 ${isZombie ? 'border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.2)]' : 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'} relative overflow-hidden group`}>
                            {/* Header Card */}
                            <div className={`absolute top-0 inset-x-0 h-8 ${isZombie ? 'bg-lime-900/80' : 'bg-cyan-900/80'} flex items-center justify-between px-2 border-b border-black/50 z-10`}>
                                <span className="text-[10px] font-black text-white uppercase truncate pr-1">{alias || 'CODENAME'}</span>
                                <span className={`text-[8px] font-bold ${isZombie ? 'text-lime-200' : 'text-cyan-200'} border border-current px-1`}>{heroClass}</span>
                            </div>

                            {/* Image Container */}
                            <div className="absolute inset-x-0 top-8 bottom-12 bg-black overflow-hidden">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        style={{ transform: `scale(${imgScale}) translate(${imgX}%, ${imgY}%)` }}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-800 text-[8px] font-black italic">IMAGEN REQUERIDA</div>
                                )}

                                {/* Scanlines effect */}
                                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
                            </div>

                            {/* Footer Card: Stats */}
                            <div className="absolute bottom-0 inset-x-0 h-14 bg-black/90 p-2 flex flex-col justify-between border-t border-white/10">
                                <div className="flex justify-between items-center text-[7px] font-black">
                                    <span className="text-red-500">STR {stats.strength}</span>
                                    <span className="text-emerald-500">AGI {stats.agility}</span>
                                    <span className="text-cyan-500">INT {stats.intellect}</span>
                                </div>
                                <div className="text-[8px] text-gray-500 italic truncate font-mono">
                                    {isZombie ? 'BIOHAZARD DETECTED' : 'CLEARANCE LEVEL OMEGA'}
                                </div>
                                <div className={`h-1 ${isZombie ? 'bg-lime-600' : 'bg-cyan-600'} w-full opacity-50`}></div>
                            </div>
                        </div>

                        <p className="text-[8px] text-gray-600 text-center uppercase tracking-widest leading-relaxed">
                            Los cambios se reflejan en tiempo real.<br />Asegurese de que la biometría es correcta antes de transmitir.
                        </p>

                        <div className={`w-full h-px bg-gradient-to-r from-transparent via-${themeColor}-900 to-transparent`}></div>

                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className={`text-xl ${accentClass}`}>{isZombie ? '🧟' : '🛡️'}</span>
                                <span className="text-[7px] text-gray-500">BANDO</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xl text-yellow-600">🎴</span>
                                <span className="text-[7px] text-gray-500">FICHA</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xl text-purple-600">🔗</span>
                                <span className="text-[7px] text-gray-500">SYNC</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};