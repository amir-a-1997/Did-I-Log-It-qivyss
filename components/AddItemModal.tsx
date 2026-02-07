
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { DEFAULT_CATEGORIES } from '@/types/LogItem';
import { IconSymbol } from './IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, category: string) => void;
  customCategories: string[];
}

export function AddItemModal({ visible, onClose, onAdd, customCategories }: AddItemModalProps) {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Home');
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
    }
  }, [visible]);

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
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <Animated.View
          style={[
            styles.topSheetContainer,
            {
              transform: [{ translateY: slideAnim }],
              paddingTop: insets.top + 8,
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Item</Text>
                <TouchableOpacity 
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.scrollView}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
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
                    returnKeyType="done"
                    onSubmitEditing={handleAdd}
                  />
                </View>

                <View style={styles.categoryContainer}>
                  <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryList}>
                      {allCategories.map((category) => {
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
                    style={[styles.button, styles.cancelButton, { backgroundColor: theme.background, borderColor: theme.border }]}
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
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  topSheetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
  },
  keyboardAvoid: {
    width: '100%',
  },
  modalContent: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
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
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  addButton: {},
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
