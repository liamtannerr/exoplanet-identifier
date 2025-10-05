import pandas as pd
import numpy as np
import math

class Lifeform:

    size: float
    color:str
    communication: str
    diet: str
    environment: str

    def __init__(self, csv_row, size, color, communication, diet, environment, base_size=2.0):
        self.row = csv_row
        self._base_size = base_size
        self._environment = environment
        self._size = size
        self._color = color
        self._communication = communication
        self._diet = diet

    # --- Getters and Setters ---
    
    def set_size(self, size):
        self.size = size

    def set_environment(self, environment):
        self.environment = environment

    def set_color(self, color):
        self.color = color

    def set_communication(self, communication):
        self.communication = communication

    def set_diet(self, diet):
        self.diet = diet

    def set_base_size(self, value):
        if value > 0:
            self._base_size = value
        else:
            raise ValueError("Base size must be positive.")


    # --- Lifeform Attribute Methods ---

    def get_base_size(self):
        return self._base_size

    def get_size(self):
        """
        Estimate lifeform size using planet radius, temperature, and insolation.
        """
        row = self.row
        planet_radius = row.get("koi_prad", 1.0)
        planet_temp = row.get("koi_teq", 288.0)
        stellar_energy = row.get("koi_insol", 1.0)

        # Replace NaNs with defaults
        if pd.isna(planet_radius): planet_radius = 1.0
        if pd.isna(planet_temp): planet_temp = 288.0
        if pd.isna(stellar_energy): stellar_energy = 1.0

        # Gravity factor approximation
        gravity_factor = (1 / planet_radius) ** 0.5

        # Temperature factor — cooler planets → smaller, slower life
        temp_factor = (288 / planet_temp) ** 0.3

        # Stellar energy affects available biomass
        energy_factor = math.log10(stellar_energy + 1) * 0.8 + 0.6

        # Environment adjustment
        env_factor = {
            "aquatic": 1.3,
            "forest": 1.0,
            "desert": 0.8,
            "terrestrial": 1.0
        }.get(self._environment, 1.0)

        size = self._base_size * gravity_factor * temp_factor * env_factor * energy_factor
        return max(size, 0.1)

    def get_color(self):
        """
        Generate a color based on stellar temperature and insolation.
        """
        row = self.row
        star_temp = row.get("koi_steff", 5500)
        insolation = row.get("koi_insol", 1.0)

        if pd.isna(star_temp): star_temp = 5500
        if pd.isna(insolation): insolation = 1.0

        r = int(min(max((star_temp - 3000) / 4000 * 255, 0), 255))
        g = int(min(max((1 / (insolation + 1)) * 200, 0), 255))
        b = int(min(max((insolation / 2) * 100, 0), 255))

        return str((r, g, b))

    def get_communication_method(self):
        """
        Determine communication method based on environment and planet temp.
        """
        temp = self.row.get("koi_teq", 288)
        size = self.get_size()

        if self._environment == "aquatic":
            return "sonar or pressure waves"
        elif temp > 350:
            return "electromagnetic or chemical signals"
        elif size > 3:
            return "low-frequency sound"
        else:
            return "vocal communication"

    def get_diet(self):
        """
        Infer diet type from temperature and energy availability.
        """
        temp = self.row.get("koi_teq", 288)
        insol = self.row.get("koi_insol", 1.0)
        size = self.get_size()

        if self._environment == "aquatic":
            if size > 3:
                return "omnivore"
            else:
                return "herbivore"
        elif insol > 2:
            return "carnivore"
        elif temp < 250:
            return "herbivore"
        else:
            return "omnivore"

    def get_environment(self):
        """
        Determines the most likely environment type of the planet
        using only attributes from the Kepler cumulative dataset.

        Uses:
            - koi_teq: Equilibrium temperature (K)
            - koi_prad: Planetary radius (Earth radii)
            - koi_insol: Stellar flux relative to Earth
        """

        # Safely extract relevant attributes
        teq = self.row.get('koi_teq', np.nan)
        prad = self.row.get('koi_prad', np.nan)
        insol = self.row.get('koi_insol', np.nan)

        # Handle missing or NaN data
        if np.isnan(teq) or np.isnan(prad) or np.isnan(insol):
            self.environment = 'unknown'
            return self.environment

        # Volcanic / molten world — very high surface temp
        if teq >= 700:
            self.environment = 'volcanic'

        # Gas giant — large radius, low or moderate temp
        elif prad > 3.0:
            self.environment = 'gas_giant'

        # Ice world — low temp or low insolation
        elif teq <= 200 or insol < 0.1:
            self.environment = 'ice'

        # Desert world — hot and high solar flux
        elif teq > 320 or insol > 2.0:
            self.environment = 'desert'

        # Aquatic world — medium-large, temperate zone
        elif 1.5 <= prad <= 3.0 and 200 < teq < 320:
            self.environment = 'aquatic'

        # Earth-like terrestrial world — small and temperate
        elif prad < 1.5 and 200 < teq < 320:
            self.environment = 'terrestrial'

        else:
            self.environment = 'unknown'

        return self.environment

    def __str__(self):
        planet_name = self.row.get("kepler_name", "Unknown planet")
        return (f"Lifeform on {planet_name}:\n"
                f"  Size: {self.get_size():.2f} m\n"
                f"  Color (RGB): {self.get_color()}\n"
                f"  Environment: {self.get_environment()}\n"
                f"  Communication: {self.get_communication_method()}\n"
                f"  Diet: {self.get_diet()}")

# --- Example usage ---
df = pd.read_csv("cumulative_2025.10.04_13.06.32.csv")
first_planet = df.iloc[0]

creature = Lifeform(first_planet, 0, str((0,0,0)), "None", "None", 0)
print(creature)
