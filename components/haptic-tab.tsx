import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from '@/src/components/ui/LinearGradient';

export function HapticTab(props: BottomTabBarButtonProps) {
  const isSelected = (props as any)['aria-selected'] === true;

  return (
    <View style={styles.container}>

      <View style={{width: 70,
        height: 70,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isSelected && (
          <LinearGradient
            variant="primary"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        )}
        <PlatformPressable
          {...props}
          onPressIn={(ev) => {
            if (process.env.EXPO_OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            props.onPressIn?.(ev);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
  },
});
