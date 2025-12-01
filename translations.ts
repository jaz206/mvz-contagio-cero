
// translations.ts

export type Language = 'es' | 'en';

export const translations = {
  es: {
    login: {
      title: "S.H.I.E.L.D.",
      subtitle: "TERMINAL DE ACCESO SEGURO",
      clearance: "SE REQUIERE NIVEL 7",
      scanBtn: "INICIAR ESCANEO BIOMÉTRICO",
      googleBtn: "ACCEDER CON CREDENCIALES (GOOGLE)",
      editorBtn: "ACCESO DE EDITOR (NIVEL 10)",
      editorPass: "CÓDIGO DE ACCESO MAESTRO",
      editorEnter: "ENTRAR",
      scanning: "VERIFICANDO IDENTIDAD...",
      granted: "ACCESO CONCEDIDO. BIENVENIDO, DIRECTOR.",
      selectLang: "IDIOMA / LANGUAGE",
      idPrompt: "IDENTIFICACIÓN REQUERIDA",
      error: "ERROR DE AUTENTICACIÓN",
      passError: "CÓDIGO INCORRECTO"
    },
    header: {
      project: "PROYECTO: LÁZARO",
      failure: "FALLO DE CONTENCIÓN GLOBAL",
      biohazard: "/// AMENAZA BIOLÓGICA DETECTADA ///",
      clearance: "NIVEL: DIRECTOR",
      logout: "CERRAR SESIÓN",
      saving: "GUARDANDO...",
      saved: "GUARDADO EN NUBE"
    },
    sidebar: {
      threatLevelTitle: "NIVEL DE AMENAZA",
      threatLevelValue: "OMEGA",
      infectionRate: "TASA DE INFECCIÓN: CRÍTICA",
      factionIntel: "INTELIGENCIA DE FACCIONES",
      leader: "LÍDER",
      status: "ESTADO",
      threat: "AMENAZA",
      quote: "\"Cuando los muertos caminan, la línea entre héroe y monstruo desaparece.\"",
      uplink: "ENLACE DE SUPERVIVIENTES ACTIVO",
      activeMissions: "MISIONES ACTIVAS",
      noMissions: "SIN ACTIVIDAD DETECTADA",
      bunkerBtn: "ACCEDER AL BÚNKER DE MANDO",
      hiveBtn: "ACCEDER AL NIDO DE LA COLMENA",
      replayStory: "REPRODUCIR ARCHIVO 0-Z",
      campaignMode: "MODO DE CAMPAÑA",
      switchHero: "ACTIVAR PROTOCOLO LÁZARO (HÉROE)",
      switchZombie: "ACTIVAR HAMBRE VORAZ (ZOMBIE)"
    },
    factions: {
      magneto: {
        name: "EL EDÉN ROTO",
        region: "OESTE",
        status: "BASTIÓN MUTANTE"
      },
      kingpin: {
        name: "IMPERIO DE LA CARNE",
        region: "NORESTE",
        status: "HOSTILES ORGANIZADOS"
      },
      doom: {
        name: "DOOMSBERG",
        region: "SUR",
        status: "FUERTEMENTE FORTIFICADO"
      },
      hulk: {
        name: "TIERRA DE NADIE",
        region: "CENTRAL",
        status: "INGOBERNABLE"
      }
    },
    map: {
      satellite: "SATÉLITE: ORBITAL-4",
      zoom: "ZOOM: HABILITADO",
      scanners: "ESCÁNERES BIOLÓGICOS: EN LÍNEA",
      loading: "DESENCRIPTANDO DATOS GEOPOLÍTICOS...",
      error: "CONEXIÓN FALLIDA: SATÉLITE FUERA DE LÍNEA.",
      sector: "SECTOR",
      bunker: "BÚNKER DE MANDO",
      hive: "NIDO CENTRAL"
    },
    bunker: {
        title: "BÚNKER DE MANDO // NIVEL SUBTERRÁNEO 4",
        hiveTitle: "NIDO DE LA COLMENA // ZONA CERO",
        roster: "LISTA DE ACTIVOS",
        recruit: "RECLUTAR ACTIVO",
        file: "EXPEDIENTE PERSONAL",
        return: "VOLVER AL MAPA TÁCTICO",
        status: "ESTADO OPERATIVO",
        class: "CLASE",
        bio: "RESUMEN BIOGRÁFICO",
        currentStory: "SITUACIÓN ACTUAL",
        objectives: "OBJETIVOS PRIORITARIOS",
        stats: "MÉTRICAS DE COMBATE",
        str: "FUERZA",
        agi: "AGILIDAD",
        int: "INTELECTO",
        assign: "ASIGNAR A MISIÓN",
        unassign: "RETIRAR DEL SERVICIO",
        assignModalTitle: "SELECCIONAR OBJETIVO TÁCTICO",
        currentMission: "DESPLEGADO EN",
        noMissions: "NO HAY MISIONES DISPONIBLES",
        maxHeroes: "CAPACIDAD MÁXIMA DE ESCUADRÓN (6) ALCANZADA",
        cancel: "CANCELAR"
    },
    recruit: {
        title: "RECLUTAMIENTO DE ACTIVO",
        selectDb: "SELECCIONAR DE LA BASE DE DATOS (NUBE)",
        loadingDb: "CARGANDO ARCHIVOS...",
        adminSeed: "ADMIN: SUBIR DATOS INICIALES",
        seedSuccess: "BASE DE DATOS ACTUALIZADA",
        alias: "ALIAS / NOMBRE EN CLAVE",
        name: "NOMBRE REAL",
        class: "CLASE TÁCTICA",
        bio: "HISTORIAL / BIOGRAFÍA",
        image: "URL DE IMAGEN (OPCIONAL)",
        generateBtn: "GENERAR IMAGEN (IA)",
        generating: "GENERANDO...",
        generateError: "ERROR DE GENERACIÓN",
        stats: "ASIGNACIÓN DE ESTADÍSTICAS (MAX 25 TOTAL)",
        submit: "REGISTRAR EN LA BASE DE DATOS",
        placeholderAlias: "EJ: HAWKEYE",
        placeholderName: "EJ: CLINT BARTON"
    },
    missions: {
        kraven: {
            title: "LA CAZA MAYOR DE KRAVEN",
            description: [
                "No hay órdenes. Solo el rastro de los gritos y la desesperación. Kraven el Cazador, el predador zombi de Fisk, ha marcado estas ruinas urbanas como su coto de caza personal.",
                "Vuestro acceso es el túnel inestable del Metro. El tiempo se agota. Debéis interceptar, proteger y evacuar a un mínimo de 5 supervivientes.",
                "Kraven es implacable. La justicia ha muerto, pero el odio es vuestra única estrategia de escape."
            ],
            objectives: [
                { title: "¡Detén la cacería!", desc: "Rescata y evacua a 5 supervivientes por el metro antes de que Kraven complete su cuota." },
                { title: "Escapar", desc: "Todos los Superhéroes deben escapar por la Zona de salida sin bajas." }
            ]
        },
        fleshSleeps: {
            title: "DONDE LA CARNE DUERME",
            description: [
                "El Metro quedó atrás. Entre los supervivientes, uno murmuraba sobre un viejo penal en el este.",
                "En los barrios de Fisk se habla de un lugar donde nadie regresa. Motores que rugen bajo tierra.",
                "Vuestra ruta termina frente a los muros de una prisión olvidada. Si el rumor es cierto, dentro hallaréis más que respuestas."
            ],
            objectives: [
                { title: "El Engaño de las Palancas", desc: "Activad las dos palancas verdaderas en el mismo turno para abrir el complejo." },
                { title: "Los Que Aún Respiran", desc: "Liberar al héroe cautivo y evacuar al menos 3 prisioneros." }
            ]
        },
        freshMeat: {
            title: "CARNE FRESCA",
            description: [
                "El Hambre quema. Olemos sangre caliente al sur. Un convoy de refugiados intenta cruzar la frontera del estado.",
                "Son lentos. Son débiles. Son comida.",
                "No dejes que ninguno escape. La Colmena necesita crecer."
            ],
            objectives: [
                { title: "Banquete", desc: "Devora a 15 civiles antes de que alcancen el refugio." },
                { title: "Sin Testigos", desc: "Destruye el vehículo de escolta blindado." }
            ]
        },
        breakSiege: {
            title: "ROMPER EL ASEDIO",
            description: [
                "La resistencia se ha hecho fuerte en una base militar de la costa. Creen que sus muros los protegerán.",
                "Ilusos. No saben que no necesitamos puertas.",
                "Lidera la horda. Trepad los muros. Inundad sus pasillos con dientes y garras."
            ],
            objectives: [
                { title: "Marea Muerta", desc: "Supera las defensas perimetrales y abre la puerta principal." },
                { title: "Asimilación", desc: "Infecta al Comandante de la base." }
            ]
        },
        bases: {
            desc: "Señal encriptada de S.H.I.E.L.D. detectada. Búnker de suministros oculto activo.",
            objSecure: "Asegurar el perímetro de hostiles.",
            objRetrieve: "Recuperar tecnología y suministros.",
            alpha: "BASE OCULTA: ALPHA",
            beta: "BASE OCULTA: BETA",
            gamma: "BASE OCULTA: GAMMA",
            delta: "BASE OCULTA: DELTA",
            epsilon: "BASE OCULTA: EPSILON",
            zeta: "BASE OCULTA: ZETA"
        },
        galactus: {
            title: "EL JUICIO FINAL CÓSMICO",
            description: [
                "El cielo ya no es negro. Es violeta. Galactus ha llegado para devorar una Tierra que ya estaba muerta.",
                "Su Heraldo Zombi, Silver Surfer, ha marcado el núcleo del planeta para su consumo.",
                "La Tríada, S.H.I.E.L.D. y la Horda son irrelevantes. Si no detenemos esto, no quedará ni polvo."
            ],
            objectives: [
                { title: "Derribar al Heraldo", desc: "Neutralizar a Silver Surfer Zombi para cegar a Galactus." },
                { title: "El Nulificador Supremo", desc: "Desplegar el arma definitiva robada a Doom antes de que el planeta sea consumido." }
            ]
        }
    },
    // New Mission Editor Translations
    missionEditor: {
        title: "CREADOR DE MISIONES TÁCTICAS",
        missionTitle: "TÍTULO DE OPERACIÓN",
        description: "DESCRIPCIÓN / INFORME (PÁRRAFOS)",
        objectives: "OBJETIVOS DE MISIÓN",
        location: "UBICACIÓN (ESTADO)",
        threat: "NIVEL DE AMENAZA",
        type: "TIPO DE MISIÓN",
        pdfUrl: "URL DE INFORME TÁCTICO (PDF)",
        addObjective: "AÑADIR OBJETIVO",
        save: "GUARDAR EN LA BASE DE DATOS",
        cancel: "CANCELAR",
        objTitle: "TÍTULO DEL OBJETIVO",
        objDesc: "DESCRIPCIÓN DEL OBJETIVO"
    },
    missionModal: {
        title: "DOSSIER DE MISIÓN // CLASIFICADO",
        objectives: "OBJETIVOS TÁCTICOS",
        briefing: "INFORME DE SITUACIÓN",
        threat: "NIVEL DE AMENAZA",
        accept: "INICIAR MISIÓN",
        complete: "REPORTAR ÉXITO DE MISIÓN",
        reactivate: "REACTIVAR OPERACIÓN",
        cancel: "CERRAR ARCHIVO",
        sending: "ENVIANDO REPORTE A SATÉLITE...",
        sent: "REPORTE CONFIRMADO",
        downloadPdf: "DESCARGAR INFORME TÁCTICO (PDF)" // Added
    },
    // ... rest of translations
    heroes: {
        spiderman: {
            alias: "SPIDER-MAN",
            bio: "Antiguo Vengador. Su gran agilidad y sentido arácnido lo convierten en un explorador ideal para zonas infectadas. Carga con la culpa de haber sobrevivido."
        },
        blackwidow: {
            alias: "BLACK WIDOW",
            bio: "Espía y asesina experta. Sus habilidades son cruciales para misiones de infiltración en territorio de Fisk. Mantiene al equipo enfocado en el objetivo."
        },
        scorpion: {
            alias: "SCORPION",
            bio: "Ex villano convertido en superviviente desesperado. Su traje le protege contra mordeduras. Músculo impredecible, pero necesario."
        },
        sabretooth: {
            alias: "SABRETOOTH",
            bio: "Impulsado por puro instinto depredador. S.H.I.E.L.D. lo mantiene con correa corta. Rastrea a los infectados no para salvarlos, sino por deporte."
        },
        reed: {
            alias: "MR. FANTASTIC",
            bio: "El hombre más inteligente vivo, luchando por encontrar una cura en un mundo que ha rechazado la ciencia. Su intelecto es la última esperanza de la humanidad."
        },
        shehulk: {
            alias: "SHE-HULK",
            bio: "Una abogada capaz de levantar un tanque. Conserva su inteligencia mientras se transforma, siendo una combinación letal de cerebro y músculo en el campo de batalla."
        },
        hawkeye: {
            alias: "HAWKEYE",
            bio: "Francotirador inigualable. Sus ojos ven lo que los satélites pierden. Lucha por aquellos que no pueden luchar."
        },
        lukecage: {
            alias: "LUKE CAGE",
            bio: "Piel impenetrable, voluntad inquebrantable. Un tanque humano capaz de resistir mordeduras y explosiones mientras protege a los civiles."
        },
        daredevil: {
            alias: "DAREDEVIL",
            bio: "El Hombre sin Miedo. Sus sentidos aumentados son el radar perfecto en la oscuridad de la zona de cuarentena."
        },
        thor: {
            alias: "THOR",
            bio: "El Dios del Trueno. Aunque Asgard cayó, su martillo sigue trayendo la tormenta a los muertos."
        },
        storm: {
            alias: "STORM",
            bio: "Diosa del clima. Puede limpiar zonas enteras de zombis con un solo tornado. La reina necesita su reino de vuelta."
        },
        loki: {
            alias: "LOKI",
            bio: "Dios del Engaño. Exiliado en la Tierra tras el cierre del Bifrost. Motivado por una retorcida mezcla de arrogancia, instinto de supervivencia y rencor contra Doom."
        },
        colonel: {
            alias: "CORONEL AMÉRICA",
            bio: "El antiguo símbolo de la libertad, ahora con el cráneo expuesto. Mantiene sus habilidades tácticas, liderando la horda con precisión militar. Su escudo ya no protege, solo decapita."
        },
        ironman_z: {
            alias: "IRON MAN (Z)",
            bio: "La tecnología Stark impulsada por carne podrida. Sus repulsores fallan, pero sus dientes no. Busca incesantemente energía para mantener su traje funcionando."
        },
        wolverine_z: {
            alias: "WOLVERINE (Z)",
            bio: "Su factor de curación lucha contra el virus eternamente, manteniéndolo en un estado de descomposición y regeneración constante. El dolor infinito lo hace imparable."
        },
        phoenix_z: {
            alias: "FÉNIX OSCURA (Z)",
            bio: "El poder cósmico mezclado con el hambre insaciable. Una amenaza de nivel Omega que no solo quiere comer carne, sino consumir estrellas."
        }
    },
    tutorial: {
        welcome: {
            title: "BIENVENIDO A LA INTERFAZ TÁCTICA",
            text: "Soy la I.A. central de S.H.I.E.L.D. Te guiaré a través de los sistemas básicos de supervivencia y mando."
        },
        map_zones: {
            title: "MAPA DE TERRITORIOS",
            text: "EE. UU. ha caído. ROJO: El Edén Roto (Magneto). MORADO: Imperio de la Carne (Kingpin). VERDE OSCURO: Doomsberg (Dr. Doom). VERDE CLARO: Tierra de Nadie (Hulk)."
        },
        hulk: {
            title: "AMENAZA MÓVIL",
            text: "El token verde brillante es HULK. Se mueve aleatoriamente por la Tierra de Nadie. Es indestructible. Si está en un estado, ninguna misión allí puede completarse."
        },
        missions: {
            title: "OPERACIONES",
            text: "AMARILLO: Misiones de Campaña. Al completar una, se desbloquearán otras. AZUL: Bases Ocultas de S.H.I.E.L.D. Recupéralas para obtener recursos."
        },
        bunker_entry: {
            title: "ACCESO AL BÚNKER",
            text: "Tu refugio seguro. Haz clic aquí para entrar, gestionar tu equipo y preparar la siguiente ofensiva."
        },
        roster: {
            title: "LISTA DE ACTIVOS",
            text: "Aquí ves a tus héroes disponibles. Controla su estado (Disponible, Desplegado, Herido) y selecciona uno para ver detalles."
        },
        file: {
            title: "EXPEDIENTE TÁCTICO",
            text: "Consulta la historia, biografía y escanea la ubicación. MARCA los Objetivos Prioritarios a medida que los completes en tu partida."
        },
        recruit: {
            title: "RECLUTAMIENTO",
            text: "¿Has encontrado nuevos aliados? Usa este botón para registrarlos en la base de datos y añadirlos a tu equipo."
        },
        finish: {
            title: "SISTEMAS EN LÍNEA",
            text: "El tutorial ha finalizado. La suerte está echada, Comandante. Salve lo que queda del mundo."
        },
        next: "ENTENDIDO // SIGUIENTE",
        skip: "OMITIR TUTORIAL",
        finishBtn: "INICIAR OPERACIONES"
    },
    events: {
        anomaly: {
            title: "ANOMALÍA CÓSMICA DETECTADA",
            desc: "LECTURAS DE ENERGÍA DESCONOCIDA EN EL ESPACIO PROFUNDO. REED RICHARDS CONFIRMA: UN PLANETA DEL SISTEMA VEGA HA DEJADO DE EXISTIR INSTANTÁNEAMENTE.",
            ack: "CONTINUAR MONITORIZACIÓN"
        },
        surfer: {
            title: "LA CAÍDA DEL HERALDO",
            desc: "OBJETO PLATEADO ENTRÓ EN LA ATMÓSFERA. INTERCEPTADO POR HULK EN KANSAS. VÍDEO CONFIRMA INFECCIÓN. SILVER SURFER HA CAÍDO ANTE EL HAMBRE. REPITÓ: TENEMOS A UN HERALDO ZOMBIE EN JUEGO.",
            ack: "ACTIVAR PROTOCOLO OMEGA"
        },
        galactus: {
            title: "LLEGADA DE GALACTUS",
            desc: "EL DEVORADOR DE MUNDOS ESTÁ EN ÓRBITA. EL CIELO SE HA VUELTO PÚRPURA. NO VIENE A SALVARNOS. VIENE A COMER. LA ÚLTIMA BATALLA POR LA TIERRA HA COMENZADO.",
            ack: "PREPARARSE PARA EL JUICIO FINAL"
        }
    }
  },
  en: {
    // ... copy existing en and update
    missionEditor: {
        title: "TACTICAL MISSION CREATOR",
        missionTitle: "OPERATION TITLE",
        description: "DESCRIPTION / BRIEFING (PARAGRAPHS)",
        objectives: "MISSION OBJECTIVES",
        location: "LOCATION (STATE)",
        threat: "THREAT LEVEL",
        type: "MISSION TYPE",
        pdfUrl: "TACTICAL REPORT URL (PDF)",
        addObjective: "ADD OBJECTIVE",
        save: "SAVE TO DATABASE",
        cancel: "CANCEL",
        objTitle: "OBJECTIVE TITLE",
        objDesc: "OBJECTIVE DESCRIPTION"
    },
    missionModal: {
        title: "MISSION DOSSIER // CLASSIFIED",
        objectives: "TACTICAL OBJECTIVES",
        briefing: "SITUATION REPORT",
        threat: "THREAT LEVEL",
        accept: "INITIATE MISSION",
        complete: "REPORT MISSION SUCCESS",
        reactivate: "REACTIVATE OPERATION",
        cancel: "CLOSE FILE",
        sending: "UPLINKING REPORT...",
        sent: "REPORT CONFIRMED",
        downloadPdf: "DOWNLOAD TACTICAL REPORT (PDF)"
    },
    // ... keep existing en translations ...
    login: {
      title: "S.H.I.E.L.D.",
      subtitle: "SECURE ACCESS TERMINAL",
      clearance: "LEVEL 7 CLEARANCE REQUIRED",
      scanBtn: "INITIATE BIOMETRIC SCAN",
      googleBtn: "ACCESS WITH CREDENTIALS (GOOGLE)",
      editorBtn: "EDITOR ACCESS (LEVEL 10)",
      editorPass: "MASTER OVERRIDE CODE",
      editorEnter: "ENTER",
      scanning: "VERIFYING IDENTITY...",
      granted: "ACCESS GRANTED. WELCOME, DIRECTOR.",
      selectLang: "LANGUAGE / IDIOMA",
      idPrompt: "IDENTIFICATION REQUIRED",
      error: "AUTHENTICATION ERROR",
      passError: "INVALID PASSCODE"
    },
    header: {
      project: "PROJECT: LAZARUS",
      failure: "GLOBAL CONTAINMENT FAILURE",
      biohazard: "/// BIO-HAZARD DETECTED ///",
      clearance: "CLEARANCE: DIRECTOR",
      logout: "LOGOUT",
      saving: "SAVING...",
      saved: "SAVED TO CLOUD"
    },
    sidebar: {
      threatLevelTitle: "THREAT LEVEL",
      threatLevelValue: "OMEGA",
      infectionRate: "INFECTION RATE: CRITICAL",
      factionIntel: "FACTION INTEL",
      leader: "LEADER",
      status: "STATUS",
      threat: "THREAT",
      quote: "\"When the dead walk, the line between hero and monster disappears.\"",
      uplink: "SURVIVOR UPLINK ACTIVE",
      activeMissions: "ACTIVE MISSIONS",
      noMissions: "NO ACTIVITY DETECTED",
      bunkerBtn: "ACCESS COMMAND BUNKER",
      hiveBtn: "ACCESS HIVE NEST",
      replayStory: "REPLAY ARCHIVE 0-Z",
      campaignMode: "CAMPAIGN MODE",
      switchHero: "ACTIVATE LAZARUS PROTOCOL (HERO)",
      switchZombie: "ACTIVATE RAVENOUS HUNGER (ZOMBIE)"
    },
    factions: {
      magneto: {
        name: "BROKEN EDEN",
        region: "WEST",
        status: "MUTANT STRONGHOLD"
      },
      kingpin: {
        name: "EMPIRE OF FLESH",
        region: "NORTH EAST",
        status: "ORGANIZED HOSTILES"
      },
      doom: {
        name: "DOOMSBERG",
        region: "SOUTH",
        status: "HEAVILY FORTIFIED"
      },
      hulk: {
        name: "NO MAN'S LAND",
        region: "CENTRAL",
        status: "UNGOVERNABLE"
      }
    },
    map: {
      satellite: "SATELLITE: ORBITAL-4",
      zoom: "ZOOM: ENABLED",
      scanners: "BIOLOGICAL SCANNERS: ONLINE",
      loading: "DECRYPTING GEOPOLITICAL DATA...",
      error: "CONNECTION FAILED: SATELLITE OFFLINE.",
      sector: "SECTOR",
      bunker: "COMMAND BUNKER",
      hive: "CENTRAL HIVE"
    },
    bunker: {
        title: "COMMAND BUNKER // SUB-LEVEL 4",
        hiveTitle: "HIVE NEST // GROUND ZERO",
        roster: "ASSET ROSTER",
        recruit: "RECRUIT ASSET",
        file: "PERSONNEL FILE",
        return: "RETURN TO TACTICAL MAP",
        status: "OPERATIONAL STATUS",
        class: "CLASS",
        bio: "BIOGRAPHICAL SUMMARY",
        currentStory: "CURRENT STATUS / INTEL",
        objectives: "PRIORITY OBJECTIVES",
        stats: "COMBAT METRICS",
        str: "STRENGTH",
        agi: "AGILIDAD",
        int: "INTELECTO",
        assign: "ASSIGN TO MISSION",
        unassign: "WITHDRAW FROM SERVICE",
        assignModalTitle: "SELECT TACTICAL MISSION",
        currentMission: "DEPLOYED TO",
        noMissions: "NO AVAILABLE MISSIONS",
        maxHeroes: "MAX SQUAD CAPACITY (6) REACHED",
        cancel: "CANCEL"
    },
    recruit: {
        title: "ASSET RECRUITMENT",
        selectDb: "SELECT FROM DATABASE (CLOUD)",
        loadingDb: "LOADING FILES...",
        adminSeed: "ADMIN: UPLOAD INITIAL DATA",
        seedSuccess: "DATABASE UPDATED",
        alias: "ALIAS / CODENAME",
        name: "REAL NAME",
        class: "TACTICAL CLASS",
        bio: "HISTORY / BIOGRAPHY",
        image: "IMAGE URL (OPTIONAL)",
        generateBtn: "GENERATE IMAGE (AI)",
        generating: "GENERATING...",
        generateError: "GENERATION ERROR",
        stats: "STAT ALLOCATION (MAX 25 TOTAL)",
        submit: "REGISTER IN DATABASE",
        placeholderAlias: "EX: HAWKEYE",
        placeholderName: "EX: CLINT BARTON"
    },
    missions: {
        kraven: {
            title: "KRAVEN'S LAST HUNT",
            description: [
                "No orders. Just the trail of screams. Kraven the Hunter, Fisk's zombie predator, has marked these ruins as his hunting grounds.",
                "Your access point is the unstable subway tunnel. Time is running out. Evacuate at least 5 survivors.",
                "Justice is dead, but survival is your only strategy."
            ],
            objectives: [
                { title: "Stop the Hunt!", desc: "Rescue and evacuate 5 survivors via the subway." },
                { title: "Escape", desc: "All Superheroes must exit via the Extraction Zone." }
            ]
        },
        fleshSleeps: {
            title: "WHERE THE FLESH SLEEPS",
            description: [
                "The subway is behind you. Survivors speak of an old prison in the east.",
                "Fisk is hiding something there. Engines roaring underground.",
                "Your path ends at the forgotten prison walls. Inside, you may find more than just answers."
            ],
            objectives: [
                { title: "The Lever Deception", desc: "Activate the two true switches in the same turn to open the complex." },
                { title: "Those Who Still Breathe", desc: "Rescue the captive hero and evacuate 3 prisoners." }
            ]
        },
        freshMeat: {
            title: "FRESH MEAT",
            description: [
                "The Hunger burns. We smell warm blood south. A refugee convoy is trying to cross the state line.",
                "They are slow. They are weak. They are food.",
                "Let none escape. The Hive must grow."
            ],
            objectives: [
                { title: "Feast", desc: "Devour 15 civilians before they reach the shelter." },
                { title: "No Witnesses", desc: "Destroy the armored escort vehicle." }
            ]
        },
        breakSiege: {
            title: "BREAK THE SIEGE",
            description: [
                "The resistance has fortified a coastal military base. They think walls will save them.",
                "Fools. We do not need doors.",
                "Lead the horde. Climb the walls. Flood their halls with teeth and claws."
            ],
            objectives: [
                { title: "Dead Tide", desc: "Breach perimeter defenses and open the main gate." },
                { title: "Assimilation", desc: "Infect the Base Commander." }
            ]
        },
        bases: {
            desc: "Encrypted S.H.I.E.L.D. signal detected. Hidden supply bunker active.",
            objSecure: "Secure perimeter from hostiles.",
            objRetrieve: "Retrieve tech and supplies.",
            alpha: "HIDDEN BASE: ALPHA",
            beta: "HIDDEN BASE: BETA",
            gamma: "HIDDEN BASE: GAMMA",
            delta: "HIDDEN BASE: DELTA",
            epsilon: "HIDDEN BASE: EPSILON",
            zeta: "HIDDEN BASE: ZETA"
        },
        galactus: {
            title: "COSMIC FINAL JUDGMENT",
            description: [
                "The sky is no longer black. It is violet. Galactus has arrived to devour a Earth that was already dead.",
                "His Zombie Herald, Silver Surfer, has marked the planet's core for consumption.",
                "The Triad, S.H.I.E.L.D., and the Horde are irrelevant. If we don't stop this, not even dust will remain."
            ],
            objectives: [
                { title: "Down the Herald", desc: "Neutralize Zombie Silver Surfer to blind Galactus." },
                { title: "The Ultimate Nullifier", desc: "Deploy the ultimate weapon stolen from Doom before the planet is consumed." }
            ]
        }
    },
    tutorial: {
        welcome: {
            title: "WELCOME TO THE TACTICAL INTERFACE",
            text: "I am S.H.I.E.L.D.'s central AI. I will guide you through the basic survival and command systems."
        },
        map_zones: {
            title: "TERRITORY MAP",
            text: "The USA has fallen. RED: Broken Eden (Magneto). PURPLE: Empire of Flesh (Kingpin). DARK GREEN: Doomsberg (Dr. Doom). LIGHT GREEN: No Man's Land (Hulk)."
        },
        hulk: {
            title: "MOBILE THREAT",
            text: "The bright green token is HULK. He roams randomly across No Man's Land. He is indestructible. If he enters a state, no mission there can be completed."
        },
        missions: {
            title: "OPERATIONS",
            text: "YELLOW: Campaign Missions. Completing one unlocks others. BLUE: Hidden S.H.I.E.L.D. Bases. Reclaim them for resources."
        },
        bunker_entry: {
            title: "BUNKER ACCESS",
            text: "Your safe haven. Click here to enter, manage your team, and prepare the next offensive."
        },
        roster: {
            title: "ASSET ROSTER",
            text: "View your available heroes here. Monitor their status (Available, Deployed, Injured) and select one for details."
        },
        file: {
            title: "TACTICAL FILE",
            text: "Review history, biography, and scan location. MARK Priority Objectives as you complete them in your game."
        },
        recruit: {
            title: "RECRUITMENT",
            text: "Found new allies? Use this button to register them in the database and add them to your team."
        },
        finish: {
            title: "SYSTEMS ONLINE",
            text: "Tutorial complete. The die is cast, Commander. Save what remains of the world."
        },
        next: "ACKNOWLEDGED // NEXT",
        skip: "SKIP TUTORIAL",
        finishBtn: "COMMENCE OPERATIONS"
    },
    events: {
        anomaly: {
            title: "COSMIC ANOMALY DETECTED",
            desc: "UNKNOWN ENERGY READINGS IN DEEP SPACE. REED RICHARDS CONFIRMS: A PLANET IN THE VEGA SYSTEM CEASED TO EXIST INSTANTANEOUSLY.",
            ack: "CONTINUE MONITORING"
        },
        surfer: {
            title: "FALL OF THE HERALD",
            desc: "SILVER OBJECT ENTERED ATMOSPHERE. INTERCEPTED BY HULK IN KANSAS. FOOTAGE CONFIRMS INFECTION. SILVER SURFER HAS FALLEN TO THE HUNGER. REPEAT: WE HAVE A ZOMBIE HERALD IN PLAY.",
            ack: "ACTIVATE OMEGA PROTOCOL"
        },
        galactus: {
            title: "ARRIVAL OF GALACTUS",
            desc: "THE DEVOURER OF WORLDS IS IN ORBIT. THE SKY HAS TURNED PURPLE. HE IS NOT HERE TO SAVE US. HE IS HERE TO EAT. THE FINAL BATTLE FOR EARTH HAS BEGUN.",
            ack: "PREPARE FOR JUDGMENT"
        }
    }
  }
};
