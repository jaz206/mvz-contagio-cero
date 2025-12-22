import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client'; 
import { fetchUSATopoJSON } from '../services/topojsonService';
import { USATopoJSON, Mission, WorldStage } from '../types';
import { translations, Language } from '../translations';

interface USAMapProps {
  language: Language;
  missions: Mission[];
  completedMissionIds: Set<string>;
  onMissionComplete: (id: string) => void;
  onMissionSelect: (mission: Mission) => void;
  onBunkerClick: () => void;
  factionStates: {
      magneto: Set<string>;
      kingpin: Set<string>;
      hulk: Set<string>;
      doom: Set<string>;
  };
  playerAlignment?: 'ALIVE' | 'ZOMBIE' | null;
  worldStage: WorldStage;
  surferTurnCount?: number;
}

export const USAMap: React.FC<USAMapProps> = ({ 
    language, 
    missions, 
    completedMissionIds, 
    onMissionSelect, 
    onBunkerClick, 
    factionStates, 
    worldStage,
    surferTurnCount = 0
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const gMapRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const gMissionsRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const gTokensRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  
  const [usData, setUsData] = useState<USATopoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const [tokensReleased, setTokensReleased] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, mission: Mission, factionName: string } | null>(null);

  const [hulkLocation, setHulkLocation] = useState<[number, number]>([-98.5, 39.8]); 
  const [surferLocation, setSurferLocation] = useState<[number, number] | null>(null);

  const hulkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const surferTimerRef = useRef<NodeJS.Timeout | null>(null);
  const releaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const hulkCurrentLocRef = useRef<[number, number]>([-98.5, 39.8]);
  const meetingInProgressRef = useRef(false);

  const t = translations[language];

  // --- DEFINICIÓN DE ANIMACIONES CSS ---
  useEffect(() => {
      const styleId = 'map-animations';
      if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.innerHTML = `
            /* 1. EFECTO FLOW (Movimiento continuo de guiones) */
            @keyframes dash-flow {
                to { stroke-dashoffset: -20; }
            }
            .line-flowing {
                animation: dash-flow 1s linear infinite;
            }

            /* 2. EFECTO RADAR (Solo SHIELD) */
            @keyframes ripple-ping {
                0% { transform: scale(1); opacity: 0.8; stroke-width: 2px; }
                100% { transform: scale(3); opacity: 0; stroke-width: 0px; }
            }
            .shield-ripple {
                transform-box: fill-box;
                transform-origin: center;
                animation: ripple-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                pointer-events: none;
            }

            /* 3. EFECTO HALO RESPIRATORIO (Historia) */
            @keyframes halo-breathe {
                0%, 100% { transform: scale(1.3); opacity: 0.3; stroke-width: 1px; }
                50% { transform: scale(1.6); opacity: 0.6; stroke-width: 2px; }
            }
            .story-halo {
                transform-box: fill-box;
                transform-origin: center;
                animation: halo-breathe 3s ease-in-out infinite;
                pointer-events: none;
            }
          `;
          document.head.appendChild(style);
      }
  }, []);

  useEffect(() => {
      hulkCurrentLocRef.current = hulkLocation;
  }, [hulkLocation]);

  useEffect(() => {
      if (worldStage === 'SURFER') {
          setTokensReleased(false);
          if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
          releaseTimerRef.current = setTimeout(() => setTokensReleased(true), 1500);
      } else {
          setTokensReleased(true);
          meetingInProgressRef.current = false;
      }
      return () => {
          if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
      };
  }, [worldStage]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchUSATopoJSON();
        if (!data || !data.objects || !data.objects.states) throw new Error("Formato TopoJSON inválido");
        setUsData(data);
      } catch (err: any) {
        setError(`ERROR DE DATOS: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { projection, pathGenerator } = useMemo(() => {
      if (!usData || !usData.objects || !usData.objects.states || dimensions.width === 0 || dimensions.height === 0) {
          return { projection: null, pathGenerator: null };
      }
      try {
          const statesFeatureCollection = feature(usData as any, usData.objects.states as any);
          const proj = d3.geoAlbersUsa().fitSize([dimensions.width, dimensions.height], statesFeatureCollection as any);
          const path = d3.geoPath().projection(proj);
          return { projection: proj, pathGenerator: path };
      } catch (e) {
          return { projection: null, pathGenerator: null };
      }
  }, [usData, dimensions]);

  const getFactionName = (state: string) => {
      if (factionStates.magneto.has(state)) return t.factions.magneto.name;
      if (factionStates.kingpin.has(state)) return t.factions.kingpin.name;
      if (factionStates.hulk.has(state)) return t.factions.hulk.name;
      if (factionStates.doom.has(state)) return t.factions.doom.name;
      return t.factions.neutral.name;
  };

  const getMissionVisuals = (mission: Mission, isCompleted: boolean) => {
      let coreColor = '#eab308'; 
      
      if (isCompleted) coreColor = '#10b981'; 
      else if (mission.type === 'SHIELD_BASE') coreColor = '#3b82f6'; 
      else if (mission.type === 'INTRODUCTORY') coreColor = '#10b981'; 
      else if (mission.type && mission.type.startsWith('BOSS')) coreColor = '#9333ea'; 
      else if (mission.type === 'GALACTUS') coreColor = '#9333ea'; 

      let factionColor = '#94a3b8'; 
      let glowId = 'glow-neutral';
      
      const state = mission.location.state;
      if (factionStates.magneto.has(state)) { factionColor = '#ef4444'; glowId = 'glow-magneto'; }
      else if (factionStates.kingpin.has(state)) { factionColor = '#d946ef'; glowId = 'glow-kingpin'; }
      else if (factionStates.hulk.has(state)) { factionColor = '#84cc16'; glowId = 'glow-hulk'; }
      else if (factionStates.doom.has(state)) { factionColor = '#06b6d4'; glowId = 'glow-doom'; }

      if (mission.type === 'GALACTUS' || (mission.type && mission.type.startsWith('BOSS'))) { 
          factionColor = '#9333ea'; 
          glowId = 'glow-boss'; 
      }
      
      if (mission.type === 'INTRODUCTORY') {
          glowId = 'glow-shield';
          factionColor = '#10b981';
      }

      return { coreColor, factionColor, glowId };
  };

  // --- LÓGICA DE MOVIMIENTO DE TOKENS (HULK/SURFER) ---
  useEffect(() => {
      if (!tokensReleased || !usData || !pathGenerator || !projection) return;
      const getDistance = (a: [number, number], b: [number, number]) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
      const jumpHulk = () => {
          if (meetingInProgressRef.current) { hulkTimerRef.current = setTimeout(jumpHulk, 1000); return; }
          const statesFeatureCollection = feature(usData as any, usData!.objects.states as any) as any;
          const validStates = statesFeatureCollection.features.filter((f: any) => factionStates.hulk.has(f.properties.name));
          if (validStates.length > 0) {
              const candidates: { coords: [number, number], dist: number }[] = [];
              const currentLoc = hulkCurrentLocRef.current;
              validStates.forEach((state: any) => {
                  const centroid = pathGenerator.centroid(state);
                  if (projection.invert && centroid && !isNaN(centroid[0])) {
                      const coords = projection.invert(centroid) as [number, number];
                      if (coords) { const dist = getDistance(currentLoc, coords); if (dist > 0.5) candidates.push({ coords, dist }); }
                  }
              });
              candidates.sort((a, b) => a.dist - b.dist);
              const poolSize = Math.min(candidates.length, 4);
              if (poolSize > 0) {
                  const randomIndex = Math.floor(Math.random() * poolSize);
                  setHulkLocation(candidates[randomIndex].coords); 
                  hulkTimerRef.current = setTimeout(jumpHulk, 6000);
              } else { hulkTimerRef.current = setTimeout(jumpHulk, 3000); }
          }
      };
      if (hulkTimerRef.current) clearTimeout(hulkTimerRef.current);
      hulkTimerRef.current = setTimeout(jumpHulk, 2000);
      return () => { if (hulkTimerRef.current) clearTimeout(hulkTimerRef.current); };
  }, [tokensReleased, usData, pathGenerator, projection, factionStates]);

  useEffect(() => {
      if (worldStage !== 'SURFER' || !usData || !pathGenerator || !projection) { setSurferLocation(null); meetingInProgressRef.current = false; return; }
      const getRandomStateCoords = () => {
          const statesFeatureCollection = feature(usData as any, usData!.objects.states as any) as any;
          const randomFeature = statesFeatureCollection.features[Math.floor(Math.random() * statesFeatureCollection.features.length)];
          const centroid = pathGenerator.centroid(randomFeature);
          if (projection.invert && centroid && !isNaN(centroid[0])) { return projection.invert(centroid) as [number, number]; }
          return [-98.5, 39.8] as [number, number];
      };
      if (surferTimerRef.current) clearTimeout(surferTimerRef.current);
      if (surferTurnCount === 0) {
          meetingInProgressRef.current = true;
          if (!surferLocation) {
              setSurferLocation([-130, 60]); 
              surferTimerRef.current = setTimeout(() => {
                  setSurferLocation(hulkCurrentLocRef.current); 
                  surferTimerRef.current = setTimeout(() => {
                      meetingInProgressRef.current = false; 
                      const scatterCoords = getRandomStateCoords();
                      setSurferLocation(scatterCoords);
                  }, 20000); 
              }, 500);
          } else { meetingInProgressRef.current = true; setSurferLocation(hulkCurrentLocRef.current); }
      } else if (surferTurnCount > 0 && surferTurnCount <= 2) {
          meetingInProgressRef.current = false; 
          const newCoords = getRandomStateCoords();
          setSurferLocation(newCoords);
      } else if (surferTurnCount > 2) {
          meetingInProgressRef.current = false;
          setSurferLocation([-60, 20]); 
      }
      return () => { if (surferTimerRef.current) clearTimeout(surferTimerRef.current); };
  }, [worldStage, surferTurnCount, usData, pathGenerator, projection]);


  useEffect(() => {
    if (!usData || !svgRef.current || !projection || !pathGenerator) return;

    const svg = d3.select(svgRef.current);
    
    if (svg.select('g.layer-map').empty()) {
        svg.selectAll('*').remove();
        const defs = svg.append("defs");
        
        const createGlowFilter = (id: string, color: string) => {
            const filter = defs.append("filter").attr("id", id).attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
            filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
            const feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "coloredBlur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");
            filter.append("feDropShadow").attr("dx", 0).attr("dy", 0).attr("stdDeviation", 4).attr("flood-color", color).attr("flood-opacity", 0.8);
        };

        createGlowFilter("glow-magneto", "#ef4444");
        createGlowFilter("glow-kingpin", "#d946ef");
        createGlowFilter("glow-hulk", "#84cc16");
        createGlowFilter("glow-doom", "#06b6d4");
        createGlowFilter("glow-neutral", "#fbbf24");
        createGlowFilter("glow-boss", "#9333ea");
        createGlowFilter("glow-shield", "#3b82f6");
        createGlowFilter("glow-surfer", "#e2e8f0");

        defs.append("clipPath").attr("id", "bunker-clip").append("circle").attr("cx", 0).attr("cy", 0).attr("r", 12);
        
        const gMain = svg.append('g').attr('class', 'g-main');
        gMapRef.current = gMain.append('g').attr('class', 'layer-map');
        gMissionsRef.current = gMain.append('g').attr('class', 'layer-missions');
        gTokensRef.current = gMain.append('g').attr('class', 'layer-tokens');

        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 8])
          .on('zoom', (event) => {
            gMain.attr('transform', event.transform.toString());
            const k = event.transform.k;
            
            svg.selectAll('.bunker').attr('transform', function() {
                 const coords = d3.select(this).attr('data-coords')?.split(',').map(Number) || [0,0];
                 return `translate(${coords[0]},${coords[1]}) scale(${1/k})`;
            });
            svg.selectAll('text.label').style('font-size', `${Math.max(6, 10/k)}px`);

            // Ajuste de escala para misiones
            if (k >= 2.5) {
                svg.selectAll('.mission-dot').style('display', 'none');
                svg.selectAll('.effect-shield-ripple').style('display', 'none');
                svg.selectAll('.effect-story-halo').style('display', 'none');
                svg.selectAll('.mission-icon').style('display', 'block').attr('transform', `scale(${1/k * 2})`);
            } else {
                svg.selectAll('.mission-icon').style('display', 'none');
                svg.selectAll('.mission-dot').style('display', 'block').attr('transform', `scale(${1/Math.sqrt(k)})`);
                svg.selectAll('.effect-shield-ripple').style('display', 'block');
                svg.selectAll('.effect-story-halo').style('display', 'block');
            }
            
            svg.selectAll('.token-group').each(function() {
                const sel = d3.select(this);
                const transform = sel.attr('transform');
                if (transform) {
                    const translateMatch = transform.match(/translate\(([^)]+)\)/);
                    if (translateMatch) {
                        sel.attr('transform', `${translateMatch[0]} scale(${1/k})`);
                    }
                }
            });
          });

        svg.call(zoom);
    }

    const gMap = gMapRef.current;
    if (!gMap) return;

    const statesFeatureCollection = feature(usData as any, usData.objects.states as any) as any;
    const statesFeatures = statesFeatureCollection.features;

    const getFactionStyle = (stateName: string) => {
        if (factionStates.magneto.has(stateName)) return 'fill-red-900/60 stroke-red-500 stroke-[1px] hover:fill-red-700 hover:stroke-red-300 hover:stroke-[2px]';
        if (factionStates.kingpin.has(stateName)) return 'fill-purple-900/60 stroke-purple-500 stroke-[1px] hover:fill-purple-700 hover:stroke-purple-300 hover:stroke-[2px]';
        if (factionStates.hulk.has(stateName)) return 'fill-lime-900/40 stroke-lime-700 stroke-[1px] hover:fill-lime-900/70 hover:stroke-lime-400 hover:stroke-[2px]';
        if (factionStates.doom.has(stateName)) return 'fill-cyan-900/40 stroke-cyan-700 stroke-[1px] hover:fill-cyan-900/70 hover:stroke-cyan-400 hover:stroke-[2px]';
        return 'fill-slate-800/60 stroke-slate-600 stroke-[1px] hover:fill-slate-700 hover:stroke-slate-400 hover:stroke-[2px]';
    };

    gMap.selectAll('path.state')
      .data(statesFeatures)
      .join('path')
      .attr('class', (d: any) => `state ${getFactionStyle(d.properties.name)} transition-all duration-200 cursor-crosshair`)
      .attr('d', pathGenerator as any)
      .on('click', (event, d: any) => {
          event.stopPropagation();
          const bounds = pathGenerator.bounds(d);
          const dx = bounds[1][0] - bounds[0][0];
          const dy = bounds[1][1] - bounds[0][1];
          const x = (bounds[0][0] + bounds[1][0]) / 2;
          const y = (bounds[0][1] + bounds[1][1]) / 2;
          const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / dimensions.width, dy / dimensions.height)));
          const translate = [dimensions.width / 2 - scale * x, dimensions.height / 2 - scale * y];
          const svg = d3.select(svgRef.current);
          // @ts-ignore
          svg.transition().duration(750).call(svg.zoom().transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
      });

    gMap.selectAll('text.label')
      .data(statesFeatures)
      .join('text')
      .attr('class', 'label pointer-events-none font-mono select-none tracking-wider font-bold')
      .attr('transform', (d: any) => {
          const centroid = pathGenerator.centroid(d);
          if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return 'translate(-1000,-1000)';
          return `translate(${centroid[0]},${centroid[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '10px')
      .style('text-shadow', '0px 0px 3px #000')
      .text((d: any) => d.properties.name ? d.properties.name.toUpperCase() : '')
      .raise();

    const bunkerCoords = projection([-82.9, 40.0]);
    if (bunkerCoords && gMap.select('.bunker').empty()) {
        const bunkerGroup = gMap.append('g')
            .attr('class', 'bunker cursor-pointer hover:opacity-100')
            .attr('transform', `translate(${bunkerCoords[0]}, ${bunkerCoords[1]})`)
            .attr('data-coords', `${bunkerCoords[0]},${bunkerCoords[1]}`)
            .on('click', (e) => { e.stopPropagation(); onBunkerClick(); });
        bunkerGroup.append('circle').attr('r', 12).attr('fill', 'none').attr('stroke', '#06b6d4').attr('stroke-width', 1)
            .append('animate').attr('attributeName', 'r').attr('from', '12').attr('to', '25').attr('dur', '2s').attr('repeatCount', 'indefinite');
        bunkerGroup.append('image').attr('href', 'https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg')
            .attr('x', -12).attr('y', -12).attr('width', 24).attr('height', 24).attr('clip-path', 'url(#bunker-clip)');
        bunkerGroup.raise();
    }

  }, [usData, dimensions, projection, pathGenerator, factionStates]); 

  useEffect(() => {
      if (!projection || !gMissionsRef.current || !gTokensRef.current || !svgRef.current) return;
      
      const gMissions = gMissionsRef.current;
      const gTokens = gTokensRef.current;
      const currentZoom = d3.zoomTransform(svgRef.current).k || 1;

      const validMissions = missions.filter(m => {
          if (!m || !m.id || !m.location || !m.location.coordinates) return false;
          const [x, y] = m.location.coordinates;
          return x !== 0 && y !== 0 && !isNaN(x) && !isNaN(y);
      });
      
      const connections: { source: string, target: string }[] = [];
      validMissions.forEach(m => {
          if (m.prereqs && Array.isArray(m.prereqs) && m.prereqs.length > 0) {
              m.prereqs.forEach(pid => connections.push({ source: pid, target: m.id }));
          } 
          else if (m.prereq) {
              connections.push({ source: m.prereq, target: m.id });
          }
      });

      // --- LÍNEAS DE CONEXIÓN CON EFECTO "VIAJE" (D3 TRANSITION) ---
      gMissions.selectAll('path.mission-line')
        .data(connections, (d: any) => `${d.source}-${d.target}`) 
        .join(
            enter => enter.append('path').attr('class', 'mission-line'),
            update => update,
            exit => exit.remove()
        )
        .attr('d', (d) => {
            const startMission = missions.find(m => m.id === d.source);
            const endMission = missions.find(m => m.id === d.target);
            if (!startMission || !endMission) return null;
            const start = projection(startMission.location.coordinates);
            const end = projection(endMission.location.coordinates);
            if (!start || !end) return null;
            const dr = Math.sqrt(Math.pow(end[0]-start[0], 2) + Math.pow(end[1]-start[1], 2));
            return `M${start[0]},${start[1]}A${dr},${dr} 0 0,1 ${end[0]},${end[1]}`;
        })
        .attr('fill', 'none')
        .attr('stroke-width', (d) => {
            const isSourceComplete = completedMissionIds.has(d.source);
            return isSourceComplete ? 2 : 1.5;
        })
        .each(function(d) {
            const path = d3.select(this);
            const isSourceComplete = completedMissionIds.has(d.source);
            const isTargetComplete = completedMissionIds.has(d.target);
            const isActiveRoute = isSourceComplete && !isTargetComplete;

            // Si es la ruta activa y NO se está animando ni fluyendo ya
            if (isActiveRoute && !path.classed('line-flowing') && !path.classed('animating')) {
                 const totalLength = (this as SVGPathElement).getTotalLength();

                 path.classed('animating', true) // Marcar como animando
                     .attr('stroke-dasharray', `${totalLength} ${totalLength}`) // Patrón: Línea completa, Espacio completo
                     .attr('stroke-dashoffset', totalLength) // Empezar oculto (offset = longitud)
                     .attr('opacity', 1)
                     .attr('stroke', '#fbbf24') // Amarillo brillante
                     .transition()
                     .duration(2000) // Duración del "viaje" (2 segundos)
                     .ease(d3.easeLinear)
                     .attr('stroke-dashoffset', 0) // Terminar visible (offset = 0)
                     .on('end', () => {
                         // Al terminar, cambiar a modo "flujo" infinito
                         path.classed('animating', false)
                             .classed('line-flowing', true)
                             .style('stroke-dasharray', '4,4'); // Restaurar patrón de guiones normal
                     });
            } 
            // Si ya estaba fluyendo (para no reiniciar la animación al hacer zoom/pan)
            else if (isActiveRoute && path.classed('line-flowing')) {
                 path.style('stroke-dasharray', '4,4')
                     .attr('stroke', '#fbbf24')
                     .attr('opacity', 1);
            } 
            // Rutas inactivas o completadas
            else {
                 path.classed('line-flowing', false)
                     .classed('animating', false)
                     .style('stroke-dasharray', '4,4')
                     .attr('stroke', '#475569')
                     .attr('opacity', 0.4);
            }
        });

      // --- GRUPOS DE MISIONES ---
      const missionGroups = gMissions.selectAll('g.mission')
        .data(validMissions, (d: any) => d.id) 
        .join(
            enter => {
                const grp = enter.append('g').attr('class', 'mission cursor-pointer hover:opacity-100');
                // 1. Efecto Radar (Solo SHIELD)
                grp.append('circle').attr('class', 'effect-shield-ripple');
                // 2. Efecto Halo (Historia)
                grp.append('circle').attr('class', 'effect-story-halo');
                // 3. Punto Principal
                grp.append('circle').attr('class', 'mission-dot');
                // 4. Icono (Zoom Alto)
                grp.append('g').attr('class', 'mission-icon');
                return grp;
            }
        )
        .attr('transform', (d) => {
            const coords = projection(d.location.coordinates);
            return coords ? `translate(${coords[0]}, ${coords[1]})` : 'translate(-100,-100)';
        })
        .on('click', (e, d) => { 
            e.stopPropagation(); 
            if (worldStage === 'GALACTUS' && d.type !== 'BOSS' && d.type !== 'GALACTUS') return;
            onMissionSelect(d); 
        })
        .on('mouseenter', (event, d) => {
            const factionName = getFactionName(d.location.state);
            setTooltip({ x: event.clientX, y: event.clientY, mission: d, factionName });
        })
        .on('mousemove', (event) => setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null))
        .on('mouseleave', () => setTooltip(null));

      // --- RENDERIZADO EFECTO RADAR (SHIELD) ---
      missionGroups.select('.effect-shield-ripple')
        .attr('r', 8)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6') // Azul SHIELD
        .attr('class', (d) => {
            const isCompleted = completedMissionIds.has(d.id);
            const isShield = d.type === 'SHIELD_BASE';
            return (isCompleted && isShield) ? 'effect-shield-ripple shield-ripple' : 'effect-shield-ripple';
        })
        .style('display', (d) => {
            const isCompleted = completedMissionIds.has(d.id);
            const isShield = d.type === 'SHIELD_BASE';
            return (isCompleted && isShield && currentZoom < 2.5) ? 'block' : 'none';
        });

      // --- RENDERIZADO EFECTO HALO (HISTORIA) ---
      missionGroups.select('.effect-story-halo')
        .attr('r', 8)
        .attr('fill', 'none')
        .attr('stroke', (d) => {
            // Color según facción o verde si es intro
            if (d.type === 'INTRODUCTORY') return '#10b981';
            const visuals = getMissionVisuals(d, true);
            return visuals.factionColor;
        })
        .attr('class', (d) => {
            const isCompleted = completedMissionIds.has(d.id);
            const isShield = d.type === 'SHIELD_BASE';
            return (isCompleted && !isShield) ? 'effect-story-halo story-halo' : 'effect-story-halo';
        })
        .style('display', (d) => {
            const isCompleted = completedMissionIds.has(d.id);
            const isShield = d.type === 'SHIELD_BASE';
            return (isCompleted && !isShield && currentZoom < 2.5) ? 'block' : 'none';
        });

      // --- RENDERIZADO DEL PUNTO PRINCIPAL ---
      missionGroups.select('.mission-dot')
        .attr('r', (d) => completedMissionIds.has(d.id) ? 6 : 5)
        .attr('fill', (d) => {
            if (worldStage === 'GALACTUS' && d.type !== 'BOSS' && d.type !== 'GALACTUS') return '#64748b';
            const visuals = getMissionVisuals(d, completedMissionIds.has(d.id));
            return visuals.coreColor;
        })
        .attr('stroke', (d) => {
            if (worldStage === 'GALACTUS' && d.type !== 'BOSS' && d.type !== 'GALACTUS') return '#475569';
            const visuals = getMissionVisuals(d, completedMissionIds.has(d.id));
            return visuals.factionColor;
        })
        .attr('stroke-width', 2) 
        .style('filter', (d) => {
            if (worldStage === 'GALACTUS' && d.type !== 'BOSS' && d.type !== 'GALACTUS') return 'none';
            const visuals = getMissionVisuals(d, completedMissionIds.has(d.id));
            return `url(#${visuals.glowId})`;
        })
        .style('display', currentZoom >= 2.5 ? 'none' : 'block')
        .attr('transform', `scale(${1/Math.sqrt(currentZoom)})`);

      // --- RENDERIZADO DEL ICONO (ZOOM ALTO) ---
      missionGroups.select('.mission-icon')
        .each(function(d) {
          const sel = d3.select(this);
          const isCompleted = completedMissionIds.has(d.id);
          const currentStatus = sel.attr('data-status');
          const newStatus = isCompleted ? 'completed' : 'active';
          const isBlocked = worldStage === 'GALACTUS' && d.type !== 'BOSS' && d.type !== 'GALACTUS';

          if (sel.selectAll('*').empty() || currentStatus !== newStatus) {
              sel.selectAll('*').remove();
              sel.attr('data-status', newStatus);
              const visuals = getMissionVisuals(d, isCompleted);
              const strokeColor = isBlocked ? '#64748b' : visuals.factionColor;
              const fillColor = isBlocked ? '#1e293b' : '#0f172a';
              const coreColor = isBlocked ? '#64748b' : visuals.coreColor;
              sel.append('circle').attr('r', 10).attr('fill', fillColor).attr('stroke', strokeColor).attr('stroke-width', 2).style('filter', isBlocked ? 'none' : `url(#${visuals.glowId})`);
              sel.append('circle').attr('r', 3).attr('fill', coreColor);
          }
        })
        .style('display', currentZoom < 2.5 ? 'none' : 'block')
        .attr('transform', `scale(${1/currentZoom * 2})`);

      // ... (Lógica de renderizado de tokens Hulk/Surfer se mantiene igual) ...
      let hulkRenderCoords = projection(hulkLocation);
      let surferRenderCoords = surferLocation ? projection(surferLocation) : null;

      if (hulkRenderCoords && surferRenderCoords) {
          const dist = Math.sqrt(Math.pow(hulkRenderCoords[0] - surferRenderCoords[0], 2) + Math.pow(hulkRenderCoords[1] - surferRenderCoords[1], 2));
          if (dist < 20) {
              hulkRenderCoords = [hulkRenderCoords[0] - 15, hulkRenderCoords[1]];
              surferRenderCoords = [surferRenderCoords[0] + 15, surferRenderCoords[1]];
          }
      }

      if (tokensReleased && hulkRenderCoords) {
          let hulkGroup = gTokens.select('.hulk-token');
          if (hulkGroup.empty()) {
              hulkGroup = gTokens.append('g').attr('class', 'token-group hulk-token cursor-pointer').attr('transform', `translate(${hulkRenderCoords[0]}, ${hulkRenderCoords[1]}) scale(${1/currentZoom})`);
              hulkGroup.append('circle').attr('r', 15).attr('fill', '#65a30d').attr('stroke', '#365314').attr('stroke-width', 2).style('filter', 'url(#glow-hulk)');
              hulkGroup.append('text').text('HULK').attr('dy', 4).attr('text-anchor', 'middle').attr('font-size', '8px').attr('font-weight', 'bold').attr('fill', 'white');
          } else {
              const currentTransform = hulkGroup.attr('transform');
              const currentCoords = currentTransform.match(/translate\(([^)]+)\)/);
              const [oldX, oldY] = currentCoords ? currentCoords[1].split(',').map(Number) : [0,0];
              const dist = Math.sqrt(Math.pow(hulkRenderCoords[0] - oldX, 2) + Math.pow(hulkRenderCoords[1] - oldY, 2));
              
              if (dist > 10) { 
                  const iX = d3.interpolateNumber(oldX, hulkRenderCoords[0]);
                  const iY = d3.interpolateNumber(oldY, hulkRenderCoords[1]);
                  const baseScale = 1/currentZoom;
                  hulkGroup.transition().duration(2000).ease(d3.easeQuadInOut).attrTween("transform", function() {
                          return function(t) {
                              const x = iX(t);
                              const y = iY(t);
                              const jumpHeight = Math.sin(t * Math.PI) * 2; 
                              const currentScale = baseScale * (1 + jumpHeight);
                              return `translate(${x},${y}) scale(${currentScale})`;
                          };
                      })
                      .on("end", function() {
                          d3.select(this).attr('transform', `translate(${hulkRenderCoords![0]}, ${hulkRenderCoords![1]}) scale(${baseScale})`);
                          d3.select(this).append("circle").attr("r", 15).attr("fill", "none").attr("stroke", "#65a30d").attr("stroke-width", 3).attr("opacity", 1).transition().duration(600).attr("r", 60).attr("opacity", 0).remove();
                      });
              } else {
                  hulkGroup.attr('transform', `translate(${hulkRenderCoords[0]}, ${hulkRenderCoords[1]}) scale(${1/currentZoom})`);
              }
          }
      } else {
          gTokens.selectAll('.hulk-token').remove();
      }

      if (surferRenderCoords) {
          let surferGroup = gTokens.select('.surfer-token');
          if (surferGroup.empty()) {
              surferGroup = gTokens.append('g')
                  .attr('class', 'token-group surfer-token cursor-pointer')
                  .attr('transform', `translate(${surferRenderCoords[0]}, ${surferRenderCoords[1]}) scale(${1/currentZoom})`);
              
              surferGroup.append('circle').attr('r', 12).attr('fill', '#e2e8f0').attr('stroke', '#94a3b8').attr('stroke-width', 2).style('filter', 'url(#glow-surfer)');
              surferGroup.append('text').text('SURFER').attr('dy', 4).attr('text-anchor', 'middle').attr('font-size', '6px').attr('font-weight', 'bold').attr('fill', '#1e293b');
          } else {
              const currentTransform = surferGroup.attr('transform');
              const currentCoords = currentTransform.match(/translate\(([^)]+)\)/);
              const [oldX, oldY] = currentCoords ? currentCoords[1].split(',').map(Number) : [0,0];
              
              const dist = Math.sqrt(Math.pow(surferRenderCoords[0] - oldX, 2) + Math.pow(surferRenderCoords[1] - oldY, 2));
              
              if (dist > 5) { 
                  const iX = d3.interpolateNumber(oldX, surferRenderCoords[0]);
                  const iY = d3.interpolateNumber(oldY, surferRenderCoords[1]);
                  const baseScale = 1/currentZoom;
                  const duration = dist > 200 ? 5000 : 3000;

                  surferGroup.transition()
                      .duration(duration)
                      .ease(d3.easeCubicInOut)
                      .attrTween("transform", function() {
                          return function(t) {
                              const x = iX(t);
                              const y = iY(t);
                              return `translate(${x},${y}) scale(${baseScale})`;
                          };
                      })
                      .on("end", function() {
                          d3.select(this).attr('transform', `translate(${surferRenderCoords![0]}, ${surferRenderCoords![1]}) scale(${baseScale})`);
                      });
              } else {
                  surferGroup.attr('transform', `translate(${surferRenderCoords[0]}, ${surferRenderCoords[1]}) scale(${1/currentZoom})`);
              }
          }
      } else {
          gTokens.selectAll('.surfer-token').remove();
      }

  }, [missions, completedMissionIds, worldStage, tokensReleased, projection, hulkLocation, surferLocation]);

  if (loading) return <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-cyan-500 font-mono"><div className="animate-spin text-4xl">✇</div><div>{t.map.loading}</div></div>;
  if (error) return <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-red-500 font-mono border border-red-900 bg-red-900/20 p-4"><div className="text-2xl mb-2">⚠ SYSTEM FAILURE</div><div className="text-xs">{error}</div></div>;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-transparent overflow-hidden group">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #0e7490 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2}}></div>
        
        {worldStage === 'GALACTUS' && (
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-purple-900/30 mix-blend-overlay animate-pulse-slow"></div>
                <div className="w-[120%] h-[120%] absolute animate-breathing opacity-60" style={{ backgroundImage: `url('https://i.pinimg.com/736x/7d/99/05/7d9905d417620745edc2c724f94e56c8.jpg')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'hard-light', maskImage: 'radial-gradient(circle, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 80%)' }}></div>
            </div>
        )}
        
        <svg ref={svgRef} className="w-full h-full relative z-10"></svg>

        {tooltip && (
            <div className="fixed z-50 pointer-events-none bg-slate-900/95 border border-cyan-500 p-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-sm min-w-[200px]" style={{ left: Math.min(tooltip.x + 15, window.innerWidth - 220), top: Math.min(tooltip.y + 15, window.innerHeight - 100) }}>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-700 pb-1">{tooltip.factionName}</div>
                <div className="text-sm font-bold text-white mb-1">{tooltip.mission.title}</div>
                <div className="flex gap-2 flex-wrap">
                    {tooltip.mission.type === 'SHIELD_BASE' && <span className="text-[9px] bg-blue-900 text-blue-300 px-1.5 py-0.5 border border-blue-700 rounded">🛡 MISION ESPECIAL S.H.I.E.L.D.</span>}
                    {(tooltip.mission.type === 'BOSS' || tooltip.mission.type === 'GALACTUS') && <span className="text-[9px] bg-purple-900 text-purple-300 px-1.5 py-0.5 border border-purple-700 rounded">💀 JEFE FINAL</span>}
                    <span className={`text-[9px] px-1.5 py-0.5 border rounded ${tooltip.mission.threatLevel === 'ALTA' ? 'bg-orange-900 text-orange-300 border-orange-700' : tooltip.mission.threatLevel === 'EXTREMA' ? 'bg-red-900 text-red-300 border-red-700' : 'bg-yellow-900 text-yellow-300 border-yellow-700'}`}>{tooltip.mission.threatLevel}</span>
                </div>
            </div>
        )}
    </div>
  );
};