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
    if exoplanet.get_habitable():
        habitability_text = "This planet is habitable and may support life"
        environment_text = exoplanet.get_environment() if exoplanet.get_habitable() else None
        life_text = (
        #    f"Lifeform: {lifeform.lifeform}\n"
            f"Size: {lifeform.get_base_size()}\n"
        #    f"Strength: {lifeform.strength}\n"
            f"Coloration: {lifeform.get_color()}\n"
        #    f"Migration pattern: {lifeform.migration}\n"
        #    f"Radiation shielding: {'Yes' if lifeform.radiationSheilding else 'No'}\n"
        #    f"Breathing method: {lifeform.breathingMethod}\n"
        #    f"Locomotion: {lifeform.locomotion}\n"
            f"Environment: {lifeform.get_environment()}"
            f"Communication method: {lifeform.get_communication_method()}\n"
            f"Diet: {lifeform.get_diet()}"
        )
    else:
        habitability_text = "This planet is not habitable."
        life_text = "No known lifeforms."
    
    description = f"{environment_text if exoplanet.get_habitable() else None}\n\n{habitability_text}\n\n{life_text}"


     # --- Construct JSON dictionary --- #
    data = {
        "text_description": description,
      #  "images": {
       #     "planet": planet_image,
        #    "lifeform": lifeform_image
        #},
        "parameters": {
            "exoplanet": {
                "habitable": exoplanet.get_habitable(),
                "environment": exoplanet.get_environment()
            },
            "lifeform": {
                #"lifeform": lifeform.lifeform if exoplanet.habitable else None,
                "size": lifeform.get_base_size() if exoplanet.get_habitable() else None,
                #"strength": lifeform.strength if exoplanet.habitable else None,
                "coloration": lifeform.get_color() if exoplanet.get_habitable() else None,
                #"migration": lifeform.migration if exoplanet.habitable else None,
                #"radiationSheilding": lifeform.radiationSheilding if exoplanet.habitable else None,
                #"breathingMethod": lifeform.breathingMethod if exoplanet.habitable else None,
                #"locomotion": lifeform.locomotion if exoplanet.habitable else None,
                "environment": lifeform.get_environment() if exoplanet.get_habitable() else None,
                "communicationMethod": lifeform.get_communication_method() if exoplanet.get_habitable() else None,
                "diet": lifeform.get_diet() if exoplanet.get_habitable() else None
            }
        }
    }

    # --- Save JSON to file ---
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(data, f, indent=4)

    return data
