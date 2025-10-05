import json
import tempfile
import pytest
from formatter import format_to_json

# --- Mock objects for testing ---
class Exoplanet:
    def __init__(self, habitable):
        self.habitable = habitable

class Lifeform:
    def __init__(self, lifeform, size, strength, coloration, migration, radiationSheilding,
                 breathingMethod, locomotion, communicationMethod, diet):
        self.lifeform = lifeform
        self.size = size
        self.strength = strength
        self.coloration = coloration
        self.migration = migration
        self.radiationSheilding = radiationSheilding
        self.breathingMethod = breathingMethod
        self.locomotion = locomotion
        self.communicationMethod = communicationMethod
        self.diet = diet

# --- Helper to create a sample lifeform ---
def sample_lifeform():
    return Lifeform(
        lifeform="Amphibious",
        size=2.5,
        strength=5.0,
        coloration="Blue-green",
        migration="Nomadic",
        radiationSheilding=True,
        breathingMethod="Photosynthetic",
        locomotion="Slithering",
        communicationMethod="Bioluminescent pulses",
        diet="Mineral absorption"
    )

# --- Test cases ---

def test_habitable_planet_creates_correct_json():
    exoplanet = Exoplanet(habitable=True)
    lifeform = sample_lifeform()

    with tempfile.NamedTemporaryFile(suffix=".json") as temp_file:
        data = format_to_json(exoplanet, lifeform, output_path=temp_file.name)
        
        # File keys
        assert "text_description" in data
        assert "parameters" in data

        # Planet parameters
        assert data["parameters"]["exoplanet"]["habitable"] is True

        # Lifeform parameters
        life_params = data["parameters"]["lifeform"]
        assert life_params["lifeform"] == "Amphibious"
        assert life_params["size"] == 2.5
        assert life_params["radiationSheilding"] is True



def test_uninhabitable_planet_sets_lifeform_none():
    exoplanet = Exoplanet(habitable=False)
    lifeform = sample_lifeform()  # lifeform object exists, but planet not habitable

    with tempfile.NamedTemporaryFile(suffix=".json") as temp_file:
        data = format_to_json(exoplanet, lifeform, output_path=temp_file.name)

        # Planet habitable is False
        assert data["parameters"]["exoplanet"]["habitable"] is False

        # All lifeform fields should be None
        life_params = data["parameters"]["lifeform"]
        for key, val in life_params.items():
            assert val is None

        # Text description should mention planet is not habitable
        assert "not habitable" in data["text_description"]


def test_json_file_is_created_and_readable():
    exoplanet = Exoplanet(habitable=True)
    lifeform = sample_lifeform()

    with tempfile.NamedTemporaryFile(suffix=".json") as temp_file:
        path = temp_file.name
        format_to_json(exoplanet, lifeform, output_path=path)

        # Try opening the file
        with open(path) as f:
            loaded = json.load(f)

        # Should contain keys
        assert "text_description" in loaded
        assert "parameters" in loaded
