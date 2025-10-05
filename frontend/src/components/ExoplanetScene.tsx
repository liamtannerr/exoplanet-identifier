import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { PlanetVisualizationParams } from '../types/exoplanet';

interface ExoplanetSceneProps {
  planets: PlanetVisualizationParams[];
  showPopover: boolean;
  setShowPopover: (show: boolean) => void;
  selectedPlanetInfo: PlanetVisualizationParams | null;
  onPlanetInfoSelect: (planetInfo: PlanetVisualizationParams | null) => void;
  focusedPlanet: string | null;
  onPlanetFocus: (kepoi_name: string | null) => void;
}

interface PlanetSystemRef {
  planetMesh: THREE.Mesh;
  starMesh: THREE.Mesh;
  orbit: THREE.Mesh;
  systemGroup: THREE.Group; // Group containing the entire planetary system
  params: PlanetVisualizationParams;
}

export const ExoplanetScene: React.FC<ExoplanetSceneProps> = ({
  planets,
  showPopover,
  setShowPopover,
  selectedPlanetInfo,
  onPlanetInfoSelect,
  focusedPlanet,
  onPlanetFocus
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const planetSystemsRef = useRef<PlanetSystemRef[]>([]);
  const frameRef = useRef<number>();
  const timeRef = useRef(0);
  const hoveredPlanetRef = useRef<string | null>(null);
  const currentMouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const planetAnglesRef = useRef<Map<string, number>>(new Map());
  const focusedPlanetRef = useRef<string | null>(null);
  const cameraTransitionRef = useRef<{
    isTransitioning: boolean;
    startPosition: THREE.Vector3;
    targetPosition: THREE.Vector3;
    progress: number;
  }>({
    isTransitioning: false,
    startPosition: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(),
    progress: 0
  });
  
  // Store persistent planet defaults to prevent re-randomization
  const planetDefaultsRef = useRef<Map<string, PlanetVisualizationParams>>(new Map());

  // Calculate camera position to frame all planetary systems
  const getCameraPosition = () => {
    if (planets.length === 0) {
      // Default position when no planets
      const baseDistance = 25;
      const angle = 50 * (Math.PI / 180);
      return [0, baseDistance * Math.sin(angle), baseDistance * Math.cos(angle)];
    }
    
    // If a planet is focused, zoom in on its orbital radius
    if (focusedPlanet) {
      const focusedParams = planets.find(p => p.kepoi_name === focusedPlanet);
      if (focusedParams) {
        // Calculate zoom based on the orbital distance of the focused planet
        const systemSize = Math.max(focusedParams.planetDistance * 2.5, 8); // View the orbital radius with some padding
        const baseDistance = systemSize + 5; // Add padding
        
        const angle = 50 * (Math.PI / 180);
        
        // All systems are centered at origin, so camera looks at (0, 0, 0)
        const position = [
          0, 
          baseDistance * Math.sin(angle), 
          baseDistance * Math.cos(angle)
        ];
        
        console.log(`Focused camera position for ${focusedPlanet}:`, position, `orbital distance: ${focusedParams.planetDistance}`);
        return position;
      }
    }
    
    // When no planet is focused, zoom out to view the largest orbital radius
    const maxOrbitalRadius = Math.max(...planets.map(p => p.planetDistance), 5);
    const systemSize = maxOrbitalRadius * 3.0; // View the largest orbital radius with more padding
    const baseDistance = Math.max(systemSize + 15, 40); // Ensure minimum distance for overview
    
    // 50-degree angle from above
    const angle = 50 * (Math.PI / 180);
    const x = 0; // Center on the overlapping systems
    const y = baseDistance * Math.sin(angle);
    const z = baseDistance * Math.cos(angle);
    
    const position = [x, y, z];
    console.log(`Unfocused camera position:`, position, `max orbital radius: ${maxOrbitalRadius}`);
    return position;
  };

  // Get position for each planetary system - all centered at origin
  const getSystemPosition = (index: number, totalSystems: number) => {
    // All systems are positioned at the center point
    return {
      x: 0,
      y: 0,
      z: 0
    };
  };

  // Calculate orbital speed based on actual orbital period but scaled for visualization
  const getOrbitalSpeed = (planet: PlanetVisualizationParams) => {
    // Scale factor to make orbits visible (real periods are too slow)
    // This makes a 365-day period complete one orbit in about 37 seconds
    const timeScale = 100; // Higher = faster orbits
    
    // Speed is inversely proportional to orbital period
    // Shorter periods = faster movement, maintaining relative speeds
    return (2 * Math.PI * timeScale) / planet.planetOrbitalPeriod;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with moderate background for visibility
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a); // Lighter background for better visibility
    sceneRef.current = scene;

    // Camera setup with 50-degree overhead view
    const [camX, camY, camZ] = getCameraPosition();
    const camera = new THREE.PerspectiveCamera(
      60, // Slightly wider field of view for better overview
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(camX, camY, camZ);
    camera.lookAt(0, 0, 0); // Look at the center of the scene
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Moderate ambient lighting for realistic space environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Add directional light to simulate distant starlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create 5-pointed star shape
    const createStarShape = () => {
      const shape = new THREE.Shape();
      const outerRadius = 0.35;
      const innerRadius = 0.3;
      const points = 9;
      
      for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      }
      shape.closePath();
      
      return shape;
    };

    // Stars background with 5-pointed star shapes
    const starShape = createStarShape();
    const starGeometry = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.02,
      bevelEnabled: false
    });
    
    const backgroundStars: THREE.Mesh[] = [];
    for (let i = 0; i < 1000; i++) {
      const starMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: Math.random() * 0.4 + .6 // Random opacity between 0.2 and 1.0
      });
      const star = new THREE.Mesh(starGeometry, starMaterial);
      
      // Random position
      star.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
      
      // Random rotation
      star.rotation.set(
        0,
        0,
        0
      );
      
      // Random scale
      const scale = Math.random() * 0.5 + 0.3; // Between 0.3 and 0.8
      star.scale.setScalar(scale);
      
      scene.add(star);
      backgroundStars.push(star);
    }
    
    // Store background stars for cleanup
    const backgroundStarsRef = { current: backgroundStars };

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      timeRef.current += 0.01;
      
      // Handle smooth camera transitions
      if (cameraTransitionRef.current.isTransitioning && cameraRef.current) {
        const transition = cameraTransitionRef.current;
        transition.progress += 0.02; // Transition speed
        
        if (transition.progress >= 1) {
          // Transition complete
          cameraRef.current.position.copy(transition.targetPosition);
          transition.isTransitioning = false;
          transition.progress = 0;
        } else {
          // Smooth interpolation
          const t = transition.progress;
          // Use ease-in-out function for smooth transition
          const smoothT = t * t * (3 - 2 * t);
          
          cameraRef.current.position.lerpVectors(
            transition.startPosition,
            transition.targetPosition,
            smoothT
          );
        }
        
        cameraRef.current.lookAt(0, 0, 0);
      }
      
      // Check for hover detection continuously
      if (cameraRef.current && rendererRef.current) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(currentMouseRef.current, cameraRef.current);

        const planetMeshes = planetSystemsRef.current.map(p => p.planetMesh);
        const intersects = raycaster.intersectObjects(planetMeshes);

        const previousHovered = hoveredPlanetRef.current;
        if (intersects.length > 0) {
          const hoveredPlanet = intersects[0].object as THREE.Mesh;
          const planetInfo = hoveredPlanet.userData.planetParams as PlanetVisualizationParams;
          hoveredPlanetRef.current = planetInfo.kepoi_name;
          
          // Change cursor to pointer if not already hovering
          if (rendererRef.current && previousHovered !== planetInfo.kepoi_name) {
            rendererRef.current.domElement.style.cursor = 'pointer';
          }
        } else {
          hoveredPlanetRef.current = null;
          // Reset cursor if previously hovering
          if (rendererRef.current && previousHovered !== null) {
            rendererRef.current.domElement.style.cursor = 'default';
          }
        }
      }
      
      // Animate all planetary systems
      planetSystemsRef.current.forEach((systemRef, index) => {
        const { params } = systemRef;
        const isPaused = hoveredPlanetRef.current === params.kepoi_name;
        const isFocused = focusedPlanetRef.current === params.kepoi_name;
        
        // Get or initialize the current angle for this planet
        if (!planetAnglesRef.current.has(params.kepoi_name)) {
          // Initialize with starting angle to spread planets out
          const startingAngle = (index * Math.PI * 2) / Math.max(planetSystemsRef.current.length, 1);
          planetAnglesRef.current.set(params.kepoi_name, startingAngle);
        }
        
        let currentAngle = planetAnglesRef.current.get(params.kepoi_name)!;
        
        if (!isPaused) {
          // Update the angle incrementally
          const orbitalSpeed = getOrbitalSpeed(params);
          currentAngle += orbitalSpeed * 0.01; // 0.01 is our time delta
          planetAnglesRef.current.set(params.kepoi_name, currentAngle);
        }
        
        // Calculate orbital position from the current angle (relative to star)
        const x = Math.cos(currentAngle) * params.planetDistance;
        const z = Math.sin(currentAngle) * params.planetDistance;
        systemRef.planetMesh.position.set(x, 0, z);
        
        // Always rotate planet on its own axis
        systemRef.planetMesh.rotation.y += 0.03;
        
        // Rotate the star slowly
        systemRef.starMesh.rotation.y += 0.005;
        
        // Pulsing effect for star
        const pulseSpeed = 0.02;
        const pulseFactor = 1.0 + 0.05 * Math.sin(timeRef.current * pulseSpeed + index);
        systemRef.starMesh.scale.setScalar(pulseFactor);
        
        // Update materials based on focus state
        const planetMaterial = systemRef.planetMesh.material as THREE.MeshPhongMaterial;
        const starMaterial = systemRef.starMesh.material as THREE.MeshBasicMaterial;
        const orbitMaterial = systemRef.orbit.material as THREE.MeshBasicMaterial;
        
        if (focusedPlanetRef.current === null) {
          // No focus - all suns grey and translucent except selected
          
          planetMaterial.color.setStyle(params.planetColor);
          planetMaterial.opacity = 1.0;
          starMaterial.color.setStyle(params.starColor);
          starMaterial.opacity = 1;
          orbitMaterial.opacity = systemRef.orbit.userData.originalOpacity;
        
        } else if (isFocused) {
          // This system is focused - full color and opacity
          planetMaterial.color.setStyle(params.planetColor);
          planetMaterial.opacity = 1.0;
          starMaterial.color.setStyle(params.starColor);
          starMaterial.opacity = 1;
          orbitMaterial.opacity = systemRef.orbit.userData.originalOpacity;
          console.log("isFocused: "+starMaterial.opacity+starMaterial.color.getHexString());
         
        } else {
          // This system is not focused - suns are grey and semi-transparent except selected sun
          planetMaterial.color.setStyle(params.planetColor);
          planetMaterial.opacity = 1.0;
          starMaterial.color.setHex(0x606060);
          starMaterial.opacity = 0;
          orbitMaterial.opacity = 0.05;
          /*
          planetMaterial.color.setHex(0x606060); // Darker grey for better contrast
          planetMaterial.opacity = 0.4;
          starMaterial.color.setHex(0x606060);
          starMaterial.opacity = 0.4;
          orbitMaterial.opacity = 0.05;
          */
        }
        
        // Force material updates
        planetMaterial.needsUpdate = true;
        starMaterial.needsUpdate = true;
        orbitMaterial.needsUpdate = true;
      });

      // Subtle orbit opacity animation for focused/unfocused systems
      planetSystemsRef.current.forEach((systemRef, index) => {
        const orbitMaterial = systemRef.orbit.material as THREE.MeshBasicMaterial;
        const isFocused = focusedPlanetRef.current === systemRef.params.kepoi_name;
        
        if (isFocused || focusedPlanetRef.current === null) {
          const baseOpacity = systemRef.orbit.userData.originalOpacity;
          const pulseOpacity = baseOpacity + 0.1 * Math.sin(timeRef.current * 0.005 + index);
          orbitMaterial.opacity = Math.max(0.1, pulseOpacity);
        }
        // Opacity for unfocused systems is handled in the main animation loop above
      });

      // Animate background stars with subtle twinkling
      backgroundStarsRef.current.forEach((star, index) => {
        const material = star.material as THREE.MeshBasicMaterial;
        const baseOpacity = 0.6;
        const twinkle = baseOpacity + 0.4 * Math.sin(timeRef.current * 0.003 + index * 0.1);
        material.opacity = Math.max(0.2, twinkle);
        
        // Slow rotation for additional visual interest
        star.rotation.z += 0.001;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      
      // Clean up background stars
      backgroundStarsRef.current.forEach(star => {
        scene.remove(star);
        star.geometry.dispose();
        (star.material as THREE.Material).dispose();
      });
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update focused planet ref when prop changes
  useEffect(() => {
    focusedPlanetRef.current = focusedPlanet;
  }, [focusedPlanet]);

  // Generate persistent planet defaults to prevent re-randomization
  const getPlanetDefaults = (planet: PlanetVisualizationParams, index: number): PlanetVisualizationParams => {
    // Check if we already have defaults for this planet
    if (planetDefaultsRef.current.has(planet.kepoi_name)) {
      const existing = planetDefaultsRef.current.get(planet.kepoi_name)!;
      // Update with current planet data but keep the generated properties
      // IMPORTANT: Always preserve color and temperature data from API
      return {
        ...planet, // Keep all API data including colors and temperatures
        planetDistance: existing.planetDistance,
        planetDiameter: existing.planetDiameter,
        planetOrbitalPeriod: existing.planetOrbitalPeriod
      };
    }

    // Generate new defaults for this planet
    const baseDistances = [3, 5, 8, 12, 16, 20]; // Different orbital distances
    const baseSizes = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0]; // Different planet sizes
    const basePeriods = [88, 225, 365, 687, 1083, 1686]; // Different orbital periods (days)
    
    // Use a simple hash of the planet name to ensure consistent randomization
    const hash = planet.kepoi_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const planetIndex = hash % 6;
    
    const planetDefaults = {
      ...planet, // Keep all API data including colors and temperatures
      planetDistance: baseDistances[planetIndex] + ((hash % 100) - 50) * 0.04, // Consistent variation
      planetDiameter: baseSizes[planetIndex] + ((hash % 40) - 20) * 0.01,
      planetOrbitalPeriod: basePeriods[planetIndex] + ((hash % 200) - 100)
    };

    // Store the defaults for future use
    planetDefaultsRef.current.set(planet.kepoi_name, planetDefaults);
    return planetDefaults;
  };

  // Incremental planetary system updates
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const currentPlanetIds = new Set(planets.map(p => p.kepoi_name));
    const existingPlanetIds = new Set(planetSystemsRef.current.map(p => p.params.kepoi_name));

    // Remove planetary systems that are no longer selected
    planetSystemsRef.current = planetSystemsRef.current.filter(systemRef => {
      if (!currentPlanetIds.has(systemRef.params.kepoi_name)) {
        // Remove from scene
        scene.remove(systemRef.systemGroup);
        
        // Clean up angle tracking
        planetAnglesRef.current.delete(systemRef.params.kepoi_name);
        
        // Clear hover state if this planet was hovered
        if (hoveredPlanetRef.current === systemRef.params.kepoi_name) {
          hoveredPlanetRef.current = null;
        }
        
        // Clear focus state if this planet was focused
        if (focusedPlanet === systemRef.params.kepoi_name) {
          onPlanetFocus(null);
        }
        
        // Dispose of resources
        systemRef.planetMesh.geometry.dispose();
        (systemRef.planetMesh.material as THREE.Material).dispose();
        systemRef.starMesh.geometry.dispose();
        (systemRef.starMesh.material as THREE.Material).dispose();
        systemRef.orbit.geometry.dispose();
        (systemRef.orbit.material as THREE.Material).dispose();
        
        return false; // Remove from array
      }
      return true; // Keep in array
    });

    // Add new planetary systems
    planets.forEach((planetParams, index) => {
      if (!existingPlanetIds.has(planetParams.kepoi_name)) {
        const planetProps = getPlanetDefaults(planetParams, index);
        const systemPosition = getSystemPosition(index, planets.length);
        
        // Initialize angle for this planet if not exists
        if (!planetAnglesRef.current.has(planetProps.kepoi_name)) {
          const startingAngle = (planetSystemsRef.current.length * Math.PI * 2) / Math.max(planets.length, 1);
          planetAnglesRef.current.set(planetProps.kepoi_name, startingAngle);
        }
        
        // Create system group
        const systemGroup = new THREE.Group();
        systemGroup.position.set(systemPosition.x, systemPosition.y, systemPosition.z);
        
        // Create star (scaled to actual size from data)
        const starRadius = planetProps.starDiameter * 0.5; // Convert diameter to radius
        const starGeometry = new THREE.SphereGeometry(starRadius, 32, 32);
        const starMaterial = new THREE.MeshBasicMaterial({ 
          color: planetProps.starColor,
          emissive: planetProps.starColor,
          emissiveIntensity: 0.3,
          transparent: true
        });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(0, 0, 0); // Star at center of system
        systemGroup.add(star);
        
        // Create point light for this star
        const pointLight = new THREE.PointLight(planetProps.starColor, 2, planetProps.planetDistance * 3);
        pointLight.position.set(0, 0, 0);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        pointLight.shadow.camera.near = 0.1;
        pointLight.shadow.camera.far = planetProps.planetDistance * 2;
        systemGroup.add(pointLight);

        // Create planet
        const planetGeometry = new THREE.SphereGeometry(planetProps.planetDiameter / 2, 32, 32);
        const planetMaterial = new THREE.MeshPhongMaterial({ 
          color: planetProps.planetColor,
          shininess: 60,
          specular: 0x222222,
          transparent: true
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.castShadow = true;
        planet.receiveShadow = true;
        planet.userData = { planetParams: planetProps };
        systemGroup.add(planet);

        // Create orbit ring
        const orbitGeometry = new THREE.RingGeometry(
          planetProps.planetDistance - 0.02, 
          planetProps.planetDistance + 0.02, 
          128
        );
        const orbitMaterial = new THREE.MeshBasicMaterial({ 
          color: planetProps.planetColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.2
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        orbit.position.set(0, 0, 0);
        orbit.userData = { originalOpacity: 0.2 };
        systemGroup.add(orbit);
        
        scene.add(systemGroup);

        planetSystemsRef.current.push({
          planetMesh: planet,
          starMesh: star,
          orbit: orbit,
          systemGroup: systemGroup,
          params: planetProps
        });
      }
    });

    // Update system positions (all systems are centered at origin)
    planetSystemsRef.current.forEach((systemRef, index) => {
      const systemPosition = getSystemPosition(index, planets.length);
      systemRef.systemGroup.position.set(systemPosition.x, systemPosition.y, systemPosition.z);
    });

    // Update camera position with smooth transition
    if (cameraRef.current) {
      const [camX, camY, camZ] = getCameraPosition();
      const newPosition = new THREE.Vector3(camX, camY, camZ);
      
      // Start camera transition if position changed significantly
      const currentPosition = cameraRef.current.position;
      const distance = currentPosition.distanceTo(newPosition);
      
      if (distance > 0.1) { // Lower threshold to ensure transitions between focus states
        cameraTransitionRef.current = {
          isTransitioning: true,
          startPosition: currentPosition.clone(),
          targetPosition: newPosition,
          progress: 0
        };
      } else {
        // Small movement, no transition needed
        cameraRef.current.position.copy(newPosition);
        cameraRef.current.lookAt(0, 0, 0);
      }
    }

  }, [planets, focusedPlanet]);

  const handleInfoClick = () => {
    if (showPopover) {
      onPlanetInfoSelect(null);
    } else {
      setShowPopover(true);
    }
  };

  // Handle planet mesh clicks and hover (removed dependency on planets to prevent unnecessary re-binding)
  useEffect(() => {
    if (!mountRef.current || !rendererRef.current) return;

    const handleClick = (event: MouseEvent) => {
      const rect = mountRef.current!.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current!);

      const planetMeshes = planetSystemsRef.current.map(p => p.planetMesh);
      const intersects = raycaster.intersectObjects(planetMeshes);

      if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object as THREE.Mesh;
        const planetInfo = clickedPlanet.userData.planetParams as PlanetVisualizationParams;
        // Focus on the clicked planet
        onPlanetFocus(planetInfo.kepoi_name);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Update mouse position for continuous hover detection
      const rect = mountRef.current!.getBoundingClientRect();
      currentMouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      currentMouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Empty dependency array to prevent re-binding

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Clear focus button */}
      {focusedPlanet && (
        <button
          className="absolute top-4 left-4 px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors"
          onClick={() => onPlanetFocus(null)}
        >
          Show All Systems
        </button>
      )}
      
      {/* Floating planet info popover */}
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <button
            className="absolute top-4 right-4 px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            onClick={handleInfoClick}
          >
            Planet Info
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-gray-900 border-gray-700">
          <div className="space-y-2">
            {selectedPlanetInfo ? (
              <>
                <h3 className="text-white">{selectedPlanetInfo.display_name}</h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>KOI ID: {selectedPlanetInfo.kepoi_name}</p>
                  <p>Orbital Distance: {selectedPlanetInfo.planetDistance.toFixed(3)} AU</p>
                  <p>Orbital Period: {selectedPlanetInfo.planetOrbitalPeriod.toFixed(1)} days</p>
                  <p>Planet Radius: {selectedPlanetInfo.planetDiameter.toFixed(2)} R⊕</p>
                  <p>Stellar Radius: {selectedPlanetInfo.starDiameter.toFixed(2)} R☉</p>
                  <p className="text-blue-400 text-xs">🌍 Orbital speed proportional to actual period</p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-white">Planetary Systems</h3>
                <div className="p-3 rounded-lg bg-gray-800 border border-gray-600">
                  <p className="text-gray-300">
                    {planets.length > 0 
                      ? `Currently displaying ${planets.length} planetary system${planets.length > 1 ? 's' : ''}. Click on a planet to focus on its system.`
                      : 'No planets currently selected. Choose planets from the database to visualize their orbital systems.'
                    }
                  </p>
                  {focusedPlanet && (
                    <div className="mt-3 p-2 rounded bg-blue-900/50 border border-blue-500/50">
                      <p className="text-blue-200 text-sm">
                        🔍 Focused on {planets.find(p => p.kepoi_name === focusedPlanet)?.display_name || focusedPlanet}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};