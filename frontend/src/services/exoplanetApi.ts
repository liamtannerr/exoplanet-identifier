import { ExoplanetListItem, ExoplanetDetails } from '../types/exoplanet';

let customPlanetByKepoiName: Record<string, ExoplanetDetails> = {};
let customPlanetKepoiNameList: string[] = [];

// Read from Vite at build time (set VITE_API_URL in Railway / .env.production)
const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, "");

export async function fetchExoplanetList(): Promise<ExoplanetListItem[]> {
  const response = await fetch(`${API_BASE}/exoplanets`);
  const data = await response.json();
  const customPlanets = customPlanetKepoiNameList.map(kepoi_name => customPlanetByKepoiName[kepoi_name]);
  // TODO: use all data
  return [...customPlanets, ...data.slice(0, 100)];
}

export async function fetchExoplanetDetails(kepoi_name: string): Promise<ExoplanetDetails | null> {
  if (customPlanetKepoiNameList.includes(kepoi_name)) {
    return customPlanetByKepoiName[kepoi_name];
  }
  const response = await fetch(`${API_BASE}/exoplanets/metrics?kepoi_name=${encodeURIComponent(kepoi_name)}`);
  let data = await response.json();
  data = data[0];
  return data;
}

// Function to add custom planet
export function addCustomPlanet(planetDetails: ExoplanetDetails) {
  customPlanetByKepoiName[planetDetails.kepoi_name] = planetDetails;
  customPlanetKepoiNameList.unshift(planetDetails.kepoi_name);
}

export function isCustomPlanet(kepoi_name: string): boolean {
  return customPlanetKepoiNameList.includes(kepoi_name);
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

export const CSS_COLOR_NAMES: string[] = [
  "Aqua", "Aquamarine", "Blue", "BlueViolet", "BurlyWood", "CadetBlue",
  "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Crimson", "Cyan",
  "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkKhaki", "DarkMagenta",
  "DarkOrange", "DarkOrchid", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue",
  "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DodgerBlue",
  "FireBrick", "ForestGreen", "Fuchsia", "Gold", "GoldenRod", "Green",
  "GreenYellow", "HotPink", "IndianRed", "Khaki", "Lavender", "LawnGreen",
  "LightBlue", "LightCoral", "LightCyan", "LightGreen", "LightPink",
  "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSteelBlue", "Lime",
  "LimeGreen", "Magenta", "MediumAquaMarine", "MediumBlue", "MediumOrchid",
  "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen",
  "MediumTurquoise", "MediumVioletRed", "Orange", "OrangeRed", "Orchid",
  "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PeachPuff",
  "Peru", "Pink", "Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red",
  "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen",
  "SkyBlue", "SlateBlue", "SpringGreen", "SteelBlue", "Tan", "Thistle",
  "Tomato", "Turquoise", "Violet", "Wheat", "Yellow", "YellowGreen"
];

// Convert planet equilibrium temperature to realistic planet color
export function temperatureToPlanetColor(temperature: number): string {
  // if (temperature >= 2000) return '#ff4500'; // Very hot: Orange-red (lava worlds)
  // if (temperature >= 1500) return '#ff6347'; // Hot: Red-orange (molten surface)
  // if (temperature >= 1000) return '#ffa500'; // Warm: Orange (Venus-like)
  // if (temperature >= 700) return '#ffff00';  // Temperate hot: Yellow
  // if (temperature >= 400) return '#90ee90';  // Temperate: Light green (potentially habitable)
  // if (temperature >= 200) return '#4169e1';  // Cool: Blue (Earth-like)
  // if (temperature >= 100) return '#87ceeb';  // Cold: Light blue (ice worlds)
  // return '#b0c4de'; // Very cold: Light steel blue (frozen worlds)
  return CSS_COLOR_NAMES[temperature % CSS_COLOR_NAMES.length];
}

// Convert orbital radius from solar radii to AU (1 AU ≈ 215 solar radii)
export function solarRadiiToAU(solarRadii: number): number {
  return solarRadii;
  //return solarRadii / 215;
}