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




