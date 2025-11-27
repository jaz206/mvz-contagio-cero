
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { USAMap } from './components/USAMap';
import { LoginScreen } from './components/LoginScreen';
import { translations, Language } from './translations';
import { Mission, Hero } from './types';
import { MissionModal } from './components/MissionModal';
import { BunkerInterior } from './components/BunkerInterior';
import { StoryMode } from './components/StoryMode';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { logout } from './services/authService';

// Centralized Faction Definitions
const FACTION_STATES = {
  magneto: new Set([
    "Washington", "Oregon", "California", "Arizona", "Colorado", 
    "Wyoming", "Montana", "Alaska", "Hawaii", "Nevada", "Utah", "Idaho"
  ]),
  kingpin: new Set([
    "Virginia", "West Virginia", "Pennsylvania", "New York", "Vermont", 
    "New Hampshire", "Maine", "Massachusetts", "Rhode Island", "Connecticut", 
    "New Jersey", "Delaware", "Maryland", "District of Columbia"
  ]),
  hulk: new Set([
    "North Dakota", "South Dakota", "Nebraska", "Kansas", "Oklahoma", 
    "New Mexico", "Texas", "Missouri", "Illinois", "Indiana", 
    "Ohio", "Michigan", "Wisconsin", "Minnesota", "Iowa"
  ])
  // Doom: All others (Checked via else logic)
};

// Initial Living Heroes
const INITIAL_HEROES: Hero[] = [
    {
        id: 'h1',
        templateId: 'spiderman',
        name: 'Peter Parker',
        alias: 'SPIDER-MAN',
        status: 'AVAILABLE',
        class: 'SCOUT',
        bio: 'Former Avenger. High agility and spider-sense make him an ideal scout for infected zones. Carries the guilt of survival.',
        imageUrl: 'https://i.pinimg.com/736x/a7/b5/42/a7b5426842d78ac7e7230d8fc3899b4d.jpg',
        stats: { strength: 8, agility: 10, intellect: 9 },
        assignedMissionId: null
    },
    {
        id: 'h2',
        templateId: 'blackwidow',
        name: 'Natasha Romanoff',
        alias: 'BLACK WIDOW',
        status: 'AVAILABLE',
        class: 'TACTICIAN',
        bio: 'Expert spy and assassin. Her skills are crucial for infiltration missions in Fisk\'s territory. Keeps the team focused on the objective.',
        imageUrl: 'https://i.pinimg.com/736x/04/22/42/042242d9f82aa42ec72efb4339b0d43d.jpg',
        stats: { strength: 6, agility: 9, intellect: 9 },
        assignedMissionId: null
    },
    {
        id: 'h3',
        templateId: 'scorpion',
        name: 'Mac Gargan',
        alias: 'SCORPION',
        status: 'AVAILABLE',
        class: 'BRAWLER',
        bio: 'Former villain turned desperate survivor. His suit provides protection against bites. Unpredictable, but necessary muscle.',
        imageUrl: 'https://i.pinimg.com/736x/b7/e4/90/b7e490624ade7c73bf8d4dc135bbbb58.jpg',
        stats: { strength: 9, agility: 7, intellect: 5 },
        assignedMissionId: null
    },
    {
        id: 'h4',
        templateId: 'sabretooth',
        name: 'Victor Creed',
        alias: 'SABRETOOTH',
        status: 'DEPLOYED',
        class: 'BRAWLER',
        bio: 'Driven by pure predatory instinct. S.H.I.E.L.D. keeps him on a tight leash. He tracks the infected not to save them, but for the sport.',
        imageUrl: 'https://i.pinimg.com/1200x/b0/28/ce/b028ce5d3234fbeecc8d75b04a32c9d7.jpg',
        stats: { strength: 10, agility: 7, intellect: 4 },
        assignedMissionId: 'kraven-ny' 
    },
    {
        id: 'h5',
        templateId: 'reed',
        name: 'Reed Richards',
        alias: 'MR. FANTASTIC',
        status: 'AVAILABLE',
        class: 'TACTICIAN',
        bio: 'The smartest man alive, struggling to find a cure in a world that has rejected science. His intellect is humanity\'s last hope.',
        imageUrl: 'https://i.pinimg.com/1200x/14/53/8f/14538f644cde719845a2948c6df4d110.jpg',
        stats: { strength: 5, agility: 6, intellect: 10 },
        assignedMissionId: null
    },
    {
        id: 'h6',
        templateId: 'shehulk',
        name: 'Jennifer Walters',
        alias: 'SHE-HULK',
        status: 'AVAILABLE',
        class: 'BRAWLER',
        bio: 'A lawyer who can bench press a tank. Retains her intelligence while transformed, making her a deadly combination of brains and brawn on the battlefield.',
        imageUrl: 'https://i.pinimg.com/736x/f2/6b/75/f26b75eafd31830b60979dc1c1b82d8a.jpg',
        stats: { strength: 10, agility: 6, intellect: 8 },
        assignedMissionId: null
    }
];

// Initial Zombie Heroes
const INITIAL_ZOMBIE_HEROES: Hero[] = [
    {
        id: 'z1',
        templateId: 'colonel',
        name: 'Steve Rogers',
        alias: 'COLONEL AMERICA',
        status: 'AVAILABLE',
        class: 'TACTICIAN',
        bio: 'Tactical genius preserved in a rotting brain. Leads the horde.',
        imageUrl: '',
        stats: { strength: 8, agility: 6, intellect: 8 },
        assignedMissionId: null
    },
    {
        id: 'z2',
        templateId: 'ironman_z',
        name: 'Tony Stark',
        alias: 'IRON MAN (Z)',
        status: 'AVAILABLE',
        class: 'BLASTER',
        bio: 'Tech-enhanced hunger. Repulsors fueled by flesh.',
        imageUrl: '',
        stats: { strength: 7, agility: 6, intellect: 10 },
        assignedMissionId: null
    },
    {
        id: 'z3',
        templateId: 'wolverine_z',
        name: 'Logan',
        alias: 'WOLVERINE (Z)',
        status: 'AVAILABLE',
        class: 'BRAWLER',
        bio: 'Regenerating rot. The ultimate predator.',
        imageUrl: '',
        stats: { strength: 9, agility: 9, intellect: 5 },
        assignedMissionId: null
    },
    {
        id: 'z4',
        templateId: 'phoenix_z',
        name: 'Jean Grey',
        alias: 'DARK PHOENIX (Z)',
        status: 'AVAILABLE',
        class: 'BLASTER',
        bio: 'Cosmic hunger. Devourer of worlds.',
        imageUrl: '',
        stats: { strength: 10, agility: 8, intellect: 9 },
        assignedMissionId: null
    }
];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isGuest, setIsGuest] = useState(false); 
  
  const [viewMode, setViewMode] = useState<'map' | 'bunker'>('map');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showStory, setShowStory] = useState(false);
  const t = translations[lang];

  // -- STATE PERSISTENCE --
  const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(new Set());
  const [heroes, setHeroes] = useState<Hero[]>(INITIAL_HEROES);
  const [playerAlignment, setPlayerAlignment] = useState<'ALIVE' | 'ZOMBIE' | null>(null);

  // Helper to get storage keys based on current user and alignment
  const getStorageKeys = useCallback((alignment: 'ALIVE' | 'ZOMBIE' | null, currentUser: User | null, guestMode: boolean) => {
      const uid = currentUser ? currentUser.uid : (guestMode ? 'guest' : null);
      if (!uid || !alignment) return null;
      
      return {
          missions: `shield_missions_${uid}_${alignment}`,
          heroes: `shield_heroes_${uid}_${alignment}`,
          legacyMissions: `shield_missions_${uid}`, // For migration
          legacyHeroes: `shield_heroes_${uid}` // For migration
      };
  }, []);

  // 1. Auth Listener
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoadingAuth(false);
          
          if (currentUser) {
            setIsGuest(false);
            // Check if user has seen intro and get LAST PLAYED alignment
            const hasSeen = localStorage.getItem(`shield_intro_seen_${currentUser.uid}`);
            const savedAlignment = localStorage.getItem(`shield_alignment_${currentUser.uid}`);
            
            if (!hasSeen) {
                setShowStory(true);
            }
            if (savedAlignment) {
                setPlayerAlignment(savedAlignment as 'ALIVE' | 'ZOMBIE');
            }
          }
      });
      return () => unsubscribe();
  }, []);

  // 2. Load Data when User OR Alignment changes
  useEffect(() => {
      if (loadingAuth || (!user && !isGuest)) return;
      if (!playerAlignment) return; // Wait until alignment is selected (Story or saved)

      const keys = getStorageKeys(playerAlignment, user, isGuest);
      if (!keys) return;

      // Load Missions
      try {
          const savedMissions = localStorage.getItem(keys.missions);
          if (savedMissions) {
              setCompletedMissionIds(new Set(JSON.parse(savedMissions)));
          } else {
              // MIGRATION: Check if legacy data exists (from before update) and current alignment is ALIVE
              if (playerAlignment === 'ALIVE') {
                  const legacyMissions = localStorage.getItem(keys.legacyMissions);
                  if (legacyMissions) {
                      setCompletedMissionIds(new Set(JSON.parse(legacyMissions)));
                  } else {
                      setCompletedMissionIds(new Set()); 
                  }
              } else {
                  setCompletedMissionIds(new Set()); 
              }
          }
      } catch (e) {
          setCompletedMissionIds(new Set());
      }

      // Load Heroes
      try {
          const savedHeroes = localStorage.getItem(keys.heroes);
          if (savedHeroes) {
              setHeroes(JSON.parse(savedHeroes));
          } else {
               // Load initial roster based on alignment
               if (playerAlignment === 'ALIVE') {
                   const legacyHeroes = localStorage.getItem(keys.legacyHeroes);
                   if (legacyHeroes) {
                       setHeroes(JSON.parse(legacyHeroes));
                   } else {
                       setHeroes(INITIAL_HEROES); 
                   }
               } else {
                   // ZOMBIE MODE DEFAULT
                   setHeroes(INITIAL_ZOMBIE_HEROES); 
               }
          }
      } catch (e) {
          setHeroes(playerAlignment === 'ZOMBIE' ? INITIAL_ZOMBIE_HEROES : INITIAL_HEROES);
      }

  }, [user, loadingAuth, isGuest, playerAlignment, getStorageKeys]);


  // 3. Save Data when State changes (using current alignment keys)
  useEffect(() => {
      if (loadingAuth || !playerAlignment) return;
      
      const keys = getStorageKeys(playerAlignment, user, isGuest);
      if (!keys) return;

      localStorage.setItem(keys.missions, JSON.stringify([...completedMissionIds]));
  }, [completedMissionIds, user, loadingAuth, isGuest, playerAlignment, getStorageKeys]);

  useEffect(() => {
      if (loadingAuth || !playerAlignment) return;

      const keys = getStorageKeys(playerAlignment, user, isGuest);
      if (!keys) return;

      localStorage.setItem(keys.heroes, JSON.stringify(heroes));
  }, [heroes, user, loadingAuth, isGuest, playerAlignment, getStorageKeys]);

  // Persist the alignment preference itself (so we reload into the same campaign)
  useEffect(() => {
      if (loadingAuth) return;
      if (playerAlignment) {
        const storageKeyAlignment = user ? `shield_alignment_${user.uid}` : 'shield_alignment_guest';
        localStorage.setItem(storageKeyAlignment, playerAlignment);
      }
  }, [playerAlignment, user, loadingAuth, isGuest]);

  // Guest Login Handler
  const handleGuestLogin = () => {
      setIsGuest(true);
      // Only show story if alignment is not set (first time guest)
      const savedAlignment = localStorage.getItem('shield_alignment_guest');
      if (!savedAlignment) {
          setShowStory(true);
      } else {
          setPlayerAlignment(savedAlignment as 'ALIVE' | 'ZOMBIE');
      }
  };

  // Story Completion Handler
  const handleStoryComplete = (choice: 'ALIVE' | 'ZOMBIE') => {
      setPlayerAlignment(choice);
      setShowStory(false);
      
      // Mark intro as seen for Auth users
      if (user) {
          localStorage.setItem(`shield_intro_seen_${user.uid}`, 'true');
      }
  };

  const handleCampaignSwitch = (newAlignment: 'ALIVE' | 'ZOMBIE') => {
      if (playerAlignment === newAlignment) return;
      
      // The current state is already saved by useEffects.
      // We just update the alignment, and the Load effect will trigger to fetch the new campaign data.
      setPlayerAlignment(newAlignment);
      setViewMode('map'); // Reset view to map on switch
  };

  // --- MISSION DEFINITIONS ---
  const allMissions: Mission[] = useMemo(() => {
      
      if (playerAlignment === 'ZOMBIE') {
          // ZOMBIE CAMPAIGN
          return [
              {
                id: 'fresh-meat-tx',
                title: t.missions.freshMeat.title,
                description: t.missions.freshMeat.description,
                objectives: t.missions.freshMeat.objectives,
                location: {
                    state: 'Texas',
                    coordinates: [-99.0, 31.0] 
                },
                threatLevel: 'HUNGER'
              },
              {
                id: 'break-siege-ca',
                prereq: 'fresh-meat-tx',
                title: t.missions.breakSiege.title,
                description: t.missions.breakSiege.description,
                objectives: t.missions.breakSiege.objectives,
                location: {
                    state: 'California',
                    coordinates: [-119.0, 36.0]
                },
                threatLevel: 'APOCALYPTIC'
              }
          ];
      } else {
          // ALIVE / HERO CAMPAIGN (Default)
          return [
            {
                id: 'kraven-ny',
                title: t.missions.kraven.title,
                description: t.missions.kraven.description,
                objectives: t.missions.kraven.objectives,
                location: {
                    state: 'New York',
                    coordinates: [-75.5, 43.0] 
                },
                threatLevel: 'CRITICAL'
            },
            {
                id: 'flesh-sleeps',
                prereq: 'kraven-ny',
                title: t.missions.fleshSleeps.title,
                description: t.missions.fleshSleeps.description,
                objectives: t.missions.fleshSleeps.objectives,
                location: {
                    state: 'New Jersey',
                    coordinates: [-74.4, 40.0] 
                },
                threatLevel: 'EXTREME'
            }
          ];
      }
  }, [t, playerAlignment]);

  // Filter missions: Show ALL missions that are either completed OR have their prereq met.
  const visibleMissions = useMemo(() => {
    return allMissions.filter(m => {
        const isCompleted = completedMissionIds.has(m.id);
        const prereqMet = !m.prereq || completedMissionIds.has(m.prereq);
        return isCompleted || prereqMet;
    });
  }, [allMissions, completedMissionIds]);

  // Filter only missions available for assignment (not completed, currently active)
  const assignableMissions = useMemo(() => {
      return visibleMissions.filter(m => !completedMissionIds.has(m.id));
  }, [visibleMissions, completedMissionIds]);

  const handleMissionComplete = (id: string) => {
    setCompletedMissionIds(prev => new Set(prev).add(id));
  };

  const handleAssignHero = (heroId: string, missionId: string) => {
      // Check limits: Max 6 heroes per mission
      const heroesOnMission = heroes.filter(h => h.assignedMissionId === missionId);
      if (heroesOnMission.length >= 6) {
          return false; // Limit reached
      }

      setHeroes(prev => prev.map(h => {
          if (h.id === heroId) {
              return { 
                  ...h, 
                  status: 'DEPLOYED', 
                  assignedMissionId: missionId 
              };
          }
          return h;
      }));
      return true; // Success
  };

  const handleUnassignHero = (heroId: string) => {
      setHeroes(prev => prev.map(h => {
          if (h.id === heroId) {
              return { 
                  ...h, 
                  status: 'AVAILABLE', 
                  assignedMissionId: null 
              };
          }
          return h;
      }));
  };
  
  const handleAddHero = (newHero: Hero) => {
      setHeroes(prev => [...prev, newHero]);
  };

  const handleLogout = async () => {
      await logout();
      setIsGuest(false); // Reset guest state so login screen appears again
      setViewMode('map');
      // We don't clear local alignment on logout to remember user choice, but we could if desired.
  };

  const getMissionsForFaction = (factionKey: 'magneto' | 'kingpin' | 'hulk' | 'doom') => {
      return visibleMissions.filter(m => {
          const state = m.location.state;
          if (factionKey === 'magneto') return FACTION_STATES.magneto.has(state);
          if (factionKey === 'kingpin') return FACTION_STATES.kingpin.has(state);
          if (factionKey === 'hulk') return FACTION_STATES.hulk.has(state);
          // Doom is fallback
          return !FACTION_STATES.magneto.has(state) && !FACTION_STATES.kingpin.has(state) && !FACTION_STATES.hulk.has(state);
      });
  };

  const renderMissionList = (factionKey: 'magneto' | 'kingpin' | 'hulk' | 'doom') => {
      const missions = getMissionsForFaction(factionKey);
      if (missions.length === 0) return null;

      return (
          <div className="mt-2 pl-2 border-l border-dashed border-cyan-800">
              <div className="text-[10px] text-cyan-600 mb-1">{t.sidebar.activeMissions}:</div>
              {missions.map(m => {
                  const isCompleted = completedMissionIds.has(m.id);
                  return (
                    <div 
                        key={m.id} 
                        onClick={() => setSelectedMission(m)}
                        className={`text-xs border p-1 mb-1 transition-all cursor-pointer hover:brightness-110 ${
                            isCompleted 
                            ? 'text-emerald-300 bg-emerald-900/20 border-emerald-500/50 opacity-80' 
                            : 'text-yellow-100 bg-yellow-900/40 border-yellow-500/50 animate-pulse'
                        }`}
                    >
                        {isCompleted ? '✓' : '⚠'} {m.title}
                    </div>
                  );
              })}
          </div>
      );
  };

  // Login Screen rendered if no user, not loading, and NOT guest
  if (!loadingAuth && !user && !isGuest) {
    return (
      <LoginScreen 
        onLogin={handleGuestLogin} 
        onGoogleLogin={() => {}} 
        language={lang} 
        setLanguage={setLang} 
      />
    );
  }

  // Loading Screen while checking auth
  if (loadingAuth) {
      return <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-cyan-500 font-mono">INITIALIZING UPLINK...</div>;
  }

  return (
    <div className={`flex flex-col h-screen w-full bg-slate-950 text-cyan-400 font-mono overflow-hidden relative ${playerAlignment === 'ZOMBIE' ? 'hue-rotate-15 saturate-50' : ''}`}>
      
      {/* Story Mode Overlay */}
      {showStory && (
          <StoryMode 
            language={lang} 
            onComplete={handleStoryComplete} 
            onSkip={() => handleStoryComplete('ALIVE')} // Default if skipped
          />
      )}

      {/* View Mode Switching */}
      {viewMode === 'bunker' ? (
        <BunkerInterior 
          heroes={heroes} 
          missions={assignableMissions}
          onAssign={handleAssignHero}
          onUnassign={handleUnassignHero}
          onAddHero={handleAddHero}
          onBack={() => setViewMode('map')} 
          language={lang} 
        />
      ) : (
        <>
            {/* BACKGROUND OVERLAY for Map Mode */}
            <div className="absolute inset-0 pointer-events-none opacity-10" 
                style={{backgroundImage: 'linear-gradient(rgba(6,182,212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
            </div>

            {/* Header / Top Bar */}
            <header className="flex justify-between items-center p-4 border-b border-cyan-800 bg-slate-900/80 z-20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-2 border-cyan-400 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-900/20"></div>
                    <span className="text-2xl font-bold">S.H.I.E.L.D.</span>
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
                    {t.header.project}
                    </h1>
                    <p className="text-[10px] md:text-xs text-red-500 tracking-widest font-bold">{t.header.failure}</p>
                </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                {/* Language Toggle & User Info */}
                <div className="flex gap-2 mb-1 items-center">
                    {(user || isGuest) && (
                         <div className="flex items-center gap-2 mr-2">
                            {user && user.photoURL && <img src={user.photoURL} className="w-4 h-4 rounded-full border border-cyan-500" alt="Agent" />}
                            <span className="text-[10px] text-cyan-600 hidden md:inline">{user ? (user.displayName || 'AGENT') : 'GUEST COMMANDER'}</span>
                            <button onClick={handleLogout} className="text-[10px] text-red-400 border border-red-900 px-2 hover:bg-red-900/50">{t.header.logout}</button>
                         </div>
                    )}
                    <div className="flex gap-1">
                        <button 
                        onClick={() => setLang('es')} 
                        className={`text-[10px] px-2 py-0.5 border transition-all ${lang === 'es' ? 'bg-cyan-900/80 border-cyan-400 text-white shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'border-cyan-900 text-cyan-700 hover:text-cyan-400'}`}
                        >
                        ES
                        </button>
                        <button 
                        onClick={() => setLang('en')} 
                        className={`text-[10px] px-2 py-0.5 border transition-all ${lang === 'en' ? 'bg-cyan-900/80 border-cyan-400 text-white shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'border-cyan-900 text-cyan-700 hover:text-cyan-400'}`}
                        >
                        EN
                        </button>
                    </div>
                </div>
                <div className="text-[10px] md:text-xs text-red-500 font-bold animate-pulse hidden md:block">{t.header.biohazard}</div>
                <div className="text-[10px] md:text-xs text-cyan-700 hidden md:block">{t.header.clearance}</div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-1 overflow-hidden relative p-4 gap-4">
                
                {/* Left Sidebar - Tactical Data */}
                <aside className="hidden lg:flex flex-col w-80 border border-cyan-900 bg-slate-900/80 p-4 gap-6 z-10 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-800">
                
                {/* Bunker Button */}
                <button
                    onClick={() => setViewMode('bunker')}
                    className={`w-full py-3 border font-bold text-xs tracking-widest hover:text-white transition-all flex items-center justify-center gap-3 shadow-[0_0_10px_rgba(6,182,212,0.1)] group ${
                        playerAlignment === 'ZOMBIE' 
                        ? 'bg-lime-900/30 border-lime-500 text-lime-300 hover:bg-lime-800/50' 
                        : 'bg-cyan-900/30 border-cyan-500 text-cyan-300 hover:bg-cyan-800/50'
                    }`}
                >
                    <div className={`w-5 h-5 border rounded-sm flex items-center justify-center ${playerAlignment === 'ZOMBIE' ? 'border-lime-400 group-hover:bg-lime-400/20' : 'border-cyan-400 group-hover:bg-cyan-400/20'}`}>
                        <div className={`w-2 h-2 rotate-45 ${playerAlignment === 'ZOMBIE' ? 'bg-lime-400' : 'bg-cyan-400'}`}></div>
                    </div>
                    {playerAlignment === 'ZOMBIE' ? t.sidebar.hiveBtn : t.sidebar.bunkerBtn}
                </button>
                
                {/* Campaign Switcher */}
                <div className="w-full">
                    <h3 className="text-[10px] text-cyan-600 mb-2 uppercase font-bold tracking-widest border-b border-cyan-900 pb-1">{t.sidebar.campaignMode}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleCampaignSwitch('ALIVE')}
                            className={`flex-1 py-2 text-[8px] font-bold border transition-all ${
                                playerAlignment === 'ALIVE' 
                                ? 'bg-cyan-800 text-white border-cyan-400' 
                                : 'text-gray-500 border-gray-700 hover:text-cyan-400 hover:border-cyan-600'
                            }`}
                        >
                            {playerAlignment === 'ALIVE' ? 'ACTIVE' : t.sidebar.switchHero}
                        </button>
                        <button
                            onClick={() => handleCampaignSwitch('ZOMBIE')}
                            className={`flex-1 py-2 text-[8px] font-bold border transition-all ${
                                playerAlignment === 'ZOMBIE' 
                                ? 'bg-lime-900 text-white border-lime-500' 
                                : 'text-gray-500 border-gray-700 hover:text-lime-400 hover:border-lime-600'
                            }`}
                        >
                            {playerAlignment === 'ZOMBIE' ? 'ACTIVE' : t.sidebar.switchZombie}
                        </button>
                    </div>
                </div>

                {/* Replay Story Button */}
                <button
                    onClick={() => setShowStory(true)}
                    className="w-full py-2 bg-slate-900 border border-cyan-800 text-cyan-600 font-bold text-[10px] tracking-widest hover:bg-cyan-900/30 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
                >
                    {t.sidebar.replayStory}
                </button>

                <div className="border-l-4 border-red-600 pl-3">
                    <h3 className="text-xs text-red-400 mb-1 font-bold">{t.sidebar.threatLevelTitle}</h3>
                    <div className="text-2xl font-bold text-white animate-pulse">{t.sidebar.threatLevelValue}</div>
                    <div className="text-[10px] text-red-400">{t.sidebar.infectionRate}</div>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-xs text-cyan-400 border-b border-cyan-800 pb-1 tracking-widest">{t.sidebar.factionIntel}</h3>
                    
                    {/* Broken Eden Intel (Magneto) - RED */}
                    <div className="bg-slate-800/50 p-2 border-l-2 border-red-600">
                    <div className="flex justify-between text-sm font-bold text-red-400">
                        <span>{t.factions.magneto.name}</span>
                        <span className="text-[10px] bg-red-900/50 px-1 rounded text-white">{t.factions.magneto.region}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{t.sidebar.leader}: MAGNETO</p>
                    <p className="text-[10px] text-cyan-700">{t.sidebar.status}: {t.factions.magneto.status}</p>
                    {renderMissionList('magneto')}
                    </div>

                    {/* Empire of Flesh Intel (Kingpin) - PURPLE */}
                    <div className="bg-slate-800/50 p-2 border-l-2 border-purple-500">
                    <div className="flex justify-between text-sm font-bold text-purple-400">
                        <span>{t.factions.kingpin.name}</span>
                        <span className="text-[10px] bg-purple-900/50 px-1 rounded text-white">{t.factions.kingpin.region}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{t.sidebar.leader}: KINGPIN</p>
                    <p className="text-[10px] text-cyan-700">{t.sidebar.status}: {t.factions.kingpin.status}</p>
                    {renderMissionList('kingpin')}
                    </div>

                    {/* Doomsberg Intel (Doom) - DARK GREEN */}
                    <div className="bg-slate-800/50 p-2 border-l-2 border-emerald-700">
                    <div className="flex justify-between text-sm font-bold text-emerald-500">
                        <span>{t.factions.doom.name}</span>
                        <span className="text-[10px] bg-emerald-900/50 px-1 rounded text-white">{t.factions.doom.region}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{t.sidebar.leader}: V. VON DOOM</p>
                    <p className="text-[10px] text-cyan-700">{t.sidebar.status}: {t.factions.doom.status}</p>
                    {renderMissionList('doom')}
                    </div>

                    {/* No Man's Land (Hulk) - LIME/WASTELAND */}
                    <div className="bg-slate-800/50 p-2 border-l-2 border-lime-600">
                    <div className="flex justify-between text-sm font-bold text-lime-400">
                        <span>{t.factions.hulk.name}</span>
                        <span className="text-[10px] bg-lime-900/50 px-1 rounded text-white">{t.factions.hulk.region}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{t.sidebar.threat}: HULK</p>
                    <p className="text-[10px] text-red-500 animate-pulse">{t.sidebar.status}: {t.factions.hulk.status}</p>
                    {renderMissionList('hulk')}
                    </div>
                </div>

                <div className="mt-auto space-y-2">
                    <div className="h-px w-full bg-cyan-900"></div>
                    <p className="text-[10px] text-cyan-600 italic">
                    {t.sidebar.quote}
                    </p>
                    <div className="border border-red-900 bg-red-900/20 p-2 text-center text-xs text-red-500 font-bold">
                    {t.sidebar.uplink}
                    </div>
                </div>
                </aside>

                {/* Map Container - The Viewport */}
                <div className="flex-1 relative border border-cyan-700/50 bg-slate-900/40 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden group">
                
                {/* Decorative Corner Brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 z-20"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 z-20"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 z-20"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 z-20"></div>

                {/* Animated Scanline (defined in index.html styles) */}
                <div className="scanline"></div>

                {/* The Map Component */}
                <USAMap 
                    language={lang} 
                    missions={visibleMissions}
                    completedMissionIds={completedMissionIds}
                    onMissionComplete={handleMissionComplete}
                    onMissionSelect={setSelectedMission}
                    onBunkerClick={() => setViewMode('bunker')}
                    factionStates={FACTION_STATES}
                />

                {/* Overlay UI elements on the map */}
                <div className="absolute bottom-4 left-4 z-20 text-[10px] md:text-xs text-cyan-600 bg-slate-900/80 p-2 border border-cyan-900 pointer-events-none">
                    <div>{t.map.satellite}</div>
                    <div>{t.map.zoom}</div>
                    <div className="text-red-500">{t.map.scanners}</div>
                </div>
                </div>

            </main>

            {/* Mission Dossier Modal - Rendered at App level */}
            {selectedMission && (
                <MissionModal 
                    mission={selectedMission} 
                    isOpen={!!selectedMission} 
                    onClose={() => setSelectedMission(null)}
                    onComplete={handleMissionComplete}
                    language={lang}
                    isCompleted={completedMissionIds.has(selectedMission.id)}
                />
            )}
        </>
      )}
    </div>
  );
};

export default App;
