
import { StyleSheet } from 'react-native';

// Clean, calm color palette for "Did I Log It?"
export const colors = {
  // Light mode
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  // Dark mode
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    primary: '#60A5FA',
    primaryLight: '#1E3A8A',
    border: '#334155',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
  },
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
