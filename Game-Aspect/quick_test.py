import pandas as pd
from formatter import format_to_json
from game_objects.determine_lifeform import Lifeform
from game_objects.determine_planet_attributes import Planet


df = pd.read_csv("cumulative_2025.10.04_13.06.32.csv")
row_dict = df.iloc[331].to_dict()
planet = Planet(row_dict)
print(planet.get_habitable())
print(planet.get_environment())
lifeform = Lifeform(row_dict)

format_to_json(planet, lifeform)
