---
name: Precision CRM Narrative
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin: 40px
---

## Brand & Style

The design system is rooted in **Modern Minimalism**, prioritizing clarity and cognitive ease for data-heavy environments. The brand personality is professional, reliable, and unobtrusive, acting as a high-performance tool rather than a decorative interface. It aims to evoke a sense of organized calm, ensuring that users feel in control of complex customer relationships.

The aesthetic utilizes "Quiet Luxury" principles: high-quality typography, generous whitespace, and a restricted color palette. Visual interest is generated through precise alignment and intentional contrast rather than ornamental flourishes. This approach reduces interface fatigue and directs focus entirely toward the user's data and actionable insights.

## Colors

The palette centers on a "Digital Indigo" primary accent that signifies action and importance without overwhelming the senses. 

- **Primary:** A crisp, high-contrast indigo used for call-to-actions and active states.
- **Secondary:** A deep slate-navy reserved for headings and primary navigation backgrounds to anchor the layout.
- **Neutrals:** A sophisticated range of cool grays. Use lighter shades for subtle borders and backgrounds, and mid-to-dark shades for secondary text and icons.
- **Semantic:** Use a desaturated emerald for success, a soft crimson for errors, and a muted amber for warnings, ensuring they remain harmonious with the neutral-heavy core palette.

## Typography

This design system utilizes **Inter** for its exceptional legibility and systematic feel. The type hierarchy is strictly enforced to create a clear scan path through dense CRM records.

- **Headlines:** Use semi-bold weights with slight negative letter spacing to create a grounded, authoritative presence.
- **Body Text:** Standardized at 14px for density without sacrificing readability. Use 16px only for long-form notes or descriptions.
- **Labels:** Small caps or medium-weight uppercase are permitted for table headers and section labels to differentiate them from dynamic data.
- **Data Points:** Numbers should use tabular figures where possible to ensure alignment in lists and reports.

## Layout & Spacing

The system employs a **12-column fluid grid** for the main content area, with a fixed-width collapsible sidebar for navigation. 

- **The 4px Rule:** All spacing must be a multiple of 4. Use 16px (md) for standard padding within cards and 24px (lg) for vertical separation between major sections.
- **Whitespace:** Prioritize "breathe room" around key data metrics. Do not fear empty space; it serves to group related items without the need for heavy lines.
- **Density:** Provide a "compact" view toggle for data tables that reduces the base unit from 16px to 12px for power users.

## Elevation & Depth

Visual hierarchy is achieved primarily through **Tonal Layering** and **Low-Contrast Outlines**.

- **Backgrounds:** The primary application background is a very light gray (#F8FAFC). Cards and containers are pure white to create a "lifted" feel.
- **Borders:** Use 1px solid strokes in a light neutral gray (#E2E8F0) to define areas. Avoid heavy shadows; instead, use a subtle 4px blur with 2% opacity only on floating elements like dropdowns or modals.
- **Interaction:** Hover states should be indicated by a slight tonal shift (e.g., a background change from white to a very faint gray) rather than an increase in elevation or shadow depth.

## Shapes

The design system adopts a **Soft** shape language. This creates a professional yet approachable atmosphere, avoiding the severity of sharp corners while maintaining the structured feel required for a CRM.

- **Small Components:** Buttons, inputs, and tags use a 0.25rem (4px) radius.
- **Large Components:** Cards and modals use a 0.5rem (8px) radius.
- **Circular:** Use full pill shapes exclusively for status badges (e.g., "Active", "Pending") and user avatars.

## Components

- **Buttons:** Primary buttons are solid indigo with white text. Secondary buttons use a light gray ghost style with indigo text. Padding should be generous horizontally to maintain a modern look.
- **Input Fields:** Use a subtle 1px border. On focus, the border transitions to indigo with a faint 2px outer glow (ring). Labels are always positioned above the field in a medium weight.
- **Cards:** Cards are the primary container. They should be flat with a 1px border. No shadows unless the card is interactive or draggable.
- **Chips & Badges:** Used for tagging leads or status. They should have a desaturated background color with a darker version of the same hue for the text to ensure high legibility and a sophisticated tone.
- **Data Tables:** Eliminate vertical lines. Use only subtle horizontal dividers. The header row should have a slightly darker neutral background to anchor the data.
- **Activity Feed:** Use a vertical "timeline" thread with minimalist icons (20px) to denote different interaction types (Call, Email, Note).