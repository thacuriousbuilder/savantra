
export const colors = {
    // Brand Colors
    primary: '#7C3AED',     // Purple (your primary)
    secondary: '#A3E635',   // Green (your secondary)
    accent: '#FB7185',      // Pink accent
    
    // Background
    background: '#F5F3FF',  // Light purple background
    white: '#FFFFFF',
    
    // Text
    textPrimary: '#111827', // Dark text (your specified)
    textSecondary: '#6B7280', // Medium gray
    textLight: '#A1A1AA',   // Light gray (zinc-400 from color scheme)
    
    // Input
    inputBorder: '#E5E7EB',
    placeholder: '#9CA3AF',
  } as const;
  
  export const spacing = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  } as const;
  
  export const fontSize = {
    sm: 14,
    base: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  } as const;
  
  export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
  } as const;