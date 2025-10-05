import math
import pandas as pd

# Creates planet object based on passed in .csv information

class Exoplanet:
    habitable: bool
    size: float
    environment: str


    def __init__(self, habitable: bool, size: float, atmosphere: str):
        self.habitable = habitable
        self.size = size
        self.atmosphere = atmosphere

    def set_habitable(self, habitable):
        self.habitable = habitable
    
    def set_size(self, size):
        self.size = size

    def set_environment(self, environment):
        self.environment = environment
        
    def get_habitable(self):
        return self.habitable
    
    def get_size(self):
        return self.size
    
    def get_environment(self):
        return self.environment

class Planet:

    def __init__(self, csv_row):
        self.row = csv_row

    def get_habitable(self):
        """
        Determines whether a planet is potentially habitable based on
        NASA Kepler 'cumulative' table columns.

        Output: Boolean — True if potentially habitable, False otherwise.
        """

        row = self.row

        # Extract key attributes with fallback defaults
        koi_teq = row.get("koi_teq", 288)      # equilibrium temp (K)
        koi_prad = row.get("koi_prad", 1.0)    # radius (Earth radii)
        koi_insol = row.get("koi_insol", 1.0)  # insolation (Earth flux)
        koi_steff = row.get("koi_steff", 5778) # star temp (K)

        # Handle NaN values
        if pd.isna(koi_teq): koi_teq = 288
        if pd.isna(koi_prad): koi_prad = 1.0
        if pd.isna(koi_insol): koi_insol = 1.0
        if pd.isna(koi_steff): koi_steff = 5778

        # Approximate planet mass using radius^3.7 (rough Earth-like scaling)
        pl_bmasse = koi_prad ** 3.7

        # --- 1. Temperature check (liquid water range) ---
        if koi_teq < 240 or koi_teq > 320:
            return False

        # --- 2. Size and mass check ---
        if not (0.5 <= koi_prad <= 1.8):
            return False
        if not (0.3 <= pl_bmasse <= 5.0):
            return False

        # --- 3. Stellar energy flux ---
        # Earth insolation = 1.0; habitable range roughly 0.35–1.75
        if not (0.35 <= koi_insol <= 1.75):
            return False

        # --- 4. Stellar temperature check ---
        # Prefer F, G, or K stars (3700–7200 K)
        if not (3700 <= koi_steff <= 7200):
            return False

        # All conditions passed → potentially habitable
        return True

    def get_environment(self):
        """
        Classify an exoplanet's environment into one of 9 concise types 
        using planetary and stellar properties.

        Parameters
        ----------
        row : dict or pandas.Series
            Planetary and stellar parameters:
            - koi_teq : equilibrium temperature (K)
            - koi_prad : planet radius (Earth radii)
            - pl_bmasse : planet mass (Earth masses)

        Returns
        -------
        str: environment type
            Rocky planets
                Frozen rocky — small, cold, rocky planets
                Earth-like — small, temperate, rocky planets
                Hot rocky — small, hot, rocky planets
            Mini-Neptunes
                Cold Mini-Neptune — intermediate size, cold
                Temperate Mini-Neptune — intermediate size, temperate
                Hot Mini-Neptune — intermediate size, hot
            Gas and Ice Giants
                Ice Giant — large/giant, cold
                Gas Giant — large/giant, temperate
                Hot Jupiter — large/giant, hot
            Unclassified — any planet that doesn’t fit the above thresholds (rare or extreme/missing data)
        """
        row = self.row

        # --- Extract values with defaults ---
        # Radius in Earth radii
        pl_rade = row.get("koi_prad", 1.0)
        pl_rade = float(pl_rade) if not pd.isna(pl_rade) else 1.0

        # Equilibrium temperature in K
        pl_eqt = row.get("koi_teq", 288)
        pl_eqt = float(pl_eqt) if not pd.isna(pl_eqt) else 288

        # Mass in Earth masses
        pl_bmasse = row.get("pl_bmasse", None)
        if pl_bmasse is None or pd.isna(pl_bmasse):
            # Estimate mass from radius
            if pl_rade < 1.8:
                # Rocky planet approximation: M ~ R^3
                pl_bmasse = pl_rade ** 3
            elif pl_rade < 3.5:
                # Mini-Neptune approximation: M ~ R^2.06
                pl_bmasse = pl_rade ** 2.06
            else:
                # Giant planets: default mass
                pl_bmasse = 10.0
        else:
            pl_bmasse = float(pl_bmasse)

        # --- Planet type by size and mass ---
        if pl_rade < 1.8 and pl_bmasse < 5:
            planet_type = "Rocky"
        elif 1.8 <= pl_rade < 3.5:
            planet_type = "Mini-Neptune"
        elif pl_rade >= 3.5 or pl_bmasse >= 10:
            planet_type = "Giant"
        else:
            planet_type = "Unclassified"

        # --- Thermal class based on equilibrium temperature ---
        if pl_eqt < 180:
            temp_class = "Cold"
        elif pl_eqt <= 320:
            temp_class = "Temperate"
        else:
            temp_class = "Hot"

        # --- Combine into concise environment classes ---
        if planet_type == "Rocky":
            if temp_class == "Cold":
                env = "Frozen rocky"
            elif temp_class == "Temperate":
                env = "Earth-like"
            else:
                env = "Hot rocky"
        elif planet_type == "Mini-Neptune":
            if temp_class == "Cold":
                env = "Cold Mini-Neptune"
            elif temp_class == "Temperate":
                env = "Temperate Mini-Neptune"
            else:
                env = "Hot Mini-Neptune"
        elif planet_type == "Giant":
            if temp_class == "Cold":
                env = "Ice Giant"
            elif temp_class == "Temperate":
                env = "Gas Giant"
            else:
                env = "Hot Jupiter"
        else:
            env = "Unclassified"

        return env
    
    def __str__(self):
        planet_name = self.row.get("kepler_name", "Unknown planet")
        return f"{planet_name}: Habitable? {self.get_habitable()}"

df = pd.read_csv("cumulative_2025.10.04_13.06.32.csv")
first_planet = df.iloc[0]

planet = Planet(first_planet)
print(planet)

print("testing get_environment: \n")
for i in range(3):
    row_dict = df.iloc[i].to_dict()
    planet = Planet(row_dict)
    env = planet.get_environment()
    print(f"Row {i+1}: {env}")


