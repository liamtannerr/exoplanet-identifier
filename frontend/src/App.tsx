import React, { useState } from 'react';
import { ExoplanetScene } from './components/ExoplanetScene';
import { PlanetSelector } from './components/PlanetSelector';
import { SelectedPlanet, PlanetVisualizationParams } from './types/exoplanet';
import { temperatureToStarColor, temperatureToPlanetColor, solarRadiiToAU, getDisplayName } from './services/exoplanetApi';

export default function App() {
  // Selected planets from API
  const [selectedPlanets, setSelectedPlanets] = useState<SelectedPlanet[]>([]);
  
  // Shared popover state for planet details
  const [showPopover, setShowPopover] = useState(false);
  const [selectedPlanetInfo, setSelectedPlanetInfo] = useState<PlanetVisualizationParams | null>(null);
  
  // Focus state for individual planetary systems
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);

  // Convert selected planets to visualization parameters
  const getVisualizationParams = (): PlanetVisualizationParams[] => {
    // Return empty array when no planets selected
    if (selectedPlanets.length === 0) {
      return [];
    }

    return selectedPlanets.map(planet => ({
      planetOrbitalPeriod: planet.orbital_period,
      planetDistance: solarRadiiToAU(planet.orbital_radius),
      planetDiameter: planet.planet_radius,
      planetColor: temperatureToPlanetColor(planet.temperature),
      starDiameter: planet.stellar_radius,
      starColor: temperatureToStarColor(planet.stellar_temperature || 5778), // Default to sun temperature if not provided
      kepoi_name: planet.kepoi_name,
      display_name: getDisplayName(planet),
      stellarTemperature: planet.stellar_temperature || 5778
    }));
  };

  const visualizationParams = getVisualizationParams();

  // Handle planet info selection from either source
  const handlePlanetInfoSelect = (planetInfo: PlanetVisualizationParams | null) => {
    setSelectedPlanetInfo(planetInfo);
    setShowPopover(!!planetInfo);
  };

  // Handle planet focus (from list or 3D scene)
  const handlePlanetFocus = (kepoi_name: string | null) => {
    setFocusedPlanet(kepoi_name);
    
    // Also update the planet info if focusing
    if (kepoi_name) {
      const planetInfo = visualizationParams.find(p => p.kepoi_name === kepoi_name);
      if (planetInfo) {
        setSelectedPlanetInfo(planetInfo);
        setShowPopover(true);
      }
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex dark">
      {/* Exoplanet Database - Full Left Panel */}
      <div className="w-80 h-full bg-gray-900 border-r border-gray-700 p-4">
        <PlanetSelector
          selectedPlanets={selectedPlanets}
          onPlanetsChange={setSelectedPlanets}
          visualizationParams={visualizationParams}
          onPlanetInfoSelect={handlePlanetInfoSelect}
          focusedPlanet={focusedPlanet}
          onPlanetFocus={handlePlanetFocus}
        />
      </div>
      
      <div className="flex-1 relative">
        <ExoplanetScene
          planets={visualizationParams}
          showPopover={showPopover}
          setShowPopover={setShowPopover}
          selectedPlanetInfo={selectedPlanetInfo}
          onPlanetInfoSelect={handlePlanetInfoSelect}
          focusedPlanet={focusedPlanet}
          onPlanetFocus={handlePlanetFocus}
        />
      </div>
    </div>
  );
}