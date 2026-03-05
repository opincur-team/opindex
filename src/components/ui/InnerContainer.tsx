import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface InnerContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const InnerContainer: React.FC<InnerContainerProps> = ({
                                                              children,
                                                              style,
                                                            }) => {
  return (
    <View
      style={[
        styles.container,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 30,
  },
});
