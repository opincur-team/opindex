import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator, View, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from './LinearGradient';
import { typography } from '@/src/styles/typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  icon?: ImageSourcePropType; // Image icon displayed after title
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  icon,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        };
      case 'secondary':
        return {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        };
      case 'danger':
        return {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: 'rgb(255, 255, 255)'
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return {
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 8
        };
    }
  };

  const getSizeStyles = () => {

    if (style?.padding !== undefined) {
      return {padding : style.padding};
    }

    switch (size) {
      case 'sm':
        return { height: 40, paddingHorizontal: 16 };
      case 'md':
        return { height: 48, paddingHorizontal: 24 };
      case 'lg':
        return { height: 56, paddingHorizontal: 32 };
      default:
        return { height: 48, paddingHorizontal: 24 };
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return typography.textXs;
      case 'md':
        return typography.textSm;
      case 'lg':
        return typography.textBase;
      default:
        return typography.textSm;
    }
  };

  const getTextColorStyle = () => {
    return variant === 'ghost'
      ? typography.textColorPrimary
      : typography.textWhite;
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles() ;

  // Wrapper style for shadow rendering
  const shadowWrapperStyle = {
    borderRadius: 20,
    ...variantStyles
  };

  // Content style for LinearGradient
  const contentStyle = {
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles
  };

  // Style for non-gradient buttons (outline, ghost)
  const buttonStyle = {

    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles,
    ...variantStyles
  };

  const textColor = '#FFFFFF';

  const textStyles = [
    typography.daysone,
    getTextSizeStyle(),
    getTextColorStyle(),
    { textTransform: 'uppercase' as const }
  ];

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const imageIconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  // Extract layout styles to apply to TouchableOpacity
  const layoutStyleKeys = ['width', 'minWidth', 'maxWidth', 'flex', 'flexGrow', 'flexShrink', 'flexBasis'];
  const containerStyle: ViewStyle = {};
  const innerStyle: ViewStyle = {};

  if (style) {
    Object.keys(style).forEach((key) => {
      if (layoutStyleKeys.includes(key)) {
        containerStyle[key as keyof ViewStyle] = style[key as keyof ViewStyle];
      } else {
        innerStyle[key as keyof ViewStyle] = style[key as keyof ViewStyle];
      }
    });
  }

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={iconSize}
              color={textColor}
              style={{ marginRight: 8 }}
            />
          )}
          {title && (
            <Text style={[textStyles, textStyle]}>
              {title}
            </Text>
          )}
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={iconSize}
              color={textColor}
              style={{ marginLeft: 8 }}
            />
          )}
          {icon && (
            <Image
              source={icon}
              style={{
                width: imageIconSize,
                height: imageIconSize,
                marginLeft: title ? 4 : 0,
              }}
              contentFit="contain"
            />
          )}
        </View>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={containerStyle}
      >
        <View style={shadowWrapperStyle}>
          <View style={{ borderRadius: 20, overflow: 'hidden' }}>
            <LinearGradient
              variant="primary"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[contentStyle, innerStyle]}
            >
              <ButtonContent />
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={containerStyle}
      >
        <View style={shadowWrapperStyle}>
          <View style={{ borderRadius: 20, overflow: 'hidden' }}>
            <LinearGradient
              variant="secondary"
              start={{ x: 0.8, y: 0 }}
              end={{ x: 0.2, y: 1 }}
              locations={[0.0963, 0.9402]}
              style={[contentStyle, innerStyle]}
            >
              <ButtonContent />
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={containerStyle}
      >
        <View style={shadowWrapperStyle}>
          <View style={{ borderRadius: 20, overflow: 'hidden' }}>
            <LinearGradient
              colors={['#FFA600', '#F76E0C']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.43 }}
              style={[contentStyle, innerStyle]}
            >
              <ButtonContent />
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[buttonStyle, innerStyle, containerStyle]}
      activeOpacity={0.8}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};
