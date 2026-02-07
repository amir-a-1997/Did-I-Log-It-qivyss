
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { IconSymbol } from './IconSymbol';

interface IconButtonProps {
  onPress: () => void;
  ios_icon_name?: string;
  android_material_icon_name?: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
  children?: React.ReactNode;
}

export function IconButton({ 
  onPress, 
  ios_icon_name, 
  android_material_icon_name, 
  size = 24, 
  color = '#000', 
  style, 
  accessibilityLabel,
  children 
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.6}
    >
      {children ? (
        children
      ) : (
        <IconSymbol
          ios_icon_name={ios_icon_name || 'gear'}
          android_material_icon_name={android_material_icon_name || 'settings'}
          size={size}
          color={color}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
