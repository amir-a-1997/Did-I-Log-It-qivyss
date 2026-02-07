
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useLogItems } from '@/hooks/useLogItems';
import { LogItemCard } from '@/components/LogItemCard';
import { AddItemModal } from '@/components/AddItemModal';
import { IconSymbol } from '@/components/IconSymbol';
import { Category, CATEGORIES } from '@/types/LogItem';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { items, loading, addItem, logItem } = useLogItems();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleLogItem = (itemId: string) => {
    logItem(itemId);
  };

  const handleItemPress = (itemId: string) => {
    console.log('User tapped item card, navigating to history:', itemId);
    router.push(`/history/${itemId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: 'Did I Log It?',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                console.log('User tapped add button');
                setAddModalVisible(true);
              }}
            >
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedCategory === 'All' ? theme.primary : theme.card,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => {
                console.log('User selected filter: All');
                setSelectedCategory('All');
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedCategory === 'All' ? '#FFFFFF' : theme.text },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map((category) => {
              const isSelected = category === selectedCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    console.log('User selected filter:', category);
                    setSelectedCategory(category);
                  }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredItems.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <IconSymbol
                  ios_icon_name="list.bullet"
                  android_material_icon_name="list"
                  size={48}
                  color={theme.textSecondary}
                />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  {selectedCategory === 'All' ? 'No items yet' : `No ${selectedCategory} items`}
                </Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {selectedCategory === 'All'
                    ? 'Tap the + button to add your first item'
                    : 'Try a different category or add a new item'}
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => (
                <LogItemCard
                  key={item.id}
                  item={item}
                  onLog={() => handleLogItem(item.id)}
                  onPress={() => handleItemPress(item.id)}
                />
              ))
            )}
          </ScrollView>
        </>
      )}

      <AddItemModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={addItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterScroll: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
