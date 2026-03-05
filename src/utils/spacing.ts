import { ViewStyle } from 'react-native';

// Utility to handle React Native spacing since space-x and space-y don't work
export const createSpacedChildren = (
  children: React.ReactNode[],
  spacing: number,
  direction: 'horizontal' | 'vertical' = 'vertical'
): React.ReactNode[] => {
  return children.map((child, index) => {
    if (index === 0) return child;
    
    const spaceStyle: ViewStyle = direction === 'vertical' 
      ? { marginTop: spacing }
      : { marginLeft: spacing };
    
    return React.cloneElement(child as React.ReactElement, {
      style: [
        (child as React.ReactElement).props.style,
        spaceStyle
      ]
    });
  });
};

// Alternative: Use gap property directly in style
export const gapStyle = (gap: number): ViewStyle => ({
  gap,
});

// Convert space-y-X to marginTop for children
export const spaceY = (space: number): ViewStyle => ({
  // This won't work in React Native - we need to handle spacing differently
});

// Convert space-x-X to marginLeft for children  
export const spaceX = (space: number): ViewStyle => ({
  // This won't work in React Native - we need to handle spacing differently
});