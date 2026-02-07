
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { getColors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { IconButton } from './IconButton';
import { DEFAULT_CATEGORIES, LogItem } from '@/types/LogItem';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmModal } from './ConfirmModal';

interface ManageCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  customCategories: string[];
  onAddCategory: (name: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
  items: LogItem[]; // Added to count items in a category
}

export function ManageCategoriesModal({
  visible,
  onClose,
  customCategories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  items,
}: ManageCategoriesModalProps) {
  const { effectiveColorScheme, accentColor } = useTheme();
  const theme = getColors(effectiveColorScheme, accentColor);
  const insets = useSafeAreaInsets();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  // Animation for sliding down from top
  const slideAnim = useRef(new Animated.Value(-1000)).current;

  // Count items in the category to be deleted (excluding already deleted items)
  const itemsInCategoryCount = useMemo(() => {
    if (!categoryToDelete) {
      return 0;
    }
    return items.filter((item) => item.category === categoryToDelete && !item.isDeleted).length;
  }, [items, categoryToDelete]);

  useEffect(() => {
    if (visible) {
      console.log('Opening Manage Categories top sheet');
      // Slide down from top
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      // Slide up to hide
      Animated.timing(slideAnim, {
        toValue: -1000,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName) {
      console.log('Adding custom category:', trimmedName);
      onAddCategory(trimmedName);
      setNewCategoryName('');
      Keyboard.dismiss();
    }
  };

  const handleStartEdit = (categoryName: string) => {
    console.log('Starting edit for category:', categoryName);
    setEditingCategory(categoryName);
    setEditedName(categoryName);
  };

  const handleSaveEdit = () => {
    const trimmedName = editedName.trim();
    if (trimmedName && editingCategory) {
      console.log('Saving edited category:', editingCategory, 'to', trimmedName);
      onRenameCategory(editingCategory, trimmedName);
      setEditingCategory(null);
      setEditedName('');
      Keyboard.dismiss();
    }
  };

  const handleCancelEdit = () => {
    console.log('Cancelling edit');
    setEditingCategory(null);
    setEditedName('');
    Keyboard.dismiss();
  };

  const handleDeleteRequest = (categoryName: string) => {
    console.log('User requested delete for category:', categoryName);
    setCategoryToDelete(categoryName);
    setDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      console.log('User confirmed permanent deletion of category and all items:', categoryToDelete);
      onDeleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
    setDeleteConfirmVisible(false);
  };

  const handleCancelDelete = () => {
    console.log('Cancelled category deletion');
    setCategoryToDelete(null);
    setDeleteConfirmVisible(false);
  };

  const handleClose = () => {
    console.log('Closing Manage Categories top sheet');
    Keyboard.dismiss();
    onClose();
  };

  const deleteConfirmTitle = 'Delete Category and All Items?';
  const deleteConfirmMessage = categoryToDelete
    ? `This will permanently delete the category "${categoryToDelete}" and all ${itemsInCategoryCount} item${itemsInCategoryCount !== 1 ? 's' : ''} in it, along with their history. This action cannot be undone.`
    : '';

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
          
          {/* Top Sheet - slides down from top */}
          <Animated.View
            style={[
              styles.topSheetContainer,
              {
                transform: [{ translateY: slideAnim }],
                paddingTop: insets.top,
              },
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoid}
            >
              <View style={[styles.topSheetContent, { backgroundColor: theme.background }]}>
                {/* Header with title and close button */}
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.title, { color: theme.text }]}>
                    Manage Categories
                  </Text>
                  <IconButton
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={theme.text}
                    onPress={handleClose}
                    accessibilityLabel="Close"
                  />
                </View>

                {/* Add New Category - AT THE TOP */}
                <View style={[styles.addSection, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Add New Category
                  </Text>
                  <View style={styles.addRow}>
                    <TextInput
                      style={[
                        styles.addInput,
                        {
                          backgroundColor: theme.card,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder="Category name"
                      placeholderTextColor={theme.textSecondary}
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                      returnKeyType="done"
                      onSubmitEditing={handleAddCategory}
                    />
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        {
                          backgroundColor: newCategoryName.trim()
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={handleAddCategory}
                      disabled={!newCategoryName.trim()}
                    >
                      <IconSymbol
                        ios_icon_name="plus"
                        android_material_icon_name="add"
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Scrollable list of categories */}
                <ScrollView 
                  style={styles.scrollView}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                >
                  {/* Default Categories */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Default Categories
                    </Text>
                    {DEFAULT_CATEGORIES.map((category) => (
                      <View
                        key={category}
                        style={[
                          styles.categoryRow,
                          { backgroundColor: theme.card, borderColor: theme.border },
                        ]}
                      >
                        <Text style={[styles.categoryName, { color: theme.text }]}>
                          {category}
                        </Text>
                        <Text style={[styles.defaultBadge, { color: theme.textSecondary }]}>
                          Default
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Custom Categories */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Custom Categories
                    </Text>
                    {customCategories.length === 0 ? (
                      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        No custom categories yet
                      </Text>
                    ) : (
                      <>
                        {customCategories.map((category) => (
                          <View
                            key={category}
                            style={[
                              styles.categoryRow,
                              { backgroundColor: theme.card, borderColor: theme.border },
                            ]}
                          >
                            {editingCategory === category ? (
                              <>
                                <TextInput
                                  style={[
                                    styles.editInput,
                                    {
                                      backgroundColor: theme.background,
                                      color: theme.text,
                                      borderColor: theme.border,
                                    },
                                  ]}
                                  value={editedName}
                                  onChangeText={setEditedName}
                                  autoFocus
                                  returnKeyType="done"
                                  onSubmitEditing={handleSaveEdit}
                                />
                                <View style={styles.editActions}>
                                  <TouchableOpacity onPress={handleSaveEdit}>
                                    <IconSymbol
                                      ios_icon_name="checkmark"
                                      android_material_icon_name="check"
                                      size={24}
                                      color={theme.success}
                                    />
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={handleCancelEdit}>
                                    <IconSymbol
                                      ios_icon_name="xmark"
                                      android_material_icon_name="close"
                                      size={24}
                                      color={theme.danger}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </>
                            ) : (
                              <>
                                <Text style={[styles.categoryName, { color: theme.text }]}>
                                  {category}
                                </Text>
                                <View style={styles.actions}>
                                  <TouchableOpacity onPress={() => handleStartEdit(category)}>
                                    <IconSymbol
                                      ios_icon_name="pencil"
                                      android_material_icon_name="edit"
                                      size={20}
                                      color={theme.primary}
                                    />
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={() => handleDeleteRequest(category)}>
                                    <IconSymbol
                                      ios_icon_name="trash"
                                      android_material_icon_name="delete"
                                      size={20}
                                      color={theme.danger}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </>
                            )}
                          </View>
                        ))}
                      </>
                    )}
                  </View>

                  {/* Bottom padding for scroll */}
                  <View style={{ height: 40 }} />
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteConfirmVisible}
        title={deleteConfirmTitle}
        message={deleteConfirmMessage}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  topSheetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  keyboardAvoid: {
    flex: 1,
  },
  topSheetContent: {
    flex: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addInput: {
    flex: 1,
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  defaultBadge: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
});
