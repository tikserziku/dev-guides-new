import subprocess
import sys

def install_dependencies():
    """Install required Python packages"""
    requirements = [
        'colorama',
        'gitpython'
    ]
    
    print("Installing required packages...")
    
    for package in requirements:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"Successfully installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"Error installing {package}: {e}")
            return False
    
    print("\nAll dependencies installed successfully!")
    return True

if __name__ == "__main__":
    install_dependencies()