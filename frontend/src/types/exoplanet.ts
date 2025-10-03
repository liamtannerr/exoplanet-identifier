export interface ExoplanetListItem {
  kepler_name: string | null;
  kepoi_name: string;
}

export interface ExoplanetDetails {
  kepoi_name: string;
  kepler_name: string | null;
  orbital_period: number; // days
  planet_radius: number; // earth radii
  stellar_radius: number; // solar radii
  orbital_radius: number; // solar radii
  temperature: number; // Kelvin - planet temperature
  stellar_temperature?: number; // Kelvin - star temperature (optional for existing data)
}

export interface SelectedPlanet extends ExoplanetDetails {
  color: string; // assigned color for visualization
}

// Convert API response to our visualization parameters
export interface PlanetVisualizationParams {
  planetOrbitalPeriod: number;
  planetDistance: number; // Convert from solar radii to AU
  planetDiameter: number;
  planetColor: string;
  starDiameter: number;
  starColor: string;
  kepoi_name: string;
  display_name: string;
  stellarTemperature: number; // Kelvin - for proper star color calculation
}

// Focus state for individual planetary systems
export interface FocusState {
  focusedPlanet: string | null; // kepoi_name of focused planet
}