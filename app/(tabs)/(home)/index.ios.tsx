
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getColors } from '@/styles/commonStyles';
import { useLogItems } from '@/hooks/useLogItems';
import { SwipeableLogItemCard } from '@/components/SwipeableLogItemCard';
import { AddItemModal } from '@/components/AddItemModal';
import { ManageCategoriesModal } from '@/components/ManageCategoriesModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { IconSymbol } from '@/components/IconSymbol';
import { DEFAULT_CATEGORIES } from '@/types/LogItem';
import { useTheme } from '@/contexts/ThemeContext';
import { IconButton } from '@/components/IconButton';

export default function HomeScreen() {
  const { effectiveColorScheme, accentColor } = useTheme();
  const theme = getColors(effectiveColorScheme, accentColor);
  const router = useRouter();
  const { items, loading, customCategories, addItem, logItem, softDeleteItem, restoreItem, deleteItem, addCategory, renameCategory, deleteCategory } = useLogItems();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [manageCategoriesVisible, setManageCategoriesVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('All');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [permanentDeleteModalVisible, setPermanentDeleteModalVisible] = useState(false);
  const [itemToPermanentlyDelete, setItemToPermanentlyDelete] = useState<{ id: string; title: string } | null>(null);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [itemToRestore, setItemToRestore] = useState<{ id: string; title: string } | null>(null);

  // Combine all categories with "All" and "Deleted" options
  const allCategoriesForFilter = useMemo(() => {
    const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
    return [
      { categoryId: 'All', name: 'All', isDefault: false },
      ...allCategories,
      { categoryId: 'Deleted', name: 'Deleted', isDefault: false },
    ];
  }, [customCategories]);

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    if (selectedCategoryId === 'Deleted') {
      return items.filter((item) => item.isDeleted === true);
    }
    
    const activeItems = items.filter((item) => !item.isDeleted);
    
    if (selectedCategoryId === 'All') {
      return activeItems;
    }
    
    return activeItems.filter((item) => item.categoryId === selectedCategoryId);
  }, [items, selectedCategoryId]);

  // Get category name for display
  const getCategoryName = (categoryId: string) => {
    const category = allCategoriesForFilter.find(cat => cat.categoryId === categoryId);
    return category ? category.name : 'Unknown';
  };

  const handleLogItem = (itemId: string) => {
    console.log('User tapped Log It button for item:', itemId);
    logItem(itemId);
  };

  const handleItemPress = (itemId: string) => {
    console.log('User tapped item card, navigating to history:', itemId);
    router.push(`/history/${itemId}`);
  };

  const handleDeleteRequest = (itemId: string, itemTitle: string) => {
    console.log('User requested soft delete for:', itemTitle);
    setItemToDelete({ id: itemId, title: itemTitle });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      console.log('User confirmed soft delete via swipe:', itemToDelete.title);
      await softDeleteItem(itemToDelete.id);
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    console.log('User cancelled delete');
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const handleRestoreRequest = (itemId: string, itemTitle: string) => {
    console.log('User requested restore for:', itemTitle);
    setItemToRestore({ id: itemId, title: itemTitle });
    setRestoreModalVisible(true);
  };

  const handleConfirmRestore = async () => {
    if (itemToRestore) {
      console.log('User confirmed restore:', itemToRestore.title);
      await restoreItem(itemToRestore.id);
      setRestoreModalVisible(false);
      setItemToRestore(null);
    }
  };

  const handleCancelRestore = () => {
    console.log('User cancelled restore');
    setRestoreModalVisible(false);
    setItemToRestore(null);
  };

  const handlePermanentDeleteRequest = (itemId: string, itemTitle: string) => {
    console.log('User requested permanent delete for:', itemTitle);
    setItemToPermanentlyDelete({ id: itemId, title: itemTitle });
    setPermanentDeleteModalVisible(true);
  };

  const handleConfirmPermanentDelete = async () => {
    if (itemToPermanentlyDelete) {
      console.log('User confirmed permanent delete:', itemToPermanentlyDelete.title);
      await deleteItem(itemToPermanentlyDelete.id);
      setPermanentDeleteModalVisible(false);
      setItemToPermanentlyDelete(null);
    }
  };

  const handleCancelPermanentDelete = () => {
    console.log('User cancelled permanent delete');
    setPermanentDeleteModalVisible(false);
    setItemToPermanentlyDelete(null);
  };

  const handleAddNewItemPress = () => {
    console.log('User tapped Add New Item row at bottom');
    setAddModalVisible(true);
  };

  const handleSettingsPress = () => {
    console.log('User tapped Settings button');
    router.push('/settings');
  };

  const isDeletedView = selectedCategoryId === 'Deleted';
  const selectedCategoryName = getCategoryName(selectedCategoryId);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: 'Did I Log It?',
          headerRight: () => (
            <IconButton
              ios_icon_name="gear"
              android_material_icon_name="settings"
              size={24}
              color={theme.text}
              onPress={handleSettingsPress}
              accessibilityLabel="Settings"
            />
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
            {allCategoriesForFilter.map((category) => {
              const isSelected = category.categoryId === selectedCategoryId;
              const isDeleted = category.categoryId === 'Deleted';
              
              // Special styling for "Deleted" chip
              const chipBackgroundColor = isDeleted
                ? (isSelected ? theme.danger : theme.card)
                : (isSelected ? theme.primary : theme.card);
              
              const chipTextColor = isSelected ? '#FFFFFF' : theme.text;

              return (
                <TouchableOpacity
                  key={category.categoryId}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: chipBackgroundColor,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    console.log('User selected filter:', category.name);
                    setSelectedCategoryId(category.categoryId);
                  }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: chipTextColor },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[
                styles.manageChip,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => {
                console.log('User tapped Manage Categories');
                setManageCategoriesVisible(true);
              }}
            >
              <IconSymbol
                ios_icon_name="gear"
                android_material_icon_name="settings"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={[styles.manageText, { color: theme.textSecondary }]}>
                Manage
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredItems.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <IconSymbol
                  ios_icon_name={isDeletedView ? 'trash' : 'list.bullet'}
                  android_material_icon_name={isDeletedView ? 'delete' : 'list'}
                  size={48}
                  color={theme.textSecondary}
                />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  {isDeletedView
                    ? 'No deleted items'
                    : selectedCategoryId === 'All'
                    ? 'No items yet'
                    : `No ${selectedCategoryName} items`}
                </Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {isDeletedView
                    ? 'Deleted items will appear here'
                    : selectedCategoryId === 'All'
                    ? 'Tap "Add new item" below to get started'
                    : 'Try a different category or add a new item'}
                </Text>
              </View>
            ) : isDeletedView ? (
              filteredItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.deletedItemCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={styles.deletedItemInfo}>
                    <Text style={[styles.deletedItemTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.deletedItemMeta, { color: theme.textSecondary }]}>
                      {item.logs.length > 0
                        ? `Last logged: ${new Date(item.logs[0].timestamp).toLocaleDateString()}`
                        : 'Never logged'}
                    </Text>
                  </View>
                  <View style={styles.deletedItemActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.success }]}
                      onPress={() => handleRestoreRequest(item.id, item.title)}
                    >
                      <IconSymbol
                        ios_icon_name="arrow.uturn.backward"
                        android_material_icon_name="restore"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonText}>Restore</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.danger }]}
                      onPress={() => handlePermanentDeleteRequest(item.id, item.title)}
                    >
                      <IconSymbol
                        ios_icon_name="trash"
                        android_material_icon_name="delete"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              filteredItems.map((item) => (
                <SwipeableLogItemCard
                  key={item.id}
                  item={item}
                  onLog={() => handleLogItem(item.id)}
                  onPress={() => handleItemPress(item.id)}
                  onDelete={() => handleDeleteRequest(item.id, item.title)}
                />
              ))
            )}

            {!isDeletedView && (
              <TouchableOpacity
                style={[styles.addNewItemRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={handleAddNewItemPress}
              >
                <View style={styles.addNewItemContent}>
                  <View style={[styles.addIconContainer, { backgroundColor: theme.primaryLight }]}>
                    <IconSymbol
                      ios_icon_name="plus"
                      android_material_icon_name="add"
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.addNewItemText, { color: theme.text }]}>
                    Add new item
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </>
      )}

      <AddItemModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={addItem}
        customCategories={customCategories}
      />

      <ManageCategoriesModal
        visible={manageCategoriesVisible}
        onClose={() => setManageCategoriesVisible(false)}
        customCategories={customCategories}
        onAddCategory={addCategory}
        onRenameCategory={renameCategory}
        onDeleteCategory={deleteCategory}
        items={items}
      />

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Item?"
        message={itemToDelete ? `Move "${itemToDelete.title}" to deleted items? You can restore it later.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ConfirmModal
        visible={restoreModalVisible}
        title="Restore Item?"
        message={itemToRestore ? `Restore "${itemToRestore.title}" with all its history?` : ''}
        confirmText="Restore"
        cancelText="Cancel"
        destructive={false}
        onConfirm={handleConfirmRestore}
        onCancel={handleCancelRestore}
      />

      <ConfirmModal
        visible={permanentDeleteModalVisible}
        title="Permanently Delete?"
        message={itemToPermanentlyDelete ? `Permanently delete "${itemToPermanentlyDelete.title}" and all its history? This cannot be undone.` : ''}
        confirmText="Delete Forever"
        cancelText="Cancel"
        destructive={true}
        onConfirm={handleConfirmPermanentDelete}
        onCancel={handleCancelPermanentDelete}
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
  manageChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  manageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
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
  deletedItemCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  deletedItemInfo: {
    marginBottom: 12,
  },
  deletedItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deletedItemMeta: {
    fontSize: 14,
  },
  deletedItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addNewItemRow: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addNewItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addNewItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
