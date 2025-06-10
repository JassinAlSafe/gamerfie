#!/bin/bash

# Create paused directory if it doesn't exist
mkdir -p .paused/challenges

# 1. Disable challenge routes by renaming them
echo "Disabling challenge routes..."
find app/challenges -type f -name "*.tsx" -o -name "*.ts" | while read file; do
  mv "$file" "${file}.paused"
done

find app/api/challenges -type f -name "*.tsx" -o -name "*.ts" | while read file; do
  mv "$file" "${file}.paused"
done

# 2. Comment out challenge imports in CompletionDialog
echo "Disabling challenge functionality in CompletionDialog..."
sed -i.bak 's/import { useChallengesStore } from "@\/stores\/useChallengesStore";/\/\/ PAUSED: import { useChallengesStore } from "@\/stores\/useChallengesStore";/' components/game/completion-dialog.tsx

# 3. Create a stub for useChallengesStore
echo "Creating stub for useChallengesStore..."
cat > stores/useChallengesStore.paused.ts << EOL
// This is a stub for the paused challenges feature
export const useChallengesStore = () => ({
  userChallenges: [],
  updateProgress: async () => {},
  fetchUserChallenges: async () => {},
});
EOL

# 4. Modify CompletionDialog to skip challenges step
echo "Modifying CompletionDialog to skip challenges step..."
sed -i.bak 's/const \[step, setStep\] = useState<"completion" | "challenges">("completion");/const \[step, setStep\] = useState<"completion" | "challenges">("completion"); \/\/ Always completion when challenges are paused/' components/game/completion-dialog.tsx

# 5. Create a README in the paused directory
echo "Creating documentation..."
cat > .paused/challenges/README.md << EOL
# Paused Challenges Feature

This directory contains information about the paused challenges feature.

## Why it was paused
The challenges feature was temporarily paused for future implementation.

## How to restore
To restore the challenges feature:
1. Run the \`scripts/unpause-challenges.sh\` script
2. Test the feature thoroughly after restoration

## Affected files
- Components in \`components/Challenges/\`
- Routes in \`app/challenges/\` and \`app/api/challenges/\`
- Store in \`stores/useChallengesStore.ts\`
- Types in \`types/challenge.ts\`
- Dialog integration in \`components/game/completion-dialog.tsx\`
EOL

echo "Challenges feature has been paused. To restore, create and run an unpause-challenges.sh script." 