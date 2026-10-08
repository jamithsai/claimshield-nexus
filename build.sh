#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=================================================="
echo "[RENDER BUILD] Installing Python Dependencies..."
echo "=================================================="
pip install --upgrade pip
pip install -r requirements.txt

echo "=================================================="
echo "[RENDER BUILD] Installing & Building Frontend..."
echo "=================================================="
cd frontend
npm install
npm run build
cd ..

echo "=================================================="
echo "[RENDER BUILD] Verifying Build Output..."
echo "=================================================="
if [ -d "frontend/dist" ]; then
    echo "✓ frontend/dist found."
    ls -la frontend/dist
else
    echo "✗ ERROR: frontend/dist was not generated!"
    exit 1
fi

echo "=================================================="
echo "[RENDER BUILD] Build Completed Successfully!"
echo "=================================================="
