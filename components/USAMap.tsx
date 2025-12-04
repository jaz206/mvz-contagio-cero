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
}

export const USAMap: React.FC<USAMapProps> = ({ 
    language, 
    missions, 
    completedMissionIds, 
    onMissionSelect, 
    onBunkerClick, 
    factionStates, 
    worldStage 
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
  
  const [hulkLocation, setHulkLocation] = useState<[number, number]>([-98.5, 39.8]); 
  
  const hulkSequenceRef = useRef<{ active: boolean, remainingJumps: number }>({ active: false, remainingJumps: 0 });
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const t = translations[language];

  const addTimeout = (callback: () => void, ms: number) => {
      const id = setTimeout(() => {
          callback();
          timeoutsRef.current = timeoutsRef.current.filter(t => t !== id);
      }, ms);
      timeoutsRef.current.push(id);
      return id;
  };

  useEffect(() => {
      if (worldStage === 'SURFER') {
          setTokensReleased(false);
          addTimeout(() => setTokensReleased(true), 5000);
      } else {
          setTokensReleased(true);
      }
      return () => {
          timeoutsRef.current.forEach(clearTimeout);
          timeoutsRef.current = [];
      };
  }, [worldStage]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchUSATopoJSON();
        if (!data || !data.objects || !data.objects.states) {
            throw new Error("Formato TopoJSON inválido");
        }
        setUsData(data);
      } catch (err: any) {
        setError(`ERROR DE DATOS: ${err.message}`);
        console.error('Error loading TopoJSON:', err);
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
        if (width > 0 && height > 0) {
            setDimensions({ width, height });
        }
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
          console.error("Error calculating projection:", e);
          return { projection: null, pathGenerator: null };
      }
  }, [usData, dimensions]);

  useEffect(() => {
      if (!tokensReleased || !usData || !pathGenerator || !projection) return;
      const getDistance = (a: [number, number], b: [number, number]) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

      const executeHulkLogic = () => {
          if (hulkSequenceRef.current.active) return;
          const jumpsToDo = Math.floor(Math.random() * 3) + 1;
          hulkSequenceRef.current = { active: true, remainingJumps: jumpsToDo };
          performJumpStep();
      };

      const performJumpStep = () => {
          const statesFeatureCollection = feature(usData as any, usData!.objects.states as any) as any;
          const validStates = statesFeatureCollection.features.filter((f: any) => factionStates.hulk.has(f.properties.name));

          if (validStates.length > 0) {
              const candidates: { coords: [number, number], dist: number }[] = [];
              validStates.forEach((state: any) => {
                  const centroid = pathGenerator.centroid(state);
                  if (projection.invert && centroid && !isNaN(centroid[0])) {
                      const coords = projection.invert(centroid) as [number, number];
                      if (coords) {
                          const dist = getDistance(hulkLocation, coords);
                          if (dist > 0.5) candidates.push({ coords, dist });
                      }
                  }
              });
              candidates.sort((a, b) => a.dist - b.dist);
              const poolSize = Math.min(candidates.length, 4);
              if (poolSize > 0) {
                  const randomIndex = Math.floor(Math.random() * poolSize);
                  setHulkLocation(candidates[randomIndex].coords);
                  hulkSequenceRef.current.remainingJumps -= 1;
                  if (hulkSequenceRef.current.remainingJumps > 0) addTimeout(performJumpStep, 2500); 
                  else addTimeout(() => { hulkSequenceRef.current.active = false; executeHulkLogic(); }, 10000);
              } else {
                  addTimeout(() => { hulkSequenceRef.current.active = false; executeHulkLogic(); }, 5000);
              }
          }
      };
      const initialTimer = addTimeout(executeHulkLogic, 2000);
      return () => clearTimeout(initialTimer);
  }, [tokensReleased, usData, pathGenerator, projection, factionStates, hulkLocation]);

  useEffect(() => {
    if (!usData || !svgRef.current || !projection || !pathGenerator) return;

    const svg = d3.select(svgRef.current);
    
    if (svg.select('g.layer-map').empty()) {
        svg.selectAll('*').remove();

        const defs = svg.append("defs");
        const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
        filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        defs.append("clipPath").attr("id", "bunker-clip").append("circle").attr("cx", 0).attr("cy", 0).attr("r", 12);
        defs.append("clipPath").attr("id", "mission-clip").append("circle").attr("cx", 0).attr("cy", 0).attr("r", 8);
        
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

            if (k >= 2.5) {
                svg.selectAll('.mission-dot').style('display', 'none');
                svg.selectAll('.mission-icon').style('display', 'block').attr('transform', `scale(${1/k * 2})`);
            } else {
                svg.selectAll('.mission-icon').style('display', 'none');
                svg.selectAll('.mission-dot').style('display', 'block').attr('transform', `scale(${1/Math.sqrt(k)})`);
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
        return 'fill-emerald-900/60 stroke-emerald-600 stroke-[1px] hover:fill-emerald-800 hover:stroke-emerald-300 hover:stroke-[2px]';
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
      })
      .select('title')
      .text((d: any) => `${d.properties.name.toUpperCase()}`);
      
    gMap.selectAll('path.state').filter(function() { return d3.select(this).select('title').empty(); })
      .append('title').text((d: any) => `${d.properties.name.toUpperCase()}`);

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

      const validMissions = missions.filter(m => m && m.id && m.location && m.location.coordinates);

      gMissions.selectAll('path.mission-line')
        .data(validMissions.filter(m => m.prereq))
        .join('path')
        .attr('class', 'mission-line')
        .attr('d', (d) => {
            const startMission = missions.find(m => m.id === d.prereq);
            if (!startMission) return null;
            const start = projection(startMission.location.coordinates);
            const end = projection(d.location.coordinates);
            if (!start || !end) return null;
            const dr = Math.sqrt(Math.pow(end[0]-start[0], 2) + Math.pow(end[1]-start[1], 2));
            return `M${start[0]},${start[1]}A${dr},${dr} 0 0,1 ${end[0]},${end[1]}`;
        })
        .attr('fill', 'none').attr('stroke', '#eab308').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,4').attr('opacity', 0.6);

      const missionGroups = gMissions.selectAll('g.mission')
        .data(validMissions, (d: any) => d.id) 
        .join(
            enter => {
                const grp = enter.append('g').attr('class', 'mission cursor-pointer hover:opacity-100');
                grp.append('circle').attr('class', 'mission-dot');
                grp.append('g').attr('class', 'mission-icon');
                return grp;
            }
        )
        .attr('transform', (d) => {
            const coords = projection(d.location.coordinates);
            return coords ? `translate(${coords[0]}, ${coords[1]})` : 'translate(-100,-100)';
        })
        .on('click', (e, d) => { e.stopPropagation(); onMissionSelect(d); });

      missionGroups.select('.mission-dot')
        .attr('r', (d) => completedMissionIds.has(d.id) ? 6 : 4.5)
        .attr('fill', (d) => {
            if (completedMissionIds.has(d.id)) return '#10b981'; 
            if (d.type === 'SHIELD_BASE') return '#06b6d4'; 
            if (d.type === 'BOSS') return '#9333ea'; 
            return '#eab308';
        })
        .attr('stroke', 'white').attr('stroke-width', 0.5).style('filter', 'url(#glow)')
        .style('display', currentZoom >= 2.5 ? 'none' : 'block')
        .attr('transform', `scale(${1/Math.sqrt(currentZoom)})`);

      missionGroups.select('.mission-icon')
        .each(function(d) {
          const sel = d3.select(this);
          const isCompleted = completedMissionIds.has(d.id);
          const currentStatus = sel.attr('data-status');
          const newStatus = isCompleted ? 'completed' : 'active';

          if (sel.selectAll('*').empty() || currentStatus !== newStatus) {
              sel.selectAll('*').remove();
              sel.attr('data-status', newStatus);
              
              if (d.type === 'SHIELD_BASE' && !isCompleted) {
                 sel.append('circle').attr('r', 9).attr('fill', '#0f172a').attr('stroke', '#06b6d4').attr('stroke-width', 1);
                 sel.append('image')
                    .attr('href', 'https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg')
                    .attr('x', -8).attr('y', -8)
                    .attr('width', 16).attr('height', 16)
                    .attr('clip-path', 'url(#mission-clip)');
              } else {
                  sel.append('circle').attr('r', 8).attr('fill', '#0f172a').attr('stroke', isCompleted ? '#10b981' : '#eab308');
                  if (isCompleted) {
                      sel.append('path').attr('d', "M-3,0 L0,3 L5,-4").attr('stroke', '#10b981').attr('stroke-width', 2).attr('fill', 'none');
                  } else if (d.type === 'BOSS') {
                      sel.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('font-size', '10px').text('💀').attr('fill', '#9333ea');
                  } else {
                      sel.append('path').attr('d', "M-4,-4 L4,4 M-4,4 L4,-4").attr('stroke', '#eab308').attr('stroke-width', 1.5);
                  }
              }
          }
        })
        .style('display', currentZoom < 2.5 ? 'none' : 'block')
        .attr('transform', `scale(${1/currentZoom * 2})`);

      if (tokensReleased) {
          const hulkCoords = projection(hulkLocation);
          if (hulkCoords) {
              let hulkGroup = gTokens.select('.hulk-token');
              
              if (hulkGroup.empty()) {
                  hulkGroup = gTokens.append('g')
                      .attr('class', 'token-group hulk-token cursor-pointer')
                      .attr('transform', `translate(${hulkCoords[0]}, ${hulkCoords[1]}) scale(${1/currentZoom})`);
                  
                  hulkGroup.append('circle').attr('r', 15).attr('fill', '#65a30d').attr('stroke', '#365314').attr('stroke-width', 2).style('filter', 'url(#glow)');
                  hulkGroup.append('text').text('HULK').attr('dy', 4).attr('text-anchor', 'middle').attr('font-size', '8px').attr('font-weight', 'bold').attr('fill', 'white');
              } else {
                  const currentTransform = hulkGroup.attr('transform');
                  const currentCoords = currentTransform.match(/translate\(([^)]+)\)/);
                  const [oldX, oldY] = currentCoords ? currentCoords[1].split(',').map(Number) : [0,0];
                  
                  const dist = Math.sqrt(Math.pow(hulkCoords[0] - oldX, 2) + Math.pow(hulkCoords[1] - oldY, 2));
                  
                  if (dist > 10) { 
                      const iX = d3.interpolateNumber(oldX, hulkCoords[0]);
                      const iY = d3.interpolateNumber(oldY, hulkCoords[1]);
                      const baseScale = 1/currentZoom;

                      hulkGroup.transition()
                          .duration(2000)
                          .ease(d3.easeQuadInOut)
                          .attrTween("transform", function() {
                              return function(t) {
                                  const x = iX(t);
                                  const y = iY(t);
                                  const jumpHeight = Math.sin(t * Math.PI) * 2; 
                                  const currentScale = baseScale * (1 + jumpHeight);
                                  return `translate(${x},${y}) scale(${currentScale})`;
                              };
                          })
                          .on("end", function() {
                              d3.select(this).attr('transform', `translate(${hulkCoords[0]}, ${hulkCoords[1]}) scale(${baseScale})`);
                              d3.select(this).append("circle")
                                  .attr("r", 15).attr("fill", "none").attr("stroke", "#65a30d").attr("stroke-width", 3).attr("opacity", 1)
                                  .transition().duration(600).attr("r", 60).attr("opacity", 0).remove();
                          });
                  } else {
                      hulkGroup.attr('transform', `translate(${hulkCoords[0]}, ${hulkCoords[1]}) scale(${1/currentZoom})`);
                  }
              }
          }
      } else {
          gTokens.selectAll('.hulk-token').remove();
      }

  }, [missions, completedMissionIds, worldStage, tokensReleased, projection, hulkLocation]);

  if (loading) return <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-cyan-500 font-mono"><div className="animate-spin text-4xl">✇</div><div>{t.map.loading}</div></div>;
  
  if (error) return <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-red-500 font-mono border border-red-900 bg-red-900/20 p-4">
      <div className="text-2xl mb-2">⚠ SYSTEM FAILURE</div>
      <div className="text-xs">{error}</div>
  </div>;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-transparent overflow-hidden group">
        {/* Fondo de rejilla */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #0e7490 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2}}></div>
        
        {/* EFECTO RADAR */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            <div className="w-[200%] h-[200%] absolute -top-[50%] -left-[50%] animate-[radar_10s_linear_infinite]"
                 style={{
                     background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(6,182,212,0.1) 310deg, rgba(6,182,212,0.4) 360deg)',
                     borderRadius: '50%'
                 }}
            ></div>
        </div>
        
        <style>{`
            @keyframes radar {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `}</style>

        <svg ref={svgRef} className="w-full h-full relative z-10"></svg>
    </div>
  );
};