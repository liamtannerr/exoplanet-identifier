<<<<<<< Updated upstream
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
=======
import math
import pandas as pd

class Planet:

    def __init__(self, csv_row):
        self.row = csv_row

    def get_habitable(self):
        """
        Determines whether a planet is potentially habitable based on
        data from the NASA Exoplanet Archive 'cumulative' table.
    
        Output: Boolean value — True if habitable, False otherwise.

        Evaluate habitability using key factors:
        - Surface temperature (pl_eqt)
        - Planet radius (pl_rade)
        - Planet mass (pl_bmasse)
        - Stellar flux (st_lum)
        - Orbital distance (pl_orbsmax)
        - Stellar temperature (st_teff)
        """
        row = self.row

        # Default values if data missing
        pl_eqt = row.get("pl_eqt", 288) or 288        # K
        pl_rade = row.get("pl_rade", 1.0) or 1.0      # Earth radii
        pl_bmasse = row.get("pl_bmasse", 1.0) or 1.0  # Earth masses
        st_lum = row.get("st_lum", 1.0) or 1.0        # Stellar luminosity (Solar)
        pl_orbsmax = row.get("pl_orbsmax", 1.0) or 1.0 # Orbital distance (AU)
        st_teff = row.get("st_teff", 5778) or 5778     # K

        # 1. Temperature check
        # Liquid water range (roughly)
        if pl_eqt < 240 or pl_eqt > 320:
            return False

        # 2. Size and mass check
        # Must be roughly Earth-like
        if not (0.5 <= pl_rade <= 1.8):
            return False
        if not (0.3 <= pl_bmasse <= 5.0):
            return False

        # 3. Stellar radiation balance
        # Approximate habitable flux range (Earth = 1.0)
        # Using inverse-square law for luminosity
        flux = st_lum / (pl_orbsmax ** 2)
        if not (0.35 <= flux <= 1.75):
            return False

        # 4. Stellar temperature range
        # F, G, K-type stars preferred for stable habitable zones
        if not (3700 <= st_teff <= 7200):
            return False

        # If all checks passed:
        return True
    
    def __str__(self):
        return (f"  Habitable?: {self.get_habitable()}\n")
    
df = pd.read_csv("cumulative_2025.10.04_13.06.32.csv")
first_planet = df.iloc[0]

planet = Planet(first_planet)
print(planet)
>>>>>>> Stashed changes

