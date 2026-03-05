import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Animated, ViewStyle } from 'react-native';
import { Text } from './Text';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
}


export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  size = 'md',
  variant = 'default',
  style,
}) => {
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          track: { width: 40, height: 24 },
          thumb: { width: 16, height: 16 },
          translateDistance: 16,
        };
      case 'md':
        return {
          track: { width: 48, height: 28 },
          thumb: { width: 20, height: 20 },
          translateDistance: 20,
        };
      case 'lg':
        return {
          track: { width: 56, height: 32 },
          thumb: { width: 24, height: 24 },
          translateDistance: 24,
        };
      default:
        return {
          track: { width: 48, height: 28 },
          thumb: { width: 20, height: 20 },
          translateDistance: 20,
        };
    }
  };

  const getVariantStyles = () => {
    if (!value) {
      return {
        track: {
          backgroundColor: '#2A2A2A',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        thumb: { backgroundColor: '#808080' },
      };
    }
    
    switch (variant) {
      case 'success':
        return {
          track: {
            backgroundColor: 'rgba(0, 255, 136, 0.3)',
            borderColor: '#00FF88'
          },
          thumb: { backgroundColor: '#00FF88' },
        };
      case 'warning':
        return {
          track: {
            backgroundColor: 'rgba(255, 170, 0, 0.3)',
            borderColor: '#FFAA00'
          },
          thumb: { backgroundColor: '#FFAA00' },
        };
      case 'error':
        return {
          track: {
            backgroundColor: 'rgba(255, 51, 51, 0.3)',
            borderColor: '#FF3333'
          },
          thumb: { backgroundColor: '#FF3333' },
        };
      case 'default':
      default:
        return {
          track: {
            backgroundColor: 'rgba(6, 235, 241, 0.3)',
            borderColor: '#06EBF1'
          },
          thumb: {
            backgroundColor: '#06EBF1',
            shadowColor: '#06EBF1',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 4
          },
        };
    }
  };

  const sizeConfig = getSizeStyles();
  const variantConfig = getVariantStyles();

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <View 
      style={[
        label ? {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12
        } : {},
        style
      ]}
    >
      {label && (
        <Text 
          variant="body" 
          color={disabled ? 'disabled' : 'secondary'}
          style={{ flex: 1 }}
        >
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View 
          style={[
            {
              borderRadius: 999,
              borderWidth: 1,
              justifyContent: 'center',
              padding: 4,
              opacity: disabled ? 0.5 : 1
            },
            sizeConfig.track,
            variantConfig.track
          ]}
        >
          <Animated.View
            style={[
              {
                borderRadius: 999,
                transform: [
                  {
                    translateX: translateX.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, sizeConfig.translateDistance],
                    }),
                  },
                ],
              },
              sizeConfig.thumb,
              variantConfig.thumb
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Toggle variant with different styling
interface ToggleProps extends SwitchProps {
  leftLabel?: string;
  rightLabel?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  leftLabel,
  rightLabel,
  disabled = false,
  style,
}) => {
  return (
    <View 
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8
        },
        style
      ]}
    >
      {leftLabel && (
        <Text 
          variant="body" 
          color={!value ? 'primary' : 'secondary'}
          style={{ fontWeight: '500' }}
        >
          {leftLabel}
        </Text>
      )}
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        size="sm"
      />
      
      {rightLabel && (
        <Text 
          variant="body" 
          color={value ? 'primary' : 'secondary'}
          style={{ fontWeight: '500' }}
        >
          {rightLabel}
        </Text>
      )}
    </View>
  );
};