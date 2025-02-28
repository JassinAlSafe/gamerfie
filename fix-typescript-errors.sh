#!/bin/bash

# Step 1: Fix ESLint auto-fixable issues
echo "Fixing ESLint auto-fixable issues..."
npx eslint --fix "**/*.{ts,tsx}" --quiet

# Step 2: Remove unused imports
echo "Removing unused imports..."
npx eslint --fix "**/*.{ts,tsx}" --rule "unused-imports/no-unused-imports: error" --quiet

# Step 3: Fix React Hook dependencies
echo "Fixing React Hook dependencies..."
npx eslint --fix "**/*.{ts,tsx}" --rule "react-hooks/exhaustive-deps: error" --quiet

# Step 4: Fix TypeScript errors one by one
echo "Checking remaining TypeScript errors..."
npx tsc --noEmit

echo "Script completed. Please check the remaining errors manually." 