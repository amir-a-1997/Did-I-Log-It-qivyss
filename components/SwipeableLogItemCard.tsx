
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { colors } from '@/styles/commonStyles';
import { LogItem } from '@/types/LogItem';
import { formatLastLogged, getDaysAgo } from '@/utils/dateUtils';
import { IconSymbol } from './IconSymbol';
import { IconButton } from './IconButton';
import * as Haptics from 'expo-haptics';

interface SwipeableLogItemCardProps {
  item: LogItem;
  onLog: () => void;
  onPress: () => void;
  onDelete: () => void;
}

export function SwipeableLogItemCard({ item, onLog, onPress, onDelete }: SwipeableLogItemCardProps) {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const [justLogged, setJustLogged] = useState(false);

  const lastLog = item.logs[0];
  const daysAgo = lastLog ? getDaysAgo(lastLog.timestamp) : null;
  const lastLoggedText = lastLog ? formatLastLogged(lastLog.timestamp) : 'Never logged';

  const getDaysColor = () => {
    if (daysAgo === null) {
      return theme.textSecondary;
    }
    if (daysAgo === 0) {
      return theme.success;
    }
    if (daysAgo <= 7) {
      return theme.primary;
    }
    if (daysAgo <= 30) {
      return theme.warning;
    }
    return theme.danger;
  };

  const handleLogPress = (e: any) => {
    e.stopPropagation();
    console.log('User tapped Log It button for:', item.title);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJustLogged(true);
    onLog();
    setTimeout(() => setJustLogged(false), 2000);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ scale }] }]}>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.danger }]}
          onPress={() => {
            console.log('User tapped swipe delete button for:', item.title);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onDelete();
          }}
        >
          <IconSymbol
            ios_icon_name="trash"
            android_material_icon_name="delete"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const justLoggedText = 'Logged just now';

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
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
              {justLogged ? (
                <Text style={[styles.lastLogged, { color: getDaysColor() }]}>
                  {justLoggedText}
                </Text>
              ) : (
                <Text style={[styles.lastLogged, { color: getDaysColor() }]}>
                  {lastLoggedText}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.logButton, { backgroundColor: theme.primary }]}
            onPress={handleLogPress}
          >
            <Text style={styles.logButtonText}>Log It</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
