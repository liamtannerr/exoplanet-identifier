import { ExoplanetListItem, ExoplanetDetails } from '../types/exoplanet';

// Mock data since we can't make real API calls in this environment
const mockExoplanetList: ExoplanetListItem[] = [
  { kepler_name: "Kepler-442b", kepoi_name: "K00282.01" },
  { kepler_name: "Kepler-438b", kepoi_name: "K00268.01" },
  { kepler_name: "Kepler-186f", kepoi_name: "K00571.05" },
  { kepler_name: "Kepler-62e", kepoi_name: "K00701.03" },
  { kepler_name: "Kepler-22b", kepoi_name: "K00087.01" },
  { kepler_name: "Kepler-452b", kepoi_name: "K07016.01" },
  { kepler_name: "Kepler-1649c", kepoi_name: "K07554.01" },
  { kepler_name: null, kepoi_name: "K00123.02" },
  { kepler_name: "Kepler-296e", kepoi_name: "K00117.02" },
  { kepler_name: "Kepler-283c", kepoi_name: "K00408.02" }
];

// Store custom planets created by users
let customPlanets: ExoplanetListItem[] = [];
let customPlanetDetails: Record<string, ExoplanetDetails> = {};

const mockExoplanetDetails: Record<string, ExoplanetDetails> = {
  "K00282.01": {
    kepoi_name: "K00282.01",
    kepler_name: "Kepler-442b",
    orbital_period: 112.3,
    planet_radius: 1.34,
    stellar_radius: 0.61,
    orbital_radius: 0.409,
    temperature: 233,
    stellar_temperature: 4402  // K-type star
  },
  "K00268.01": {
    kepoi_name: "K00268.01",
    kepler_name: "Kepler-438b",
    orbital_period: 35.2,
    planet_radius: 1.12,
    stellar_radius: 0.54,
    orbital_radius: 0.166,
    temperature: 276,
    stellar_temperature: 3952  // M-type star
  },
  "K00571.05": {
    kepoi_name: "K00571.05",
    kepler_name: "Kepler-186f",
    orbital_period: 129.9,
    planet_radius: 1.11,
    stellar_radius: 0.47,
    orbital_radius: 0.432,
    temperature: 188,
    stellar_temperature: 3788  // M-type star
  },
  "K00701.03": {
    kepoi_name: "K00701.03",
    kepler_name: "Kepler-62e",
    orbital_period: 122.4,
    planet_radius: 1.61,
    stellar_radius: 0.69,
    orbital_radius: 0.427,
    temperature: 270,
    stellar_temperature: 4925  // K-type star
  },
  "K00087.01": {
    kepoi_name: "K00087.01",
    kepler_name: "Kepler-22b",
    orbital_period: 289.9,
    planet_radius: 2.38,
    stellar_radius: 0.97,
    orbital_radius: 0.849,
    temperature: 262,
    stellar_temperature: 5518  // G-type star (sun-like)
  },
  "K07016.01": {
    kepoi_name: "K07016.01",
    kepler_name: "Kepler-452b",
    orbital_period: 384.8,
    planet_radius: 1.63,
    stellar_radius: 1.11,
    orbital_radius: 1.046,
    temperature: 265,
    stellar_temperature: 5757  // G-type star (sun-like)
  },
  "K07554.01": {
    kepoi_name: "K07554.01",
    kepler_name: "Kepler-1649c",
    orbital_period: 19.5,
    planet_radius: 1.06,
    stellar_radius: 0.20,
    orbital_radius: 0.0649,
    temperature: 234,
    stellar_temperature: 3240  // M-type red dwarf
  },
  "K00123.02": {
    kepoi_name: "K00123.02",
    kepler_name: null,
    orbital_period: 45.7,
    planet_radius: 0.89,
    stellar_radius: 0.82,
    orbital_radius: 0.201,
    temperature: 315,
    stellar_temperature: 5297  // G-type star
  },
  "K00117.02": {
    kepoi_name: "K00117.02",
    kepler_name: "Kepler-296e",
    orbital_period: 34.1,
    planet_radius: 1.75,
    stellar_radius: 0.50,
    orbital_radius: 0.169,
    temperature: 292,
    stellar_temperature: 3740  // M-type star
  },
  "K00408.02": {
    kepoi_name: "K00408.02",
    kepler_name: "Kepler-283c",
    orbital_period: 92.7,
    planet_radius: 1.84,
    stellar_radius: 0.63,
    orbital_radius: 0.348,
    temperature: 254,
    stellar_temperature: 4544  // K-type star
  }
};

export async function fetchExoplanetList(): Promise<ExoplanetListItem[]> {
  try {
    // In a real environment, this would be:
    // const response = await fetch('http://localhost:8000/exoplanets');
    // return await response.json();
    
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...customPlanets, ...mockExoplanetList];
  } catch (error) {
    console.error('Error fetching exoplanet list:', error);
    // Return mock data as fallback
    return [...customPlanets, ...mockExoplanetList];
  }
}

export async function fetchExoplanetDetails(kepoi_name: string): Promise<ExoplanetDetails | null> {
  try {
    // In a real environment, this would be:
    // const response = await fetch(`http://localhost:8000/exoplanets/${kepoi_name}`);
    // return await response.json();
    
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return customPlanetDetails[kepoi_name] || mockExoplanetDetails[kepoi_name] || null;
  } catch (error) {
    console.error(`Error fetching exoplanet details for ${kepoi_name}:`, error);
    return customPlanetDetails[kepoi_name] || mockExoplanetDetails[kepoi_name] || null;
  }
}

// Function to add custom planet
export function addCustomPlanet(planetDetails: ExoplanetDetails) {
  const listItem: ExoplanetListItem = {
    kepoi_name: planetDetails.kepoi_name,
    kepler_name: planetDetails.kepler_name
  };
  
  customPlanets.unshift(listItem); // Add to beginning of list
  customPlanetDetails[planetDetails.kepoi_name] = planetDetails;
}

// Utility function to get display name
export function getDisplayName(planet: ExoplanetListItem | ExoplanetDetails): string {
  return planet.kepler_name || planet.kepoi_name;
}

// Convert temperature to star color (bright and visible)
export function temperatureToStarColor(temperature: number): string {
  if (temperature < 3500) return '#FF6B35'; // Bright orange-red for cool stars
  if (temperature < 5000) return '#FF4444'; // Bright red for red giants
  if (temperature < 6000) return '#FF8800'; // Bright orange 
  if (temperature < 7500) return '#FFDD00'; // Bright yellow sun
  if (temperature < 10000) return '#FFFFFF'; // Pure white
  return '#66AAFF'; // Bright blue for hot stars
}

// Convert planet equilibrium temperature to realistic planet color
export function temperatureToPlanetColor(temperature: number): string {
  if (temperature >= 2000) return '#ff4500'; // Very hot: Orange-red (lava worlds)
  if (temperature >= 1500) return '#ff6347'; // Hot: Red-orange (molten surface)
  if (temperature >= 1000) return '#ffa500'; // Warm: Orange (Venus-like)
  if (temperature >= 700) return '#ffff00';  // Temperate hot: Yellow
  if (temperature >= 400) return '#90ee90';  // Temperate: Light green (potentially habitable)
  if (temperature >= 200) return '#4169e1';  // Cool: Blue (Earth-like)
  if (temperature >= 100) return '#87ceeb';  // Cold: Light blue (ice worlds)
  return '#b0c4de'; // Very cold: Light steel blue (frozen worlds)
}

// Convert orbital radius from solar radii to AU (1 AU ≈ 215 solar radii)
export function solarRadiiToAU(solarRadii: number): number {
  return solarRadii / 215;
}