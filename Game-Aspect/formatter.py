import json;
from pathlib import Path;

def format_to_json(exoplanet, lifeform, output_path = "planet_profile.json"):
    """
    Takes Exoplanet and Lifeform objects and formats a JSON containing:
    - text description
    - parameters
    - optional placeholder images
    """

    # --- Build Text Description -- #
    if exoplanet.habitable:
        habitability_text = "This planet is habitable and may support life"
        life_text = (
            f"Lifeform: {lifeform.lifeform}\n"
            f"Size: {lifeform.size}\n"
            f"Strength: {lifeform.strength}\n"
            f"Coloration: {lifeform.coloration}\n"
            f"Migration pattern: {lifeform.migration}\n"
            f"Radiation shielding: {'Yes' if lifeform.radiationSheilding else 'No'}\n"
            f"Breathing method: {lifeform.breathingMethod}\n"
            f"Locomotion: {lifeform.locomotion}\n"
            f"Communication method: {lifeform.communicationMethod}\n"
            f"Diet: {lifeform.diet}"
        )
    else:
        habitability_text = "This planet is not habitable."
        life_text = "No known lifeforms."
    
    description = f"{habitability_text}\n\n{life_text}"


     # --- Construct JSON dictionary --- #
    data = {
        "text_description": description,
      #  "images": {
       #     "planet": planet_image,
        #    "lifeform": lifeform_image
        #},
        "parameters": {
            "exoplanet": {
                "habitable": exoplanet.habitable
            },
            "lifeform": {
                "lifeform": lifeform.lifeform if exoplanet.habitable else None,
                "size": lifeform.size if exoplanet.habitable else None,
                "strength": lifeform.strength if exoplanet.habitable else None,
                "coloration": lifeform.coloration if exoplanet.habitable else None,
                "migration": lifeform.migration if exoplanet.habitable else None,
                "radiationSheilding": lifeform.radiationSheilding if exoplanet.habitable else None,
                "breathingMethod": lifeform.breathingMethod if exoplanet.habitable else None,
                "locomotion": lifeform.locomotion if exoplanet.habitable else None,
                "communicationMethod": lifeform.communicationMethod if exoplanet.habitable else None,
                "diet": lifeform.diet if exoplanet.habitable else None
            }
        }
    }

    # --- Save JSON to file ---
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(data, f, indent=4)

    return data
