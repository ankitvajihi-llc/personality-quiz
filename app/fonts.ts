import { Platform } from 'react-native';
// Shared font configuration for the entire app
export const Fonts = {
  // Serif font for titles and headings
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'System',
  }),
  
  // Sans-serif font for body text
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Font weights
  weights: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
    extrabold: '800' as '800',
  },
};

// If you want to use custom fonts later, install them and update here:
// export const Fonts = {
//   serif: 'PlayfairDisplay-Bold',
//   sans: 'DMSans-Regular',
//   ...
// };