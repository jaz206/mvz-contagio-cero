
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
      scanning: "VERIFICANDO IDENTIDAD...",
      granted: "ACCESO CONCEDIDO. BIENVENIDO, DIRECTOR.",
      selectLang: "IDIOMA / LANGUAGE",
      idPrompt: "IDENTIFICACIÓN REQUERIDA",
      error: "ERROR DE AUTENTICACIÓN"
    },
    header: {
      project: "PROYECTO: LÁZARO",
      failure: "FALLO DE CONTENCIÓN GLOBAL",
      biohazard: "/// AMENAZA BIOLÓGICA DETECTADA ///",
      clearance: "NIVEL: DIRECTOR",
      logout: "CERRAR SESIÓN"
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
        selectDb: "SELECCIONAR DE LA BASE DE DATOS (OPCIONAL)",
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
    heroes: {
        // LIVING HEROES
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
        // DATABASE HEROES
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
        // ZOMBIE HEROES
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
    missionModal: {
        title: "DOSSIER DE MISIÓN // CLASIFICADO",
        objectives: "OBJETIVOS TÁCTICOS",
        briefing: "INFORME DE SITUACIÓN",
        threat: "NIVEL DE AMENAZA",
        accept: "INICIAR MISIÓN",
        complete: "REPORTAR ÉXITO DE MISIÓN",
        cancel: "CERRAR ARCHIVO",
        sending: "ENVIANDO REPORTE A SATÉLITE...",
        sent: "REPORTE CONFIRMADO"
    },
    story: {
        skip: "SALTAR SECUENCIA",
        next: "SIGUIENTE",
        prev: "ANTERIOR",
        choose: "ELIGE TU CAMINO",
        optionA: "OPCIÓN A: EL HÉROE VIVO",
        optionB: "OPCIÓN B: EL HÉROE ZOMBIE",
        slides: [
            { text: "MARVEL ZOMBIES: CONTAGIO CERO\nLibro I: El Legado de la Arrogancia", image: "https://i.pinimg.com/1200x/18/85/ee/1885ee42132b6976d36896a81f33ad8c.jpg" },
            { text: " No hubo trompetas. No hubo cielos rojos ni profecías antiguas cumpliéndose.\n El fin del mundo no vino del espacio exterior, ni de una dimensión oscura.", image: "https://i.pinimg.com/1200x/18/99/ec/1899ec756f8731e015eb941d7122fbec.jpg" },
            { text: " Lo construimos nosotros. Aquí. En casa.\nO mejor dicho, lo construyeron ellos.\n\nFue en un laboratorio estéril. Tres hombres se reunieron allí: Victor Von Doom, Magneto y Wilson Fisk.\nDecidieron que la humanidad era demasiado caótica. Su solución fue la ciencia fría y dura: el Pulso Nulificador.", image: "https://i.pinimg.com/1200x/71/06/7d/71067db72856dfd6ca03d0d51a679bd6.jpg" },
            { text: " Necesitaban cuerpos para afinar la fórmula. Usaron a Jamie Madrox para ver cómo se multiplicaba la infección.\nUsaron a los Reavers para ver si el metal podía enfermar.\nY funcionó. Dios, cómo funcionó.", image: "https://i.pinimg.com/1200x/99/80/1e/99801e7603e4a770127ce29530f13f87.jpg" },
            { text: " Pero la arrogancia es una pistola cargada que siempre apunta hacia atrás.\nDecidieron probar su obra maestra en Bruce Banner. Buscaban energía infinita...", image: "https://i.pinimg.com/1200x/19/26/53/1926533335a2b27c4a79c9d2632ec83d.jpg" },
            { text: " ...lo que consiguieron fue una bomba biológica.\nCuando el virus tocó la sangre gamma, no murió. Se enfureció.", image: "https://i.pinimg.com/1200x/b2/06/15/b20615925dfa53cdf9622fb596cdd5e3.jpg" },
            { text: " El estallido no fue de fuego, fue de contagio.\nHulk rugió, y en ese rugido viajaba la extinción.", image: "https://i.pinimg.com/1200x/a8/e9/b7/a8e9b76d6a9a87de0cfba509d5fef534.jpg" },
            { text: " En cuestión de horas, Nueva York era un matadero. Los Vengadores cayeron primero.\nLos X-Men aguantaron un poco más, solo para ver cómo su escuela se convertía en un buffet libre.", image: "https://i.pinimg.com/1200x/eb/db/e8/ebdbe8d5738acd105654dc8ddad8216f.jpg" },
            { text: " ¿Y la Tríada? Doom, Magneto y Fisk fueron alcanzados por su propia creación.\nNo perdieron la mente. Sus cuerpos se pudrieron, pero su intelecto permaneció intacto.", image: "https://i.pinimg.com/1200x/b9/0a/18/b90a18369639b131f91273f019b699cd.jpg" },
            { text: " Ahora, se sientan en tronos de huesos, gobernando facciones de pesadilla:\nDoomsberg, el Edén Roto y el Imperio de la Carne.", image: "https://i.pinimg.com/1200x/e1/02/86/e102864e130bfa5b5f2ffc5a9d9ed9c0.jpg" },
            { text: " Pero hay algo más ahí fuera. Algo peor que los muertos.\nS.H.I.E.L.D. sigue activo.", image: "https://i.pinimg.com/1200x/e2/5c/3a/e25c3ac26e5fc65f9119b6073912e856.jpg" },
            { text: " El \"Protocolo Lázaro\" sigue corriendo. S.H.I.E.L.D. ya no es una agencia; es un fantasma armado hasta los dientes.\nUna IA ciega, sorda y paranoica que elimina todo lo que se mueva.", image: "https://i.pinimg.com/1200x/39/c8/cd/39c8cde0a5b56acc78b41c4eecf91f0a.jpg" },
            { text: " Así que aquí estás. De pie sobre las cenizas.\nA tu izquierda, los muertos. A tu derecha, las máquinas.\nDime, superviviente... en esta nueva era de monstruos y máquinas:\n¿QUÉ ERES TÚ?", image: "https://i.pinimg.com/1200x/45/7d/c5/457dc515c61d470eb26cf1727ebd67ea.jpg" },
        ]
    },
    missions: {
        kraven: {
            title: "LA CAZA MAYOR DE KRAVEN",
            description: [
                "No hay órdenes. Solo el rastro de los gritos y la desesperación. Kraven el Cazador, el predador zombi de Fisk, ha marcado estas ruinas urbanas como su coto de caza personal. Es una purga activa para asegurar la 'mercancía' viva.",
                "Vuestro acceso es el túnel inestable del Metro, vuestra única entrada y salida segura. Los pocos supervivientes serán forzados a salir de sus escondites a lo largo de los asaltos.",
                "El tiempo se agota. Debéis interceptar, proteger y evacuar a un mínimo de 5 supervivientes por el Metro. Kraven es implacable; si asegura 2 víctimas antes que ustedes, la misión será un fracaso total. La justicia ha muerto, pero el odio es vuestra única estrategia de escape.",
                "¡Salid a las calles y detened la Caza Mayor de Kraven!"
            ],
            objectives: [
                {
                    title: "¡Detén la cacería!",
                    desc: "Rescata y evacua a 5 supervivientes por el metro antes de que Kraven complete su cuota de trofeos."
                },
                {
                    title: "Escapar",
                    desc: "Todos los Superhéroes deben escapar por la Zona de salida. Cualquier Superhéroe puede salir a través de esta Zona al final de su turno sin coste alguno, siempre y cuando no haya ningún enemigo en ella."
                }
            ]
        },
        fleshSleeps: {
            title: "DONDE LA CARNE DUERME",
            description: [
                "El Metro quedó atrás, devorado por el polvo y el silencio. Entre los supervivientes que lograsteis sacar, uno —un técnico de mantenimiento— no paraba de murmurar cosas inconexas mientras lo arrastrabais hacia la superficie.",
                "“Camiones… contenedores marcados… un viejo penal en el este… frío, tanto frío…” Luego calló. No murió, pero desapareció al amanecer.",
                "Desde entonces, los rumores se han multiplicado. En los barrios controlados por Fisk se habla de un lugar donde nadie regresa, de motores que rugen bajo tierra y de luces que nunca se apagan. Nadie sabe qué es exactamente. Algunos lo llaman “el almacén”. Otros, “la cámara”. Solo hay una certeza: Fisk guarda algo allí que no quiere que nadie vea.",
                "Vuestra ruta termina frente a los muros de una prisión olvidada, cubierta de vallas improvisadas y emblemas grabados con fuego. Si el rumor es cierto, dentro hallaréis más que respuestas. Y si no lo es… habréis caminado hasta el corazón del imperio de la carne."
            ],
            objectives: [
                {
                    title: "El Engaño de las Palancas",
                    desc: "Abrir las puertas del complejo. Activad las dos palancas verdaderas en el mismo turno."
                },
                {
                    title: "La Celda del Silencio",
                    desc: "Liberar al héroe cautivo."
                },
                {
                    title: "Los Que Aún Respiran",
                    desc: "Rescatar a los prisioneros. Evacuad al menos 3 transeúntes."
                },
                {
                    title: "Condiciones",
                    desc: "Victoria: Completad A + B + C. Fracaso: Si el héroe cautivo muere, Kraven captura 2 víctimas (si sigue activo), o todos los héroes son eliminados."
                }
            ]
        },
        freshMeat: {
            title: "CARNE FRESCA",
            description: [
                "El hambre es un fuego que nunca se apaga. La colmena susurra ubicaciones de asentamientos humanos no detectados por S.H.I.E.L.D. En el corazón de Texas, un convoy de supervivientes intenta cruzar la Tierra de Nadie.",
                "No saben que somos los dueños de este páramo. Creen que Hulk es el único peligro. Pobres ilusos.",
                "La misión es simple: Interceptar el convoy. No queremos destrucción total. Queremos conversión. Necesitamos soldados. Necesitamos comida. Necesitamos expandir la familia."
            ],
            objectives: [
                {
                    title: "Emboscada",
                    desc: "Detén el vehículo principal del convoy antes de que cruce la frontera estatal."
                },
                {
                    title: "Conversión",
                    desc: "Infecta a 3 líderes de la resistencia."
                },
                {
                    title: "Sin Testigos",
                    desc: "Elimina cualquier señal de socorro antes de que contacten a S.H.I.E.L.D."
                }
            ]
        },
        breakSiege: {
            title: "ROMPER EL ASEDIO",
            description: [
                "Magneto ha establecido un perímetro defensivo alrededor de San Francisco. Sus centinelas reprogramados están cazando a los nuestros. Es un insulto a nuestra supremacía.",
                "S.H.I.E.L.D. cree que puede contenernos, pero el Edén Roto caerá. Hemos detectado una brecha en sus escudos magnéticos.",
                "Infiltraos. Destruid los generadores. Haced que el Homo Superior se arrodille ante el Hambre Superior."
            ],
            objectives: [
                {
                    title: "Sabotaje",
                    desc: "Destruye los 2 generadores de campo magnético."
                },
                {
                    title: "Caza de Mutantes",
                    desc: "Devour Magneto's elite guard."
                }
            ]
        },
        bases: {
            desc: "Señal encriptada detectada. Firma de energía coincide con tecnología S.H.I.E.L.D. pre-colapso.",
            objSecure: "Asegurar el perímetro",
            objRetrieve: "Recuperar datos",
            alpha: "BASE OCULTA: ALPHA",
            beta: "BASE OCULTA: BETA",
            gamma: "BASE OCULTA: GAMMA",
            delta: "BASE OCULTA: DELTA",
            epsilon: "BASE OCULTA: EPSILON",
            zeta: "BASE OCULTA: ZETA"
        }
    }
  },
  en: {
    login: {
      title: "S.H.I.E.L.D.",
      subtitle: "SECURE ACCESS TERMINAL",
      clearance: "LEVEL 7 CLEARANCE REQUIRED",
      scanBtn: "INITIATE BIOMETRIC SCAN",
      googleBtn: "ACCESS WITH CREDENTIALS (GOOGLE)",
      scanning: "VERIFYING IDENTITY...",
      granted: "ACCESS GRANTED. WELCOME, DIRECTOR.",
      selectLang: "LANGUAGE / IDIOMA",
      idPrompt: "IDENTIFICATION REQUIRED",
      error: "AUTHENTICATION ERROR"
    },
    header: {
      project: "PROJECT: LAZARUS",
      failure: "GLOBAL CONTAINMENT FAILURE",
      biohazard: "/// BIO-HAZARD DETECTED ///",
      clearance: "CLEARANCE: DIRECTOR",
      logout: "LOGOUT"
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
        stats: "COMBAT METRICS",
        str: "STRENGTH",
        agi: "AGILITY",
        int: "INTELLECT",
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
        selectDb: "SELECT FROM DATABASE (OPTIONAL)",
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
    heroes: {
        // LIVING
        spiderman: {
            alias: "SPIDER-MAN",
            bio: "Former Avenger. High agility and spider-sense make him an ideal scout for infected zones. Carries the guilt of survival."
        },
        blackwidow: {
            alias: "BLACK WIDOW",
            bio: "Expert spy and assassin. Her skills are crucial for infiltration missions in Fisk's territory. Keeps the team focused on the objective."
        },
        scorpion: {
            alias: "SCORPION",
            bio: "Former villain turned desperate survivor. His suit provides protection against bites. Unpredictable, but necessary muscle."
        },
        sabretooth: {
            alias: "SABRETOOTH",
            bio: "Driven by pure predatory instinct. S.H.I.E.L.D. keeps him on a tight leash. He tracks the infected not to save them, but for the sport."
        },
        reed: {
            alias: "MR. FANTASTIC",
            bio: "The smartest man alive, struggling to find a cure in a world that has rejected science. His intellect is humanity's last hope."
        },
        shehulk: {
            alias: "SHE-HULK",
            bio: "A lawyer who can bench press a tank. Retains her intelligence while transformed, making her a deadly combination of brains and brawn on the battlefield."
        },
        // DATABASE
        hawkeye: {
            alias: "HAWKEYE",
            bio: "Unmatched marksman. His eyes see what satellites miss. Fights for those who cannot fight."
        },
        lukecage: {
            alias: "LUKE CAGE",
            bio: "Impenetrable skin, unbreakable will. A human tank capable of withstanding bites and explosions while protecting civilians."
        },
        daredevil: {
            alias: "DAREDEVIL",
            bio: "The Man Without Fear. His enhanced senses are the perfect radar in the darkness of the quarantine zone."
        },
        thor: {
            alias: "THOR",
            bio: "The God of Thunder. Though Asgard fell, his hammer still brings the storm to the dead."
        },
        storm: {
            alias: "STORM",
            bio: "Weather Goddess. Can clear entire zones of zombies with a single tornado. The Queen needs her kingdom back."
        },
        // ZOMBIES
        colonel: {
            alias: "COLONEL AMERICA",
            bio: "The former symbol of freedom, now with an exposed skull. Retains tactical skills, leading the horde with military precision. His shield no longer protects, it only decapitaes."
        },
        ironman_z: {
            alias: "IRON MAN (Z)",
            bio: "Stark technology powered by rotting flesh. Repulsors glitching, but his teeth are not. Endlessly seeks energy sources to keep the suit running."
        },
        wolverine_z: {
            alias: "WOLVERINE (Z)",
            bio: "Healing factor fighting the virus eternally, keeping him in a state of constant rot and regeneration. Infinite pain makes him unstoppable."
        },
        phoenix_z: {
            alias: "DARK PHOENIX (Z)",
            bio: "Cosmic power mixed with insatiable hunger. An Omega-level threat that doesn't just want to eat flesh, but consume stars."
        }
    },
    missionModal: {
        title: "MISSION DOSSIER // CLASSIFIED",
        objectives: "TACTICAL OBJECTIVES",
        briefing: "SITUATION REPORT",
        threat: "THREAT LEVEL",
        accept: "INITIATE MISSION",
        complete: "REPORT MISSION SUCCESS",
        cancel: "CLOSE FILE",
        sending: "TRANSMITTING REPORT TO SATELLITE...",
        sent: "REPORT CONFIRMED"
    },
    story: {
        skip: "SKIP SEQUENCE",
        next: "NEXT",
        prev: "PREV",
        choose: "CHOOSE YOUR PATH",
        optionA: "OPTION A: THE LIVING HERO",
        optionB: "OPTION B: THE ZOMBIE HERO",
        slides: [
            { text: "MARVEL ZOMBIES: CONTAGIO CERO\nBook I: The Legacy of Arrogance", image: "https://i.pinimg.com/1200x/18/85/ee/1885ee42132b6976d36896a81f33ad8c.jpg" },
            { text: "There were no trumpets. No red skies or ancient prophecies being fulfilled.\nThe end of the world didn't come from outer space, nor from a dark dimension.", image: "https://i.pinimg.com/1200x/18/99/ec/1899ec756f8731e015eb941d7122fbec.jpg" },
            { text: "We built it. Here. At home. Or rather, they built it.\n\nIt was in a sterile lab. Three men gathered there: Victor Von Doom, Magneto, and Wilson Fisk.\nThey decided humanity was too chaotic. Their solution was cold, hard science: the Nullifier Pulse.", image: "https://i.pinimg.com/1200x/71/06/7d/71067db72856dfd6ca03d0d51a679bd6.jpg" },
            { text: "They needed bodies to refine the formula. They used Jamie Madrox to see how the infection multiplied.\nThey used the Reavers to see if metal could get sick.\nAnd it worked. God, how it worked.", image: "https://i.pinimg.com/1200x/99/80/1e/99801e7603e4a770127ce29530f13f87.jpg" },
            { text: "But arrogance is a loaded gun that always points backwards.\nThey decided to test their masterpiece on Bruce Banner. They were looking for infinite energy...", image: "https://i.pinimg.com/1200x/19/26/53/1926533335a2b27c4a79c9d2632ec83d.jpg" },
            { text: "...what they got was a biological bomb.\nWhen the virus touched gamma blood, he didn't die. He raged.", image: "https://i.pinimg.com/1200x/b2/06/15/b20615925dfa53cdf9622fb596cdd5e3.jpg" },
            { text: "The blast wasn't fire, it was contagion.\nHulk roared, and in that roar traveled extinction.", image: "https://i.pinimg.com/1200x/a8/e9/b7/a8e9b76d6a9a87de0cfba509d5fef534.jpg" },
            { text: "In a matter of hours, New York was a slaughterhouse. The Avengers fell first.\nThe X-Men held out a little longer, only to watch their school become an all-you-can-eat buffet.", image: "https://i.pinimg.com/1200x/eb/db/e8/ebdbe8d5738acd105654dc8ddad8216f.jpg" },
            { text: "And the Triad? Doom, Magneto, and Fisk were caught by their own creation.\nThey didn't lose their minds. Their bodies rotted, but their intellect remained intact.", image: "https://i.pinimg.com/1200x/b9/0a/18/b90a18369639b131f91273f019b699cd.jpg" },
            { text: "Now, they sit on thrones of bone, ruling nightmare factions:\nDoomsberg, the Broken Eden, and the Empire of Flesh.", image: "https://i.pinimg.com/1200x/e1/02/86/e102864e130bfa5b5f2ffc5a9d9ed9c0.jpg" },
            { text: "But there's something else out there. Something worse than the dead.\nS.H.I.E.L.D. is still active.", image: "https://i.pinimg.com/1200x/e2/5c/3a/e25c3ac26e5fc65f9119b6073912e856.jpg" },
            { text: "The \"Lazarus Protocol\" is still running. S.H.I.E.L.D. is no longer an agency; it's a ghost armed to the teeth.\nA blind, deaf, and paranoid AI that eliminates anything that moves.", image: "https://i.pinimg.com/1200x/39/c8/cd/39c8cde0a5b56acc78b41c4eecf91f0a.jpg" },
            { text: "So here you are. Standing on the ashes.\nTo your left, the dead. To your right, the machines.\nTell me, survivor... in this new era of monsters and machines:\nWHAT ARE YOU?", image: "https://i.pinimg.com/1200x/45/7d/c5/457dc515c61d470eb26cf1727ebd67ea.jpg" },
            // Choices handled by UI
        ]
    },
    missions: {
        kraven: {
            title: "KRAVEN'S LAST HUNT",
            description: [
                "There are no orders. Only the trail of screams and despair. Kraven the Hunter, Fisk's zombie predator, has marked these urban ruins as his personal hunting ground. It is an active purge to secure live 'merchandise'.",
                "Your access is the unstable Subway tunnel, your only safe entry and exit. The few survivors will be forced out of their hiding places throughout the assaults.",
                "Time is running out. You must intercept, protect, and evacuate a minimum of 5 survivors via the Subway. Kraven is relentless; if he secures 2 victims before you, the mission will be a total failure. Justice is dead, but hatred is your only escape strategy.",
                "Take to the streets and stop Kraven's Great Hunt!"
            ],
            objectives: [
                {
                    title: "Stop the Hunt!",
                    desc: "Rescue and evacuate 5 survivors via the subway before Kraven completes his trophy quota."
                },
                {
                    title: "Escape",
                    desc: "All Superheroes must escape via the Exit Zone. Any Superhero may exit through this Zone at the end of their turn at no cost, provided there are no enemies in it."
                }
            ]
        },
        fleshSleeps: {
            title: "WHERE THE FLESH SLEEPS",
            description: [
                "The Subway was left behind, devoured by dust and silence. Among the survivors you managed to get out, one —a maintenance technician— kept muttering disconnected things while you dragged him to the surface.",
                "“Trucks… marked containers… an old prison in the east… cold, so cold…” Then he fell silent. He didn't die, but he disappeared at dawn.",
                "Since then, rumors have multiplied. In neighborhoods controlled by Fisk, they speak of a place where no one returns, of engines roaring underground and lights that never go out. No one knows exactly what it is. Some call it “the warehouse”. Others, “the chamber”. Only one thing is certain: Fisk keeps something there he doesn't want anyone to see.",
                "Your route ends in front of the walls of a forgotten prison, covered in makeshift fences and emblems engraved with fire. If the rumor is true, inside you will find more than answers. And if it isn't… you will have walked into the heart of the empire of flesh."
            ],
            objectives: [
                {
                    title: "The Deception of Levers",
                    desc: "Open the complex doors. Activate the two real levers in the same turn."
                },
                {
                    title: "The Cell of Silence",
                    desc: "Free the captive hero."
                },
                {
                    title: "Those Who Still Breathe",
                    desc: "Rescue the prisoners. Evacuate at least 3 bystanders."
                },
                {
                    title: "Conditions",
                    desc: "Victory: Complete A + B + C. Failure: If the captive hero dies, Kraven captures 2 victims (if still active), or all heroes are eliminated."
                }
            ]
        },
        freshMeat: {
            title: "FRESH MEAT",
            description: [
                "Hunger is a fire that never dies. The Hive whispers locations of human settlements undetected by S.H.I.E.L.D. In the heart of Texas, a convoy of survivors attempts to cross No Man's Land.",
                "They don't know we own this wasteland. They think Hulk is the only danger. Poor fools.",
                "The mission is simple: Intercept the convoy. We don't want total destruction. We want conversion. We need soldiers. We need food. We need to expand the family."
            ],
            objectives: [
                {
                    title: "Ambush",
                    desc: "Stop the lead vehicle of the convoy before it crosses the state border."
                },
                {
                    title: "Conversion",
                    desc: "Infect 3 resistance leaders."
                },
                {
                    title: "No Witnesses",
                    desc: "Eliminate any distress signals before they contact S.H.I.E.L.D."
                }
            ]
        },
        breakSiege: {
            title: "BREAK THE SIEGE",
            description: [
                "Magneto has established a defensive perimeter around San Francisco. His reprogrammed sentinels are hunting our own. It is an insult to our supremacy.",
                "S.H.I.E.L.D. thinks they can contain us, but Broken Eden will fall. We have detected a breach in their magnetic shields.",
                "Infiltrate. Destroy the generators. Make Homo Superior kneel before the Superior Hunger."
            ],
            objectives: [
                {
                    title: "Sabotage",
                    desc: "Destroy the 2 magnetic field generators."
                },
                {
                    title: "Mutant Hunt",
                    desc: "Devour Magneto's elite guard."
                }
            ]
        },
        bases: {
            desc: "Encrypted signal detected. Energy signature matches pre-collapse S.H.I.E.L.D. technology.",
            objSecure: "Secure the perimeter",
            objRetrieve: "Retrieve Data",
            alpha: "HIDDEN BASE: ALPHA",
            beta: "HIDDEN BASE: BETA",
            gamma: "HIDDEN BASE: GAMMA",
            delta: "HIDDEN BASE: DELTA",
            epsilon: "HIDDEN BASE: EPSILON",
            zeta: "HIDDEN BASE: ZETA"
        }
    }
  }
};
