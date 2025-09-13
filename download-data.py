from huggingface_hub import hf_hub_download, list_repo_files
import zipfile
import os

REPO_ID = "jowongx8/resonance"
REPO_TYPE = "dataset"
ZIP_FILE = "database.zip"

def main():
    print("🔍 Listing files in dataset repo...")
    files = list_repo_files(repo_id=REPO_ID, repo_type=REPO_TYPE)
    for f in files:
        print(" -", f)
    
    if ZIP_FILE not in files:
        raise FileNotFoundError(f"{ZIP_FILE} not found in the dataset files. Available: {files}")
    
    print(f"📥 Downloading {ZIP_FILE} ...")
    path = hf_hub_download(repo_id=REPO_ID, filename=ZIP_FILE, repo_type=REPO_TYPE)
    
    print(f"📦 Extracting {ZIP_FILE} to public/")
    os.makedirs("public", exist_ok=True)
    with zipfile.ZipFile(path, "r") as zip_ref:
        zip_ref.extractall("public")
    
    print("✅ Done.")

if __name__ == "__main__":
    main()

