
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
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { Category, CATEGORIES } from '@/types/LogItem';
import { IconSymbol } from './IconSymbol';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, category: Category) => void;
}

export function AddItemModal({ visible, onClose, onAdd }: AddItemModalProps) {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Home');

  const handleAdd = () => {
    if (title.trim()) {
      console.log('User tapped Add button in modal');
      onAdd(title.trim(), selectedCategory);
      setTitle('');
      setSelectedCategory('Home');
      onClose();
    }
  };

  const handleClose = () => {
    console.log('User closed add item modal');
    setTitle('');
    setSelectedCategory('Home');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Item</Text>
            <TouchableOpacity onPress={handleClose}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>What do you want to track?</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
              ]}
              placeholder="e.g., Changed bedsheets"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          <View style={styles.categoryContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryList}>
                {CATEGORIES.map((category) => {
                  const isSelected = category === selectedCategory;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.background,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => {
                        console.log('User selected category:', category);
                        setSelectedCategory(category);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: isSelected ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.background }]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.addButton,
                { backgroundColor: theme.primary },
                !title.trim() && styles.buttonDisabled,
              ]}
              onPress={handleAdd}
              disabled={!title.trim()}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Add</Text>
            </TouchableOpacity>
          </View>
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
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {},
  addButton: {},
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
