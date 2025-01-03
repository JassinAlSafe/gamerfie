import { ChallengeGoal, ChallengeRule } from "@/types/challenge";

interface GoalProgress {
  [goalId: string]: number;
}

export function calculateChallengeProgress(
  goals: ChallengeGoal[],
  goalProgress: GoalProgress
): number {
  if (!goals.length) return 0;

  let totalProgress = 0;
  let completedGoals = 0;

  for (const goal of goals) {
    const currentProgress = goalProgress[goal.id] || 0;
    const goalPercentage = Math.min(100, (currentProgress / goal.target) * 100);
    
    if (goalPercentage >= 100) {
      completedGoals++;
    }
    
    totalProgress += goalPercentage;
  }

  return Math.floor(totalProgress / goals.length);
}

export function checkChallengeRules(
  rules: ChallengeRule[],
  userStats: any
): boolean {
  // If no rules, challenge is considered fulfilled
  if (!rules.length) return true;

  // Check each rule
  for (const rule of rules) {
    const ruleStr = rule.rule.toLowerCase();

    // Game completion rule
    if (ruleStr.includes('complete game') || ruleStr.includes('finish game')) {
      if (!userStats.completedGames || userStats.completedGames === 0) {
        return false;
      }
    }

    // Achievement rule
    if (ruleStr.includes('achievement') || ruleStr.includes('trophy')) {
      if (!userStats.achievements || userStats.achievements === 0) {
        return false;
      }
    }

    // Playtime rule
    if (ruleStr.includes('play') && ruleStr.includes('hours')) {
      const requiredHours = parseInt(ruleStr.match(/\d+/)?.[0] || '0');
      if (!userStats.playtime || userStats.playtime < requiredHours) {
        return false;
      }
    }

    // Level rule
    if (ruleStr.includes('reach level') || ruleStr.includes('achieve level')) {
      const requiredLevel = parseInt(ruleStr.match(/\d+/)?.[0] || '0');
      if (!userStats.level || userStats.level < requiredLevel) {
        return false;
      }
    }

    // Score rule
    if (ruleStr.includes('score') || ruleStr.includes('points')) {
      const requiredScore = parseInt(ruleStr.match(/\d+/)?.[0] || '0');
      if (!userStats.score || userStats.score < requiredScore) {
        return false;
      }
    }
  }

  return true;
} 