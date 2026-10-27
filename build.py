"""Build FlipMargin store zips.

    python build.py

Writes dist/flipmargin-v<version>-chrome.zip and dist/flipmargin-v<version>-firefox.zip.
The Firefox zip ships manifest.firefox.json renamed to manifest.json.
"""
import json
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FILES = [
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
    "ExtPay.js",
    "icons/icon16.png",
    "icons/icon48.png",
    "icons/icon128.png",
]


def load_manifest(name):
    data = json.loads((ROOT / name).read_text(encoding="utf-8"))
    for key in ("manifest_version", "name", "version", "description", "icons", "action", "background"):
        if key not in data:
            sys.exit(f"{name}: missing '{key}'")
    for size, path in data["icons"].items():
        if not (ROOT / path).is_file():
            sys.exit(f"{name}: icon {size} not found at {path}")
    return data


def check_js():
    for js in ("background.js", "content.js", "popup.js"):
        result = subprocess.run(["node", "--check", str(ROOT / js)], capture_output=True, text=True)
        if result.returncode != 0:
            sys.exit(f"{js} failed node --check:\n{result.stderr}")


def build(manifest_name, out_path):
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(ROOT / manifest_name, "manifest.json")
        for rel in FILES:
            z.write(ROOT / rel, rel)
    print(f"built {out_path.relative_to(ROOT)}")


def main():
    chrome = load_manifest("manifest.json")
    firefox = load_manifest("manifest.firefox.json")
    if chrome["version"] != firefox["version"]:
        sys.exit(f"version mismatch: chrome {chrome['version']} vs firefox {firefox['version']}")
    if "service_worker" not in chrome["background"]:
        sys.exit("manifest.json background must use service_worker")
    if "scripts" not in firefox["background"]:
        sys.exit("manifest.firefox.json background must use scripts")
    check_js()

    version = chrome["version"]
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    build("manifest.json", dist / f"flipmargin-v{version}-chrome.zip")
    build("manifest.firefox.json", dist / f"flipmargin-v{version}-firefox.zip")


if __name__ == "__main__":
    main()
