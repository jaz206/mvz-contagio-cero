import React, { useEffect, useState } from 'react';
import { Language } from '../translations';
import { HeroClass, HeroPlayableSheet, HeroPlayableSheetsByLanguage, HeroStats, HeroTemplate, ImageParams } from '../types';
import { createHeroTemplateInDB, getHeroTemplates, updateHeroTemplate } from '../services/heroService';
import { CharacterImageOption, fetchCharacterImageOptions } from '../services/characterImageRepositoryService';

interface CharacterEditorProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    initialData?: HeroTemplate | null;
    onSave?: () => void;
}

const HERO_CLASSES: HeroClass[] = ['BRAWLER', 'SCOUT', 'TACTICIAN', 'BLASTER'];

type SheetLanguage = 'es' | 'en';
type SheetVariant = {
    es: HeroPlayableSheet;
    en: HeroPlayableSheet;
};

const createBlankSheet = (characterName = '', set = ''): HeroPlayableSheet => ({
    characterName,
    set,
    life: '',
    attack: '',
    type: '',
    range: '',
    dice: '',
    toHit: '',
    blueSkillName: '',
    blueSkillDescription: '',
    yellowSkillName: '',
    yellowSkillDescription: '',
    orangeSkillName: '',
    orangeSkillDescription: '',
    redSkillName: '',
    redSkillDescription: '',
    spawnAbility: '',
    toughness: ''
});

const buildSheetVariants = (playableSheets?: HeroPlayableSheetsByLanguage, alias = '', set = ''): SheetVariant[] => {
    const esSheets = playableSheets?.es || [];
    const enSheets = playableSheets?.en || [];
    const count = Math.max(esSheets.length, enSheets.length, 1);

    return Array.from({ length: count }, (_, index) => ({
        es: esSheets[index] || createBlankSheet(alias, set),
        en: enSheets[index] || createBlankSheet(alias, set)
    }));
};

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ isOpen, onClose, initialData, onSave }) => {
    const [name, setName] = useState('');
    const [alias, setAlias] = useState('');
    const [heroClass, setHeroClass] = useState<HeroClass>('BRAWLER');
    const [stats, setStats] = useState<HeroStats>({ strength: 5, agility: 5, intellect: 5 });
    const [bioEs, setBioEs] = useState('');
    const [bioEn, setBioEn] = useState('');
    const [originEs, setOriginEs] = useState('');
    const [originEn, setOriginEn] = useState('');
    const [currentStoryEs, setCurrentStoryEs] = useState('');
    const [currentStoryEn, setCurrentStoryEn] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [characterSheetUrl, setCharacterSheetUrl] = useState('');
    const [alignment, setAlignment] = useState<'ALIVE' | 'ZOMBIE'>('ALIVE');
    const [relatedHeroId, setRelatedHeroId] = useState<string | undefined>(undefined);
    const [imgScale, setImgScale] = useState(1);
    const [imgX, setImgX] = useState(0);
    const [imgY, setImgY] = useState(0);
    const [sheetVariants, setSheetVariants] = useState<SheetVariant[]>([{
        es: createBlankSheet(),
        en: createBlankSheet()
    }]);
    const [activeSheetIndex, setActiveSheetIndex] = useState(0);
    const [activeSheetLanguage, setActiveSheetLanguage] = useState<SheetLanguage>('es');
    const [saving, setSaving] = useState(false);

    const [showLinker, setShowLinker] = useState(false);
    const [allHeroes, setAllHeroes] = useState<HeroTemplate[]>([]);
    const [linkSearch, setLinkSearch] = useState('');

    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const [imagePickerTarget, setImagePickerTarget] = useState<'portrait' | 'sheet'>('portrait');
    const [imagePickerLoading, setImagePickerLoading] = useState(false);
    const [imagePickerError, setImagePickerError] = useState('');
    const [imagePickerQuery, setImagePickerQuery] = useState('');
    const [repoImageOptions, setRepoImageOptions] = useState<CharacterImageOption[]>([]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.defaultName || '');
            setAlias(initialData.alias || '');
            setHeroClass(initialData.defaultClass || 'BRAWLER');
            setStats(initialData.defaultStats || { strength: 5, agility: 5, intellect: 5 });

            if (initialData.bio && typeof initialData.bio === 'object') {
                setBioEs(initialData.bio.es || '');
                setBioEn(initialData.bio.en || '');
            } else {
                setBioEs((initialData.bio as string) || '');
                setBioEn((initialData.bio as string) || '');
            }

            if (initialData.origin && typeof initialData.origin === 'object') {
            setOriginEs(initialData.origin.es || '');
            setOriginEn(initialData.origin.en || '');
        } else {
            setOriginEs((initialData.origin as string) || '');
            setOriginEn((initialData.origin as string) || '');
        }

        if (initialData.currentStory && typeof initialData.currentStory === 'object') {
            setCurrentStoryEs(initialData.currentStory.es || '');
            setCurrentStoryEn(initialData.currentStory.en || '');
        } else {
            setCurrentStoryEs((initialData.currentStory as string) || '');
            setCurrentStoryEn((initialData.currentStory as string) || '');
        }
        setImageUrl(initialData.imageUrl || '');
        setCharacterSheetUrl(initialData.characterSheetUrl || '');
            setAlignment(initialData.defaultAlignment || 'ALIVE');
            setRelatedHeroId(initialData.relatedHeroId);

            if (initialData.imageParams) {
                setImgScale(initialData.imageParams.scale);
                setImgX(initialData.imageParams.x);
                setImgY(initialData.imageParams.y);
            } else {
                setImgScale(1);
                setImgX(0);
                setImgY(0);
            }

            setSheetVariants(buildSheetVariants(initialData.playableSheets, initialData.alias, initialData.defaultName));
            setActiveSheetIndex(0);
            setActiveSheetLanguage('es');
        } else {
            setName('');
            setAlias('');
            setHeroClass('BRAWLER');
            setStats({ strength: 5, agility: 5, intellect: 5 });
            setBioEs('');
            setBioEn('');
            setOriginEs('');
            setOriginEn('');
            setCurrentStoryEs('');
            setCurrentStoryEn('');
            setImageUrl('');
            setCharacterSheetUrl('');
            setAlignment('ALIVE');
            setRelatedHeroId(undefined);
            setImgScale(1);
            setImgX(0);
            setImgY(0);
            setSheetVariants([{
                es: createBlankSheet(),
                en: createBlankSheet()
            }]);
            setActiveSheetIndex(0);
            setActiveSheetLanguage('es');
        }

        setIsImagePickerOpen(false);
        setImagePickerTarget('portrait');
        setImagePickerError('');
        setImagePickerQuery('');
    }, [initialData, isOpen]);

    useEffect(() => {
        if (showLinker && allHeroes.length === 0) {
            getHeroTemplates().then(setAllHeroes);
        }
    }, [showLinker, allHeroes.length]);

    if (!isOpen) return null;

    const activeSheetVariant = sheetVariants[activeSheetIndex] || sheetVariants[0];
    const activeSheetData = activeSheetVariant?.[activeSheetLanguage] || createBlankSheet();
    const updateSheetVariant = (index: number, updater: (variant: SheetVariant) => SheetVariant) => {
        setSheetVariants((prev) => prev.map((variant, variantIndex) => (
            variantIndex === index ? updater(variant) : variant
        )));
    };

    const updateCommonSheetField = (field: keyof HeroPlayableSheet, value: string) => {
        updateSheetVariant(activeSheetIndex, (variant) => ({
            es: {
                ...variant.es,
                [field]: value
            },
            en: {
                ...variant.en,
                [field]: value
            }
        }));
    };

    const updateSheetField = (index: number, language: SheetLanguage, field: keyof HeroPlayableSheet, value: string) => {
        updateSheetVariant(index, (variant) => ({
            ...variant,
            [language]: {
                ...variant[language],
                [field]: value
            }
        }));
    };

    const addSheetVariant = () => {
        setSheetVariants((prev) => [
            ...prev,
            {
                es: createBlankSheet(alias.toUpperCase(), ''),
                en: createBlankSheet(alias.toUpperCase(), '')
            }
        ]);
        setActiveSheetIndex(sheetVariants.length);
    };

    const duplicateSheetVariant = () => {
        const current = activeSheetVariant;
        if (!current) return;

        setSheetVariants((prev) => [
            ...prev,
            {
                es: { ...current.es },
                en: { ...current.en }
            }
        ]);
        setActiveSheetIndex(sheetVariants.length);
    };

    const removeSheetVariant = (index: number) => {
        setSheetVariants((prev) => {
            if (prev.length <= 1) return prev;
            const next = prev.filter((_, itemIndex) => itemIndex !== index);
            return next.length > 0 ? next : [{ es: createBlankSheet(), en: createBlankSheet() }];
        });
        setActiveSheetIndex((prev) => Math.max(0, Math.min(prev, Math.max(0, sheetVariants.length - 2))));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);

        const imageParams: ImageParams = {
            scale: imgScale,
            x: imgX,
            y: imgY
        };

        const templateData: Partial<HeroTemplate> = {
            defaultName: name,
            alias: alias.toUpperCase(),
            defaultClass: heroClass,
            defaultStats: stats,
            bio: { es: bioEs, en: bioEn },
            origin: { es: originEs, en: originEn },
            currentStory: { es: currentStoryEs, en: currentStoryEn },
            imageUrl,
            characterSheetUrl,
            defaultAlignment: alignment,
            objectives: initialData?.objectives || [],
            relatedHeroId: relatedHeroId || undefined,
            imageParams,
            playableSheets: {
                es: sheetVariants.map((variant) => variant.es),
                en: sheetVariants.map((variant) => variant.en)
            }
        };

        try {
            if (initialData?.id) {
                await updateHeroTemplate(initialData.id, templateData);
                alert('PERSONAJE ACTUALIZADO');
            } else {
                await createHeroTemplateInDB(templateData as Omit<HeroTemplate, 'id'>);
                alert('PERSONAJE CREADO');
            }

            if (onSave) onSave();
            onClose();
        } catch (error) {
            console.error(error);
            alert('ERROR AL GUARDAR');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenImagePicker = async (target: 'portrait' | 'sheet') => {
        setIsImagePickerOpen(true);
        setImagePickerTarget(target);
        setImagePickerError('');
        setImagePickerLoading(true);

        try {
            const options = await fetchCharacterImageOptions();
            setRepoImageOptions(options);
        } catch (error) {
            setImagePickerError((error as Error).message || 'No se pudo cargar la biblioteca de imagenes.');
        } finally {
            setImagePickerLoading(false);
        }
    };

    const handleSelectRepoImage = (option: CharacterImageOption) => {
        if (imagePickerTarget === 'sheet') {
            setCharacterSheetUrl(option.url);
        } else {
            setImageUrl(option.url);
        }
        setIsImagePickerOpen(false);
        setImagePickerTarget('portrait');
        setImagePickerQuery('');
        setImagePickerError('');
    };

    const linkCandidates = allHeroes.filter((hero) => {
        const isOpposite = hero.defaultAlignment !== alignment;
        const matchesSearch = hero.alias.toLowerCase().includes(linkSearch.toLowerCase());
        const isNotSelf = hero.id !== initialData?.id;
        return isOpposite && matchesSearch && isNotSelf;
    });

    const getRelatedStatusText = () => {
        if (relatedHeroId === 'NO_VARIANT') return 'SIN VARIANTE';
        if (relatedHeroId) {
            const found = allHeroes.find((hero) => hero.id === relatedHeroId);
            return found ? `VINCULADO A: ${found.alias}` : `ID: ${relatedHeroId}`;
        }
        return 'SIN VINCULACION';
    };

    const isZombie = alignment === 'ZOMBIE';
    const accentClass = isZombie ? 'text-lime-500' : 'text-cyan-500';
    const borderClass = isZombie ? 'border-lime-800' : 'border-cyan-800';
    const focusClass = isZombie ? 'focus:border-lime-400' : 'focus:border-cyan-400';
    const bgHeaderClass = isZombie ? 'bg-lime-900/40' : 'bg-cyan-900/40';
    const buttonClass = isZombie ? 'bg-lime-600 hover:bg-lime-500' : 'bg-cyan-600 hover:bg-cyan-500';
    const shadowClass = isZombie ? 'shadow-lime-900/20' : 'shadow-cyan-900/20';

    const filteredImageOptions = repoImageOptions.filter((option) => {
        if (!imagePickerQuery.trim()) return true;
        const normalizedQuery = imagePickerQuery.trim().toLowerCase();
        return option.name.toLowerCase().includes(normalizedQuery) || option.path.toLowerCase().includes(normalizedQuery);
    });

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
            <div className={`relative flex max-h-[95vh] w-full max-w-6xl flex-col rounded-sm border-t-2 ${isZombie ? 'border-lime-500' : 'border-cyan-500'} ${shadowClass} glass-panel shadow-2xl`}>
                {showLinker && (
                    <div className="absolute inset-0 z-[130] flex flex-col bg-slate-950/98 p-8 animate-fade-in">
                        <div className={`mb-6 flex items-center justify-between border-b ${isZombie ? 'border-cyan-700' : 'border-lime-700'} pb-2`}>
                            <h4 className={`${isZombie ? 'text-cyan-400' : 'text-lime-400'} text-xl font-black uppercase tracking-[0.3em]`}>
                                VINCULAR CONTRAPARTE {alignment === 'ALIVE' ? 'ZOMBIE' : 'HUMANA'}
                            </h4>
                            <button onClick={() => setShowLinker(false)} className="border border-red-900 px-4 py-2 font-black text-red-500 hover:bg-red-900/20">
                                ESC :: CANCELAR
                            </button>
                        </div>
                        <input
                            placeholder="ESCRIBE CODENAME O NOMBRE..."
                            value={linkSearch}
                            onChange={(e) => setLinkSearch(e.target.value)}
                            className={`mb-6 w-full border bg-black p-4 text-xl uppercase outline-none ${isZombie ? 'border-cyan-800 focus:border-cyan-400' : 'border-lime-800 focus:border-lime-400'}`}
                            autoFocus
                        />
                        <div className="flex-1 space-y-3 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-800">
                            {linkCandidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    onClick={() => {
                                        setRelatedHeroId(candidate.id);
                                        setShowLinker(false);
                                    }}
                                    className="group flex cursor-pointer items-center justify-between border border-slate-800 p-4 transition-all hover:border-white/50 hover:bg-white/5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 overflow-hidden border border-slate-700 bg-black">
                                            <img src={candidate.imageUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-black uppercase tracking-tighter text-white group-hover:text-cyan-400">{candidate.alias}</div>
                                            <div className="font-mono text-[10px] italic text-gray-500">{candidate.defaultName}</div>
                                        </div>
                                    </div>
                                    <div className={`border px-4 py-1 text-xs font-black ${candidate.defaultAlignment === 'ZOMBIE' ? 'border-lime-600 text-lime-500' : 'border-cyan-600 text-cyan-500'}`}>
                                        {candidate.defaultAlignment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`${bgHeaderClass} flex items-center justify-between border-b ${isZombie ? 'border-lime-600' : 'border-cyan-600'} p-4`}>
                    <div className="flex items-center gap-4">
                        <div className={`text-2xl ${accentClass} animate-pulse`}>
                            {isZombie ? 'BIO' : 'SH'}
                        </div>
                        <h3 className={`${accentClass} text-sm font-black uppercase tracking-[0.2em]`}>
                            {initialData ? `MODIFICANDO AGENTE: ${initialData.alias}` : 'REGISTRAR NUEVO PERSONAJE'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 transition-colors hover:text-white">
                        <span className="mr-2 font-mono text-xs">[ESC]</span> X
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 overflow-y-auto border-r border-slate-800 p-6 font-mono scrollbar-thin scrollbar-thumb-slate-800">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`mb-1 block text-[10px] font-black uppercase tracking-widest ${accentClass}`}>NOMBRE REAL</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} required className={`w-full border bg-slate-950 p-2 text-white outline-none transition-all ${borderClass} ${focusClass}`} />
                            </div>
                            <div>
                                <label className={`mb-1 block text-[10px] font-black uppercase tracking-widest ${accentClass}`}>CODENAME</label>
                                <input value={alias} onChange={(e) => setAlias(e.target.value)} required className={`w-full border bg-slate-950 p-2 uppercase text-white outline-none transition-all ${borderClass} ${focusClass}`} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`mb-1 block text-[10px] font-black uppercase tracking-widest ${accentClass}`}>CLASE</label>
                                <select value={heroClass} onChange={(e) => setHeroClass(e.target.value as HeroClass)} className={`w-full border bg-slate-950 p-2 text-white outline-none ${borderClass}`}>
                                    {HERO_CLASSES.map((heroClassOption) => (
                                        <option key={heroClassOption} value={heroClassOption}>{heroClassOption}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`mb-1 block text-[10px] font-black uppercase tracking-widest ${accentClass}`}>BANDO</label>
                                <select value={alignment} onChange={(e) => setAlignment(e.target.value as 'ALIVE' | 'ZOMBIE')} className={`w-full border bg-slate-950 p-2 font-black text-white outline-none ${borderClass}`}>
                                    <option value="ALIVE">HUMANO</option>
                                    <option value="ZOMBIE">ZOMBIE</option>
                                </select>
                            </div>
                        </div>

                        <div className={`${isZombie ? 'border-lime-500/30 bg-lime-900/10' : 'border-purple-500/30 bg-purple-900/10'} relative overflow-hidden border p-4`}>
                            <div className={`mb-3 block text-[10px] font-black uppercase tracking-[0.2em] ${isZombie ? 'text-lime-400' : 'text-purple-400'}`}>
                                VINCULACION DE VARIANTE
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className={`flex items-center justify-between border bg-black p-3 text-sm shadow-inner ${isZombie ? 'border-lime-900' : 'border-purple-900'}`}>
                                    <span className={`font-mono ${relatedHeroId === 'NO_VARIANT' ? 'text-red-500 line-through' : (isZombie ? 'text-lime-200' : 'text-purple-200')}`}>
                                        {getRelatedStatusText()}
                                    </span>
                                    {relatedHeroId && (
                                        <button type="button" onClick={() => setRelatedHeroId(undefined)} className="px-2 text-red-500 transition-colors hover:text-white">X</button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowLinker(true)} className={`flex-1 border px-4 py-2 text-[10px] font-black uppercase transition-all hover:brightness-125 ${isZombie ? 'border-cyan-800 bg-cyan-900/40 text-cyan-400' : 'border-purple-800 bg-purple-900/40 text-purple-400'}`}>
                                        Seleccionar contraparte
                                    </button>
                                    <button type="button" onClick={() => setRelatedHeroId('NO_VARIANT')} className="flex-1 border border-slate-700 bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-gray-500 transition-all hover:border-red-900 hover:bg-red-900/20 hover:text-red-400">
                                        Anular variante
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border border-slate-800 bg-slate-900/30 p-4">
                            <label className={`mb-4 block border-b pb-2 text-center text-[10px] font-black uppercase tracking-widest ${accentClass} ${borderClass}`}>ESTADISTICAS</label>
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { key: 'strength', label: 'STRENGTH', color: 'text-red-500 border-red-900 hover:border-red-500 hover:text-red-500' },
                                    { key: 'agility', label: 'AGILITY', color: 'text-emerald-500 border-emerald-900 hover:border-emerald-500 hover:text-emerald-500' },
                                    { key: 'intellect', label: 'INTELLECT', color: 'text-cyan-500 border-cyan-900 hover:border-cyan-500 hover:text-cyan-500' }
                                ].map((stat) => (
                                    <div key={stat.key} className="text-center">
                                        <label className={`mb-2 block text-[9px] font-black tracking-tighter ${stat.color.split(' ')[0]}`}>{stat.label}</label>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setStats({ ...stats, [stat.key]: Math.max(1, stats[stat.key as keyof HeroStats] - 1) })}
                                                className={`h-6 w-6 border text-slate-300 ${stat.color}`}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-xl font-black text-white">{stats[stat.key as keyof HeroStats]}</span>
                                            <button
                                                type="button"
                                                onClick={() => setStats({ ...stats, [stat.key]: Math.min(10, stats[stat.key as keyof HeroStats] + 1) })}
                                                className={`h-6 w-6 border text-slate-300 ${stat.color}`}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    ))}
                            </div>
                        </div>

                        <div className="border border-slate-800 bg-slate-900/30 p-4 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <label className={`text-[10px] font-black uppercase tracking-widest ${accentClass}`}>FICHA OPERATIVA</label>
                                <div className="flex flex-wrap gap-2">
                                    {sheetVariants.map((variant, index) => (
                                        <button
                                            key={`variant_${index}`}
                                            type="button"
                                            onClick={() => setActiveSheetIndex(index)}
                                            className={`border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${activeSheetIndex === index ? `${borderClass} ${accentClass} bg-black` : 'border-slate-800 text-gray-500 hover:text-white'}`}
                                        >
                                            {variant.es.set || variant.en.set || `VARIANTE ${index + 1}`}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addSheetVariant}
                                        className="border border-emerald-800 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-900/20"
                                    >
                                        + Variante
                                    </button>
                                    <button
                                        type="button"
                                        onClick={duplicateSheetVariant}
                                        className="border border-slate-700 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800"
                                    >
                                        Duplicar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeSheetVariant(activeSheetIndex)}
                                        className="border border-red-900 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-300 hover:bg-red-900/20"
                                    >
                                        Borrar
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                                <div>
                                    <label className={`mb-1 block text-[9px] font-black uppercase tracking-widest ${accentClass}`}>SERIE</label>
                                    <input
                                        value={activeSheetVariant.es.set}
                                        onChange={(event) => updateCommonSheetField('set', event.target.value)}
                                        className={`w-full border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`}
                                    />
                                </div>
                                <div>
                                    <label className={`mb-1 block text-[9px] font-black uppercase tracking-widest ${accentClass}`}>VIDA</label>
                                    <input
                                        value={activeSheetVariant.es.life}
                                        onChange={(event) => updateCommonSheetField('life', event.target.value)}
                                        className={`w-full border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`}
                                    />
                                </div>
                                <div>
                                    <label className={`mb-1 block text-[9px] font-black uppercase tracking-widest ${accentClass}`}>TIPO</label>
                                    <input
                                        value={activeSheetVariant.es.type}
                                        onChange={(event) => updateCommonSheetField('type', event.target.value)}
                                        className={`w-full border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`}
                                    />
                                </div>
                                <div>
                                    <label className={`mb-1 block text-[9px] font-black uppercase tracking-widest ${accentClass}`}>DADOS</label>
                                    <input
                                        value={activeSheetVariant.es.dice}
                                        onChange={(event) => updateCommonSheetField('dice', event.target.value)}
                                        className={`w-full border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`}
                                    />
                                </div>
                                <div>
                                    <label className={`mb-1 block text-[9px] font-black uppercase tracking-widest ${accentClass}`}>TO HIT</label>
                                    <input
                                        value={activeSheetVariant.es.toHit}
                                        onChange={(event) => updateCommonSheetField('toHit', event.target.value)}
                                        className={`w-full border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`}
                                    />
                                </div>
                                <div className="md:col-span-5">
                                    <label className={`mb-1 block text-[9px] font-black uppercase tracking-widest ${accentClass}`}>ALCANCE</label>
                                    <input
                                        value={activeSheetVariant.es.range}
                                        onChange={(event) => updateCommonSheetField('range', event.target.value)}
                                        className={`w-full border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveSheetLanguage('es')}
                                    className={`border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${activeSheetLanguage === 'es' ? `${accentClass} ${borderClass} bg-black` : 'border-slate-800 text-gray-500 hover:text-white'}`}
                                >
                                    Español
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSheetLanguage('en')}
                                    className={`border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${activeSheetLanguage === 'en' ? `${accentClass} ${borderClass} bg-black` : 'border-slate-800 text-gray-500 hover:text-white'}`}
                                >
                                    English
                                </button>
                                <span className="ml-auto text-[9px] uppercase tracking-[0.25em] text-gray-500">
                                    {activeSheetData.characterName || alias || 'FICHA'}
                                </span>
                            </div>

                            <div className="grid gap-4 xl:grid-cols-2">
                                {[
                                    { key: 'blue', title: 'AZUL', name: 'blueSkillName', desc: 'blueSkillDescription', color: 'text-cyan-400 border-cyan-900/60' },
                                    { key: 'yellow', title: 'AMARILLA', name: 'yellowSkillName', desc: 'yellowSkillDescription', color: 'text-amber-400 border-amber-900/60' },
                                    { key: 'orange', title: 'NARANJA', name: 'orangeSkillName', desc: 'orangeSkillDescription', color: 'text-orange-400 border-orange-900/60' },
                                    { key: 'red', title: 'ROJA', name: 'redSkillName', desc: 'redSkillDescription', color: 'text-red-400 border-red-900/60' }
                                ].map((ability) => (
                                    <div key={`${ability.key}_${activeSheetLanguage}`} className={`border bg-slate-950/60 p-3 ${ability.color}`}>
                                        <div className={`mb-2 text-[9px] font-black uppercase tracking-[0.28em] ${ability.color.split(' ')[0]}`}>
                                            {ability.title} / {activeSheetLanguage.toUpperCase()}
                                        </div>
                                        <input
                                            value={activeSheetData[ability.name as keyof HeroPlayableSheet] as string}
                                            onChange={(event) => updateSheetField(activeSheetIndex, activeSheetLanguage, ability.name as keyof HeroPlayableSheet, event.target.value)}
                                            placeholder="Nombre del poder"
                                            className="mb-2 w-full border border-slate-800 bg-black p-2 text-sm font-bold text-white outline-none"
                                        />
                                        <textarea
                                            value={activeSheetData[ability.desc as keyof HeroPlayableSheet] as string}
                                            onChange={(event) => updateSheetField(activeSheetIndex, activeSheetLanguage, ability.desc as keyof HeroPlayableSheet, event.target.value)}
                                            rows={4}
                                            placeholder="Descripcion del poder"
                                            className="w-full resize-none border border-slate-800 bg-black p-2 text-xs text-white outline-none"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">APARICION ESPECIAL</label>
                                    <textarea
                                        value={activeSheetVariant.es.spawnAbility}
                                        onChange={(event) => updateCommonSheetField('spawnAbility', event.target.value)}
                                        rows={3}
                                        className="w-full resize-none border border-slate-800 bg-black p-2 text-xs text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">DUREZA</label>
                                    <input
                                        value={activeSheetVariant.es.toughness}
                                        onChange={(event) => updateCommonSheetField('toughness', event.target.value)}
                                        className="w-full border border-slate-800 bg-black p-2 text-sm text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className={`mb-1 block text-[10px] font-black uppercase tracking-widest ${accentClass}`}>URL RETRATO</label>
                                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className={`w-full border bg-slate-950 p-2 text-[10px] text-white outline-none overflow-hidden ${borderClass} ${focusClass}`} />
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <button type="button" onClick={() => handleOpenImagePicker('portrait')} className={`border px-3 py-1 text-[10px] font-black uppercase transition-all hover:bg-white/5 ${borderClass} ${accentClass}`}>
                                            Buscar imagen en GitHub
                                        </button>
                                        {imageUrl && (
                                            <button type="button" onClick={() => setImageUrl('')} className="border border-slate-700 px-3 py-1 text-[10px] font-black uppercase text-gray-300 transition-all hover:border-white">
                                                Limpiar imagen
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-2 text-[9px] uppercase tracking-wide text-cyan-300/70">
                                        Repositorio conectado: jaz206 / MisionesMZC
                                    </div>
                                    {isImagePickerOpen && (
                                        <div className="mt-3 border border-slate-800 bg-black/70">
                                            <div className="flex flex-col gap-3 border-b border-slate-800 p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className={`text-[10px] font-black uppercase tracking-widest ${accentClass}`}>
                                                        {imagePickerTarget === 'sheet' ? 'Biblioteca de fichas' : 'Biblioteca de imagenes'}
                                                    </div>
                                                    <button type="button" onClick={() => setIsImagePickerOpen(false)} className="text-[10px] uppercase text-gray-500 hover:text-white">
                                                        Cerrar
                                                    </button>
                                                </div>
                                                <input
                                                    value={imagePickerQuery}
                                                    onChange={(e) => setImagePickerQuery(e.target.value)}
                                                    placeholder="Buscar por nombre o carpeta..."
                                                    className={`w-full border bg-slate-950 p-2 text-[10px] text-white outline-none transition-all ${borderClass} ${focusClass}`}
                                                />
                                            </div>
                                            <div className="max-h-72 overflow-y-auto">
                                                {imagePickerLoading ? (
                                                    <div className={`p-4 text-[10px] font-black uppercase tracking-widest ${accentClass}`}>
                                                        Cargando imagenes...
                                                    </div>
                                                ) : imagePickerError ? (
                                                    <div className="p-4 text-[10px] uppercase tracking-wide text-red-400">
                                                        {imagePickerError}
                                                    </div>
                                                ) : filteredImageOptions.length === 0 ? (
                                                    <div className="p-4 text-[10px] uppercase tracking-wide text-gray-400">
                                                        No hay imagenes que coincidan con esa busqueda.
                                                    </div>
                                                ) : (
                                                    filteredImageOptions.map((option) => (
                                                        <button
                                                            key={option.path}
                                                            type="button"
                                                            onClick={() => handleSelectRepoImage(option)}
                                                            className={`flex w-full items-center gap-3 border-b border-slate-900 px-3 py-3 text-left transition-all ${imageUrl === option.url ? 'bg-cyan-900/20' : 'bg-transparent hover:bg-white/5'}`}
                                                        >
                                                            <div className="h-14 w-14 shrink-0 overflow-hidden border border-slate-800 bg-black">
                                                                <img src={option.url} alt={option.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className={`truncate text-[10px] font-black uppercase ${accentClass}`}>{option.name}</div>
                                                                <div className="break-all text-[9px] text-gray-500">{option.path}</div>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-yellow-600">URL FICHA COMPLETA</label>
                                    <input value={characterSheetUrl} onChange={(e) => setCharacterSheetUrl(e.target.value)} placeholder="https://..." className="w-full overflow-hidden border border-yellow-950 bg-slate-950 p-2 text-[10px] text-yellow-200 outline-none focus:border-yellow-500" />
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <button type="button" onClick={() => handleOpenImagePicker('sheet')} className="border border-yellow-800 px-3 py-1 text-[10px] font-black uppercase text-yellow-300 transition-all hover:bg-yellow-900/20">
                                            Buscar ficha en GitHub
                                        </button>
                                        {characterSheetUrl && (
                                            <button type="button" onClick={() => setCharacterSheetUrl('')} className="border border-slate-700 px-3 py-1 text-[10px] font-black uppercase text-gray-300 transition-all hover:border-white">
                                                Limpiar ficha
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border border-slate-800 bg-black p-3">
                                <label className={`mb-1 text-center text-[9px] font-black uppercase ${accentClass}`}>AJUSTE DE ENCUADRE</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] uppercase text-gray-500">Zoom</span>
                                        <input type="range" min="1" max="3" step="0.1" value={imgScale} onChange={(e) => setImgScale(parseFloat(e.target.value))} className="w-full accent-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] uppercase text-gray-500">Offset X</span>
                                        <input type="range" min="-50" max="50" value={imgX} onChange={(e) => setImgX(parseInt(e.target.value, 10))} className="w-full accent-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] uppercase text-gray-500">Offset Y</span>
                                        <input type="range" min="-50" max="50" value={imgY} onChange={(e) => setImgY(parseInt(e.target.value, 10))} className="w-full accent-white" />
                                    </div>
                                </div>
                                <button type="button" onClick={() => { setImgScale(1); setImgX(0); setImgY(0); }} className="text-[8px] font-black uppercase text-red-900 hover:text-red-500">
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={`mb-1 block text-[10px] font-black uppercase tracking-widest ${accentClass}`}>HISTORIA / HISTORIAL</label>
                                <textarea value={originEs} onChange={(e) => setOriginEs(e.target.value)} rows={4} className={`w-full resize-none border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`} />
                            </div>
                            <div>
                                <label className={`mb-1 block text-[10px] font-black uppercase tracking-widest ${accentClass}`}>PERFIL DE PODERES</label>
                                <textarea value={bioEs} onChange={(e) => setBioEs(e.target.value)} rows={4} className={`w-full resize-none border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`} />
                            </div>
                            <div>
                                <label className={`mb-1 block text-[10px] font-black uppercase tracking-widest ${accentClass}`}>EVALUACION DE S.H.I.E.L.D.</label>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <textarea value={currentStoryEs} onChange={(e) => setCurrentStoryEs(e.target.value)} rows={4} placeholder="Texto en espanol" className={`w-full resize-none border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`} />
                                    <textarea value={currentStoryEn} onChange={(e) => setCurrentStoryEn(e.target.value)} rows={4} placeholder="Text in English" className={`w-full resize-none border bg-slate-950 p-2 text-xs text-white outline-none ${borderClass} ${focusClass}`} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                            <button type="button" onClick={onClose} className="border border-red-900 px-6 py-2 text-[10px] font-black uppercase text-red-500 transition-all hover:bg-red-900/20">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} className={`px-10 py-2 text-[10px] font-black uppercase text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${buttonClass}`}>
                                {saving ? 'Guardando...' : (initialData ? 'Actualizar registro' : 'Crear personaje')}
                            </button>
                        </div>
                    </form>

                    <div className="hidden w-80 select-none flex-col items-center justify-center gap-6 border-l border-slate-900 bg-black/40 p-6 lg:flex">
                        <h4 className={`mb-4 text-[10px] font-black uppercase tracking-[0.4em] ${accentClass}`}>VISTA PREVIA</h4>

                        <div className={`relative h-64 w-48 overflow-hidden border-2 bg-slate-900 ${isZombie ? 'border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.2)]' : 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'}`}>
                            <div className={`absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between border-b border-black/50 px-2 ${isZombie ? 'bg-lime-900/80' : 'bg-cyan-900/80'}`}>
                                <span className="truncate pr-1 text-[10px] font-black uppercase text-white">{alias || 'CODENAME'}</span>
                                <span className={`border border-current px-1 text-[8px] font-bold ${isZombie ? 'text-lime-200' : 'text-cyan-200'}`}>{heroClass}</span>
                            </div>

                            <div className="absolute inset-x-0 bottom-12 top-8 overflow-hidden bg-black">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        className="h-full w-full object-cover transition-all duration-500 group-hover:grayscale-0"
                                        style={{ transform: `scale(${imgScale}) translate(${imgX}%, ${imgY}%)` }}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[8px] font-black italic text-gray-800">
                                        IMAGEN REQUERIDA
                                    </div>
                                )}
                            </div>

                            <div className="absolute inset-x-0 bottom-0 flex h-14 flex-col justify-between border-t border-white/10 bg-black/90 p-2">
                                <div className="flex items-center justify-between text-[7px] font-black">
                                    <span className="text-red-500">STR {stats.strength}</span>
                                    <span className="text-emerald-500">AGI {stats.agility}</span>
                                    <span className="text-cyan-500">INT {stats.intellect}</span>
                                </div>
                                <div className="truncate font-mono text-[8px] italic text-gray-500">
                                    {isZombie ? 'BIOHAZARD DETECTED' : 'CLEARANCE LEVEL OMEGA'}
                                </div>
                                <div className={`h-1 w-full opacity-50 ${isZombie ? 'bg-lime-600' : 'bg-cyan-600'}`}></div>
                            </div>
                        </div>

                        <p className="text-center text-[8px] uppercase tracking-widest leading-relaxed text-gray-600">
                            Los cambios se reflejan al momento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
