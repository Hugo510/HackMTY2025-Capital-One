export const Colors = {
  primary: {
    main: '#004977',
    light: '#0074C4',
    dark: '#002F4F',
  },
  secondary: {
    main: '#D61F26',
    light: '#FF4F54',
    dark: '#A01519',
  },
  accent: {
    teal: '#00A9E0',
    orange: '#F26522',
  },
  neutral: {
    white: '#FFFFFF',
    offWhite: '#F5F7FA',
    lightGray: '#E1E8ED',
    gray: '#8B96A3',
    darkGray: '#525F6F',
    charcoal: '#2E3842',
    black: '#1A1F24',
  },
  status: {
    success: '#00A878',
    warning: '#FFB020',
    error: '#D61F26',
    info: '#00A9E0',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F7FA',
    dark: '#1A1F24',
  },
  text: {
    primary: '#1A1F24',
    secondary: '#525F6F',
    tertiary: '#8B96A3',
    inverse: '#FFFFFF',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
