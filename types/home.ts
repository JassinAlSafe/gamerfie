import { IconName } from '@/lib/constants';

export interface Stat {
  value: string;
  label: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: IconName;
  iconColor: string;
  link: string;
}

export interface HomePageData {
  stats: Stat[];
  features: Feature[];
}
