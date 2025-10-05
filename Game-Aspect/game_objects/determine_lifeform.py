import pandas as pd
import math

class Lifeform:

    def __init__(self, csv_row, base_size=2.0, environment="terrestrial"):
        self.row = csv_row
        self._base_size = base_size
        self._environment = environment

    # --- Getters and Setters ---
    def get_base_size(self):
        return self._base_size

    def set_base_size(self, value):
        if value > 0:
            self._base_size = value
        else:
            raise ValueError("Base size must be positive.")

    def get_environment(self):
        return self._environment

    def set_environment(self, value):
        self._environment = value

    # --- Lifeform Attribute Methods ---
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

        return (r, g, b)

    def get_radiation_shielding(self):
        """
        Estimate radiation shielding needed in Sieverts equivalent protection.
        """
        row = self.row
        insolation = row.get("koi_insol", 1.0)
        star_temp = row.get("koi_steff", 5500)

        if pd.isna(insolation): insolation = 1.0
        if pd.isna(star_temp): star_temp = 5500

        # Approx radiation exposure model
        radiation_msv = (insolation * (star_temp / 5800)) * 0.5
        sieverts = radiation_msv / 1000  # convert mSv to Sv
        return round(sieverts, 6)

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

    def __str__(self):
        planet_name = self.row.get("kepler_name", "Unknown planet")
        return (f"Lifeform on {planet_name}:\n"
                f"  Size: {self.get_size():.2f} m\n"
                f"  Color (RGB): {self.get_color()}\n"
                f"  Radiation Shielding: {self.get_radiation_shielding()} Sv\n"
                f"  Communication: {self.get_communication_method()}\n"
                f"  Diet: {self.get_diet()}")

# --- Example usage ---
df = pd.read_csv("cumulative_2025.10.04_13.06.32.csv")
first_planet = df.iloc[0]

creature = Lifeform(first_planet, base_size=2.0, environment="aquatic")
print(creature)
