import math
import pandas as pd
# # Creates planet object based on passed in .csv information

# class Exoplanet:
#     habitable: bool
#     size: float
#     environment: str


#     def __init__(self, habitable: bool, size: float, atmosphere: str):
#         self.habitable = habitable
#         self.size = size
#         self.atmosphere = atmosphere

#     def set_habitable(self, habitable):
#         self.habitable = habitable
    
#     def set_size(self, size):
#         self.size = size

#     def set_environment(self, environment):
#         self.environment = environment
        

#     def get_habitable(self):
#         return self.habitable
    
#     def get_size(self):
#         return self.size
    
#     def get_environment(self):
#         return self.environment



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

    def __str__(self):
        planet_name = self.row.get("kepler_name", "Unknown planet")
        return f"{planet_name}: Habitable? {self.get_habitable()}"


# --- Example Usage ---
df = pd.read_csv("cumulative_2025.10.04_13.06.32.csv")
first_planet = df.iloc[0]

planet = Planet(first_planet)
print(planet)

