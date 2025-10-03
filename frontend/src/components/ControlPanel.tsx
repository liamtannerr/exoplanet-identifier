import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

interface ControlPanelProps {
  planetOrbitalPeriod: number;
  setPlanetOrbitalPeriod: (value: number) => void;
  planetDistance: number;
  setPlanetDistance: (value: number) => void;
  planetDiameter: number;
  setPlanetDiameter: (value: number) => void;
  planetColor: string;
  setPlanetColor: (value: string) => void;
  starDiameter: number;
  setStarDiameter: (value: number) => void;
  starColor: string;
  setStarColor: (value: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  planetOrbitalPeriod,
  setPlanetOrbitalPeriod,
  planetDistance,
  setPlanetDistance,
  planetDiameter,
  setPlanetDiameter,
  planetColor,
  setPlanetColor,
  starDiameter,
  setStarDiameter,
  starColor,
  setStarColor
}) => {
  const starColorPresets = [
    { name: 'Blue Giant', color: '#4A90E2' },
    { name: 'White Dwarf', color: '#F5F5F5' },
    { name: 'Yellow Sun', color: '#FFD700' },
    { name: 'Orange Giant', color: '#FF8C00' },
    { name: 'Red Giant', color: '#DC143C' },
    { name: 'Brown Dwarf', color: '#8B4513' }
  ];

  const planetColorPresets = [
    { name: 'Earth Blue', color: '#4A90E2' },
    { name: 'Mars Red', color: '#CD5C5C' },
    { name: 'Venus Yellow', color: '#FFC649' },
    { name: 'Jupiter Orange', color: '#D2691E' },
    { name: 'Neptune Blue', color: '#4169E1' },
    { name: 'Saturn Tan', color: '#FAD5A5' }
  ];

  return (
    <div className="w-100 h-full bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
      <div className="space-y-6">
        <h2 className="text-white mb-6">Exoplanet System Controls</h2>
        
        {/* Planet Controls */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Planet Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orbital-period" className="text-gray-300">
                Orbital Period (days)
              </Label>
              <div className="mt-2 space-y-2">
                <Slider
                  id="orbital-period"
                  min={1}
                  max={500}
                  step={1}
                  value={[planetOrbitalPeriod]}
                  onValueChange={(value) => setPlanetOrbitalPeriod(value[0])}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={planetOrbitalPeriod}
                  onChange={(e) => setPlanetOrbitalPeriod(Number(e.target.value))}
                  min={1}
                  max={500}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="orbital-distance" className="text-gray-300">
                Orbital Distance (AU)
              </Label>
              <div className="mt-2 space-y-2">
                <Slider
                  id="orbital-distance"
                  min={0.1}
                  max={20}
                  step={0.1}
                  value={[planetDistance]}
                  onValueChange={(value) => setPlanetDistance(value[0])}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={planetDistance}
                  onChange={(e) => setPlanetDistance(Number(e.target.value))}
                  min={0.1}
                  max={20}
                  step={0.1}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="planet-diameter" className="text-gray-300">
                Planet Diameter (Earth radii)
              </Label>
              <div className="mt-2 space-y-2">
                <Slider
                  id="planet-diameter"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={[planetDiameter]}
                  onValueChange={(value) => setPlanetDiameter(value[0])}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={planetDiameter}
                  onChange={(e) => setPlanetDiameter(Number(e.target.value))}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="planet-color" className="text-gray-300">
                Planet Color
              </Label>
              <div className="mt-2 space-y-2">
                <Input
                  id="planet-color"
                  type="color"
                  value={planetColor}
                  onChange={(e) => setPlanetColor(e.target.value)}
                  className="w-full h-10 bg-gray-700 border-gray-600"
                />
                <div className="grid grid-cols-3 gap-2">
                  {planetColorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setPlanetColor(preset.color)}
                      className={`h-8 rounded border-2 transition-all hover:scale-105 ${
                        planetColor.toLowerCase() === preset.color.toLowerCase()
                          ? 'border-white'
                          : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {planetColorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setPlanetColor(preset.color)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        planetColor.toLowerCase() === preset.color.toLowerCase()
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Star Controls */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Star Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="star-diameter" className="text-gray-300">
                Star Diameter (Solar radii)
              </Label>
              <div className="mt-2 space-y-2">
                <Slider
                  id="star-diameter"
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={[starDiameter]}
                  onValueChange={(value) => setStarDiameter(value[0])}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={starDiameter}
                  onChange={(e) => setStarDiameter(Number(e.target.value))}
                  min={0.5}
                  max={10}
                  step={0.1}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="star-color" className="text-gray-300">
                Star Color
              </Label>
              <div className="mt-2 space-y-2">
                <Input
                  id="star-color"
                  type="color"
                  value={starColor}
                  onChange={(e) => setStarColor(e.target.value)}
                  className="w-full h-10 bg-gray-700 border-gray-600"
                />
                <div className="grid grid-cols-3 gap-2">
                  {starColorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setStarColor(preset.color)}
                      className={`h-8 rounded border-2 transition-all hover:scale-105 ${
                        starColor.toLowerCase() === preset.color.toLowerCase()
                          ? 'border-white'
                          : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {starColorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setStarColor(preset.color)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        starColor.toLowerCase() === preset.color.toLowerCase()
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Panel */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">
              Adjust the parameters above to create different planetary systems. 
              The classification algorithm considers orbital distance, period, and size 
              to determine if the planet qualifies as an exoplanet.
            </p>
            <div className="mt-3 text-xs text-gray-400">
              <p>• AU = Astronomical Unit (Earth-Sun distance)</p>
              <p>• Solar radii = Sun's radius</p>
              <p>• Earth radii = Earth's radius</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};