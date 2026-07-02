---
name: Premium Culinary Editorial
colors:
  surface: '#f6fbee'
  surface-dim: '#d6dccf'
  surface-bright: '#f6fbee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f6e8'
  surface-container: '#eaf0e2'
  surface-container-high: '#e4eadd'
  surface-container-highest: '#dfe4d7'
  on-surface: '#181d15'
  on-surface-variant: '#404a3b'
  inverse-surface: '#2c3229'
  inverse-on-surface: '#edf3e5'
  outline: '#707a6a'
  outline-variant: '#bfcab7'
  surface-tint: '#126e04'
  primary: '#075200'
  on-primary: '#ffffff'
  primary-container: '#116d03'
  on-primary-container: '#92ed7a'
  inverse-primary: '#82db6b'
  secondary: '#45673b'
  on-secondary: '#ffffff'
  secondary-container: '#c6eeb6'
  on-secondary-container: '#4b6d41'
  tertiary: '#841456'
  on-tertiary: '#ffffff'
  tertiary-container: '#a3306f'
  on-tertiary-container: '#ffc8de'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9df984'
  primary-fixed-dim: '#82db6b'
  on-primary-fixed: '#012200'
  on-primary-fixed-variant: '#075300'
  secondary-fixed: '#c6eeb6'
  secondary-fixed-dim: '#abd19c'
  on-secondary-fixed: '#022101'
  on-secondary-fixed-variant: '#2e4e26'
  tertiary-fixed: '#ffd8e6'
  tertiary-fixed-dim: '#ffafd1'
  on-tertiary-fixed: '#3d0025'
  on-tertiary-fixed-variant: '#851557'
  background: '#f6fbee'
  on-background: '#181d15'
  surface-variant: '#dfe4d7'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Bebas Neue
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.2'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  tamil-body:
    fontFamily: Noto Sans Tamil
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.8'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: auto
  max-width: 1200px
---

## Brand & Style

This design system is built on the philosophy of "elevated heritage." It captures the vitality of farm-to-table culinary traditions, presenting them through a refined, premium lens. The aesthetic is strictly flat and editorial, eschewing gradients and heavy shadows in favor of rich tonal layering and impeccable typography.

The target audience seeks authenticity, freshness, and quality. The UI should feel like a high-end botanical food journal—clean, structured, and inviting. The emotional response is one of trust, organic growth, and sophistication, achieved through a "Lush Minimalist" approach that prioritizes natural palettes and clarity over visual noise.

## Colors

The palette is inspired by lush gardens and harvest tones. The **cool neutral** background provides a crisp, linen-like canvas that is more sophisticated than pure white. 

**Leafy Green** serves as the primary action color, signaling freshness and vitality. **Muted Olive** provides a sophisticated secondary layer for subtle UI elements, while **Plum Berry** is used as a tertiary accent for callouts, seasonal highlights, or premium features. All text utilizes a deep, desaturated green-charcoal to maintain an organic contrast that is softer on the eyes than pure black.

## Typography

The typographic hierarchy is designed for impact and readability. **Bebas Neue** provides a tall, condensed, and authoritative voice for headlines, reminiscent of bold culinary mastheads found in printed journals.

**DM Sans** is the functional workhorse for body copy and UI elements, chosen for its modern geometric clarity. **Noto Sans Tamil** is integrated seamlessly for multi-language support, sharing the same x-height and optical weight as DM Sans to ensure a harmonious bilingual experience. Use `label-caps` for small metadata or overlines to add an editorial flair and structured information hierarchy.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain the editorial "magazine" feel, centered within the viewport. A 12-column system is used with generous gutters to allow the content to breathe.

Spacing is strictly mathematical, based on a 4px/8px scale. Layouts should prioritize vertical rhythm, using subtle 1px line separators to delineate sections rather than heavy padding or shadows. On mobile, margins shrink to 16px, and complex grids should reflow into a single-column stack.

## Elevation & Depth

This system avoids ambient shadows entirely to maintain a modern, flat aesthetic. Depth is communicated through **Tonal Layers** derived from the neutral and primary palettes:

1.  **Level 0 (Background):** The base canvas, a very light sage-tinted neutral.
2.  **Level 1 (Cards/Containers):** A slightly darker tonal shift from the background, used for primary content sections.
3.  **Level 2 (Interaction/Popovers):** The lightest tint or a desaturated green, used for hover states or elements that need to appear "closer" to the user.

Structural separation is achieved using a subtle `1px` solid border in the Primary Leafy Green color at low opacity (approx. 15%). This creates a "ghost frame" that defines shapes without adding visual weight.

## Shapes

The shape language is **Soft** and structured. A `0.25rem` (4px) base radius is applied to buttons, input fields, and cards. This slight rounding takes the edge off the "Brutalist" influence of flat design, making the UI feel more approachable and "organic."

Images should follow the same corner radius, or occasionally remain perfectly sharp (0px) when used as full-bleed editorial headers to reinforce the magazine aesthetic.

## Components

### Buttons
- **Primary:** Solid Leafy Green (`#328822`) with white text. No shadow.
- **Secondary:** Transparent background with a `1px` border of Olive Green (`#5d8052`) and primary color text.
- **Text:** All-caps `label-caps` for action clarity.

### Cards
- Flat background using a light tonal variant of the neutral color.
- 1px border using a low-opacity primary color.
- No shadows. Padding should be generous (`md: 24px`).

### Input Fields
- Background-colored or slightly tinted toward the neutral shade.
- Bottom-border only (1px) for a minimal look, or a full 1px border with the standard 4px radius.
- Placeholder text in a muted neutral gray.

### Chips & Tags
- Small, pill-shaped or soft-square containers.
- Use the Plum Berry accent (`#a3306f`) for "Seasonal," "New," or "Editor's Choice" tags.

### Lists & Separators
- Horizontal lists for categories should use `1px` vertical lines as dividers.
- Vertical lists use `1px` horizontal lines between items to maintain the editorial grid.

### Images
- High-quality photography is central. Use a subtle desaturated overlay if necessary to ensure images feel integrated into the cool, organic green color palette.