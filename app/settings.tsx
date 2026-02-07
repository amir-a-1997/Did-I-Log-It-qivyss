
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getColors, accentColors } from '@/styles/commonStyles';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, accentColor, effectiveColorScheme, setThemeMode, setAccentColor } = useTheme();
  const theme = getColors(effectiveColorScheme, accentColor);

  const themeOptions: Array<{ value: 'system' | 'light' | 'dark'; label: string; description: string }> = [
    { value: 'system', label: 'System Default', description: 'Follow device settings' },
    { value: 'light', label: 'Light', description: 'Always use light mode' },
    { value: 'dark', label: 'Dark', description: 'Always use dark mode' },
  ];

  const accentOptions: Array<{ value: 'blue' | 'green' | 'purple'; label: string }> = [
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
  ];

  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    console.log('User changed theme mode to:', mode);
    setThemeMode(mode);
  };

  const handleAccentChange = (color: 'blue' | 'green' | 'purple') => {
    console.log('User changed accent color to:', color);
    setAccentColor(color);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Customize how the app looks
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Theme</Text>
          {themeOptions.map((option) => {
            const isSelected = themeMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionRow,
                  { borderBottomColor: theme.border },
                  option.value === 'dark' && styles.lastOptionRow,
                ]}
                onPress={() => handleThemeChange(option.value)}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, { color: theme.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                {isSelected && (
                  <IconSymbol
                    ios_icon_name="checkmark"
                    android_material_icon_name="check"
                    size={24}
                    color={theme.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Accent Color</Text>
          <View style={styles.accentGrid}>
            {accentOptions.map((option) => {
              const isSelected = accentColor === option.value;
              const colorValue = effectiveColorScheme === 'light' 
                ? accentColors[option.value].light 
                : accentColors[option.value].dark;
              
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.accentOption,
                    { borderColor: isSelected ? theme.primary : theme.border },
                    isSelected && styles.accentOptionSelected,
                  ]}
                  onPress={() => handleAccentChange(option.value)}
                >
                  <View
                    style={[
                      styles.accentColorCircle,
                      { backgroundColor: colorValue },
                    ]}
                  />
                  <Text style={[styles.accentLabel, { color: theme.text }]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.accentCheckmark, { backgroundColor: theme.success }]}>
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.aboutRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>App Name</Text>
            <Text style={[styles.aboutValue, { color: theme.text }]}>Did I Log It?</Text>
          </View>
          <View style={[styles.aboutRow, styles.lastAboutRow]}>
            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: theme.text }]}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
  accentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  accentOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
  },
  accentOptionSelected: {
    borderWidth: 2,
  },
  accentColorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  accentLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  accentCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastAboutRow: {
    borderBottomWidth: 0,
  },
  aboutLabel: {
    fontSize: 15,
  },
  aboutValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});
