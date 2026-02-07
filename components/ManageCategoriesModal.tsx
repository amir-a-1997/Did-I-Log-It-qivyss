
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { DEFAULT_CATEGORIES } from '@/types/LogItem';
import { IconSymbol } from './IconSymbol';

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
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName) {
      console.log('User adding custom category:', trimmedName);
      onAddCategory(trimmedName);
      setNewCategoryName('');
    }
  };

  const handleStartEdit = (categoryName: string) => {
    console.log('User editing category:', categoryName);
    setEditingCategory(categoryName);
    setEditedName(categoryName);
  };

  const handleSaveEdit = () => {
    const trimmedName = editedName.trim();
    if (trimmedName && editingCategory) {
      console.log('User renaming category:', editingCategory, 'to', trimmedName);
      onRenameCategory(editingCategory, trimmedName);
      setEditingCategory(null);
      setEditedName('');
    }
  };

  const handleCancelEdit = () => {
    console.log('User cancelled edit');
    setEditingCategory(null);
    setEditedName('');
  };

  const handleDeleteCategory = (categoryName: string) => {
    console.log('User requested delete category:', categoryName);
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? Items in this category will be moved to "Uncategorised".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('User confirmed delete category:', categoryName);
            onDeleteCategory(categoryName);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Manage Categories</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Add New Category</Text>
              <View style={styles.addCategoryRow}>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
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
                    { backgroundColor: theme.primary },
                    !newCategoryName.trim() && styles.buttonDisabled,
                  ]}
                  onPress={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Default Categories</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Cannot be edited or deleted
              </Text>
              {DEFAULT_CATEGORIES.map((category) => (
                <View
                  key={category}
                  style={[styles.categoryRow, { backgroundColor: theme.background, borderColor: theme.border }]}
                >
                  <Text style={[styles.categoryName, { color: theme.text }]}>{category}</Text>
                  <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>Default</Text>
                  </View>
                </View>
              ))}
            </View>

            {customCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Custom Categories</Text>
                {customCategories.map((category) => (
                  <View
                    key={category}
                    style={[styles.categoryRow, { backgroundColor: theme.background, borderColor: theme.border }]}
                  >
                    {editingCategory === category ? (
                      <>
                        <TextInput
                          style={[
                            styles.editInput,
                            { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                          ]}
                          value={editedName}
                          onChangeText={setEditedName}
                          autoFocus
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={[styles.iconButton, { width: 44, height: 44 }]}
                            onPress={handleSaveEdit}
                          >
                            <IconSymbol
                              ios_icon_name="checkmark"
                              android_material_icon_name="check"
                              size={20}
                              color={theme.primary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconButton, { width: 44, height: 44 }]}
                            onPress={handleCancelEdit}
                          >
                            <IconSymbol
                              ios_icon_name="xmark"
                              android_material_icon_name="close"
                              size={20}
                              color={theme.textSecondary}
                            />
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.categoryName, { color: theme.text }]}>{category}</Text>
                        <View style={styles.categoryActions}>
                          <TouchableOpacity
                            style={[styles.iconButton, { width: 44, height: 44 }]}
                            onPress={() => handleStartEdit(category)}
                          >
                            <IconSymbol
                              ios_icon_name="pencil"
                              android_material_icon_name="edit"
                              size={20}
                              color={theme.textSecondary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconButton, { width: 44, height: 44 }]}
                            onPress={() => handleDeleteCategory(category)}
                          >
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
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.doneButtonText, { color: '#FFFFFF' }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  addCategoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    marginRight: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 4,
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
