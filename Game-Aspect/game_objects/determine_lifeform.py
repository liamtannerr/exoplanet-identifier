import pandas as pd


class Lifeform: 

    def __init__(self, csv_row, base_size=2.0, environment="terrestrial"):
        self.row = csv_row
        self.base_size = base_size
        self.environment = environment

    def get_base_size(self):
        return self.get_base_size
    
    def get_environment(self):
        return self._environment
    
    def set_environment(self, value):
        self._environment = value

    def set_base_size(self, value):
        if value > 0:
            self._base_size = value
        else:
            raise ValueError("Base size must be positive.")
        

    def get_size(self):
        """
        Calculate estimated lifeform size 
        Uses:
            - pl_bmasse: Planet mass (Earth masses)
            - pl_rade: Planet radius (Earth radii)
            - pl_eqt: Planet equilibrium temperature (K)
        """
        row = self.row

        # Extract CSV attributes (with defaults if missing)
        planet_mass = row["pl_bmasse"] if not pd.isna(row.get("pl_bmasse")) else 1.0
        planet_radius = row["pl_rade"] if not pd.isna(row.get("pl_rade")) else 1.0
        planet_temp = row["pl_eqt"] if not pd.isna(row.get("pl_eqt")) else 288.0

        # Gravity effect (relative to Earth)
        gravity = planet_mass / (planet_radius ** 2)
        gravity_factor = (1 / gravity) ** 0.5

        # Temperature effect
        temp_factor = (288 / planet_temp) ** 0.3  # 288K ~ Earth ideal temp

        # Environment effect
        env_factor = {
            "aquatic": 1.2,
            "forest": 0.9,
            "desert": 0.95,
            "terrestrial": 1.0
        }.get(self.environment, 1.0)

        # Final lifeform size
        size = self.base_size * gravity_factor * temp_factor * env_factor
        return max(size, 0.1)  # ensure positive 
      
    def get_color(self): 

        """
        Generate a color for the lifeform based on CSV attributes.
        Uses:
            - pl_eqt (planet temperature) → red channel
            - pl_bmasse (planet mass) → green channel
            - pl_rade (planet radius) → blue channel
        Returns:
            tuple: (R, G, B) with values 0-255
        """
        row = self.row

        # Map CSV values to 0-255 RGB range
        temp = row["pl_eqt"] if not pd.isna(row.get("pl_eqt")) else 288
        mass = row["pl_bmasse"] if not pd.isna(row.get("pl_bmasse")) else 1.0
        radius = row["pl_rade"] if not pd.isna(row.get("pl_rade")) else 1.0

        # Normalize values (rough min/max from exoplanet table)
        r = int(min(max((temp - 100) / 1000 * 255, 0), 255))
        g = int(min(max((mass - 0.1) / 10 * 255, 0), 255))
        b = int(min(max((radius - 0.1) / 20 * 255, 0), 255))

        return (r, g, b)

 
    def get_communication_method(self):
        """
        Determine probable communication method for lifeform based on CSV attributes.
        """
        row = self.row
        planet_temp = row["pl_eqt"] if not pd.isna(row.get("pl_eqt")) else 288
        planet_mass = row["pl_bmasse"] if not pd.isna(row.get("pl_bmasse")) else 1.0
        planet_radius = row["pl_rade"] if not pd.isna(row.get("pl_rade")) else 1.0

        size = self.get_size()

        # Determine communication method based on environment and planetary conditions
        if self.environment == "aquatic":
            method = "sonar or pressure waves"
        elif self.environment == "forest":
            if size > 5:
                method = "low-frequency calls"
            else:
                method = "vocal or visual signals"
        elif self.environment == "desert":
            method = "vibrations or visual signals"
        else:  # terrestrial default
            if planet_temp > 350:
                method = "electromagnetic or chemical signals"
            elif size > 3:
                method = "low-frequency sound"
            else:
                method = "vocal communication"

        return method

    def get_diet(self):
        """
        Estimate lifeform diet based on CSV attributes and environment.
        Returns:
            str: diet type ("herbivore", "carnivore", "omnivore")
        """
        row = self.row
        planet_temp = row["pl_eqt"] if not pd.isna(row.get("pl_eqt")) else 288
        size = self.get_size()

        # Basic rules:
        # Large lifeforms on nutrient-rich planets → carnivore or omnivore
        # Small lifeforms or harsh environments → herbivore
        if self.environment == "aquatic":
            if size > 3:
                diet = "omnivore"
            else:
                diet = "herbivore"
        elif self.environment == "forest":
            if size > 5:
                diet = "carnivore"
            else:
                diet = "omnivore"
        elif self.environment == "desert":
            diet = "herbivore" if planet_temp > 350 else "omnivore"
        else:  # terrestrial default
            if size > 4:
                diet = "omnivore"
            else:
                diet = "herbivore"

        return diet

    def __str__(self):
        planet_name = self.row.get("pl_name", "Unknown planet")
        return (f"Lifeform on {planet_name}:\n"
                f"  Size: {self.get_size():.2f} m\n"
                f"  Color: {self.get_color()}\n"
                f"  Communication method: {self.get_communication_method()}\n"
                f"  Diet: {self.get_diet()}")


df = pd.read_csv("cumulative_2025.10.04_13.06.32.csv")
first_planet = df.iloc[0]

creature = Lifeform(first_planet)
print(creature)
