#!/bin/bash
set -e

# Define the target folder and the output zip name
FOLDER="src"
OUTPUT="../build/laboratory-app.zip"

# Check if the folder exists
if [ -d "$FOLDER" ]; then
    echo "Zipping contents of $FOLDER..."
    mkdir -p "$(dirname "$FOLDER/$OUTPUT")"
    rm -f "$FOLDER/$OUTPUT"
    # Navigate inside, zip contents, and return
    (
        cd "$FOLDER"
        if command -v zip >/dev/null 2>&1; then
            zip -r "$OUTPUT" .
        elif command -v python3 >/dev/null 2>&1; then
            python3 -c '
import os, sys, zipfile
out = sys.argv[1]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, _, files in os.walk("."):
        for f in sorted(files):
            full = os.path.join(root, f)
            zf.write(full, os.path.relpath(full, "."))
' "$OUTPUT"
        else
            echo "Error: Neither zip nor python3 is installed."
            exit 1
        fi
    )
    mkdir -p public
    cp "$FOLDER/$OUTPUT" public/laboratory-app.zip
    echo "Done! Zip file created: $OUTPUT (and copied to public/laboratory-app.zip)."
else
    echo "Error: Folder $FOLDER does not exist."
    exit 1
fi