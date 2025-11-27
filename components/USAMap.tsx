
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { fetchUSATopoJSON } from '../services/topojsonService';
import { USATopoJSON, Mission } from '../types';
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
}

export const USAMap: React.FC<USAMapProps> = ({ language, missions, completedMissionIds, onMissionSelect, onBunkerClick, factionStates }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [usData, setUsData] = useState<USATopoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);
  
  // Get translation helper based on current language prop
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
      // Magneto: Red
      return 'fill-red-900/60 stroke-red-500 stroke-[1px] hover:fill-red-700 hover:stroke-red-300 hover:stroke-[2px]';
    } else if (factionStates.kingpin.has(stateName)) {
      // Kingpin: Purple (Empire of Flesh)
      return 'fill-purple-900/60 stroke-purple-500 stroke-[1px] hover:fill-purple-700 hover:stroke-purple-300 hover:stroke-[2px]';
    } else if (factionStates.hulk.has(stateName)) {
      // Hulk: No Man's Land (Wasteland Green/Lime/Yellowish)
      return 'fill-lime-900/40 stroke-lime-700 stroke-[1px] hover:fill-lime-900/70 hover:stroke-lime-400 hover:stroke-[2px]';
    } else {
      // Doomsberg: Dark Green (Emerald)
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

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // --- DEFS ---
    const defs = svg.append("defs");
    
    // Grid Pattern
    const pattern = defs.append("pattern")
      .attr("id", "grid-pattern")
      .attr("width", 40)
      .attr("height", 40)
      .attr("patternUnits", "userSpaceOnUse");
    
    pattern.append("path")
      .attr("d", "M 40 0 L 0 0 0 40")
      .attr("fill", "none")
      .attr("stroke", "#0e7490")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3);
    
    // Marker Glow Filter
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");


    // Group for map content
    const g = svg.append('g'); 

    // Projection setup
    const projection = d3.geoAlbersUsa();
    const path = d3.geoPath();
    const states = topojson.feature(usData as any, usData.objects.states as any) as any;
    
    projection.fitSize([svgWidth, svgHeight], states);
    path.projection(projection);

    // Draw States
    g.selectAll('path.state')
      .data(states.features)
      .join('path')
      .attr('class', 'state')
      .attr('d', path as d3.GeoPath<any, d3.GeoGeometryObjects>)
      .attr('class', (d: any) => `${getFactionStyle(d.properties.name)} transition-all duration-200 cursor-crosshair`)
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
         const name = d.properties.name;
         if (factionStates.magneto.has(name)) return 'pointer-events-none text-[8px] sm:text-[10px] font-mono fill-red-300 select-none tracking-wider opacity-90 font-bold';
         if (factionStates.kingpin.has(name)) return 'pointer-events-none text-[8px] sm:text-[10px] font-mono fill-purple-300 select-none tracking-wider opacity-90 font-bold';
         if (factionStates.hulk.has(name)) return 'pointer-events-none text-[8px] sm:text-[10px] font-mono fill-lime-300 select-none tracking-wider opacity-90 font-bold';
         return 'pointer-events-none text-[8px] sm:text-[10px] font-mono fill-emerald-300 select-none tracking-wider opacity-90 font-bold';
      })
      .style('text-shadow', '0px 0px 3px #000') 
      .text((d: any) => d.properties.name.toUpperCase());


    // --- HULK ROAMING TOKEN ---
    // Identify Hulk states for random movement
    const hulkFeatures = states.features.filter((f: any) => factionStates.hulk.has(f.properties.name));
    
    if (hulkFeatures.length > 0) {
        // Initial random position
        const startState = hulkFeatures[Math.floor(Math.random() * hulkFeatures.length)];
        const startCentroid = path.centroid(startState);
        
        if (startCentroid && !isNaN(startCentroid[0])) {
            const hulkGroup = g.append('g')
                .attr('id', 'hulk-token')
                .attr('transform', `translate(${startCentroid[0]}, ${startCentroid[1]})`)
                .attr('class', 'pointer-events-none'); // Hulk is just a visual threat, not clickable yet

            // Radioactive Glow
            hulkGroup.append('circle')
                .attr('r', 12)
                .attr('fill', '#84cc16') // Lime-500
                .attr('opacity', 0.4)
                .append('animate')
                .attr('attributeName', 'r')
                .attr('values', '12;20;12')
                .attr('dur', '2s')
                .attr('repeatCount', 'indefinite');

            // Core
            hulkGroup.append('circle')
                .attr('r', 5)
                .attr('fill', '#bef264') // Lime-200
                .attr('stroke', '#365314') // Lime-950
                .attr('stroke-width', 1);

            // Label
            hulkGroup.append('text')
                .attr('y', -15)
                .attr('text-anchor', 'middle')
                .attr('class', 'text-[6px] font-bold fill-lime-400')
                .text('HULK');

            // Movement Logic
            const moveHulk = () => {
                const targetState = hulkFeatures[Math.floor(Math.random() * hulkFeatures.length)];
                const targetCentroid = path.centroid(targetState);
                
                if (targetCentroid && !isNaN(targetCentroid[0])) {
                    d3.select('#hulk-token')
                        .transition()
                        .duration(4000) // Slow movement
                        .ease(d3.easeSinInOut)
                        .attr('transform', `translate(${targetCentroid[0]}, ${targetCentroid[1]})`)
                        .on('end', () => {
                             // Wait a bit then move again
                             setTimeout(moveHulk, 3000);
                        });
                } else {
                    setTimeout(moveHulk, 2000);
                }
            };
            
            // Start moving after initial render
            setTimeout(moveHulk, 2000);
        }
    }


    // --- S.H.I.E.L.D. BUNKER (BASE) ---
    // Location: No Man's Land (Kansas) - Approx Coordinates
    const bunkerCoords = projection([-98.5, 39.0]); // Center of USA/Kansas

    if (bunkerCoords) {
        const bunkerGroup = g.append('g')
            .attr('class', 'bunker cursor-pointer hover:opacity-100') // Make interactive
            .attr('transform', `translate(${bunkerCoords[0]}, ${bunkerCoords[1]})`)
            .on('click', (e) => {
                e.stopPropagation();
                onBunkerClick();
            });
        
        // Bunker Pulse
        bunkerGroup.append('circle')
            .attr('r', 10)
            .attr('fill', 'none')
            .attr('stroke', '#06b6d4')
            .attr('stroke-width', 1)
            .append('animate')
            .attr('attributeName', 'r')
            .attr('from', '5')
            .attr('to', '20')
            .attr('dur', '2s')
            .attr('repeatCount', 'indefinite');
            
        bunkerGroup.append('circle')
            .attr('r', 20)
            .attr('fill', 'none')
            .attr('stroke', '#06b6d4')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0)
            .append('animate')
            .attr('attributeName', 'opacity')
            .attr('from', '1')
            .attr('to', '0')
            .attr('dur', '2s')
            .attr('repeatCount', 'indefinite');

        // Bunker Icon (Shield Shape)
        bunkerGroup.append('path')
            .attr('d', "M0,10 L-8,2 L-8,-5 L0,-8 L8,-5 L8,2 Z")
            .attr('fill', '#06b6d4')
            .attr('stroke', '#ecfeff')
            .attr('stroke-width', 1)
            .style('filter', 'url(#glow)');

        // Bunker Label
        bunkerGroup.append('text')
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .attr('class', 'font-mono font-bold fill-cyan-400 text-[8px] tracking-widest')
            .style('text-shadow', '0 0 5px black')
            .text(`[ ${t.map.bunker} ]`);
    }

    // --- MISSION LINES (CONNECTORS) ---
    // Draw lines first so they are under the tokens
    g.selectAll('path.mission-line')
      .data(missions.filter(m => m.prereq)) // Only connect missions that have a prereq
      .join('path')
      .attr('class', 'mission-line')
      .attr('d', (d) => {
          const startMission = missions.find(m => m.id === d.prereq);
          if (!startMission) return null;
          
          const startCoords = projection(startMission.location.coordinates);
          const endCoords = projection(d.location.coordinates);

          if (!startCoords || !endCoords) return null;

          // Simple curve
          const dx = endCoords[0] - startCoords[0];
          const dy = endCoords[1] - startCoords[1];
          const dr = Math.sqrt(dx * dx + dy * dy);
          
          return `M${startCoords[0]},${startCoords[1]}A${dr},${dr} 0 0,1 ${endCoords[0]},${endCoords[1]}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#eab308') // Yellowish
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.6)
      .append('animate') // Animate the dash offset to look like data flow
      .attr('attributeName', 'stroke-dashoffset')
      .attr('from', '0')
      .attr('to', '-8')
      .attr('dur', '1s')
      .attr('repeatCount', 'indefinite');


    // --- MISSION TOKENS ---
    // Create a group for each mission
    const missionGroups = g.selectAll('g.mission')
      .data(missions)
      .join('g')
      .attr('class', 'mission cursor-pointer hover:opacity-100')
      .attr('transform', (d) => {
        const coords = projection(d.location.coordinates);
        return coords ? `translate(${coords[0]}, ${coords[1]})` : 'translate(-100,-100)';
      })
      .on('click', (e, d) => {
        e.stopPropagation(); // Prevent zoom or other interactions
        onMissionSelect(d);
      });
    
    // Add Tooltip (Title)
    missionGroups.append('title')
        .text(d => d.title);

    // 1. The Dot (Visible at Low Zoom) - INCREASED SIZE
    missionGroups.append('circle')
      .attr('class', 'mission-dot')
      .attr('r', (d) => completedMissionIds.has(d.id) ? 6 : 4.5) // WAS: 3 and 2. Increased for visibility.
      .attr('fill', (d) => completedMissionIds.has(d.id) ? '#10b981' : '#eab308') // Green if done, Yellow if active
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .style('filter', 'url(#glow)');
    
    // Pulse animation only for active missions
    const activeMissionCircles = missionGroups.filter((d) => !completedMissionIds.has(d.id))
      .append('circle')
      .attr('r', 4.5) // Match base size
      .attr('fill', 'none')
      .attr('stroke', '#eab308')
      .attr('stroke-width', 0.5);

    activeMissionCircles.append('animate')
      .attr('attributeName', 'r')
      .attr('from', '4.5')
      .attr('to', '15') // Increased pulse range
      .attr('dur', '1.5s')
      .attr('repeatCount', 'indefinite');

    activeMissionCircles.append('animate')
      .attr('attributeName', 'opacity')
      .attr('from', '1')
      .attr('to', '0')
      .attr('dur', '1.5s')
      .attr('repeatCount', 'indefinite');

    // 2. The Icon (Visible at High Zoom)
    const iconGroup = missionGroups.append('g')
      .attr('class', 'mission-icon')
      .style('opacity', 0) // Hidden by default
      .style('display', 'none');

    // Icon Circle Background
    iconGroup.append('circle')
      .attr('r', 8)
      .attr('fill', '#0f172a')
      .attr('stroke', (d) => completedMissionIds.has(d.id) ? '#10b981' : '#eab308')
      .attr('stroke-width', 1);

    // Icon Inner Graphic 
    // Target for active, Shield/Check for complete
    iconGroup.each(function(d) {
        const sel = d3.select(this);
        const color = completedMissionIds.has(d.id) ? '#10b981' : '#eab308';
        
        if (completedMissionIds.has(d.id)) {
            // Checkmark
            sel.append('path')
               .attr('d', "M-3,0 L0,3 L5,-4")
               .attr('stroke', color)
               .attr('stroke-width', 2)
               .attr('fill', 'none');
        } else {
             // Target
             sel.append('path')
                .attr('d', "M-4,-4 L4,4 M-4,4 L4,-4 M0,-6 L0,-3 M0,6 L0,3 M-6,0 L-3,0 M6,0 L3,0")
                .attr('stroke', color)
                .attr('stroke-width', 1.5)
                .attr('fill', 'none');
        }
    });

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        const { k, x, y } = event.transform;
        
        // Transform the whole map group
        g.attr('transform', event.transform.toString());
        
        // --- DYNAMIC MARKER SCALING ---
        
        // BUNKER SCALING
        // Keep bunker roughly constant visual size
        g.selectAll('.bunker').attr('transform', function() {
            // Need to get the original translation from the projection first
            // Since we can't easily parse 'transform', we re-calculate
            if (bunkerCoords) {
                return `translate(${bunkerCoords[0]},${bunkerCoords[1]}) scale(${1/k})`;
            }
            return null;
        });
        
        // HULK SCALING
        g.select('#hulk-token').attr('transform', function() {
             // Hulk is moving, so we rely on current transform, but apply scale
             // This is tricky with D3 transitions. 
             // Simplification: We don't counter-scale Hulk, let him grow/shrink, it's a monster!
             return null;
        });


        // MISSION MARKER SCALING
        // Threshold for switching from Dot to Icon
        const showIconThreshold = 2.5;

        if (k >= showIconThreshold) {
            // Show Icons
            g.selectAll('.mission-dot').style('opacity', 0).style('display', 'none');
            
            g.selectAll('.mission-icon')
                .style('display', 'block')
                .style('opacity', 1)
                // Counter-scale the icon so it stays roughly the same screen size
                .attr('transform', `scale(${1/k * 2})`); 
        } else {
            // Show Dots
            g.selectAll('.mission-icon').style('opacity', 0).style('display', 'none');
            
            g.selectAll('.mission-dot')
                .style('display', 'block')
                .style('opacity', 1)
                // Keep dots somewhat small but visible
                .attr('transform', `scale(${1/Math.sqrt(k)})`);
        }
      });

    svg.call(zoom);

  }, [usData, svgWidth, svgHeight, getFactionLabel, missions, factionStates, completedMissionIds, onMissionSelect, onBunkerClick, t]);

  useEffect(() => {
    if (usData && svgWidth > 0 && svgHeight > 0) {
      renderMap();
    }
  }, [usData, svgWidth, svgHeight, renderMap]);

  if (loading) {
    return (
      <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-cyan-500 font-mono">
        <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-cyan-400 border-l-transparent rounded-full animate-spin mb-4"></div>
        <div className="animate-pulse">{t.map.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div ref={containerRef} className="flex flex-col items-center justify-center w-full h-full text-red-500 font-mono border border-red-900 bg-red-900/20 p-4">
        <div className="text-4xl mb-2">⚠</div>
        <p className="tracking-widest font-bold">{t.map.error}</p>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="w-full h-full relative bg-transparent overflow-hidden">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 z-0 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(circle, #0e7490 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              opacity: 0.2
            }}>
        </div>
        
        <svg
          ref={svgRef}
          className="w-full h-full relative z-10"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        ></svg>
      </div>
    </>
  );
};
