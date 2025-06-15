export interface PlatformStat {
  number: string;
  label: string;
  icon: string;
}

export const platformStats: PlatformStat[] = [
  { number: "10K+", label: "Active Gamers", icon: "👥" },
  { number: "50K+", label: "Games Tracked", icon: "🎮" },
  { number: "25K+", label: "Reviews", icon: "⭐" },
  { number: "500+", label: "Communities", icon: "🌍" },
];