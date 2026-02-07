
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { getColors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { IconButton } from './IconButton';
import { DEFAULT_CATEGORIES } from '@/types/LogItem';
import { useTheme } from '@/contexts/ThemeContext';

interface ManageCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  customCategories: string[];
  onAddCategory: (name: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}

export function ManageCategoriesModal({
  visible,
  onClose,
  customCategories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: ManageCategoriesModalProps) {
  const { effectiveColorScheme, accentColor } = useTheme();
  const theme = getColors(effectiveColorScheme, accentColor);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      console.log('Adding custom category:', newCategoryName);
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleStartEdit = (categoryName: string) => {
    console.log('Starting edit for category:', categoryName);
    setEditingCategory(categoryName);
    setEditedName(categoryName);
  };

  const handleSaveEdit = () => {
    if (editedName.trim() && editingCategory) {
      console.log('Saving edited category:', editingCategory, 'to', editedName);
      onRenameCategory(editingCategory, editedName.trim());
      setEditingCategory(null);
      setEditedName('');
    }
  };

  const handleCancelEdit = () => {
    console.log('Cancelling edit');
    setEditingCategory(null);
    setEditedName('');
  };

  const handleDeleteCategory = (categoryName: string) => {
    console.log('User requested delete for category:', categoryName);
    Alert.alert(
      'Delete Category',
      `Delete "${categoryName}"? Items in this category will be moved to "Uncategorised".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Deleting category:', categoryName);
            onDeleteCategory(categoryName);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Manage Categories
            </Text>
            <IconButton
              ios_icon_name="xmark"
              android_material_icon_name="close"
              size={24}
              color={theme.text}
              onPress={onClose}
              accessibilityLabel="Close"
            />
          </View>

          <ScrollView style={styles.scrollView}>
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

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Custom Categories
              </Text>
              {customCategories.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No custom categories yet
                </Text>
              ) : (
                customCategories.map((category) => (
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
                          <TouchableOpacity onPress={() => handleDeleteCategory(category)}>
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
                ))
              )}
            </View>

            <View style={styles.section}>
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
});
