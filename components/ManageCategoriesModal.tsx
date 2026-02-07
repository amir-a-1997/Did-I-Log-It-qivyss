
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
import { IconSymbol } from './IconSymbol';
import { IconButton } from './IconButton';
import { DEFAULT_CATEGORIES } from '@/types/LogItem';

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
    console.log('User started editing category:', categoryName);
    setEditingCategory(categoryName);
    setEditedName(categoryName);
  };

  const handleSaveEdit = () => {
    const trimmedName = editedName.trim();
    if (trimmedName && editingCategory && trimmedName !== editingCategory) {
      console.log('User renamed category:', editingCategory, 'to', trimmedName);
      onRenameCategory(editingCategory, trimmedName);
    }
    setEditingCategory(null);
    setEditedName('');
  };

  const handleCancelEdit = () => {
    console.log('User cancelled editing category');
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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Manage Categories</Text>
          <IconButton
            onPress={onClose}
            accessibilityLabel="Close"
          >
            <IconSymbol
              ios_icon_name="xmark"
              android_material_icon_name="close"
              size={24}
              color={theme.text}
            />
          </IconButton>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Default Categories</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              These categories cannot be edited or deleted
            </Text>
            {DEFAULT_CATEGORIES.map((category) => (
              <View
                key={category}
                style={[styles.categoryItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={[styles.categoryName, { color: theme.text }]}>{category}</Text>
                <View style={styles.defaultBadge}>
                  <Text style={[styles.defaultBadgeText, { color: theme.textSecondary }]}>
                    Default
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Custom Categories</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Add your own categories
            </Text>

            <View style={[styles.addContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="New category name"
                placeholderTextColor={theme.textSecondary}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                onSubmitEditing={handleAddCategory}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={handleAddCategory}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {customCategories.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No custom categories yet
                </Text>
              </View>
            ) : (
              customCategories.map((category) => (
                <View
                  key={category}
                  style={[styles.categoryItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  {editingCategory === category ? (
                    <>
                      <TextInput
                        style={[styles.editInput, { color: theme.text, borderColor: theme.border }]}
                        value={editedName}
                        onChangeText={setEditedName}
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          style={[styles.editActionButton, { backgroundColor: theme.primary }]}
                          onPress={handleSaveEdit}
                        >
                          <Text style={styles.editActionText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editActionButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                          onPress={handleCancelEdit}
                        >
                          <Text style={[styles.editActionText, { color: theme.text }]}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.categoryName, { color: theme.text }]}>{category}</Text>
                      <View style={styles.categoryActions}>
                        <IconButton
                          onPress={() => handleStartEdit(category)}
                          accessibilityLabel="Edit category"
                        >
                          <IconSymbol
                            ios_icon_name="pencil"
                            android_material_icon_name="edit"
                            size={20}
                            color={theme.primary}
                          />
                        </IconButton>
                        <IconButton
                          onPress={() => handleDeleteCategory(category)}
                          accessibilityLabel="Delete category"
                        >
                          <IconSymbol
                            ios_icon_name="trash"
                            android_material_icon_name="delete"
                            size={20}
                            color={theme.danger}
                          />
                        </IconButton>
                      </View>
                    </>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
