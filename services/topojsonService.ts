// services/topojsonService.ts
import { USATopoJSON } from '../types';

// Use the unprojected (spherical) TopoJSON. 
// The previous URL ('states-albers-10m.json') was pre-projected, causing issues when applying d3.geoAlbersUsa() again.
const USA_TOPOJSON_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

export const fetchUSATopoJSON = async (): Promise<USATopoJSON> => {
  try {
    const response = await fetch(USA_TOPOJSON_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: USATopoJSON = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching USA TopoJSON data:", error);
    throw error;
  }
};