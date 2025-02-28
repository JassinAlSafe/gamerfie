#!/bin/bash

# 1. Restore challenge routes
echo "Restoring challenge routes..."
find app/challenges -type f -name "*.tsx.paused" -o -name "*.ts.paused" | while read file; do
  mv "$file" "${file%.paused}"
done

find app/api/challenges -type f -name "*.tsx.paused" -o -name "*.ts.paused" | while read file; do
  mv "$file" "${file%.paused}"
done

# 2. Restore challenge imports in CompletionDialog
echo "Restoring challenge functionality in CompletionDialog..."
sed -i.bak 's/\/\/ PAUSED: import { useChallengesStore } from "@\/stores\/useChallengesStore";/import { useChallengesStore } from "@\/stores\/useChallengesStore";/' components/game/completion-dialog.tsx

# 3. Remove the stub for useChallengesStore if it exists
echo "Removing stub for useChallengesStore..."
if [ -f "stores/useChallengesStore.paused.ts" ]; then
  rm "stores/useChallengesStore.paused.ts"
fi

# 4. Restore CompletionDialog step state
echo "Restoring CompletionDialog step state..."
sed -i.bak 's/const \[step, setStep\] = useState<"completion" | "challenges">("completion"); \/\/ Always completion when challenges are paused/const \[step, setStep\] = useState<"completion" | "challenges">("completion");/' components/game/completion-dialog.tsx

# 5. Clean up backup files
echo "Cleaning up backup files..."
find . -name "*.bak" -delete

echo "Challenges feature has been restored. Please test thoroughly before deploying." 