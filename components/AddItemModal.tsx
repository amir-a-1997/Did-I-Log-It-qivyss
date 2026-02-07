
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { getColors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { DEFAULT_CATEGORIES, Category } from '@/types/LogItem';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, categoryId: string) => void;
  categories: Category[]; // Custom categories from the hook
}

export function AddItemModal({
  visible,
  onClose,
  onAdd,
  categories,
}: AddItemModalProps) {
  const { effectiveColorScheme, accentColor } = useTheme();
  const theme = getColors(effectiveColorScheme, accentColor);
  const insets = useSafeAreaInsets();
  
  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(DEFAULT_CATEGORIES[0].categoryId);
  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      console.log('Opening Add Item modal');
      setTitle('');
      setSelectedCategoryId(DEFAULT_CATEGORIES[0].categoryId);
    }
  }, [visible]);

  const handleAdd = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      console.log('Adding item:', trimmedTitle, 'with categoryId:', selectedCategoryId);
      onAdd(trimmedTitle, selectedCategoryId);
      setTitle('');
      onClose();
    }
  };

  const handleClose = () => {
    console.log('Closing Add Item modal');
    setTitle('');
    onClose();
  };

  // SINGLE SOURCE OF TRUTH: Combine default categories with custom categories from storage
  const allCategories = [...DEFAULT_CATEGORIES, ...categories];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <View style={[styles.modalContent, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              Add New Item
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: theme.text }]}>
              Item Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g., Changed bedsheets"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />

            <Text style={[styles.label, { color: theme.text }]}>
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {allCategories.map((category) => {
                const isSelected = selectedCategoryId === category.categoryId;
                return (
                  <TouchableOpacity
                    key={category.categoryId}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setSelectedCategoryId(category.categoryId)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: title.trim() ? theme.primary : theme.border,
              },
            ]}
            onPress={handleAdd}
            disabled={!title.trim()}
          >
            <Text style={styles.addButtonText}>
              Add Item
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
