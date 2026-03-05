/**
 * Common StyleSheet utilities
 * Reusable styles for layouts, spacing, and frequently used patterns
 */

import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const commonStyles = StyleSheet.create({
  // Flex & Layout
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexWrap: {
    flexWrap: 'wrap',
  },
  itemsCenter: {
    alignItems: 'center',
  },
  itemsStart: {
    alignItems: 'flex-start',
  },
  itemsEnd: {
    alignItems: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },

  // Common layout combinations
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Spacing - Padding
  p1: { padding: theme.spacing[1] },
  p2: { padding: theme.spacing[2] },
  p3: { padding: theme.spacing[3] },
  p4: { padding: theme.spacing[4] },
  p5: { padding: theme.spacing[5] },
  p6: { padding: theme.spacing[6] },

  px1: { paddingHorizontal: theme.spacing[1] },
  px2: { paddingHorizontal: theme.spacing[2] },
  px3: { paddingHorizontal: theme.spacing[3] },
  px4: { paddingHorizontal: theme.spacing[4] },
  px5: { paddingHorizontal: theme.spacing[5] },

  py1: { paddingVertical: theme.spacing[1] },
  py2: { paddingVertical: theme.spacing[2] },
  py3: { paddingVertical: theme.spacing[3] },
  py4: { paddingVertical: theme.spacing[4] },

  pt2: { paddingTop: theme.spacing[2] },
  pt4: { paddingTop: theme.spacing[4] },

  // Spacing - Margin
  m1: { margin: theme.spacing[1] },
  m2: { margin: theme.spacing[2] },
  m3: { margin: theme.spacing[3] },
  m4: { margin: theme.spacing[4] },

  mx1: { marginHorizontal: theme.spacing[1] },
  mx2: { marginHorizontal: theme.spacing[2] },
  mx3: { marginHorizontal: theme.spacing[3] },
  mx4: { marginHorizontal: theme.spacing[4] },

  my1: { marginVertical: theme.spacing[1] },
  my2: { marginVertical: theme.spacing[2] },
  my3: { marginVertical: theme.spacing[3] },
  my4: { marginVertical: theme.spacing[4] },

  mb1: { marginBottom: theme.spacing[1] },
  mb2: { marginBottom: theme.spacing[2] },
  mb3: { marginBottom: theme.spacing[3] },
  mb4: { marginBottom: theme.spacing[4] },
  mb6: { marginBottom: theme.spacing[6] },
  mb8: { marginBottom: theme.spacing[8] },

  mt1: { marginTop: theme.spacing[1] },
  mt2: { marginTop: theme.spacing[2] },
  mt3: { marginTop: theme.spacing[3] },
  mt4: { marginTop: theme.spacing[4] },
  mt8: { marginTop: theme.spacing[8] },

  mr2: { marginRight: theme.spacing[2] },
  mr3: { marginRight: theme.spacing[3] },
  mr4: { marginRight: theme.spacing[4] },
  mr6: { marginRight: theme.spacing[6] },

  ml2: { marginLeft: theme.spacing[2] },
  ml6: { marginLeft: theme.spacing[6] },

  // Sizing
  wFull: {
    width: '100%',
  },
  hFull: {
    height: '100%',
  },

  // Borders
  rounded: {
    borderRadius: theme.borderRadius.md,
  },
  roundedLg: {
    borderRadius: theme.borderRadius.lg,
  },
  roundedXl: {
    borderRadius: theme.borderRadius.xl,
  },
  rounded2xl: {
    borderRadius: theme.borderRadius['2xl'],
  },
  roundedFull: {
    borderRadius: theme.borderRadius.full,
  },

  border: {
    borderWidth: theme.borderWidth.default,
  },
  borderT: {
    borderTopWidth: theme.borderWidth.default,
  },
  border2: {
    borderWidth: theme.borderWidth.thick,
  },

  // Common border colors
  borderWhite10: {
    borderColor: theme.colors.border.light,
  },
  borderWhite20: {
    borderColor: theme.colors.border.medium,
  },
  borderPrimary50: {
    borderColor: theme.colors.primary,
    opacity: 0.5,
  },

  // Backgrounds
  bgBlack: {
    backgroundColor: theme.colors.black,
  },
  bgTransparent: {
    backgroundColor: theme.colors.transparent,
  },
  bgDark200: {
    backgroundColor: theme.colors.dark[200],
  },
  bgDark300: {
    backgroundColor: theme.colors.dark[300],
  },
  bgDark400: {
    backgroundColor: theme.colors.dark[400],
  },
  bgGlassLight: {
    backgroundColor: theme.colors.glass.light,
  },
  bgPrimary10: {
    backgroundColor: theme.colors.primary,
    opacity: theme.opacity[10],
  },
  bgPrimary20: {
    backgroundColor: theme.colors.primary,
    opacity: theme.opacity[20],
  },

  // Shadows
  shadowSm: {
    ...theme.shadows.sm,
    elevation: theme.elevation.sm,
  },
  shadowMd: {
    ...theme.shadows.md,
    elevation: theme.elevation.md,
  },
  shadowLg: {
    ...theme.shadows.lg,
    elevation: theme.elevation.lg,
  },
  shadowGlow: {
    ...theme.shadows.glow,
    elevation: theme.elevation.md,
  },

  // Text alignment
  textLeft: {
    textAlign: 'left',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },

  // Text transform
  uppercase: {
    textTransform: 'uppercase',
  },

  // Positioning
  relative: {
    position: 'relative',
  },
  absolute: {
    position: 'absolute',
  },
});

// Helper functions for dynamic spacing
export const createSpacing = {
  padding: (value: number) => ({ padding: theme.spacing[value as keyof typeof theme.spacing] || value }),
  paddingHorizontal: (value: number) => ({ paddingHorizontal: theme.spacing[value as keyof typeof theme.spacing] || value }),
  paddingVertical: (value: number) => ({ paddingVertical: theme.spacing[value as keyof typeof theme.spacing] || value }),
  margin: (value: number) => ({ margin: theme.spacing[value as keyof typeof theme.spacing] || value }),
  marginHorizontal: (value: number) => ({ marginHorizontal: theme.spacing[value as keyof typeof theme.spacing] || value }),
  marginVertical: (value: number) => ({ marginVertical: theme.spacing[value as keyof typeof theme.spacing] || value }),
  marginBottom: (value: number) => ({ marginBottom: theme.spacing[value as keyof typeof theme.spacing] || value }),
  marginTop: (value: number) => ({ marginTop: theme.spacing[value as keyof typeof theme.spacing] || value }),
  marginRight: (value: number) => ({ marginRight: theme.spacing[value as keyof typeof theme.spacing] || value }),
  marginLeft: (value: number) => ({ marginLeft: theme.spacing[value as keyof typeof theme.spacing] || value }),
};
