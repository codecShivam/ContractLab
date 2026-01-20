/**
 * 🎨 ContractLab Theme Configuration
 * 
 * Color Scheme: "Foundations Blue"
 * Inspired by Shopify Editions - clean, professional, and developer-friendly
 * Soft blues and lavenders on dark backgrounds
 */

export const theme = {
  // ============================================
  // 🌃 BASE COLORS - Background & Surfaces
  // ============================================
  bg: {
    primary: '#1a1f2e',      // Deep navy - main background
    secondary: '#252b3d',    // Slightly lighter - secondary panels
    tertiary: '#2d3548',     // Panel headers, elevated surfaces
    elevated: '#363d52',     // Hover states, elevated cards
    hover: '#3d4560',        // Hover overlay
    input: '#1f2433',        // Input fields background
  },

  // ============================================
  // 🎯 BORDERS & DIVIDERS
  // ============================================
  border: {
    subtle: '#363d52',       // Subtle dividers
    default: '#4a5270',      // Default borders
    hover: '#5a6380',        // Hover state borders
    focus: '#7091E6',        // Focus rings - medium blue
    accent: '#3D52A0',       // Accent borders
  },

  // ============================================
  // 📝 TEXT COLORS
  // ============================================
  text: {
    primary: '#EDE8F5',      // Main text - soft lavender white
    secondary: '#ADBBDA',    // Secondary text - light grayish blue
    tertiary: '#8697C4',     // Tertiary text - medium blue
    disabled: '#5a6380',     // Disabled state
    inverse: '#1a1f2e',      // Text on light backgrounds
    link: '#7091E6',         // Links - medium blue
    linkHover: '#ADBBDA',    // Link hover
  },

  // ============================================
  // 🎨 ACCENT COLORS - Brand & Highlights
  // ============================================
  accent: {
    primary: '#7091E6',      // Primary accent - bright medium blue
    primaryHover: '#8da7ed', // Primary hover
    secondary: '#3D52A0',    // Secondary accent - deep blue
    secondaryHover: '#4d62b0', // Secondary hover
    tertiary: '#8697C4',     // Tertiary - grayish blue
    tertiaryHover: '#9dadce', // Tertiary hover
  },

  // ============================================
  // ⚡ FUNCTIONAL COLORS - States & Feedback
  // ============================================
  state: {
    // Success - Mint/Teal
    success: '#10b981',
    successBg: '#064e3b20',
    successBorder: '#065f4680',
    successText: '#6ee7b7',

    // Warning - Amber
    warning: '#f59e0b',
    warningBg: '#78350f20',
    warningBorder: '#92400e80',
    warningText: '#fbbf24',

    // Error - Rose
    error: '#ef4444',
    errorBg: '#7f1d1d20',
    errorBorder: '#991b1b80',
    errorText: '#fca5a5',

    // Info - Blue
    info: '#7091E6',
    infoBg: '#1e3a8a20',
    infoBorder: '#3D52A080',
    infoText: '#ADBBDA',

    // Neutral
    neutral: '#8697C4',
    neutralBg: '#2d354820',
    neutralBorder: '#4a527080',
    neutralText: '#ADBBDA',
  },

  // ============================================
  // 🔘 BUTTON STYLES
  // ============================================
  button: {
    // Primary Button
    primary: {
      bg: '#7091E6',
      bgHover: '#8da7ed',
      bgActive: '#5a7ad4',
      text: '#ffffff',
      border: '#7091E6',
    },

    // Secondary Button
    secondary: {
      bg: '#363d52',
      bgHover: '#3d4560',
      bgActive: '#454d6a',
      text: '#EDE8F5',
      border: '#4a5270',
    },

    // Accent Button (Deep Blue)
    accent: {
      bg: '#3D52A0',
      bgHover: '#4d62b0',
      bgActive: '#2f4180',
      text: '#ffffff',
      border: '#3D52A0',
    },

    // Ghost Button
    ghost: {
      bg: 'transparent',
      bgHover: '#363d5220',
      bgActive: '#363d5240',
      text: '#ADBBDA',
      border: 'transparent',
    },

    // Danger Button
    danger: {
      bg: '#ef4444',
      bgHover: '#f87171',
      bgActive: '#dc2626',
      text: '#ffffff',
      border: '#ef4444',
    },
  },

  // ============================================
  // 🏷️ BADGE & TAG COLORS
  // ============================================
  badge: {
    // Read function
    read: {
      bg: '#7091E620',
      text: '#ADBBDA',
      border: '#7091E640',
    },

    // Write function
    write: {
      bg: '#3D52A020',
      text: '#8da7ed',
      border: '#3D52A040',
    },

    // Payable function
    payable: {
      bg: '#8697C420',
      text: '#ADBBDA',
      border: '#8697C440',
    },

    // Valid/Success
    valid: {
      bg: '#064e3b20',
      text: '#6ee7b7',
      border: '#065f4640',
    },

    // Default
    default: {
      bg: '#363d52',
      text: '#ADBBDA',
      border: '#4a5270',
    },
  },

  // ============================================
  // 🎭 TAB COLORS
  // ============================================
  tab: {
    // Read tab
    read: {
      indicator: '#7091E6',
      activeText: '#EDE8F5',
      inactiveText: '#8697C4',
      activeBg: '#2d3548',
      hoverBg: '#363d52',
    },

    // Write tab
    write: {
      indicator: '#3D52A0',
      activeText: '#EDE8F5',
      inactiveText: '#8697C4',
      activeBg: '#2d3548',
      hoverBg: '#363d52',
    },

    // Payable tab
    payable: {
      indicator: '#8697C4',
      activeText: '#EDE8F5',
      inactiveText: '#8697C4',
      activeBg: '#2d3548',
      hoverBg: '#363d52',
    },
  },

  // ============================================
  // 🔍 CODE EDITOR COLORS
  // ============================================
  editor: {
    background: '#1a1f2e',
    lineHighlight: '#2d354840',
    selection: '#7091E640',
    cursor: '#7091E6',
    lineNumber: '#5a6380',
    lineNumberActive: '#ADBBDA',
    gutterBg: '#252b3d',
  },

  // ============================================
  // 📊 CONSOLE COLORS
  // ============================================
  console: {
    bg: '#171c29',
    text: '#ADBBDA',
    icon: '#8697C4',
    border: '#363d52',
    logBg: '#252b3d',
    logBgHover: '#2d3548',
    errorIcon: '#f87171',
    successIcon: '#6ee7b7',
    infoIcon: '#7091E6',
  },

  // ============================================
  // 🎯 SPECIAL EFFECTS
  // ============================================
  effects: {
    glow: '0 0 20px rgba(112, 145, 230, 0.3)',
    glowCyan: '0 0 20px rgba(112, 145, 230, 0.4)',
    glowPurple: '0 0 20px rgba(134, 151, 196, 0.3)',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    shadowLarge: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  },
} as const

// ============================================
// 🎨 UTILITY FUNCTIONS
// ============================================

/**
 * Get RGB values from hex color
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Add opacity to hex color
 */
export function hexWithOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

/**
 * Get theme color by path (e.g., 'bg.primary', 'accent.primary')
 */
export function getThemeColor(path: string): string {
  const keys = path.split('.')
  let value: any = theme
  for (const key of keys) {
    value = value[key]
    if (value === undefined) return '#000000'
  }
  return value as string
}

export default theme
