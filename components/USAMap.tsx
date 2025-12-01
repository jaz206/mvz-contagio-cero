
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
  };
  playerAlignment?: 'ALIVE' | 'ZOMBIE' | null;
  worldStage: WorldStage;
}

export const USAMap: React.FC<USAMapProps> = ({ language, missions, completedMissionIds, onMissionSelect, onBunkerClick, factionStates, playerAlignment, worldStage }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [usData, setUsData] = useState<USATopoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);
  
  const hulkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const surferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = translations[language];

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

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
          setSvgWidth(contentBoxSize.inlineSize);
          setSvgHeight(contentBoxSize.blockSize);
        } else {
          setSvgWidth(entry.contentRect.width);
          setSvgHeight(entry.contentRect.height);
        }
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const getFactionStyle = (stateName: string) => {
    if (factionStates.magneto.has(stateName)) {
      return 'fill-red-900/60 stroke-red-500 stroke-[1px] hover:fill-red-700 hover:stroke-red-300 hover:stroke-[2px]';
    } else if (factionStates.kingpin.has(stateName)) {
      return 'fill-purple-900/60 stroke-purple-500 stroke-[1px] hover:fill-purple-700 hover:stroke-purple-300 hover:stroke-[2px]';
    } else if (factionStates.hulk.has(stateName)) {
      return 'fill-lime-900/40 stroke-lime-700 stroke-[1px] hover:fill-lime-900/70 hover:stroke-lime-400 hover:stroke-[2px]';
    } else {
      return 'fill-emerald-900/60 stroke-emerald-600 stroke-[1px] hover:fill-emerald-800 hover:stroke-emerald-300 hover:stroke-[2px]';
    }
  };

  const getFactionLabel = useCallback((stateName: string) => {
    const sectorPrefix = t.map.sector;
    if (factionStates.magneto.has(stateName)) return `${sectorPrefix}: ${t.factions.magneto.name.toUpperCase()}`;
    if (factionStates.kingpin.has(stateName)) return `${sectorPrefix}: ${t.factions.kingpin.name.toUpperCase()}`;
    if (factionStates.hulk.has(stateName)) return `${sectorPrefix}: ${t.factions.hulk.name.toUpperCase()}`;
    return `${sectorPrefix}: ${t.factions.doom.name.toUpperCase()}`;
  }, [language, t, factionStates]);

  const renderMap = useCallback(() => {
    if (!usData || !svgRef.current || svgWidth === 0 || svgHeight === 0) {
      return;
    }
    
    if (hulkTimerRef.current) clearTimeout(hulkTimerRef.current);
    if (surferTimerRef.current) clearTimeout(surferTimerRef.current);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // --- DEFS ---
    const defs = svg.append("defs");
    
    // Patterns and Filters
    const pattern = defs.append("pattern").attr("id", "grid-pattern").attr("width", 40).attr("height", 40).attr("patternUnits", "userSpaceOnUse");
    pattern.append("path").attr("d", "M 40 0 L 0 0 0 40").attr("fill", "none").attr("stroke", "#0e7490").attr("stroke-width", 0.5).attr("opacity", 0.3);
    
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Clip Paths
    defs.append("clipPath").attr("id", "hulk-clip").append("circle").attr("cx", 0).attr("cy", 0).attr("r", 50); 
    defs.append("clipPath").attr("id", "bunker-clip").append("circle").attr("cx", 0).attr("cy", 0).attr("r", 12);
    defs.append("clipPath").attr("id", "mission-clip").append("circle").attr("cx", 0).attr("cy", 0).attr("r", 8);
    // Surfer Clip
    defs.append("clipPath").attr("id", "surfer-clip").append("circle").attr("cx", 0).attr("cy", 0).attr("r", 15);

    const g = svg.append('g'); 

    const projection = d3.geoAlbersUsa();
    const path = d3.geoPath();
    const states = topojson.feature(usData as any, usData.objects.states as any) as any;
    
    projection.fitSize([svgWidth, svgHeight], states);
    path.projection(projection);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        const { k } = event.transform;
        g.attr('transform', event.transform.toString());
        
        g.selectAll('.bunker').attr('transform', function() {
            if (bunkerCoords) {
                return `translate(${bunkerCoords[0]},${bunkerCoords[1]}) scale(${1/k})`;
            }
            return null;
        });
        
        // HULK SCALING
        const hulkGroup = g.select('#hulk-token');
        if (!hulkGroup.empty()) {
            if (k >= 2.5) {
                hulkGroup.select('.hulk-orb').style('display', 'none').style('opacity', 0);
                hulkGroup.select('.hulk-icon').style('display', 'block').style('opacity', 1).attr('transform', `scale(${1/k * 2.5})`); 
            } else {
                hulkGroup.select('.hulk-icon').style('display', 'none').style('opacity', 0);
                hulkGroup.select('.hulk-orb').style('display', 'block').style('opacity', 1).attr('transform', `scale(${1/Math.sqrt(k)})`);
            }
        }

        // SURFER SCALING
        const surferGroup = g.select('#surfer-token');
        if (!surferGroup.empty()) {
             surferGroup.attr('transform', function() {
                 const currentTransform = d3.select(this).attr('transform');
                 const translateMatch = /translate\(([^)]+)\)/.exec(currentTransform || '');
                 const translate = translateMatch ? translateMatch[0] : '';
                 return `${translate} scale(${1/Math.sqrt(k)})`;
             });
        }

        // MISSION SCALING
        if (k >= 2.5) {
            g.selectAll('.mission-dot').style('opacity', 0).style('display', 'none');
            g.selectAll('.mission-icon').style('display', 'block').style('opacity', 1).attr('transform', `scale(${1/k * 2})`); 
        } else {
            g.selectAll('.mission-icon').style('opacity', 0).style('display', 'none');
            g.selectAll('.mission-dot').style('display', 'block').style('opacity', 1).attr('transform', `scale(${1/Math.sqrt(k)})`);
        }
      });

    svg.call(zoom);

    const handleStateClick = (event: any, d: any) => {
        event.stopPropagation();
        const bounds = path.bounds(d);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / svgWidth, dy / svgHeight)));
        const translate = [svgWidth / 2 - scale * x, svgHeight / 2 - scale * y];
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    };

    svg.on('click', () => {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    });

    // Draw States
    g.selectAll('path.state')
      .data(states.features)
      .join('path')
      .attr('class', 'state')
      .attr('d', path as d3.GeoPath<any, d3.GeoGeometryObjects>)
      .attr('class', (d: any) => `${getFactionStyle(d.properties.name)} transition-all duration-200 cursor-crosshair`)
      .on('click', handleStateClick)
      .append('title')
      .text((d: any) => `${d.properties.name.toUpperCase()}\n${getFactionLabel(d.properties.name)}`);

    // Draw Labels
    g.selectAll('text.label')
      .data(states.features)
      .join('text')
      .attr('class', 'label')
      .attr('transform', (d: any) => {
          const centroid = path.centroid(d);
          if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return 'translate(0,0)';
          return `translate(${centroid[0]},${centroid[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('class', (d: any) => {
         return 'pointer-events-none text-[8px] sm:text-[10px] font-mono fill-white/50 select-none tracking-wider font-bold';
      })
      .text((d: any) => d.properties.name.toUpperCase());


    // --- HULK ROAMING TOKEN ---
    const hulkFeatures = states.features.filter((f: any) => factionStates.hulk.has(f.properties.name));
    if (hulkFeatures.length > 0) {
        let currentHulkFeature = hulkFeatures[Math.floor(Math.random() * hulkFeatures.length)];
        const startCentroid = path.centroid(currentHulkFeature);
        
        if (startCentroid && !isNaN(startCentroid[0])) {
            const hulkGroup = g.append('g').attr('id', 'hulk-token').attr('transform', `translate(${startCentroid[0]}, ${startCentroid[1]})`).attr('class', 'pointer-events-none'); 
            const jumpWrapper = hulkGroup.append('g').attr('class', 'hulk-jump-wrapper');
            const hulkOrb = jumpWrapper.append('g').attr('class', 'hulk-orb');
            hulkOrb.append('circle').attr('r', 12).attr('fill', '#84cc16').attr('opacity', 0.4).append('animate').attr('attributeName', 'r').attr('values', '12;20;12').attr('dur', '2s').attr('repeatCount', 'indefinite');
            hulkOrb.append('circle').attr('r', 5).attr('fill', '#bef264').attr('stroke', '#365314').attr('stroke-width', 1);
            hulkOrb.append('text').attr('y', -15).attr('text-anchor', 'middle').attr('class', 'text-[6px] font-bold fill-lime-400').text('HULK');

            const hulkIcon = jumpWrapper.append('g').attr('class', 'hulk-icon').style('display', 'none').style('opacity', 0);
            
            // Backlight for multiply effect
            hulkIcon.append('circle').attr('r', 40).attr('fill', '#a3e635').attr('cx', 0).attr('cy', 0); 
            
            // Image with multiply blend
            hulkIcon.append('image')
                .attr('href', 'https://i.pinimg.com/1200x/dd/fa/7b/ddfa7b9d3e2b76cbd33af6647308f3a7.jpg')
                .attr('x', -40).attr('y', -40).attr('width', 80).attr('height', 80)
                .attr('clip-path', 'url(#hulk-clip)')
                .style('mix-blend-mode', 'multiply');

            const moveHulk = () => {
                const currentCentroid = path.centroid(currentHulkFeature);
                const neighbors = hulkFeatures
                    .filter((f: any) => f !== currentHulkFeature)
                    .map((f: any) => {
                        const c = path.centroid(f);
                        if (!c || isNaN(c[0])) return { feature: f, dist: Infinity, centroid: [0,0] };
                        const dist = Math.sqrt(Math.pow(c[0] - currentCentroid[0], 2) + Math.pow(c[1] - currentCentroid[1], 2));
                        return { feature: f, dist, centroid: c };
                    })
                    .sort((a: any, b: any) => a.dist - b.dist)
                    .slice(0, 4);
                
                const randomDelay = Math.floor(Math.random() * (180000 - 5000 + 1) + 5000);

                if (neighbors.length > 0) {
                    const nextMove = neighbors[Math.floor(Math.random() * neighbors.length)];
                    currentHulkFeature = nextMove.feature;
                    const jumpDuration = 3000;
                    d3.select('#hulk-token').transition().duration(jumpDuration).ease(d3.easeLinear).attr('transform', `translate(${nextMove.centroid[0]}, ${nextMove.centroid[1]})`);
                    d3.select('.hulk-jump-wrapper').transition().duration(jumpDuration / 2).ease(d3.easeQuadOut).attr('transform', 'scale(1.5)').transition().duration(jumpDuration / 2).ease(d3.easeQuadIn).attr('transform', 'scale(1)').on('end', () => {
                             hulkTimerRef.current = setTimeout(moveHulk, randomDelay);
                        });
                } else {
                    hulkTimerRef.current = setTimeout(moveHulk, randomDelay);
                }
            };
            hulkTimerRef.current = setTimeout(moveHulk, 3000);
        }
    }

    // --- SILVER SURFER ZOMBIE TOKEN ---
    if (worldStage === 'SURFER' || worldStage === 'GALACTUS') {
        const allStates = states.features;
        let currentSurferFeature = allStates[Math.floor(Math.random() * allStates.length)];
        const startC = path.centroid(currentSurferFeature);

        if (startC && !isNaN(startC[0])) {
            const surferGroup = g.append('g').attr('id', 'surfer-token').attr('transform', `translate(${startC[0]}, ${startC[1]})`).attr('class', 'pointer-events-none');
            
            surferGroup.append('circle')
                .attr('r', 6)
                .attr('fill', '#ffffff')
                .attr('stroke', '#cbd5e1')
                .attr('stroke-width', 1.5)
                .style('filter', 'url(#glow)');

            surferGroup.append('circle')
                .attr('r', 6)
                .attr('fill', 'none')
                .attr('stroke', '#e2e8f0')
                .attr('stroke-width', 1)
                .attr('opacity', 0.8)
                .append('animate')
                .attr('attributeName', 'r')
                .attr('from', '6')
                .attr('to', '20')
                .attr('dur', '0.8s')
                .attr('repeatCount', 'indefinite');
            
            surferGroup.select('circle:last-child')
                .append('animate')
                .attr('attributeName', 'opacity')
                .attr('from', '0.8')
                .attr('to', '0')
                .attr('dur', '0.8s')
                .attr('repeatCount', 'indefinite');

            const moveSurfer = () => {
                const randomState = allStates[Math.floor(Math.random() * allStates.length)];
                const nextC = path.centroid(randomState);
                if (nextC && !isNaN(nextC[0])) {
                    d3.select('#surfer-token')
                        .transition()
                        .duration(800)
                        .ease(d3.easeCubicInOut)
                        .attr('transform', `translate(${nextC[0]}, ${nextC[1]})`)
                        .on('end', () => {
                            surferTimerRef.current = setTimeout(moveSurfer, 1500); 
                        });
                } else {
                    surferTimerRef.current = setTimeout(moveSurfer, 1000);
                }
            };
            surferTimerRef.current = setTimeout(moveSurfer, 1000);
        }
    }

    // --- GALACTUS OVERLAY (FULL MAP) ---
    if (worldStage === 'GALACTUS') {
        const galactusGroup = g.append('g').attr('class', 'pointer-events-none');
        
        galactusGroup.append('image')
            .attr('href', 'https://i.pinimg.com/736x/b6/f6/48/b6f64882666f8e568a7274b4d03c31a4.jpg')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .attr('preserveAspectRatio', 'xMidYMid slice') // Ensures full coverage
            .style('mix-blend-mode', 'multiply')
            .attr('opacity', 0.25); // Ghostly transparency
    }

    // --- S.H.I.E.L.D. BUNKER (BASE) ---
    const bunkerCoords = projection([-98.5, 39.0]);
    if (bunkerCoords) {
        const bunkerGroup = g.append('g').attr('class', 'bunker cursor-pointer hover:opacity-100').attr('transform', `translate(${bunkerCoords[0]}, ${bunkerCoords[1]})`).on('click', (e) => { e.stopPropagation(); onBunkerClick(); });
        bunkerGroup.append('circle').attr('r', 12).attr('fill', 'none').attr('stroke', '#06b6d4').attr('stroke-width', 1).append('animate').attr('attributeName', 'r').attr('from', '12').attr('to', '25').attr('dur', '2s').attr('repeatCount', 'indefinite');
        bunkerGroup.append('image').attr('href', 'https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg').attr('x', -12).attr('y', -12).attr('width', 24).attr('height', 24).attr('clip-path', 'url(#bunker-clip)');
        const bunkerLabel = playerAlignment === 'ZOMBIE' ? t.map.hive : t.map.bunker;
        bunkerGroup.append('text').attr('y', 25).attr('text-anchor', 'middle').attr('class', 'font-mono font-bold fill-cyan-400 text-[8px] tracking-widest').style('text-shadow', '0 0 5px black').text(`[ ${bunkerLabel} ]`);
    }

    // --- MISSION LINES ---
    g.selectAll('path.mission-line').data(missions.filter(m => m.prereq)).join('path').attr('class', 'mission-line')
      .attr('d', (d) => {
          const startMission = missions.find(m => m.id === d.prereq);
          if (!startMission) return null;
          const startCoords = projection(startMission.location.coordinates);
          const endCoords = projection(d.location.coordinates);
          if (!startCoords || !endCoords) return null;
          const dx = endCoords[0] - startCoords[0];
          const dy = endCoords[1] - startCoords[1];
          const dr = Math.sqrt(dx * dx + dy * dy);
          return `M${startCoords[0]},${startCoords[1]}A${dr},${dr} 0 0,1 ${endCoords[0]},${endCoords[1]}`;
      })
      .attr('fill', 'none').attr('stroke', '#eab308').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,4').attr('opacity', 0.6).append('animate').attr('attributeName', 'stroke-dashoffset').attr('from', '0').attr('to', '-8').attr('dur', '1s').attr('repeatCount', 'indefinite');

    // --- MISSION TOKENS ---
    const missionGroups = g.selectAll('g.mission').data(missions).join('g').attr('class', 'mission cursor-pointer hover:opacity-100').attr('transform', (d) => {
        const coords = projection(d.location.coordinates);
        return coords ? `translate(${coords[0]}, ${coords[1]})` : 'translate(-100,-100)';
      }).on('click', (e, d) => { e.stopPropagation(); onMissionSelect(d); });
    
    missionGroups.append('title').text(d => d.title);
    missionGroups.append('circle').attr('class', 'mission-dot').attr('r', (d) => completedMissionIds.has(d.id) ? 6 : 4.5).attr('fill', (d) => {
          if (completedMissionIds.has(d.id)) return '#10b981'; 
          if (d.type === 'SHIELD_BASE') return '#06b6d4'; 
          if (d.type === 'BOSS') return '#9333ea'; 
          return '#eab308';
      }).attr('stroke', 'white').attr('stroke-width', 0.5).style('filter', 'url(#glow)');
    
    const activeMissionCircles = missionGroups.filter((d) => !completedMissionIds.has(d.id)).append('circle').attr('r', 4.5).attr('fill', 'none').attr('stroke', (d) => {
        if(d.type === 'SHIELD_BASE') return '#06b6d4';
        if(d.type === 'BOSS') return '#9333ea';
        return '#eab308';
    }).attr('stroke-width', 0.5);
    activeMissionCircles.append('animate').attr('attributeName', 'r').attr('from', '4.5').attr('to', '15').attr('dur', '1.5s').attr('repeatCount', 'indefinite');
    activeMissionCircles.append('animate').attr('attributeName', 'opacity').attr('from', '1').attr('to', '0').attr('dur', '1.5s').attr('repeatCount', 'indefinite');

    const iconGroup = missionGroups.append('g').attr('class', 'mission-icon').style('opacity', 0).style('display', 'none');
    iconGroup.append('circle').attr('r', 8).attr('fill', '#0f172a').attr('stroke', (d) => {
          if (completedMissionIds.has(d.id)) return '#10b981';
          if (d.type === 'SHIELD_BASE') return '#06b6d4';
          if (d.type === 'BOSS') return '#9333ea';
          return '#eab308';
      }).attr('stroke-width', 1);

    iconGroup.each(function(d) {
        const sel = d3.select(this);
        const isCompleted = completedMissionIds.has(d.id);
        if (isCompleted) {
            sel.append('path').attr('d', "M-3,0 L0,3 L5,-4").attr('stroke', '#10b981').attr('stroke-width', 2).attr('fill', 'none');
        } else if (d.type === 'SHIELD_BASE') {
             sel.append('image').attr('href', 'https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg').attr('x', -8).attr('y', -8).attr('width', 16).attr('height', 16).attr('clip-path', 'url(#mission-clip)');
        } else if (d.type === 'BOSS') {
             sel.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('font-size', '10px').text('💀').attr('fill', '#9333ea');
        } else {
             sel.append('path').attr('d', "M-4,-4 L4,4 M-4,4 L4,-4 M0,-6 L0,-3 M0,6 L0,3 M-6,0 L-3,0 M6,0 L3,0").attr('stroke', '#eab308').attr('stroke-width', 1.5).attr('fill', 'none');
        }
    });

  }, [usData, svgWidth, svgHeight, getFactionLabel, missions, factionStates, completedMissionIds, onMissionSelect, onBunkerClick, t, playerAlignment, worldStage]);

  useEffect(() => {
    if (usData && svgWidth > 0 && svgHeight > 0) {
      renderMap();
    }
    return () => {
        if (hulkTimerRef.current) clearTimeout(hulkTimerRef.current);
        if (surferTimerRef.current) clearTimeout(surferTimerRef.current);
    };
  }, [usData, svgWidth, svgHeight, renderMap]);

  if (loading) return <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-cyan-500 font-mono"><div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-cyan-400 border-l-transparent rounded-full animate-spin mb-4"></div><div className="animate-pulse">{t.map.loading}</div></div>;
  if (error) return <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-red-500 font-mono border border-red-900 bg-red-900/20 p-4"><div className="text-4xl mb-2">⚠</div><p className="tracking-widest font-bold">{t.map.error}</p></div>;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-transparent overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #0e7490 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2}}></div>
        <svg ref={svgRef} className="w-full h-full relative z-10" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet"></svg>
    </div>
  );
};
