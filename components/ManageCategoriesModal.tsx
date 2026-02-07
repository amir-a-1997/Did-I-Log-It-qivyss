
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
import { DEFAULT_CATEGORIES, LogItem, Category } from '@/types/LogItem';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';

interface ManageCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[]; // Active custom categories from the hook
  archivedCategories?: Category[]; // Archived custom categories from the hook
  onAddCategory: (name: string) => void;
  onRenameCategory: (categoryId: string, newName: string) => void;
  onDeleteCategory?: (categoryId: string) => Promise<boolean>; // Legacy - calls archive
  onArchiveCategory?: (categoryId: string) => Promise<boolean>;
  onRestoreCategory?: (categoryId: string) => Promise<boolean>;
  items: LogItem[];
}

export function ManageCategoriesModal({
  visible,
  onClose,
  categories,
  archivedCategories = [],
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onArchiveCategory,
  onRestoreCategory,
  items,
}: ManageCategoriesModalProps) {
  const { effectiveColorScheme, accentColor } = useTheme();
  const theme = getColors(effectiveColorScheme, accentColor);
  const insets = useSafeAreaInsets();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  
  // isMounted guard to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Animation for sliding down from top
  const slideAnim = useRef(new Animated.Value(-1000)).current;
  
  // Refs to close swipeable rows
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());



  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    
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
    
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      console.log('ManageCategoriesModal unmounting - setting isMounted to false');
      isMounted.current = false;
    };
  }, [visible]);

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName) {
      console.log('Adding custom category:', trimmedName);
      onAddCategory(trimmedName);
      setNewCategoryName('');
      Keyboard.dismiss();
      Toast.show({
        type: 'success',
        text1: 'Category added',
      });
    }
  };

  const handleStartEdit = (category: Category) => {
    console.log('Starting edit for category:', category.name);
    setEditingCategory(category.categoryId);
    setEditedName(category.name);
  };

  const handleSaveEdit = () => {
    const trimmedName = editedName.trim();
    if (trimmedName && editingCategory) {
      console.log('Saving edited category:', editingCategory, 'to', trimmedName);
      onRenameCategory(editingCategory, trimmedName);
      setEditingCategory(null);
      setEditedName('');
      Keyboard.dismiss();
      Toast.show({
        type: 'success',
        text1: 'Category renamed',
      });
    }
  };

  const handleCancelEdit = () => {
    console.log('Cancelling edit');
    setEditingCategory(null);
    setEditedName('');
    Keyboard.dismiss();
  };

  const handleArchive = async (category: Category) => {
    console.log('User swiped to archive category:', category.name);
    
    if (category.isDefault) {
      console.warn('Attempted to archive a default category:', category.name);
      Toast.show({
        type: 'error',
        text1: "Default categories can't be archived",
      });
      return;
    }
    
    // Close the swipeable row
    const swipeableRef = swipeableRefs.current.get(category.categoryId);
    if (swipeableRef) {
      swipeableRef.close();
    }
    
    // Set archiving state to disable UI during archive
    if (isMounted.current) {
      setIsArchiving(true);
    }
    
    try {
      // Call the archive function (prefer onArchiveCategory, fallback to onDeleteCategory)
      const archiveFunc = onArchiveCategory || onDeleteCategory;
      if (!archiveFunc) {
        console.error('No archive function provided');
        Toast.show({
          type: 'error',
          text1: 'Archive function not available',
        });
        return;
      }
      
      const success = await archiveFunc(category.categoryId);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        if (success) {
          console.log('Category archived successfully');
          // Toast is shown by the hook
        } else {
          console.error('Category archive failed');
          // Toast is shown by the hook
        }
      } else {
        console.log('Component unmounted during archive - skipping state update');
      }
    } catch (error) {
      console.error('Error during category archive:', error);
      if (isMounted.current) {
        Toast.show({
          type: 'error',
          text1: 'Failed to archive category',
        });
      }
    } finally {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setIsArchiving(false);
      }
    }
  };

  const handleRestore = async (category: Category) => {
    console.log('User swiped to restore category:', category.name);
    
    if (!onRestoreCategory) {
      console.error('No restore function provided');
      Toast.show({
        type: 'error',
        text1: 'Restore function not available',
      });
      return;
    }
    
    // Close the swipeable row
    const swipeableRef = swipeableRefs.current.get(category.categoryId);
    if (swipeableRef) {
      swipeableRef.close();
    }
    
    if (isMounted.current) {
      setIsArchiving(true);
    }
    
    try {
      const success = await onRestoreCategory(category.categoryId);
      
      if (isMounted.current) {
        if (success) {
          console.log('Category restored successfully');
          // Toast is shown by the hook
        } else {
          console.error('Category restore failed');
          // Toast is shown by the hook
        }
      }
    } catch (error) {
      console.error('Error during category restore:', error);
      if (isMounted.current) {
        Toast.show({
          type: 'error',
          text1: 'Failed to restore category',
        });
      }
    } finally {
      if (isMounted.current) {
        setIsArchiving(false);
      }
    }
  };

  const handleClose = () => {
    console.log('User tapped X to close Manage Categories sheet');
    
    // Don't allow close while archiving is in progress
    if (isArchiving) {
      console.log('Archive in progress - preventing close');
      return;
    }
    
    Keyboard.dismiss();
    onClose();
  };

  // Render swipe actions for archive
  const renderArchiveAction = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    category: Category
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.swipeAction, { transform: [{ scale }] }]}>
        <TouchableOpacity
          style={[styles.swipeButton, { backgroundColor: theme.warning }]}
          onPress={() => {
            console.log('User tapped swipe archive button for:', category.name);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleArchive(category);
          }}
          disabled={isArchiving}
        >
          <IconSymbol
            ios_icon_name="archivebox"
            android_material_icon_name="archive"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.swipeText}>Archive</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render swipe actions for restore
  const renderRestoreAction = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    category: Category
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.swipeAction, { transform: [{ scale }] }]}>
        <TouchableOpacity
          style={[styles.swipeButton, { backgroundColor: theme.success }]}
          onPress={() => {
            console.log('User tapped swipe restore button for:', category.name);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleRestore(category);
          }}
          disabled={isArchiving}
        >
          <IconSymbol
            ios_icon_name="arrow.uturn.backward"
            android_material_icon_name="restore"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.swipeText}>Restore</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
            disabled={isArchiving}
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
                    color={isArchiving ? theme.textSecondary : theme.text}
                    onPress={handleClose}
                    accessibilityLabel="Close"
                    disabled={isArchiving}
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
                      editable={!isArchiving}
                    />
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        {
                          backgroundColor: newCategoryName.trim() && !isArchiving
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={handleAddCategory}
                      disabled={!newCategoryName.trim() || isArchiving}
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
                  scrollEnabled={!isArchiving}
                >
                  {/* Default Categories */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Default Categories
                    </Text>
                    {DEFAULT_CATEGORIES.map((category) => (
                      <View
                        key={category.categoryId}
                        style={[
                          styles.categoryRow,
                          { backgroundColor: theme.card, borderColor: theme.border },
                        ]}
                      >
                        <Text style={[styles.categoryName, { color: theme.text }]}>
                          {category.name}
                        </Text>
                        <Text style={[styles.defaultBadge, { color: theme.textSecondary }]}>
                          Default
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Custom Categories (Active) */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Custom Categories
                    </Text>
                    {categories.length === 0 ? (
                      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        No custom categories yet
                      </Text>
                    ) : (
                      <>
                        {categories.map((category) => {
                          const isEditing = editingCategory === category.categoryId;
                          
                          // If editing, don't wrap in Swipeable
                          if (isEditing) {
                            return (
                              <View
                                key={category.categoryId}
                                style={[
                                  styles.categoryRow,
                                  { backgroundColor: theme.card, borderColor: theme.border },
                                ]}
                              >
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
                                  editable={!isArchiving}
                                />
                                <View style={styles.editActions}>
                                  <TouchableOpacity onPress={handleSaveEdit} disabled={isArchiving}>
                                    <IconSymbol
                                      ios_icon_name="checkmark"
                                      android_material_icon_name="check"
                                      size={24}
                                      color={theme.success}
                                    />
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={handleCancelEdit} disabled={isArchiving}>
                                    <IconSymbol
                                      ios_icon_name="xmark"
                                      android_material_icon_name="close"
                                      size={24}
                                      color={theme.danger}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          }
                          
                          // Normal view with swipe-to-archive
                          return (
                            <Swipeable
                              key={category.categoryId}
                              ref={(ref) => {
                                if (ref) {
                                  swipeableRefs.current.set(category.categoryId, ref);
                                } else {
                                  swipeableRefs.current.delete(category.categoryId);
                                }
                              }}
                              renderRightActions={(progress, dragX) =>
                                renderArchiveAction(progress, dragX, category)
                              }
                              onSwipeableOpen={() =>
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                              }
                              enabled={!isArchiving}
                            >
                              <View
                                style={[
                                  styles.categoryRow,
                                  { backgroundColor: theme.card, borderColor: theme.border },
                                ]}
                              >
                                <Text style={[styles.categoryName, { color: theme.text }]}>
                                  {category.name}
                                </Text>
                                <View style={styles.actions}>
                                  <TouchableOpacity 
                                    onPress={() => handleStartEdit(category)}
                                    disabled={isArchiving}
                                  >
                                    <IconSymbol
                                      ios_icon_name="pencil"
                                      android_material_icon_name="edit"
                                      size={20}
                                      color={isArchiving ? theme.textSecondary : theme.primary}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </Swipeable>
                          );
                        })}
                      </>
                    )}
                  </View>

                  {/* Archived Categories */}
                  {archivedCategories.length > 0 && (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        Archived
                      </Text>
                      {archivedCategories.map((category) => (
                        <Swipeable
                          key={category.categoryId}
                          ref={(ref) => {
                            if (ref) {
                              swipeableRefs.current.set(category.categoryId, ref);
                            } else {
                              swipeableRefs.current.delete(category.categoryId);
                            }
                          }}
                          renderRightActions={(progress, dragX) =>
                            renderRestoreAction(progress, dragX, category)
                          }
                          onSwipeableOpen={() =>
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          }
                          enabled={!isArchiving}
                        >
                          <View
                            style={[
                              styles.categoryRow,
                              styles.archivedRow,
                              { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.6 },
                            ]}
                          >
                            <Text style={[styles.categoryName, { color: theme.textSecondary }]}>
                              {category.name}
                            </Text>
                          </View>
                        </Swipeable>
                      ))}
                    </View>
                  )}

                  {/* Bottom padding for scroll */}
                  <View style={{ height: 40 }} />
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
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
  archivedRow: {
    borderStyle: 'dashed',
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
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  swipeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  swipeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
