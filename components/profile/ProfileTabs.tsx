"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface Tab {
  value: string;
  label: string;
  content?: React.ReactNode;
  href?: string;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function ProfileTabs({
  tabs,
  activeTab,
  onTabChange,
}: ProfileTabsProps) {
  const router = useRouter();

  const handleTabClick = (value: string) => {
    const tab = tabs.find((t) => t.value === value);
    if (tab?.href) {
      router.push(tab.href);
    } else {
      onTabChange(value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabClick}>
      <TabsList className="w-full justify-start border-b rounded-none px-0 h-auto">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-4 py-3 data-[state=active]:border-b-2 rounded-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
