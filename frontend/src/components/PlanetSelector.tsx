import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Loader2, Search, Plus, X } from 'lucide-react';
import { ExoplanetListItem, SelectedPlanet, ExoplanetDetails, PlanetVisualizationParams } from '../types/exoplanet';
import { fetchExoplanetList, fetchExoplanetDetails, addCustomPlanet, getDisplayName, temperatureToStarColor, temperatureToPlanetColor, solarRadiiToAU } from '../services/exoplanetApi';

interface PlanetSelectorProps {
  selectedPlanets: SelectedPlanet[];
  onPlanetsChange: (planets: SelectedPlanet[]) => void;
  visualizationParams: PlanetVisualizationParams[];
  onPlanetInfoSelect: (planetInfo: PlanetVisualizationParams | null) => void;
  focusedPlanet: string | null;
  onPlanetFocus: (kepoi_name: string | null) => void;
}

const planetColors = [
  '#4A90E2', '#CD5C5C', '#FFC649', '#D2691E', '#4169E1', '#FAD5A5',
  '#32CD32', '#FF69B4', '#8A2BE2', '#20B2AA', '#F0E68C', '#DDA0DD'
];

export const PlanetSelector: React.FC<PlanetSelectorProps> = ({
  selectedPlanets,
  onPlanetsChange,
  visualizationParams,
  onPlanetInfoSelect,
  focusedPlanet,
  onPlanetFocus
}) => {
  const [allPlanets, setAllPlanets] = useState<ExoplanetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingPlanet, setAddingPlanet] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [customPlanetForm, setCustomPlanetForm] = useState({
    kepler_name: '',
    orbital_period: '',
    planet_radius: '',
    stellar_radius: '',
    orbital_radius: '',
    temperature: '',
    stellar_temperature: ''
  });

  useEffect(() => {
    loadPlanets();
  }, []);

  const loadPlanets = async () => {
    try {
      const planets = await fetchExoplanetList();
      setAllPlanets(planets);
    } catch (error) {
      console.error('Failed to load planets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlanets = allPlanets.filter(planet => {
    const displayName = getDisplayName(planet).toLowerCase();
    const search = searchTerm.toLowerCase();
    return displayName.includes(search) || planet.kepoi_name.toLowerCase().includes(search);
  });

  const isSelected = (kepoi_name: string) => {
    return selectedPlanets.some(p => p.kepoi_name === kepoi_name);
  };

  const addPlanet = async (planet: ExoplanetListItem) => {
    if (isSelected(planet.kepoi_name) || selectedPlanets.length >= 6) return;

    setAddingPlanet(planet.kepoi_name);
    try {
      const details = await fetchExoplanetDetails(planet.kepoi_name);
      if (details) {
        const selectedPlanet: SelectedPlanet = {
          ...details,
          color: temperatureToPlanetColor(details.temperature)
        };
        onPlanetsChange([...selectedPlanets, selectedPlanet]);
      }
    } catch (error) {
      console.error('Failed to add planet:', error);
    } finally {
      setAddingPlanet(null);
    }
  };

  const removePlanet = (kepoi_name: string) => {
    onPlanetsChange(selectedPlanets.filter(p => p.kepoi_name !== kepoi_name));
  };

  const handleSelectedPlanetClick = (planet: SelectedPlanet) => {
    // Focus on this planet (this will also update planet info)
    onPlanetFocus(planet.kepoi_name);
  };

  const generateCustomKoiName = () => {
    // Generate a unique KOI name for custom planets
    const timestamp = Date.now().toString().slice(-6);
    return `CUSTOM${timestamp}`;
  };

  const handleCustomPlanetSubmit = () => {
    // Validate form
    const requiredFields = ['orbital_period', 'planet_radius', 'stellar_radius', 'orbital_radius', 'temperature', 'stellar_temperature'];
    const missingFields = requiredFields.filter(field => !customPlanetForm[field as keyof typeof customPlanetForm]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate numeric values
    const numericValues = {
      orbital_period: parseFloat(customPlanetForm.orbital_period),
      planet_radius: parseFloat(customPlanetForm.planet_radius),
      stellar_radius: parseFloat(customPlanetForm.stellar_radius),
      orbital_radius: parseFloat(customPlanetForm.orbital_radius),
      temperature: parseFloat(customPlanetForm.temperature),
      stellar_temperature: parseFloat(customPlanetForm.stellar_temperature)
    };

    // Check for invalid numbers
    const invalidFields = Object.entries(numericValues)
      .filter(([_, value]) => isNaN(value) || value <= 0)
      .map(([field, _]) => field);

    if (invalidFields.length > 0) {
      alert(`Please enter valid positive numbers for: ${invalidFields.join(', ')}`);
      return;
    }

    // Create the custom planet
    const kepoi_name = generateCustomKoiName();
    const customPlanet: ExoplanetDetails = {
      kepoi_name,
      kepler_name: customPlanetForm.kepler_name || null,
      orbital_period: numericValues.orbital_period,
      planet_radius: numericValues.planet_radius,
      stellar_radius: numericValues.stellar_radius,
      orbital_radius: numericValues.orbital_radius,
      temperature: numericValues.temperature,
      stellar_temperature: numericValues.stellar_temperature
    };

    // Add to planet database
    addCustomPlanet(customPlanet);
    
    // Reload planet list to include the new custom planet
    loadPlanets();

    // Add to selected planets if not at limit
    if (selectedPlanets.length < 6) {
      const selectedPlanet: SelectedPlanet = {
        ...customPlanet,
        color: temperatureToPlanetColor(customPlanet.temperature)
      };
      onPlanetsChange([...selectedPlanets, selectedPlanet]);
    }

    // Reset form and close dialog
    setCustomPlanetForm({
      kepler_name: '',
      orbital_period: '',
      planet_radius: '',
      stellar_radius: '',
      orbital_radius: '',
      temperature: '',
      stellar_temperature: ''
    });
    setShowAddDialog(false);
  };

  const handleFormChange = (field: string, value: string) => {
    setCustomPlanetForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={24} />
        <span className="ml-2 text-gray-400">Loading exoplanets...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white">Exoplanet Database</h2>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Plus size={16} className="mr-1" />
                Add Planet
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Custom Planet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="kepler_name" className="text-gray-300">
                    Kepler Name (optional)
                  </Label>
                  <Input
                    id="kepler_name"
                    placeholder="e.g., Kepler-442b"
                    value={customPlanetForm.kepler_name}
                    onChange={(e) => handleFormChange('kepler_name', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="orbital_period" className="text-gray-300">
                    Orbital Period (days) *
                  </Label>
                  <Input
                    id="orbital_period"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g., 365.25 (Earth: 365.25)"
                    value={customPlanetForm.orbital_period}
                    onChange={(e) => handleFormChange('orbital_period', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="planet_radius" className="text-gray-300">
                    Planet Radius (Earth radii) *
                  </Label>
                  <Input
                    id="planet_radius"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 1.2 (Earth: 1.0)"
                    value={customPlanetForm.planet_radius}
                    onChange={(e) => handleFormChange('planet_radius', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="stellar_radius" className="text-gray-300">
                    Stellar Radius (Solar radii) *
                  </Label>
                  <Input
                    id="stellar_radius"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 0.8 (Sun: 1.0)"
                    value={customPlanetForm.stellar_radius}
                    onChange={(e) => handleFormChange('stellar_radius', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="orbital_radius" className="text-gray-300">
                    Orbital Radius (Solar radii) *
                  </Label>
                  <Input
                    id="orbital_radius"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="e.g., 0.409 (Earth: ~215)"
                    value={customPlanetForm.orbital_radius}
                    onChange={(e) => handleFormChange('orbital_radius', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="temperature" className="text-gray-300">
                    Planet Temperature (Kelvin) *
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="1"
                    placeholder="e.g., 273 (Earth: 288K)"
                    value={customPlanetForm.temperature}
                    onChange={(e) => handleFormChange('temperature', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="stellar_temperature" className="text-gray-300">
                    Star Temperature (Kelvin) *
                  </Label>
                  <Input
                    id="stellar_temperature"
                    type="number"
                    min="1000"
                    placeholder="e.g., 5778 (Sun: 5778K)"
                    value={customPlanetForm.stellar_temperature}
                    onChange={(e) => handleFormChange('stellar_temperature', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCustomPlanetSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Planet
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search planets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* Selected Planets */}
        {selectedPlanets.length > 0 && (
          <div>
            <h4 className="text-sm text-gray-300 mb-2">Selected Planets ({selectedPlanets.length}/6)</h4>
            <div className="space-y-2">
              {selectedPlanets.map((planet) => {
                const isFocused = focusedPlanet === planet.kepoi_name;
                return (
                <div 
                  key={planet.kepoi_name} 
                  className={`flex items-center justify-between p-2 rounded hover:bg-gray-600 transition-colors cursor-pointer ${
                    isFocused ? 'bg-blue-600 border border-blue-400' : 'bg-gray-700'
                  }`}
                >
                  <div 
                    className="flex items-center space-x-2 flex-1"
                    onClick={() => handleSelectedPlanetClick(planet)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: temperatureToPlanetColor(planet.temperature) }}
                    />
                    <span className={`text-sm ${isFocused ? 'text-white font-medium' : 'text-white'}`}>
                      {getDisplayName(planet)}
                    </span>
                    {isFocused && <span className="text-blue-200 text-xs">• Focused</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // If removing the focused planet, clear focus
                      if (focusedPlanet === planet.kepoi_name) {
                        onPlanetFocus(null);
                      }
                      removePlanet(planet.kepoi_name);
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                  >
                    <X size={12} />
                  </Button>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Planets */}
        <div className="flex-1 flex flex-col">
          <h4 className="text-sm text-gray-300 mb-2">Available Planets</h4>
          <div className="flex-1 overflow-y-auto space-y-1">
            {filteredPlanets.map((planet) => {
              const selected = isSelected(planet.kepoi_name);
              const adding = addingPlanet === planet.kepoi_name;
              const canAdd = !selected && selectedPlanets.length < 6;

              return (
                <div 
                  key={planet.kepoi_name}
                  className={`flex items-center justify-between p-2 rounded text-sm ${
                    selected 
                      ? 'bg-blue-900/50 border border-blue-500/50' 
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <div>
                    <div className="text-white">{getDisplayName(planet)}</div>
                    <div className="text-gray-400 text-xs">
                      {planet.kepoi_name}
                      {planet.kepoi_name.startsWith('CUSTOM') && (
                        <span className="ml-1 text-blue-400">• Custom</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selected && <Badge variant="secondary" className="text-xs">Selected</Badge>}
                    {!selected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addPlanet(planet)}
                        disabled={!canAdd || adding}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-green-400 disabled:opacity-50"
                      >
                        {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedPlanets.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            <p className="text-sm">Select planets from the list above to visualize them</p>
          </div>
        )}

        {selectedPlanets.length >= 6 && (
          <div className="text-center text-yellow-400 py-2">
            <p className="text-sm">Maximum 6 planets can be displayed simultaneously</p>
          </div>
        )}
      </div>
    </div>
  );
};