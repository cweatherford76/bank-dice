// Theme definitions for Bank Dice game
export type ThemeId = 'modern' | 'classic' | 'tron' | 'retro-arcade' | 'retro-neon';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  cssClass: string;
}

export const THEMES: Theme[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Dark futuristic with cyan and purple accents',
    cssClass: 'theme-modern',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean light theme with neutral colors',
    cssClass: 'theme-classic',
  },
  {
    id: 'tron',
    name: 'Tron',
    description: 'Black with glowing cyan grid lines',
    cssClass: 'theme-tron',
  },
  {
    id: 'retro-arcade',
    name: 'Retro Arcade',
    description: 'Neon pink and cyan arcade vibes',
    cssClass: 'theme-retro-arcade',
  },
  {
    id: 'retro-neon',
    name: 'Retro Neon',
    description: 'Dark purple with vibrant neon accents',
    cssClass: 'theme-retro-neon',
  },
];

export const DEFAULT_THEME: ThemeId = 'modern';

export function getTheme(themeId: ThemeId): Theme {
  return THEMES.find(t => t.id === themeId) || THEMES[0];
}
