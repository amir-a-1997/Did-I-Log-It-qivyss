
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { LogItem } from '@/types/LogItem';
import { formatLastLogged, getDaysAgo } from '@/utils/dateUtils';
import { IconSymbol } from './IconSymbol';

interface LogItemCardProps {
  item: LogItem;
  onLog: () => void;
  onPress: () => void;
}

export function LogItemCard({ item, onLog, onPress }: LogItemCardProps) {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];

  const lastLog = item.logs[0];
  const lastLoggedText = formatLastLogged(lastLog?.timestamp);
  const daysAgo = lastLog ? getDaysAgo(lastLog.timestamp) : null;

  const getDaysColor = () => {
    if (daysAgo === null) return theme.textSecondary;
    if (daysAgo === 0) return theme.success;
    if (daysAgo <= 7) return theme.primary;
    if (daysAgo <= 30) return theme.warning;
    return theme.danger;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: colorScheme === 'dark' ? theme.primaryLight : theme.primaryLight },
              ]}
            >
              <Text style={[styles.categoryText, { color: theme.primary }]}>{item.category}</Text>
            </View>
            <Text style={[styles.lastLogged, { color: getDaysColor() }]}>{lastLoggedText}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logButton, { backgroundColor: theme.primary }]}
          onPress={(e) => {
            e.stopPropagation();
            console.log('User tapped Log It button for:', item.title);
            onLog();
          }}
        >
          <IconSymbol
            ios_icon_name="checkmark"
            android_material_icon_name="check"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.logButtonText}>Log It</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastLogged: {
    fontSize: 13,
    fontWeight: '500',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
