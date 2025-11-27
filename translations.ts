
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
      bunkerBtn: "ACCEDER AL BÚNKER DE MANDO"
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
    },
    bunker: {
        title: "BÚNKER DE MANDO // NIVEL SUBTERRÁNEO 4",
        roster: "LISTA DE ACTIVOS",
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
    missionModal: {
        title: "DOSSIER DE MISIÓN // CLASIFICADO",
        objectives: "OBJETIVOS TÁCTICOS",
        briefing: "INFORME DE SITUACIÓN",
        threat: "NIVEL DE AMENAZA",
        accept: "INICIAR MISIÓN",
        complete: "REPORTAR ÉXITO DE MISIÓN",
        cancel: "CERRAR ARCHIVO"
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
      bunkerBtn: "ACCESS COMMAND BUNKER"
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
    },
    bunker: {
        title: "COMMAND BUNKER // SUB-LEVEL 4",
        roster: "ASSET ROSTER",
        file: "PERSONNEL FILE",
        return: "RETURN TO TACTICAL MAP",
        status: "OPERATIONAL STATUS",
        class: "CLASS",
        bio: "BIOGRAPHICAL SUMMARY",
        stats: "COMBAT METRICS",
        str: "STRENGTH",
        agi: "AGILIDAD",
        int: "INTELLECT",
        assign: "ASSIGN TO MISSION",
        unassign: "WITHDRAW FROM SERVICE",
        assignModalTitle: "SELECT TACTICAL MISSION",
        currentMission: "DEPLOYED TO",
        noMissions: "NO AVAILABLE MISSIONS",
        maxHeroes: "MAX SQUAD CAPACITY (6) REACHED",
        cancel: "CANCEL"
    },
    missionModal: {
        title: "MISSION DOSSIER // CLASSIFIED",
        objectives: "TACTICAL OBJECTIVES",
        briefing: "SITUATION REPORT",
        threat: "THREAT LEVEL",
        accept: "INITIATE MISSION",
        complete: "REPORT MISSION SUCCESS",
        cancel: "CLOSE FILE"
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
        }
    }
  }
};