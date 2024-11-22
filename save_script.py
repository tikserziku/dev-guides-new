import os

def save_scan_script():
    script_content = '''import subprocess
import os
import json
from datetime import datetime
import git

def run_git_command(path, command):
    """Execute git command and return output"""
    try:
        full_command = f'cd "{path}" && git {command}'
        result = subprocess.run(["powershell", "-Command", full_command],
                              capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception as e:
        print(f"Error executing git command: {e}")
        return None

def get_git_info(path):
    """Get Git repository information"""
    git_info = {}
    try:
        repo = git.Repo(path)
        
        # Get current branch
        git_info['current_branch'] = repo.active_branch.name
        
        # Get last commit
        last_commit = repo.head.commit
        git_info['last_commit'] = last_commit.hexsha
        git_info['last_commit_message'] = last_commit.message
        git_info['last_commit_date'] = datetime.fromtimestamp(last_commit.committed_date).strftime('%Y-%m-%d %H:%M:%S')
        
        # Get remote URL
        if repo.remotes:
            git_info['remote_url'] = repo.remotes.origin.url
        
        # Get list of branches
        git_info['remote_branches'] = [ref.name for ref in repo.remote().refs]
        
        # Get status (modified files)
        git_info['modified_files'] = [item.a_path for item in repo.index.diff(None)]
            
    except Exception as e:
        print(f"Error getting git info: {e}")
    
    return git_info

def scan_directory(path):
    """Scan directory and return file structure with git information"""
    structure = {}
    try:
        # Using PowerShell to get directory structure
        ps_command = f'Get-ChildItem -Path "{path}" -Recurse | Select-Object FullName, Length, LastWriteTime | ConvertTo-Json'
        result = subprocess.run(["powershell", "-Command", ps_command], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            items = json.loads(result.stdout)
            # Convert to list if single item
            if isinstance(items, dict):
                items = [items]
                
            for item in items:
                full_path = item['FullName']
                relative_path = os.path.relpath(full_path, path)
                structure[relative_path] = {
                    'size': item['Length'],
                    'last_modified': item['LastWriteTime']
                }
                
                # Get git blame info for files (not directories)
                if os.path.isfile(full_path):
                    try:
                        repo = git.Repo(path)
                        blame = repo.blame('HEAD', relative_path)
                        structure[relative_path]['git_blame'] = [
                            {
                                'commit': b[0].hexsha,
                                'author': b[0].author.name,
                                'date': datetime.fromtimestamp(b[0].committed_date).strftime('%Y-%m-%d %H:%M:%S')
                            }
                            for b in blame
                        ]
                    except Exception as e:
                        # Skip git blame if file is not tracked or other issues
                        pass
        
        return structure
    except Exception as e:
        print(f"Error scanning directory: {e}")
        return None

def create_index_file(structure, git_info, output_path):
    """Create index file with directory structure and git information"""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("Directory and Git Repository Index\\n")
            f.write("=" * 40 + "\\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\\n\\n")
            
            # Write Git information
            if git_info:
                f.write("Git Repository Information\\n")
                f.write("-" * 30 + "\\n")
                f.write(f"Current Branch: {git_info.get('current_branch', 'N/A')}\\n")
                f.write(f"Last Commit: {git_info.get('last_commit', 'N/A')}\\n")
                f.write(f"Last Commit Message: {git_info.get('last_commit_message', 'N/A')}\\n")
                f.write(f"Last Commit Date: {git_info.get('last_commit_date', 'N/A')}\\n")
                f.write(f"Remote URL: {git_info.get('remote_url', 'N/A')}\\n\\n")
                
                if git_info.get('modified_files'):
                    f.write("Modified Files:\\n")
                    for file in git_info['modified_files']:
                        f.write(f"- {file}\\n")
                    f.write("\\n")
            
            # Write file structure
            f.write("Directory Structure\\n")
            f.write("-" * 30 + "\\n")
            for path, info in structure.items():
                size = info['size'] if info['size'] is not None else 0
                size_str = f"{size/1024:.2f} KB" if size > 0 else "0 KB"
                f.write(f"Path: {path}\\n")
                f.write(f"Size: {size_str}\\n")
                f.write(f"Last Modified: {info['last_modified']}\\n")
                
                if 'git_blame' in info:
                    f.write("Git History:\\n")
                    for blame in info['git_blame']:
                        f.write(f"  - Author: {blame['author']}, Date: {blame['date']}\\n")
                
                f.write("-" * 50 + "\\n")
        return True
    except Exception as e:
        print(f"Error creating index file: {e}")
        return False

def main():
    dir_path = r"G:\\dev-guides-new"
    output_file = os.path.join(dir_path, "repository_index.txt")
    
    # Get git information
    print("Collecting git information...")
    git_info = get_git_info(dir_path)
    if git_info:
        print("Git repository information collected successfully")
    else:
        print("No git repository found or error accessing git information.")
    
    # Scan directory
    print("Scanning directory structure...")
    structure = scan_directory(dir_path)
    if not structure:
        print("Error scanning directory")
        return
    
    # Create index file
    print("Creating index file...")
    if create_index_file(structure, git_info, output_file):
        print(f"Index file created successfully at: {output_file}")
    else:
        print("Failed to create index file")

if __name__ == "__main__":
    main()
'''
    
    # Path to save the script
    script_path = r"G:\dev-guides-new\scan_directory.py"
    
    try:
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
        print(f"Script saved successfully to: {script_path}")
        return True
    except Exception as e:
        print(f"Error saving script: {e}")
        return False

if __name__ == "__main__":
    save_scan_script()