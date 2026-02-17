// Military-appropriate color scheme optimized for field use
export const colors = {
  // Primary - Army green tones
  primary: '#4a5d23',
  primaryLight: '#6b7d3e',
  primaryDark: '#2d3a14',

  // Background - Dark for low-light readability
  background: '#1a1a2e',
  backgroundSecondary: '#16213e',
  surface: '#1f2940',
  surfaceElevated: '#263553',

  // Text
  text: '#e8e8e8',
  textSecondary: '#a0a0a0',
  textMuted: '#6b6b6b',

  // Accent colors for card grades
  gradeAgain: '#c0392b',    // Red - forgot
  gradeHard: '#e67e22',     // Orange - hard
  gradeGood: '#27ae60',     // Green - good
  gradeEasy: '#3498db',     // Blue - easy

  // Status colors
  success: '#27ae60',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',

  // Border
  border: '#2d3a4f',
  borderLight: '#3d4a5f',

  // Card states
  cardNew: '#9b59b6',
  cardLearning: '#e67e22',
  cardReview: '#27ae60',
  cardRelearning: '#e74c3c',
} as const;

export type ColorKey = keyof typeof colors;
