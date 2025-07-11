#!/bin/bash

# Ensure we're in the backend directory
cd "$(dirname "$0")"

# Compile the TypeScript code
echo "Compiling TypeScript..."
npm run build

# Run the seed script
echo "Running Tour Package Seed Script..."
node dist/scripts/seedTourPackages.js

echo "Done!"
