---
name: Tactile Neumorphic Productivity
colors:
  surface: '#f8f9fd'
  surface-dim: '#d9dade'
  surface-bright: '#f8f9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3f7'
  surface-container: '#edeef2'
  surface-container-high: '#e7e8ec'
  surface-container-highest: '#e1e2e6'
  on-surface: '#191c1f'
  on-surface-variant: '#424754'
  inverse-surface: '#2e3134'
  inverse-on-surface: '#f0f0f5'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f8f9fd'
  on-background: '#191c1f'
  surface-variant: '#e1e2e6'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
This design system crafts a focused, tranquil, and tangible workspace for mobile calendar and task management. It blends modern minimalism with soft neumorphism (soft UI), simulating a seamless physical matte surface sculpted under directional, diffuse natural lighting.

The visual mood evokes clarity, tactile satisfaction, and effortless control. By abandoning flat card borders and harsh contrast lines in favor of continuous molded clay planes, interactive elements emerge naturally from the background canvas. Interactive touch states deliver micro-physical feedback through transitioning between extruded convex surfaces and debossed recessed insets. Crisp electric blue accents draw the eye to active states, progress indicators, and critical deadlines without disrupting the calming monochrome canvas.

## Colors
The palette is built around an off-white soft grey base (`#ebecf0`), engineered specifically to sustain dual-shadow neumorphic lighting:
- **Base Canvas & Surface (`#ebecf0` / `#e6e8ec`):** Serves as the global backdrop and extruded surface color. Components share the exact chromatic DNA of the background to ensure they appear pressed directly out of the base material.
- **Shadow Extremes:** 
  - Specular Highlight: Pure white `#ffffff` oriented towards top-left (−135° illumination).
  - Ambient Shadow: Subdued cool grey `#b8bec9` at 70% opacity oriented towards bottom-right (45°).
- **Primary Accent (`#3b82f6`):** Vibrant electric blue used sparingly for actionable highlights, active toggles, calendar date selection badges, and task completions.
- **Secondary Slate (`#64748b`):** Muted cool slate for secondary metadata, calendar sub-headers, and inactive icons.
- **Neutral Typography:** Deep graphite (`#1e293b`) for maximum readability on primary text, scaling down to `#64748b` for secondary labels, ensuring strict WCAG AA legibility across soft tonal planes.

## Typography
Typography relies on **Inter** to deliver a neutral, highly engineered typographic framework that balances the physical, sculpted appearance of neumorphic UI elements.

- **Headlines:** Display weights utilize negative letter-spacing to preserve punchy structure against low-contrast shadow fields.
- **Body:** Standard text remains crisp, avoiding faint weights (never falling below 400 regular) to guarantee legibility against muted grey backgrounds.
- **Labels & Numbers:** Micro-labels and time indicators utilize medium-to-semibold weights with slight positive tracking to preserve tabular clarity on calendar grids and task timestamps.

## Layout & Spacing
The layout uses an 8pt spatial grid designed for tactile mobile interaction. Because dual shadows expand beyond traditional component bounding boxes, element gaps require generous breathability to prevent overlapping shadow artifacts.

- **Canvas Margins:** Mobile viewports enforce a strict `1.25rem` (20px) outer margin to maintain safe clearance from physical screen edges.
- **Component Padding:** Cards and interactive groups use `space-lg` (24px) internal padding, ensuring extruded convex profiles do not crowd internal text.
- **Spacing Rhythm:** Form fields and calendar event lists keep a `space-md` (16px) vertical separation, providing distinct physical relief between successive interactive rows.

## Elevation & Depth
Depth is strictly simulated via dual-axis soft illumination (simulated light origin: upper-left at 315°):

1. **Extruded (Raised / Convex):** Used for resting buttons, cards, floating actions, and unpressed tiles.
   - Dual Shadow: `-6px -6px 14px rgba(255, 255, 255, 1.0), 6px 6px 14px rgba(184, 190, 201, 0.65)`.
   - Subtle surface gradient: `linear-gradient(145deg, #fbfcfe, #e1e3e8)`.

2. **Debossed (Recessed / Inset / Sunken):** Used for text inputs, progress wells, active toggle tracks, calendar day wells, and pressed button states.
   - Dual Inset Shadow: `inset 4px 4px 8px rgba(184, 190, 201, 0.65), inset -4px -4px 8px rgba(255, 255, 255, 0.9)`.
   - Background fills with flat `#e4e6ea` to denote recessed depth.

3. **Active Floating (Elevation 2):** High-priority modals and toast containers.
   - Dual Shadow: `-10px -10px 24px rgba(255, 255, 255, 1.0), 12px 12px 28px rgba(184, 190, 201, 0.75)`.

Outlines and borders are avoided, except for accessibility focus rings which display an ultra-crisp `2px solid #3b82f6` with a `2px` offset.

## Shapes
Geometry emphasizes smooth, organic curvature that enhances light wrap-around:
- Standard interactive elements, calendar cells, and content cards feature generous `16px` to `24px` border radii.
- Form inputs, segmented controls, chips, and pill buttons utilize fully circular caps (`rounded-full` / `9999px`) to emphasize pill-shaped recessed channels.
- Hard, angular corners (under 12px) are strictly forbidden, as harsh angles break the illusion of continuous molded clay surfaces.

## Components

### Buttons & Interactive Controls
- **Default State:** Extruded surface matching canvas tone with dual drop shadows. Crisp dark graphite label.
- **Hover/Focus State:** Slight lighting intensification; focus ring displays `#3b82f6` with 2px offset.
- **Pressed/Active State:** Immediate transition to debossed inset shadows (`inset 4px 4px 8px ...`), giving the sensation of physical compression.
- **Primary Action (Blue):** Inset with a rich vibrant blue fill (`#3b82f6`), white text, and an outer ambient drop shadow tinted blue (`0 8px 20px rgba(59, 130, 246, 0.35)`).

### Text Inputs & Search Bars
- Recessed pill-shaped wells using dual inset shadows.
- Inner text uses `#1e293b`, with placeholder text at `#94a3b8`.
- On focus, the inner shadow deepens slightly and gains an electric blue subtle interior glow (`inset 0 0 0 1.5px #3b82f6`).

### Toggles & Switches
- **Track:** Deep debossed capsule channel (`inset 3px 3px 6px ...`). When active, track fills with `#3b82f6`.
- **Thumb:** Extruded circular pebble with raised dual drop shadows, smoothly sliding along the sunken track.

### Cards & Calendar Event Tiles
- Floating sculpted surfaces with `20px` corner radii.
- Content sections inside cards are separated by soft recessed divider lines or grouped within debossed sub-panels.
- Active or current date tiles switch from extruded to debossed with a `#3b82f6` accent indicator dot or ring.

### Checkboxes & Task Completion
- **Unchecked:** Debossed small rounded square (`12px` radius) set into the card.
- **Checked:** Extruded or flush filled `#3b82f6` surface revealing a crisp white micro checkmark icon.

### Sliders & Scrubbers
- Recessed groove track with dual inset shadows.
- Active fill segment illuminated with `#3b82f6`.
- Scrubber thumb rendered as an extruded circular pebble with high physical elevation.