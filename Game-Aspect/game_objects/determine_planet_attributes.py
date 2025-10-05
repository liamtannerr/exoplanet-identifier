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

