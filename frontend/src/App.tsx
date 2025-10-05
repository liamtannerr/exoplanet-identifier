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
  const [selectedKepoiName, setSelectedKepoiName] = useState<string | null>(null);
  
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
      planetDistance: planet.orbital_radius,
      //planetDistance: solarRadiiToAU(planet.orbital_radius),
      planetDiameter: planet.planet_radius,
      planetColor: temperatureToPlanetColor(planet.temperature),
      starDiameter: planet.stellar_radius,
      starColor: temperatureToStarColor(planet.stellar_temperature || 5778), // Default to sun temperature if not provided
      kepoi_name: planet.kepoi_name,
      display_name: getDisplayName(planet),
      stellarTemperature: planet.stellar_temperature || 5778
    }));
  };

  // Handle planet info selection from either source
  const handlePlanetInfoSelect = (planetInfo: PlanetVisualizationParams | null) => {
    setSelectedKepoiName(planetInfo?.kepoi_name);
    setShowPopover(!!planetInfo);
  };

  const visualizationParams = getVisualizationParams();

  const handlePlanetFocus = (kepoi_name: string | null) => {
    setSelectedKepoiName(kepoi_name);
    setShowPopover(true);
    setFocusedPlanet(kepoi_name);
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex dark">
      {/* Exoplanet Database - Full Left Panel */}
      <div className="w-100 h-full bg-gray-900 border-r border-gray-700 p-4">
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
          selectedPlanetInfo={visualizationParams.find(p => p.kepoi_name === selectedKepoiName) || null}
          onPlanetInfoSelect={handlePlanetInfoSelect}
          focusedPlanet={focusedPlanet}
          onPlanetFocus={handlePlanetFocus}
        />
      </div>
    </div>
  );
}