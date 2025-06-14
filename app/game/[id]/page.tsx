"use client";

import { GamePageClient } from "./GamePageClient";
import { GamePageProps } from "@/types";

export default function GamePage({ params }: GamePageProps) {
  return <GamePageClient params={params} />;
}
