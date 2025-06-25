import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useMemo } from 'react';

// Type definitions for the theme
type ThemeColors = typeof Colors.light;
type ThemeTypography = {
  header: typeof Typography.header & { color: string };
  body: typeof Typography.body & { color: string };
  caption: typeof Typography.caption & { color: string };
  small: typeof Typography.small & { color: string };
  label: typeof Typography.label & { color: string };
  button: typeof Typography.button & { color: string };
  input: typeof Typography.input & { color: string };
  sectionTitle: typeof Typography.sectionTitle & { color: string };
  subsectionTitle: typeof Typography.subsectionTitle & { color: string };
  modalTitle: typeof Typography.modalTitle & { color: string };
};
type ThemeSpacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
};
type ThemeBorderRadius = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
};
type ThemeShadows = {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};
type ThemeLayout = {
  containerPadding: number;
  modalPadding: number;
  buttonHeight: number;
  inputHeight: number;
  fabSize: number;
};

type Theme = {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  layout: ThemeLayout;
  getColor: (key: keyof ThemeColors) => string;
  getSpacing: (size: keyof ThemeSpacing) => number;
  getBorderRadius: (size: keyof ThemeBorderRadius) => number;
  getShadow: (size: keyof ThemeShadows) => ThemeShadows[keyof ThemeShadows];
};

/**
 * Comprehensive theme hook that loads all theme properties at compile time.
 * This optimizes performance by avoiding repeated theme checks in components.
 * 
 * @returns An object containing all theme properties for the current color scheme
 */
export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();
  
  return useMemo((): Theme => {
    const currentColors = Colors[colorScheme ?? 'light'];
    
    const spacing: ThemeSpacing = {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    };
    
    const borderRadius: ThemeBorderRadius = {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 50,
    };
    
    const shadows: ThemeShadows = {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
    };
    
    const layout: ThemeLayout = {
      containerPadding: 16,
      modalPadding: 20,
      buttonHeight: 44,
      inputHeight: 40,
      fabSize: 56,
    };
    
    return {
      // Colors
      colors: currentColors,
      
      // Typography
      typography: {
        header: {
          ...Typography.header,
          color: currentColors.textPrimary,
        },
        body: {
          ...Typography.body,
          color: currentColors.text,
        },
        caption: {
          ...Typography.caption,
          color: currentColors.textSecondary,
        },
        small: {
          ...Typography.small,
          color: currentColors.textSecondary,
        },
        button: {
          ...Typography.button,
          color: currentColors.buttonText,
        },
        input: {
          ...Typography.input,
          color: currentColors.text,
        },
        sectionTitle: {
          ...Typography.sectionTitle,
          color: currentColors.textPrimary,
        },
        subsectionTitle: {
          ...Typography.subsectionTitle,
          color: currentColors.textPrimary,
        },
        modalTitle: {
          ...Typography.modalTitle,
          color: currentColors.textPrimary,
        },
        label: {
          ...Typography.label,
          color: currentColors.textSecondary,
        },
      },
      
      // Spacing
      spacing,
      
      // Border radius
      borderRadius,
      
      // Shadows
      shadows,
      
      // Layout
      layout,
      
      // Helper functions
      getColor: (key: keyof ThemeColors) => currentColors[key],
      getSpacing: (size: keyof ThemeSpacing) => spacing[size],
      getBorderRadius: (size: keyof ThemeBorderRadius) => borderRadius[size],
      getShadow: (size: keyof ThemeShadows) => shadows[size],
    };
  }, [colorScheme]);
}; 