
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { DEFAULT_CATEGORIES } from '@/types/LogItem';
import { useTheme } from '@/contexts/ThemeContext';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, category: string) => void;
  customCategories: string[];
}

export function AddItemModal({ visible, onClose, onAdd, customCategories }: AddItemModalProps) {
  const { effectiveColorScheme, accentColor } = useTheme();
  const theme = getColors(effectiveColorScheme, accentColor);
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [slideAnim] = useState(new Animated.Value(-500));

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -500,
        duration: 250,
        useNativeDriver: true,
      }).start();
      setTitle('');
      setSelectedCategory(DEFAULT_CATEGORIES[0]);
    }
  }, [visible]);

  const handleAdd = () => {
    if (title.trim()) {
      console.log('Adding item:', title, selectedCategory);
      onAdd(title.trim(), selectedCategory);
      handleClose();
    }
  };

  const handleClose = () => {
    console.log('Closing Add Item modal');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.background,
              paddingTop: insets.top + 16,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Add New Item</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeButton, { backgroundColor: theme.card }]}
            >
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={20}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
              <Text style={[styles.label, { color: theme.text }]}>Item Name</Text>
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
              />

              <Text style={[styles.label, { color: theme.text }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {allCategories.map((category) => {
                  const isSelected = category === selectedCategory;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.card,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => {
                        console.log('Selected category:', category);
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
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: title.trim() ? theme.primary : theme.border },
              ]}
              onPress={handleAdd}
              disabled={!title.trim()}
            >
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
