{
  description = "Exoplanet Identifier";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            python312Packages.fastapi
            python312Packages.uvicorn
            python312Packages.pandas
            python312Packages.pydantic
            python312Packages.joblib
            python312Packages.scikit-learn
            nodejs_20
          ];
        };
      }
    );
}
