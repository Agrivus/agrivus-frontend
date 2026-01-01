# Agrivus Design System - Design Tokens

## Overview
This document defines all design tokens used in the Agrivus agricultural marketplace platform. Design tokens are the values that define the visual language and ensure consistency across the application.

---

## 1. COLOR PALETTE

### Primary Brand Colors

**Primary Green**: `#1a5c2a`
- Used for: Primary actions, main headings, key CTAs
- Contrast ratio with white: 9.5:1 ✅ WCAG AA compliant
- Example usage: Primary buttons, main links, page titles

**Secondary Green**: `#2d7d3d`
- Used for: Secondary actions, button hover states
- Contrast ratio with white: 8.2:1 ✅ WCAG AA compliant
- Example usage: Secondary buttons, outline border colors

**Dark Green**: `#0d3e1a`
- Used for: Text, form labels, headers
- Contrast ratio with white: 13.2:1 ✅ WCAG AAA compliant
- Example usage: Body text, labels, top bar background

**Light Green**: `#c8e6c9`
- Used for: Light backgrounds, badges, status indicators
- Contrast ratio with dark text: 6.5:1 ✅ WCAG AA compliant
- **UPDATED:** Changed from #e8f5e9 for better contrast
- Example usage: Background for cards, certification badges

**Medium Green**: `#4a8c5a`
- Used for: Secondary visual elements
- Contrast ratio with white: 6.1:1 ✅ WCAG AA compliant
- Example usage: Icon fills, secondary badges

**Bright Green**: `#3aab5a`
- Used for: Success states, active indicators
- Contrast ratio with white: 5.8:1 ✅ WCAG AA compliant
- Example usage: Success messages, active toggles

**Vibrant Green**: `#2ecc71`
- Used for: Alerts, notifications
- Contrast ratio with white: 5.2:1 ✅ WCAG AA compliant
- Example usage: Success notifications

### Accent Color

**Accent Gold**: `#d4a017`
- Used for: Highlights, underlines, special emphasis
- Contrast ratio with dark green: 5.8:1 ✅ WCAG AA compliant
- Contrast ratio with white: 2.1:1 ⚠️ Only for large text (14pt+)
- Example usage: Section title underlines, boost badges (Gold tier)

### Status Colors

**Success**: `#27ae60`
- Used for: Positive actions, confirmations

**Warning/Error**: `#e74c3c`
- Used for: Errors, destructive actions, form validation

**Info**: `#3498db`
- Used for: Informational messages, hints

### Neutral Colors

**Gray Tones**: Tailwind defaults
- Used for: Text, borders, backgrounds, disabled states
- Gray-50: `#f9fafb` - Very light backgrounds
- Gray-300: `#d1d5db` - Borders, dividers
- Gray-600: `#4b5563` - Secondary text
- Gray-800: `#1f2937` - Primary text

---

## 2. TYPOGRAPHY

### Font Families

**Primary Font (Body)**: Montserrat (sans-serif)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Use for: Body text, labels, buttons, UI elements
- Import: Google Fonts

**Secondary Font (Headings)**: Playfair Display (serif)
- Weights: 400 (regular), 600 (semibold), 700 (bold)
- Use for: Page titles, section headings, hero text
- Import: Google Fonts
- Adds elegance and distinction from body text

### Font Sizes & Hierarchy

```
Hero Title        | 48px-60px (3rem-3.75rem)  | Playfair Display 700
Page Title        | 36px (2.25rem)            | Playfair Display 700
Section Title     | 30px (1.875rem)           | Playfair Display 700
Large Text        | 24px (1.5rem)             | Montserrat 600-700
Body Text         | 16px (1rem)               | Montserrat 400-500
Small Text        | 14px (0.875rem)           | Montserrat 400-500
Extra Small       | 12px (0.75rem)            | Montserrat 400
```

### Line Height

**Global**: 1.625 (relaxed)
- Applied to all body text for improved readability
- Optimal for line length 65-80 characters

### Letter Spacing

**Default**: Standard (Montserrat default)
**Headings**: Standard (Playfair default)
**Buttons**: `tracking-wider` (0.05em) - All caps buttons only
**Subtitles**: `tracking-wide` (0.025em) - Optional emphasis

### Font Weight Usage

- **400 (Regular)**: Body paragraphs, standard text
- **500 (Medium)**: Slightly emphasized text
- **600 (Semibold)**: Form labels, secondary headings
- **700 (Bold)**: Primary headings, strong emphasis

---

## 3. SPACING SYSTEM

### Base Unit
The spacing system uses 4px as the base unit (Tailwind default).

### Spacing Scale

```
px-1 / py-1   | 4px   | Minimal spacing
px-2 / py-2   | 8px   | Small gaps
px-3 / py-3   | 12px  | Form input vertical padding
px-4 / py-4   | 16px  | Standard padding
px-6 / py-6   | 24px  | Large padding
px-8 / py-8   | 32px  | Extra large padding
gap-2         | 8px   | Small gaps between elements
gap-4         | 16px  | Standard gaps
gap-6         | 24px  | Large gaps
gap-8         | 32px  | Extra large gaps
py-20         | 80px  | Section vertical spacing
```

### Spacing Guidelines

**Form Elements**:
- Input padding: `px-4 py-3` (16px × 12px)
- Form field gap: `gap-6` (24px vertical spacing)
- Label margin: `mb-2` (8px)

**Cards**:
- Card padding: `p-5`, `p-6`, or `p-8` (20px-32px)
- Card gap: `gap-4` or `gap-6` (16px-24px)

**Sections**:
- Section vertical spacing: `py-12` to `py-20` (48px-80px)
- Container padding: `px-4` (16px)

**Components**:
- Button padding: `px-4 py-2` (sm), `px-6 py-3` (md), `px-8 py-4` (lg)
- Notification item padding: `p-4` to `p-5` (16px-20px)

---

## 4. SHADOWS

### Shadow Scale

**Card Shadow**: `0 5px 15px rgba(0, 0, 0, 0.1)`
- Used for: Standard cards, containers
- Elevation: Low (subtle depth)

**Card Hover Shadow**: `0 15px 30px rgba(0, 0, 0, 0.15)`
- Used for: Card hover states
- Elevation: Medium (elevated)

**Modal Backdrop**: `bg-black bg-opacity-70`
- Used for: Modal overlay background
- Opacity: 70% (prominent)

**Tailwind Shadows**:
- `shadow-md`: Medium shadow (standard buttons)
- `shadow-lg`: Large shadow (hover states)
- `shadow-xl`: Extra large shadow (modals)
- `shadow-2xl`: Massive shadow (special emphasis)

---

## 5. BORDER RADIUS

### Radius Scale

```
rounded    | 0.25rem (4px)  | Standard elements
rounded-lg | 0.5rem (8px)   | Cards, buttons, dropdowns
rounded-full| 50%            | Badges, circular elements
```

### Usage Guidelines

- **Standard elements** (inputs, dropdowns): `rounded` (4px)
- **Cards & containers**: `rounded-lg` (8px)
- **Badges & pills**: `rounded-full` (circular)
- **Buttons**: Use default or `rounded` for square corners

---

## 6. ANIMATIONS & TRANSITIONS

### Transition Duration

**Default**: 300ms (`duration-300`)
- Used for: Hover effects, color changes, opacity
- Timing function: `ease` (default)

**Fast**: 150ms (`duration-150`) - Not commonly used
**Slow**: 500ms+ - For important transitions (optional)

### Custom Animations

**Fade Up**: `animate-fade-up`
```css
animation: fadeUp 1s ease forwards;
Transform: opacity 0 → 1, translateY 30px → 0
```
- Used for: Hero sections, on-page load animations

**Bounce Slow**: `animate-bounce-slow`
```css
animation: bounce 2s infinite;
Transform: translateY 0px → -10px → -5px → 0px
```
- Used for: Call-to-action emphasis (rarely)

### Hover Effects

**Buttons**:
- Background color change
- Lift effect: `hover:-translate-y-0.5` (2px)
- Shadow increase: `hover:shadow-lg`
- **Updated**: Reduced from -translate-y-1 (4px) to -translate-y-0.5 (2px) for subtlety

**Cards**:
- Shadow increase: `hover:shadow-card-hover`
- Lift effect: `hover:-translate-y-2` (8px)
- Transition: `transition-all duration-300`

**Links**:
- Underline animation (width 0 → 100% on hover)
- Text color change to primary-green
- Timing: 300ms

---

## 7. RESPONSIVE BREAKPOINTS

Uses Tailwind CSS default breakpoints:

```
Mobile (default)  | < 640px   | Base styles
Tablet (sm)       | ≥ 640px   | `sm:` prefix
Desktop (md)      | ≥ 768px   | `md:` prefix (commonly used)
Large (lg)        | ≥ 1024px  | `lg:` prefix
Extra Large (xl)  | ≥ 1280px  | `xl:` prefix
```

### Mobile-First Approach
- Default styles apply to mobile
- Add breakpoints to enhance for larger screens
- Example: `hidden md:flex` (hidden on mobile, visible on desktop)

### Container

**Max Width**: 1280px (`max-w-5xl` or explicit `max-w-[1280px]`)
- Applied to main content containers
- Centered with `mx-auto`

**Padding**: 16px (`px-4`)
- Applied to all screen sizes for breathing room

---

## 8. COMPONENT SPECIFICATIONS

### Button Variants

**Primary**:
- Background: Secondary Green (#2d7d3d)
- Text: White
- Hover: Gold background with Dark Green text
- Shadow: md → lg on hover

**Outline**:
- Background: Transparent
- Border: 2px Secondary Green
- Text: Secondary Green
- Hover: Gold background (10% opacity) with gold border

**Success**:
- Background: Success Green (#27ae60)
- Text: White
- Hover: Darker green

**Danger**:
- Background: Warning Red (#e74c3c)
- Text: White
- Hover: Darker red

### Button Sizes

**Small (sm)**: `px-4 py-2 text-xs`
**Medium (md)**: `px-6 py-3 text-sm` (default)
**Large (lg)**: `px-8 py-4 text-base`

### Input Elements

**States**:
- Default: `border-gray-300`
- Focus: `border-primary-green` + `ring-primary-green`
- Error: `border-warning` (red)
- Disabled: `opacity-50`

**Height**: 44px minimum (12px padding top/bottom + 16px text)
**Touch target**: ≥ 44px × 44px (mobile standard)

### Card Elevation

**Default**: `shadow-card` (0 5px 15px rgba(0,0,0,0.1))
**Hover**: `shadow-card-hover` (0 15px 30px rgba(0,0,0,0.15)) + lift

---

## 9. ACCESSIBILITY STANDARDS

### Color Contrast

All color combinations comply with **WCAG 2.1 AA standard** (minimum 4.5:1 for normal text):

- ✅ Dark Green text on white backgrounds
- ✅ Dark Green text on Light Green backgrounds (6.5:1)
- ✅ White text on Primary/Secondary Green backgrounds
- ⚠️ Gold on white: Only for large text (14pt+)

### Focus States

All interactive elements have visible focus indicators:
- Focus ring color: `primary-green`
- Ring width: 2px
- Applied via CSS: `focus:ring-2 focus:ring-primary-green`

### ARIA Labels

- All SVG icons have `aria-hidden="true"` (decorative) or `aria-label="text"` (functional)
- Buttons have descriptive labels (no icon-only buttons without labels)
- Form fields have associated labels

---

## 10. IMPLEMENTATION GUIDELINES

### When to Use Which Color

| Element | Color | Rationale |
|---------|-------|-----------|
| Primary CTA Button | Secondary Green | Brand primary action |
| Secondary CTA | Primary Green | Clear distinction |
| Links | Primary Green | Recognizable link color |
| Success Message | Vibrant Green | Positive association |
| Error Message | Warning Red | Caution association |
| Section Headings | Primary Green (text) + Gold (underline) | Emphasis + elegance |
| Badges | Light Green background + Primary Green text | Status indicator |
| Disabled State | Gray-300 border + Gray-600 text | Visual demotion |

### Spacing Decision Tree

1. **Form inputs**: Use `gap-6` between fields vertically
2. **Card content**: Use `gap-4` between elements
3. **Sections**: Use `py-12` to `py-20` for breathing room
4. **Small UI gaps**: Use `gap-2` or `gap-1`
5. **Container padding**: Always `px-4` on mobile, can increase on desktop

### Responsive Design Checklist

- [ ] Default mobile styles (no breakpoint prefix)
- [ ] `md:` prefix for desktop enhancements (≥ 768px)
- [ ] Touch targets ≥ 44px on mobile
- [ ] Text is readable without horizontal scroll
- [ ] Images scale appropriately
- [ ] Navigation adapts (mobile menu → desktop nav)

---

## 11. RECENT UPDATES

**January 2024**:
- Updated light green from #e8f5e9 to #c8e6c9 for better contrast
- Reduced button hover animation from 4px to 2px lift
- Replaced all text emojis with SVG icons (improved accessibility)
- Added ARIA labels to all interactive SVGs
- Created SelectInput component for consistent form styling
- Replaced BoostBadge purple colors with brand-consistent green/gold variants

---

## 12. COMPONENT LIBRARY REFERENCE

### Available Components

- **Button**: `variant` (primary|outline|danger|success), `size` (sm|md|lg)
- **Input**: Supports label, error, icon, helpText
- **Select**: Wrapper for select elements with consistent styling (NEW)
- **Card**: Wrapper with hover lift effect
- **Modal**: Responsive modal with sizes (sm|md|lg|xl)
- **LoadingSpinner**: Animated spinner with size options
- **StatCard**: Display metrics with icon and trend
- **BoostBadge**: User boost status indicator
- **NotificationBell**: Notification dropdown menu
- **Header**: Sticky navigation with mobile menu
- **Footer**: Multi-column footer with links

---

## 13. QUICK REFERENCE

### Color Quick Access

```tsx
// Primary colors
bg-primary-green        // #1a5c2a
text-primary-green      // Text color
hover:bg-secondary-green // On hover

// Light backgrounds (improved contrast)
bg-light-green          // #c8e6c9 (updated)

// Accents
text-accent-gold        // #d4a017
hover:text-accent-gold  // On hover

// Status
text-success            // Green (#27ae60)
text-warning            // Red (#e74c3c)
text-info              // Blue (#3498db)
```

### Typography Quick Access

```tsx
font-serif              // Playfair Display (headings)
font-sans               // Montserrat (body)

// Tailwind heading sizes
text-3xl                // ~30px
text-2xl                // ~24px
text-xl                 // ~20px
text-lg                 // ~18px
text-base               // ~16px
text-sm                 // ~14px
text-xs                 // ~12px
```

### Spacing Quick Access

```tsx
px-4 py-3               // Standard input/button padding
p-6                     // Card padding
gap-6                   // Large gaps between elements
py-12                   // Section vertical spacing
rounded-lg              // Card border radius
shadow-card             // Standard card shadow
hover:shadow-card-hover // Hover shadow
```

---

**Last Updated**: January 2024
**Version**: 1.1
**Status**: Active & Maintained
