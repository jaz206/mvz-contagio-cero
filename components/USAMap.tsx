import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client'; 
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
    playerAlignment, 
    worldStage 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  
  const [usData, setUsData] = useState<USATopoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const [tokensReleased, setTokensReleased] = useState(false);
  
  const hulkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const surferTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = translations[language];

  // Timer para liberar tokens
  useEffect(() => {
      if (worldStage === 'SURFER') {
          setTokensReleased(false);
          const timer = setTimeout(() => {
              setTokensReleased(true);
          }, 5000);
          return () => clearTimeout(timer);
      } else {
          setTokensReleased(true);
      }
  }, [worldStage]);

  // Carga de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchUSATopoJSON();
        setUsData(data);
      } catch (err) {
        setError('CONNECTION FAILED: SATELLITE OFFLINE.');
        console.error('Error loading TopoJSON:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Resize Observer
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

  const getFactionStyle = useCallback((stateName: string) => {
    if (factionStates.magneto.has(stateName)) return 'fill-red-900/60 stroke-red-500 stroke-[1px] hover:fill-red-700 hover:stroke-red-300 hover:stroke-[2px]';
    if (factionStates.kingpin.has(stateName)) return 'fill-purple-900/60 stroke-purple-500 stroke-[1px] hover:fill-purple-700 hover:stroke-purple-300 hover:stroke-[2px]';
    if (factionStates.hulk.has(stateName)) return 'fill-lime-900/40 stroke-lime-700 stroke-[1px] hover:fill-lime-900/70 hover:stroke-lime-400 hover:stroke-[2px]';
    return 'fill-emerald-900/60 stroke-emerald-600 stroke-[1px] hover:fill-emerald-800 hover:stroke-emerald-300 hover:stroke-[2px]';
  }, [factionStates]);

  // 1. INICIALIZACIÓN DEL MAPA
  useEffect(() => {
    if (!usData || !svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Filtros y Clips
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    defs.append("clipPath").attr("id", "bunker-clip").append("circle").attr("cx", 0).attr("cy", 0).attr("r", 12);
    defs.append("clipPath").attr("id", "mission-clip").append("circle").attr("cx", 0).attr("cy", 0).attr("r", 8);
    
    const g = svg.append('g');
    gRef.current = g;

    // FIX: Ensure usData.objects.states exists before accessing
    if (!usData.objects || !usData.objects.states) {
        console.error("Invalid TopoJSON structure");
        return;
    }

    const statesFeatureCollection = topojson.feature(usData as any, usData.objects.states as any) as any;
    const projection = d3.geoAlbersUsa().fitSize([dimensions.width, dimensions.height], statesFeatureCollection);
    const path = d3.geoPath().projection(projection);

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
        const k = event.transform.k;
        
        // Semantic Zoom
        g.selectAll('.bunker').attr('transform', function() {
             const coords = d3.select(this).attr('data-coords')?.split(',').map(Number) || [0,0];
             return `translate(${coords[0]},${coords[1]}) scale(${1/k})`;
        });

        if (k >= 2.5) {
            g.selectAll('.mission-dot').style('display', 'none');
            g.selectAll('.mission-icon').style('display', 'block').attr('transform', `scale(${1/k * 2})`);
        } else {
            g.selectAll('.mission-icon').style('display', 'none');
            g.selectAll('.mission-dot').style('display', 'block').attr('transform', `scale(${1/Math.sqrt(k)})`);
        }
        
        g.selectAll('.token-group').attr('transform', function() {
            const currentTransform = d3.select(this).attr('transform');
            const translateMatch = /translate\(([^)]+)\)/.exec(currentTransform);
            const translate = translateMatch ? translateMatch[0] : 'translate(0,0)';
            return `${translate} scale(${1/k})`;
        });
      });

    svg.call(zoom);

    const statesFeatures = statesFeatureCollection.features;
    
    g.selectAll('path.state')
      .data(statesFeatures)
      .join('path')
      .attr('class', 'state')
      .attr('d', path as any)
      .attr('class', (d: any) => `${getFactionStyle(d.properties.name)} transition-all duration-200 cursor-crosshair`)
      .on('click', (event, d: any) => {
          event.stopPropagation();
          const bounds = path.bounds(d);
          const dx = bounds[1][0] - bounds[0][0];
          const dy = bounds[1][1] - bounds[0][1];
          const x = (bounds[0][0] + bounds[1][0]) / 2;
          const y = (bounds[0][1] + bounds[1][1]) / 2;
          const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / dimensions.width, dy / dimensions.height)));
          const translate = [dimensions.width / 2 - scale * x, dimensions.height / 2 - scale * y];
          svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
      })
      .append('title')
      .text((d: any) => `${d.properties.name.toUpperCase()}`);

    g.selectAll('text.label')
      .data(statesFeatures)
      .join('text')
      .attr('class', 'label')
      .attr('transform', (d: any) => {
          const centroid = path.centroid(d);
          return (centroid && !isNaN(centroid[0])) ? `translate(${centroid[0]},${centroid[1]})` : 'translate(0,0)';
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('class', 'pointer-events-none text-[8px] sm:text-[10px] font-mono fill-white/50 select-none tracking-wider font-bold')
      .text((d: any) => d.properties.name.toUpperCase());

    const bunkerCoords = projection([-82.9, 40.0]);
    if (bunkerCoords) {
        const bunkerGroup = g.append('g')
            .attr('class', 'bunker cursor-pointer hover:opacity-100')
            .attr('transform', `translate(${bunkerCoords[0]}, ${bunkerCoords[1]})`)
            .attr('data-coords', `${bunkerCoords[0]},${bunkerCoords[1]}`)
            .on('click', (e) => { e.stopPropagation(); onBunkerClick(); });
            
        bunkerGroup.append('circle').attr('r', 12).attr('fill', 'none').attr('stroke', '#06b6d4').attr('stroke-width', 1)
            .append('animate').attr('attributeName', 'r').attr('from', '12').attr('to', '25').attr('dur', '2s').attr('repeatCount', 'indefinite');
        bunkerGroup.append('image').attr('href', 'https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg')
            .attr('x', -12).attr('y', -12).attr('width', 24).attr('height', 24).attr('clip-path', 'url(#bunker-clip)');
    }

  }, [usData, dimensions, getFactionStyle]); 

  // 2. ACTUALIZACIÓN DINÁMICA
  useEffect(() => {
      if (!usData || !gRef.current || dimensions.width === 0) return;
      const g = gRef.current;
      
      if (!usData.objects || !usData.objects.states) return;
      const statesFeatureCollection = topojson.feature(usData as any, usData.objects.states as any) as any;
      const projection = d3.geoAlbersUsa().fitSize([dimensions.width, dimensions.height], statesFeatureCollection);
      
      const currentZoom = d3.zoomTransform(svgRef.current!).k || 1;

      const validMissions = missions.filter(m => m && m.id && m.location && m.location.coordinates);
      
      g.selectAll('path.mission-line')
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

      const missionGroups = g.selectAll('g.mission')
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
          sel.selectAll('*').remove(); 
          
          if (d.type === 'SHIELD_BASE' && !completedMissionIds.has(d.id)) {
             sel.append('circle').attr('r', 9).attr('fill', '#0f172a').attr('stroke', '#06b6d4').attr('stroke-width', 1);
             sel.append('image')
                .attr('href', 'https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg')
                .attr('x', -8).attr('y', -8)
                .attr('width', 16).attr('height', 16)
                .attr('clip-path', 'url(#mission-clip)');
          } else {
              sel.append('circle').attr('r', 8).attr('fill', '#0f172a').attr('stroke', completedMissionIds.has(d.id) ? '#10b981' : '#eab308');
              
              if (completedMissionIds.has(d.id)) {
                  sel.append('path').attr('d', "M-3,0 L0,3 L5,-4").attr('stroke', '#10b981').attr('stroke-width', 2).attr('fill', 'none');
              } else if (d.type === 'BOSS') {
                  sel.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('font-size', '10px').text('💀').attr('fill', '#9333ea');
              } else {
                  sel.append('path').attr('d', "M-4,-4 L4,4 M-4,4 L4,-4").attr('stroke', '#eab308').attr('stroke-width', 1.5);
              }
          }
        })
        .style('display', currentZoom < 2.5 ? 'none' : 'block')
        .attr('transform', `scale(${1/currentZoom * 2})`);

      g.selectAll('.galactus-overlay').remove();
      if (worldStage === 'GALACTUS') {
          g.append('image')
            .attr('class', 'galactus-overlay pointer-events-none')
            .attr('href', 'https://i.pinimg.com/736x/7d/99/05/7d9905d417620745edc2c724f94e56c8.jpg')
            .attr('width', dimensions.width).attr('height', dimensions.height)
            .attr('preserveAspectRatio', 'xMidYMid slice').attr('opacity', 0.4);
      }

      const moveHulk = (selection: d3.Selection<any, any, any, any>, currentCoords: [number, number]) => {
          const states = (topojson.feature(usData as any, usData.objects.states as any) as any).features;
          const hulkStates = states.filter((s: any) => factionStates.hulk.has(s.properties.name));

          const candidates = hulkStates.map((s: any) => {
              const centroid = d3.geoPath().projection(projection).centroid(s);
              if (!centroid || isNaN(centroid[0])) return null;
              
              const dist = Math.sqrt(Math.pow(centroid[0] - currentCoords[0], 2) + Math.pow(centroid[1] - currentCoords[1], 2));
              return { centroid, dist, name: s.properties.name };
          }).filter((c: any) => c !== null && c.dist > 10); 

          candidates.sort((a: any, b: any) => a.dist - b.dist);
          const neighbors = candidates.slice(0, 3);

          if (neighbors.length === 0) return; 

          const target = neighbors[Math.floor(Math.random() * neighbors.length)];

          selection.transition()
              .duration(2000) 
              .ease(d3.easeQuadInOut)
              .attrTween("transform", function() {
                  const i = d3.interpolate(currentCoords, target.centroid);
                  return function(t) {
                      const pos = i(t);
                      const scale = 1 + Math.sin(t * Math.PI) * 0.5; 
                      const currentZoom = d3.zoomTransform(svgRef.current!).k;
                      return `translate(${pos[0]},${pos[1]}) scale(${scale / currentZoom})`;
                  };
              })
              .on('end', () => {
                  hulkTimeoutRef.current = setTimeout(() => {
                      moveHulk(selection, target.centroid);
                  }, 3000);
              });
      };

      g.selectAll('.hulk-token').remove();
      if (tokensReleased) {
          const startStateName = 'North Dakota'; 
          const states = (topojson.feature(usData as any, usData.objects.states as any) as any).features;
          const startFeature = states.find((s: any) => s.properties.name === startStateName);
          const startCoords = startFeature ? d3.geoPath().projection(projection).centroid(startFeature) : projection([-100, 47]);

          if (startCoords) {
              const hulkGroup = g.append('g')
                  .attr('class', 'token-group hulk-token cursor-pointer')
                  .attr('id', 'hulk-token')
                  .attr('transform', `translate(${startCoords[0]}, ${startCoords[1]})`);
              
              hulkGroup.append('circle').attr('r', 15).attr('fill', '#65a30d').attr('stroke', '#365314').attr('stroke-width', 2).style('filter', 'url(#glow)');
              hulkGroup.append('text').text('HULK').attr('dy', 4).attr('text-anchor', 'middle').attr('font-size', '8px').attr('font-weight', 'bold').attr('fill', 'white');
              
              moveHulk(hulkGroup, startCoords as [number, number]);
          }
      }

      const moveSurfer = (selection: d3.Selection<any, any, any, any>) => {
          const states = (topojson.feature(usData as any, usData.objects.states as any) as any).features;
          const randomState = states[Math.floor(Math.random() * states.length)];
          const centroid = d3.geoPath().projection(projection).centroid(randomState);

          if (centroid && !isNaN(centroid[0])) {
              selection.transition()
                  .duration(4000) 
                  .ease(d3.easeLinear)
                  .attr('transform', function() {
                      const currentZoom = d3.zoomTransform(svgRef.current!).k;
                      return `translate(${centroid[0]}, ${centroid[1]}) scale(${1/currentZoom})`;
                  })
                  .on('end', () => moveSurfer(selection));
          }
      };

      g.selectAll('.surfer-token').remove();
      if (worldStage === 'SURFER' && tokensReleased) {
          const surferStart = projection([-120, 35]) || [0,0];
          const surferGroup = g.append('g')
              .attr('class', 'token-group surfer-token cursor-pointer')
              .attr('transform', `translate(${surferStart[0]}, ${surferStart[1]})`);
          
          surferGroup.append('circle').attr('r', 12).attr('fill', '#94a3b8').attr('stroke', 'white').attr('stroke-width', 2).style('filter', 'url(#glow)');
          surferGroup.append('text').text('🏄').attr('dy', 4).attr('text-anchor', 'middle').attr('font-size', '12px');
          
          moveSurfer(surferGroup);
      }

      return () => {
          if (hulkTimeoutRef.current) clearTimeout(hulkTimeoutRef.current);
          if (surferTimeoutRef.current) clearTimeout(surferTimeoutRef.current);
          g.selectAll('.token-group').interrupt(); 
      };

  }, [missions, completedMissionIds, worldStage, tokensReleased, usData, dimensions]);

  if (loading) return <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-cyan-500 font-mono"><div className="animate-spin text-4xl">✇</div><div>{t.map.loading}</div></div>;
  if (error) return <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-red-500 font-mono border border-red-900 bg-red-900/20 p-4">⚠ {t.map.error}</div>;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-transparent overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #0e7490 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2}}></div>
        <svg ref={svgRef} className="w-full h-full relative z-10"></svg>
    </div>
  );
};