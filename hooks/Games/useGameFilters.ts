
import { useState } from "react";

export function useSearchQuery() {
  const [searchQuery, setSearchQuery] = useState("");
  return [searchQuery, setSearchQuery] as const;
}

export function useStatusFilter() {
  const [statusFilter, setStatusFilter] = useState("all");
  return [statusFilter, setStatusFilter] as const;
}