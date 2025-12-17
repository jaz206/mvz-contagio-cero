export type Language = 'es' | 'en';

export const translations = {
  es: {
    // ... (resto de traducciones igual) ...
    header: {
      project: "PROYECTO: LÁZARO",
      failure: "FALLO DE CONTENCIÓN",
      biohazard: "PELIGRO BIOLÓGICO",
      clearance: "NIVEL DE ACCESO: OMEGA",
      saving: "GUARDANDO...",
      saved: "GUARDADO",
      logout: "SALIR"
    },
    sidebar: {
      threatLevelTitle: "NIVEL DE AMENAZA",
      threatLevelValue: "CRÍTICO",
      infectionRate: "TASA DE INFECCIÓN: 89%",
      hiveBtn: "ACCESO COLMENA",
      bunkerBtn: "ACCESO BÚNKER",
      campaignMode: "MODO CAMPAÑA",
      activeMissions: "MISIONES ACTIVAS",
      noMissions: "NO HAY MISIONES DISPONIBLES",
      replayStory: "REPETIR INTRO"
    },
    map: {
      sector: "SECTOR",
      loading: "CARGANDO DATOS SATELITALES...",
      error: "ERROR DE CONEXIÓN",
      hive: "COLMENA",
      bunker: "BÚNKER"
    },
    factions: {
      magneto: { name: "Edén Roto (Magneto)" },
      kingpin: { name: "Imperio de la Carne" },
      hulk: { name: "Tierras Baldías (Hulk)" },
      doom: { name: "Doomsberg (Latveria)" },
      neutral: { name: "Zona Neutral" }
    },
    login: {
      title: "SHIELD OS",
      subtitle: "SISTEMA DE RESPUESTA A ZOMBIES",
      clearance: "AUTORIZACIÓN REQUERIDA",
      idPrompt: "ESCANEAR IDENTIFICACIÓN BIOMÉTRICA",
      scanning: "ESCANEANDO...",
      granted: "ACCESO CONCEDIDO",
      scanBtn: "INICIAR ESCANEO DE RETINA",
      googleBtn: "ACCESO OFICIAL DE SHIELD (GOOGLE)",
      editorBtn: "ACCESO DE EDITOR",
      editorPass: "CONTRASEÑA DE MANDO",
      error: "ERROR DE AUTENTICACIÓN",
      passError: "CONTRASEÑA INCORRECTA"
    },
    missionModal: {
      title: "ARCHIVO DE MISIÓN",
      threat: "NIVEL DE AMENAZA",
      briefing: "INFORME DE MISIÓN",
      objectives: "OBJETIVOS PRIMARIOS",
      downloadPdf: "DESCARGAR INFORME TÁCTICO COMPLETO",
      cancel: "CANCELAR",
      reactivate: "REACTIVAR",
      sending: "ENVIANDO...",
      sent: "INFORME ENVIADO",
      complete: "REPORTAR ÉXITO",
      accept: "ACEPTAR MISIÓN",
      outcomeTitle: "INFORME DE DESENLACE",
      closeReport: "ARCHIVAR INFORME"
    },
    bunker: {
      title: "PUESTO DE MANDO AVANZADO",
      hiveTitle: "NEXO DE LA COLMENA",
      return: "VOLVER AL MAPA",
      roster: "LISTA DE ACTIVOS",
      recruit: "RECLUTAR",
      currentStory: "ESTADO ACTUAL",
      objectives: "OBJETIVOS PERSONALES",
      status: "ESTADO",
      unassign: "RETIRAR",
      assign: "ASIGNAR A MISIÓN",
      viewFile: "VER FICHA TÉCNICA",
      manageSquad: "GESTIONAR ESCUADRÓN",
      assignModalTitle: "SELECCIONAR MISIÓN",
      squadModalTitle: "ASIGNACIÓN DE ESCUADRÓN",
      addToMission: "AÑADIR A MISIÓN",
      removeFromMission: "RETIRAR DE MISIÓN",
      noMissions: "NO HAY MISIONES DISPONIBLES",
      cancel: "CANCELAR",
      maxHeroes: "CAPACIDAD MÁXIMA ALCANZADA",
      omega: {
          title: "CILINDROS OMEGA",
          desc: "Nanobots reprogramados capaces de revertir la infección.",
          empty: "RESERVAS AGOTADAS",
          find: "BUSCAR SUMINISTROS",
          found: "¡CILINDRO ENCONTRADO!",
          notFound: "BÚSQUEDA FALLIDA"
      },
      rooms: {
          command: "SALA DE GUERRA",
          commandDesc: "Misiones activas y despliegue táctico.",
          barracks: "BARRACONES",
          barracksDesc: "Agentes en reserva listos para el servicio.",
          medbay: "ALA MÉDICA / CONTENCIÓN",
          medbayDesc: "Tratamiento y escaneo de nuevos sujetos.",
          cerebro: "INTERFAZ CEREBRO",
          cerebroDesc: "Búsqueda y reclutamiento global."
      }
    },
    recruit: {
      title: "RECLUTAMIENTO DE HÉROES",
      selectDb: "BASE DE DATOS DE S.H.I.E.L.D.",
      loadingDb: "ACCEDIENDO A ARCHIVOS...",
      alias: "NOMBRE EN CLAVE",
      name: "NOMBRE REAL",
      fileUrl: "URL DE FICHA (IMAGEN/PDF)",
      scanZombie: "ESCANEAR: SEÑALES ZOMBIE (CURAR)",
      scanHuman: "ESCANEAR: CARNE FRESCA (INFECTAR)",
      adminSeed: "ADMIN: REINICIAR DB",
      seedSuccess: "DB REINICIADA",
      submit: "RECLUTAR AGENTE"
    },
    missionEditor: {
      title: "EDITOR DE MISIONES",
      missionTitle: "TÍTULO DE LA MISIÓN",
      location: "UBICACIÓN (ESTADO)",
      threat: "NIVEL DE AMENAZA",
      type: "TIPO DE MISIÓN",
      prereq: "CONTINUACIÓN DE (REQUISITO)",
      pdfUrl: "URL DEL PDF (OPCIONAL)",
      description: "DESCRIPCIÓN",
      outcome: "DESENLACE (OPCIONAL)",
      objectives: "OBJETIVOS",
      addObjective: "AÑADIR OBJETIVO",
      objTitle: "Título del Objetivo",
      objDesc: "Descripción del Objetivo",
      cancel: "CANCELAR",
      save: "GUARDAR CAMBIOS"
    },
    events: {
      anomaly: {
          alive: {
              title: "ANOMALÍA CÓSMICA DETECTADA",
              desc: "LECTURAS DE ENERGÍA DESCONOCIDA EN EL ESPACIO PROFUNDO. REED RICHARDS CONFIRMA: UN PLANETA DEL SISTEMA VEGA HA DEJADO DE EXISTIR INSTANTÁNEAMENTE.",
              ack: "CONTINUAR MONITORIZACIÓN"
          },
          zombie: {
              title: "COMPETENCIA DETECTADA",
              desc: "EL HAMBRE SIENTE UNA PERTURBACIÓN. HANK PYM (ZOMBIE) INFORMA: ALGO MÁS ESTÁ DEVORANDO PLANETAS EN EL ESPACIO PROFUNDO. ¿ES COMIDA O UN RIVAL?",
              ack: "RASTREAR PRESA"
          }
      },
      surfer: {
          alive: {
              title: "LA CAÍDA DEL HERALDO",
              desc: "OBJETO PLATEADO ENTRÓ EN LA ATMÓSFERA. INTERCEPTADO POR HULK EN KANSAS. VÍDEO CONFIRMA INFECCIÓN. SILVER SURFER HA CAÍDO ANTE EL HAMBRE. REPITO: TENEMOS A UN HERALDO ZOMBIE EN JUEGO.",
              ack: "ACTIVAR PROTOCOLO OMEGA",
              image: "https://i.pinimg.com/1200x/ed/22/4b/ed224b12777f7372e1a4b6ca74912cf9.jpg"
          },
          zombie: {
              title: "COMIDA A DOMICILIO",
              desc: "UN SER DE PLATA HA ENTRADO EN LA ATMÓSFERA. TIENE SABOR A PODER CÓSMICO. HULK YA LE HA DADO EL PRIMER MORDISCO. EL HERALDO ES NUESTRO.",
              ack: "CONSUMIR PODER",
              image: "https://i.pinimg.com/1200x/ed/22/4b/ed224b12777f7372e1a4b6ca74912cf9.jpg"
          }
      },
      galactus: {
          alive: {
              title: "LLEGADA DE GALACTUS",
              desc: "EL DEVORADOR DE MUNDOS ESTÁ EN ÓRBITA. EL CIELO SE HA VUELTO PÚRPURA. NO VIENE A SALVARNOS. VIENE A COMER. LA ÚLTIMA BATALLA POR LA TIERRA HA COMENZADO.",
              ack: "PREPARARSE PARA EL JUICIO FINAL",
              image: "https://i.pinimg.com/736x/03/c7/6c/03c76c56fccbdc6bc57aff5c1b506089.jpg"
          },
          zombie: {
              title: "THE MAIN COURSE",
              desc: "GALACTUS IS HERE. HE IS GIANT. HE IS FULL OF ENERGY. IF WE EAT THIS SPACE GOD, WE WILL NEVER HUNGER AGAIN. DINNER IS SERVED!",
              ack: "DEVOUR THE DEVOURER",
              image: "https://i.pinimg.com/736x/03/c7/6c/03c76c56fccbdc6bc57aff5c1b506089.jpg"
          }
      }
    },
    missions: {
        kraven: {
            title: "LA CACERÍA DE KRAVEN",
            description: ["Kraven el Cazador ha establecido una zona de caza en Central Park. Está usando supervivientes como cebo.", "Debemos detenerlo antes de que mate a más inocentes."],
            objectives: [
                { title: "Localizar a Kraven", desc: "Rastrear sus movimientos en Central Park." },
                { title: "Neutralizar a Kraven", desc: "Acabar con la amenaza." }
            ]
        },
        fleshSleeps: {
            title: "DONDE DUERME LA CARNE",
            description: ["Hemos detectado una instalación subterránea donde Kingpin almacena 'carne fresca'.", "Es una granja de humanos. Debemos liberarlos."],
            objectives: [
                { title: "Infiltración", desc: "Entrar en la instalación sin ser detectados." },
                { title: "Liberación", desc: "Liberar a los prisioneros." }
            ]
        },
        bases: {
            alpha: "BASE ALPHA",
            beta: "BASE BETA",
            gamma: "BASE GAMMA",
            delta: "BASE DELTA",
            epsilon: "BASE EPSILON",
            zeta: "BASE ZETA",
            desc: "Antigua base de operaciones de S.H.I.E.L.D. Puede contener suministros vitales.",
            objSecure: "Asegurar el perímetro",
            objRetrieve: "Recuperar datos"
        },
        galactus: {
            title: "EL JUICIO FINAL",
            description: ["Galactus ha comenzado a alimentarse. Debemos detenerlo o la Tierra será destruida.", "Todos los héroes disponibles deben converger en su posición."],
            objectives: [
                { title: "Atacar a Galactus", desc: "Coordinar un ataque masivo." },
                { title: "Salvar la Tierra", desc: "Evitar la destrucción total." }
            ]
        }
    },
    heroes: {
        hawkeye: { alias: "HAWKEYE", bio: "Maestro arquero y asesino. Nunca falla." },
        lukecage: { alias: "LUKE CAGE", bio: "Piel impenetrable y fuerza sobrehumana." },
        daredevil: { alias: "DAREDEVIL", bio: "El hombre sin miedo. Sentidos aumentados." },
        thor: { alias: "THOR", bio: "Dios del Trueno. Posee el poder de Mjolnir." },
        storm: { alias: "STORM", bio: "Controla el clima. Una diosa entre mortales." }
    },
    
    introSequence: {
        alive: [
            {
                text: "El zumbido en tus oídos es lo único que ahoga los gritos de los moribundos. Sientes sabor a cobre; sangre. El transporte blindado de la Tríada, esa jaula con ruedas que os llevaba al matadero, es ahora un amasijo de metal retorcido y carne quemada. Iban a venderos, a usaros como cobayas o entretenimiento... pero el destino ha tirado los dados.",
                image: "https://i.postimg.cc/s2krL4L6/Video-con-humo-llamas-y-nubes-1.gif"
            },
            {
                text: "Te tocas el cuello. El piloto LED del collar inhibidor está apagado. El impacto ha frito los circuitos. Estáis libres. Pero en este mundo, la libertad tiene un precio: ahora sois presas. El humo negro es una baliza; el ruido del choque, una campana de cena para cada mordedor hambriento en cinco kilómetros a la redonda. Ya puedes oír sus gruñidos mezclándose con sirenas distantes.",
                image: "https://i.postimg.cc/FHdhNV6n/Image-to-Video.gif"
            },
            {
                text: "Una figura aparece recortada por las llamas. No lleva el uniforme de la Tríada. Os tiende una mano llena de cicatrices y grasa. “Podéis quedaros ahí tirados y ser el aperitivo, o podéis levantaros y ser los que aprietan el gatillo. El refugio está cerca… pero el asfalto se va a teñir de rojo antes de que lleguemos.”",
                image: "https://i.postimg.cc/4xpjWHtk/Mind-Video-20251212162510-850.gif"
            }
        ],
        zombie: [
            {
                text: "Nosotros no fuimos a pelear una guerra. Fuimos a terminar con una. Jennifer Walters (She-Hulk) nos había llamado a gritos. La Tríada (Doom, Magneto, Fisk) había secuestrado a Bruce Banner. Su plan: usar el 'Pulso Nulificador' para convertir a los superhumanos en esclavos. Nuestra misión era sencilla: infiltrarnos en ese laboratorio de hormigón, liberar a Bruce y desmantelar el arma. Estábamos allí, apretando los dientes, listos para la pelea... Pero no pudimos llegar. El Pulso se activó, y todo fue demasiado rápido. Un segundo de retraso fue nuestra condena. El arma falló.",
                // IMAGEN ACTUALIZADA SLIDE 1
                image: "https://i.postimg.cc/m2jR0zNC/Animacion-sutil-de-imagen-original.gif"
            },
            {
                text: "Cuando las alarmas sonaron, ya estábamos en los pasillos, y el color verde lo inundó todo. El virus nos tocó. Y, en lugar de matarnos, nos despertó. El dolor se desvaneció, y en su lugar llegó el Hambre. No como un grito, sino como un frío constante, un vacío que ningún poder puede apagar. Éramos héroes, y ahora somos el error. El laboratorio es ahora nuestro matadero personal. Y en el corazón del complejo, lo oímos. Hulk no murió. El monstruo despertó. Sin alma, sin freno. Cada latido suyo extiende la plaga Gamma. Ahora entendemos: Hulk es el origen, y lo último que intentamos fue lo que desató la catástrofe.",
                // IMAGEN ACTUALIZADA SLIDE 2
                image: "https://i.postimg.cc/RhvyRdYX/Animacion-sutil-de-vineta-comica.gif"
            },
            {
                text: "S.H.I.E.L.D. llegó tarde. Sellaron el complejo, bombardearon las coordenadas. Llaman a nuestra casa 'Zona Perdida'. El mundo exterior aún cree que puede contener esto, que puede revertirlo. No saben que el origen sigue rugiendo. No saben que el virus nos ha otorgado un poder que nunca conocimos. Ya no se trata de salvación. Se trata de expansión. Hemos aprendido a caminar con este vacío. Hemos aprendido a usar esta rabia. El virus aprendió a caminar. Y nosotros... vamos a cazarlo todo.",
                image: "https://i.pinimg.com/736x/e9/82/23/e98223ab8a1251e8fe9fce826dd3385f.jpg"
            }
        ]
    },
    // ... (resto del archivo igual)