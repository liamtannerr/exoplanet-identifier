## Script that accepts kepler ID and runs caluculations to generate the habitability for a known exoplanet
import csv

keplerID = "10156110"

def read_csv_row(keplerID) -> dict:
    row_inf = {}

    with open("C:/Users/yasmi/OneDrive/Desktop/UvicDesktop/NASA Hackathon/exoplanet-identifier/Game-Aspect/game_objects/cumulative_2025.10.04_13.06.32.csv", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            if row["kepid"] == keplerID:
                row_inf = row
                return row_inf
                

# def create_lifeform() -> 

# Planet specific, returns true or false
# def determine_habitable(keplerID):
def main() -> None:
    planet_info = {}

    planet_info = read_csv_row(keplerID) 
    
    print(planet_info)

main()