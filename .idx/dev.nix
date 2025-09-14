{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # Or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    # Add packages here to use them in your workspace.
    pkgs.python311 
  ];
  # Sets environment variables in the workspace
  env = {};
}
