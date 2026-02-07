
import { StyleSheet } from 'react-native';

// Accent color variants
export const accentColors = {
  blue: {
    light: '#3B82F6',
    dark: '#60A5FA',
    lightBackground: '#DBEAFE',
    darkBackground: '#1E3A8A',
  },
  green: {
    light: '#10B981',
    dark: '#34D399',
    lightBackground: '#D1FAE5',
    darkBackground: '#065F46',
  },
  purple: {
    light: '#8B5CF6',
    dark: '#A78BFA',
    lightBackground: '#E9D5FF',
    darkBackground: '#581C87',
  },
};

// Helper function to get colors with dynamic accent color
export const getColors = (colorScheme: 'light' | 'dark', accentColor: 'blue' | 'green' | 'purple') => {
  const accent = accentColors[accentColor];
  const primaryColor = colorScheme === 'light' ? accent.light : accent.dark;
  const primaryLightColor = colorScheme === 'light' ? accent.lightBackground : accent.darkBackground;

  return {
    background: colorScheme === 'light' ? '#F8F9FA' : '#0F172A',
    card: colorScheme === 'light' ? '#FFFFFF' : '#1E293B',
    text: colorScheme === 'light' ? '#1A1A1A' : '#F1F5F9',
    textSecondary: colorScheme === 'light' ? '#6B7280' : '#94A3B8',
    primary: primaryColor,
    primaryLight: primaryLightColor,
    border: colorScheme === 'light' ? '#E5E7EB' : '#334155',
    success: colorScheme === 'light' ? '#10B981' : '#34D399',
    warning: colorScheme === 'light' ? '#F59E0B' : '#FBBF24',
    danger: colorScheme === 'light' ? '#EF4444' : '#F87171',
  };
};

// Static colors for backward compatibility (default to blue)
export const colors = {
  light: getColors('light', 'blue'),
  dark: getColors('dark', 'blue'),
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
  },
  caption: {
    fontSize: 13,
  },
});
