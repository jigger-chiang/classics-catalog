/**
 * Design system tokens for consistent UI styling
 */

// Border radius - Modern, very rounded design
export const RADIUS = {
  sm: "rounded-xl",      // Small elements (icons, tags)
  md: "rounded-2xl",     // Medium elements (inputs, small cards)
  lg: "rounded-3xl",     // Large elements (cards, modals)
  xl: "rounded-[2rem]",  // Extra large (hero images, large cards)
  full: "rounded-full",  // Pills, badges, circular buttons
  // Specific cases
  search: "rounded-full", // Search bars - full rounded
  button: "rounded-full", // Buttons - full rounded
  card: "rounded-3xl",    // Cards - very rounded
  modal: "rounded-3xl",   // Modals - very rounded
  image: "rounded-2xl",   // Images - rounded
} as const;

// Transition effects
export const TRANSITION = {
  base: "transition-all duration-200 ease-in-out",
  smooth: "transition-all duration-300 ease-out",
  hover: "transition-all duration-200 ease-in-out",
} as const;

// Shadow effects
export const SHADOW = {
  sm: "shadow-sm",
  md: "shadow-lg",
  lg: "shadow-xl",
  xl: "shadow-2xl",
  glow: "shadow-lg shadow-amber-500/25",
  glowHover: "shadow-xl shadow-amber-400/30",
} as const;

// Hover effects
export const HOVER = {
  lift: "hover:-translate-y-1",
  liftSm: "hover:-translate-y-0.5",
  scale: "hover:scale-105",
  glow: "hover:shadow-xl hover:shadow-amber-400/30",
} as const;

