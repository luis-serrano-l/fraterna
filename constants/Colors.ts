/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 * 
 * NEW COLOR SYSTEM:
 * The app now uses a consistent color system based on the History view's aesthetic.
 * 
 * Usage examples:
 * - Container backgrounds: Colors[colorScheme].containerBackground
 * - Active states: Colors[colorScheme].containerBackgroundActive
 * - Borders: Colors[colorScheme].border
 * - Text: Colors[colorScheme].textPrimary, textSecondary, textTertiary
 * - Separators: Colors[colorScheme].separator, separatorSubtle
 * 
 * Helper function: getColor(colorScheme, 'containerBackground')
 * 
 * TYPOGRAPHY:
 * Typography variables are now in a separate file: @/constants/Typography
 * Import with: import { Typography } from '@/constants/Typography'
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#00ffff';

// Cyan/Aqua color palette for consistent UI elements
const cyanLight = 'rgba(0, 255, 255, 0.05)';
const cyanMedium = 'rgba(0, 255, 255, 0.1)';
const cyanSubtle = 'rgba(0, 255, 255, 0.02)';
const cyanBorder = 'rgba(0, 255, 255, 0.2)';
const cyanDark = 'rgba(0, 255, 255, 0.8)';

const grayLight = 'rgba(128, 128, 128, 0.1)';
const grayMedium = 'rgba(128, 128, 128, 0.2)';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    
    // Container colors (preferred from History view)
    containerBackground: cyanLight,
    containerBackgroundActive: cyanMedium,
    containerBackgroundEmpty: grayLight,
    containerBackgroundSubtle: cyanSubtle,
    
    // Border colors
    border: cyanBorder,
    borderSubtle: grayMedium,
    
    // Text colors
    textPrimary: '#000',
    textSecondary: 'rgba(0, 0, 0, 0.7)',
    textTertiary: 'rgba(0, 0, 0, 0.8)',
    
    // Interactive elements
    buttonPrimary: '#007AFF',
    buttonText: '#fff',
    
    // Separators
    separator: cyanBorder,
    separatorSubtle: grayMedium,
  },
  dark: {
    text: '#f0ffff',
    background: '#001a1a',
    tint: tintColorDark,
    tabIconDefault: '#008080',
    tabIconSelected: tintColorDark,
    
    // Container colors (adapted for dark mode)
    containerBackground: 'rgba(0, 255, 255, 0.08)',
    containerBackgroundActive: 'rgba(0, 255, 255, 0.15)',
    containerBackgroundEmpty: 'rgba(128, 128, 128, 0.15)',
    containerBackgroundSubtle: 'rgba(0, 255, 255, 0.03)',
    
    // Border colors
    border: 'rgba(0, 255, 255, 0.3)',
    borderSubtle: 'rgba(128, 128, 128, 0.3)',
    
    // Text colors
    textPrimary: '#f0ffff',
    textSecondary: 'rgba(240, 255, 255, 0.7)',
    textTertiary: 'rgba(240, 255, 255, 0.8)',
    
    // Interactive elements
    buttonPrimary: '#007AFF',
    buttonText: '#fff',
    
    // Separators
    separator: 'rgba(0, 255, 255, 0.3)',
    separatorSubtle: 'rgba(128, 128, 128, 0.3)',
  },
};

// Helper function to get color based on color scheme
export const getColor = (colorScheme: 'light' | 'dark', colorKey: keyof typeof Colors.light) => {
  return Colors[colorScheme][colorKey];
};
