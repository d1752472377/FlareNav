import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const AVAILABLE_ICONS = [
  'Sparkles', 'Code2', 'Palette', 'Cloud', 'Zap', 'BookOpen',
  'Folder', 'Globe', 'Terminal', 'Server', 'Shield', 'Layers',
  'Cpu', 'Database', 'Compass', 'Layout', 'Bookmark', 'Star',
  'Flame', 'Heart', 'Music', 'Video', 'Camera', 'ShoppingCart',
  'Coffee', 'Briefcase', 'Sliders', 'Activity', 'Feather', 'Tv'
];

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5', size = 20, color }) => {
  // @ts-ignore
  const IconComponent = (Icons as any)[name] || Icons.Folder;
  return <IconComponent className={className} size={size} color={color} />;
};
