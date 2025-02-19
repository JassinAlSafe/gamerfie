import { Gamepad2, BarChart3, Trophy, Users, Zap, Star } from "lucide-react";

export const ICON_MAP = {
  Gamepad2,
  BarChart3,
  Trophy,
  Users,
  Zap,
  Star,
} as const;

export type IconName = keyof typeof ICON_MAP;
