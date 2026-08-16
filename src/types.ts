export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_pinned?: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Bookmark {
  id: string;
  category_id: string;
  title: string;
  url: string;
  description: string;
  icon_url: string;
  is_pinned?: number | boolean;
  is_private?: number | boolean;
  sort_order: number;
  click_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface SearchEngine {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  urlTemplate: string;
}

export type ViewLayout = 'bento' | 'grid' | 'compact';
export type ThemeMode = 'dark' | 'light' | 'oled' | 'cyber';

export interface StatsData {
  totalBookmarks: number;
  totalCategories: number;
  totalClicks: number;
  topVisited: Bookmark[];
}
