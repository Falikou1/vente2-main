---
name: Ivorian Horizon
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#3f4946'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#707976'
  outline-variant: '#bfc9c5'
  surface-tint: '#2b685c'
  primary: '#00322a'
  on-primary: '#ffffff'
  primary-container: '#004b40'
  on-primary-container: '#7dbaab'
  inverse-primary: '#95d3c4'
  secondary: '#954a00'
  on-secondary: '#ffffff'
  secondary-container: '#fd8100'
  on-secondary-container: '#5d2c00'
  tertiary: '#2a2c2a'
  on-tertiary: '#ffffff'
  tertiary-container: '#404240'
  on-tertiary-container: '#adaeab'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0efdf'
  primary-fixed-dim: '#95d3c4'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#095045'
  secondary-fixed: '#ffdcc6'
  secondary-fixed-dim: '#ffb785'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#723700'
  tertiary-fixed: '#e2e3e0'
  tertiary-fixed-dim: '#c6c7c4'
  on-tertiary-fixed: '#1a1c1a'
  on-tertiary-fixed-variant: '#454745'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built to facilitate a trustworthy and vibrant community marketplace. It reflects the energy of Abidjan while maintaining the professional rigor required for peer-to-peer commerce. The aesthetic is **Modern Corporate** with a **Tactile** edge, utilizing high-quality whitespace and clear visual hierarchies to reduce cognitive load in a busy marketplace environment.

The design narrative focuses on "Proximité" (proximity) and "Confiance" (trust). This is achieved through a clean, card-based interface that prioritizes local context and user reputation. The emotional response should be one of reliability and neighborhood connection—less like a cold global e-commerce site and more like a curated, digital version of a local boutique.

## Colors

The palette is anchored by **Forest Green** (#004B40), representing stability and growth, used primarily for headers, primary actions, and trust indicators. **Ivorian Orange** (#FF8200) serves as a high-energy accent for status indicators, brand flourishes, and non-transactional calls to action (like "Contact Seller").

The background uses a soft **Off-White** (#F4F4F1) to provide a premium feel and reduce glare, while neutral grays are reserved for secondary text and borders. Success states should lean into the forest green, while warnings utilize a softened version of the orange to maintain brand harmony.

## Typography

This design system uses a dual-type approach. **Be Vietnam Pro** is used for headlines to inject a contemporary, friendly personality that feels welcoming to a local community. It is set with tighter letter-spacing in larger sizes to maintain a modern editorial look.

**Inter** is utilized for all body copy, labels, and data-heavy components. Its high legibility ensures that item descriptions and location tags (e.g., "Plateau, Cité Esculape") are easily readable even on smaller mobile screens. Bold weights in Inter should be used sparingly for emphasis on prices and user names to reinforce trust and clarity.

## Layout & Spacing

The layout follows a **fluid grid** model optimized for mobile-first usage, as is common in the Abidjan market. On mobile, we use a 2-column or 1-column grid with 20px side margins. On desktop, the content expands to a 12-column grid with a maximum width of 1280px.

Spacing follows an 8px rhythmic scale. Cards within the marketplace should have generous internal padding (min 16px) to ensure content "breathes." Group related items (like a seller's profile and their rating) using `stack-sm`, while separating distinct sections (like Product Details and Location Map) with `stack-lg`.

## Elevation & Depth

To align with a clean, modern aesthetic, this design system uses **Tonal Layers** combined with **Ambient Shadows**. 

- **Level 0 (Background):** The off-white surface (#F4F4F1).
- **Level 1 (Cards/Surface):** Pure white (#FFFFFF) with a very soft, high-diffusion shadow (0px 4px 20px rgba(0, 0, 0, 0.04)). This makes items feel "plonked" onto the canvas, inviting interaction.
- **Level 2 (Modals/Popovers):** Pure white with a more defined shadow (0px 10px 30px rgba(0, 0, 0, 0.08)) to focus attention.

Avoid heavy borders; use 1px strokes in a light gray (#E2E8F0) only when cards are adjacent to each other on a white background.

## Shapes

The shape language is **Rounded**, fostering a friendly and approachable atmosphere. 
- **Standard UI Elements:** Buttons, inputs, and small chips use a 0.5rem (8px) radius.
- **Content Containers:** Product cards and profile sections use `rounded-lg` (16px) to create a soft, modern container feel.
- **Interactive Tags:** Location and category tags use `rounded-xl` (24px) or a full pill-shape to distinguish them from actionable buttons.

## Components

### Buttons
Buttons should be substantial and tactile. **Primary actions** (e.g., "Contacter le vendeur") use the Forest Green background with white text. **Secondary actions** (e.g., "Partager") use a ghost style with a Forest Green border. *Never use "Buy Now" or "Add to Cart" patterns.*

### Trust Cards
Product cards must feature a prominent "Trust Header" or "Trust Footer." This includes the seller's star rating and a localized tag (e.g., "📍 Cocody"). The price should be displayed in a bold Inter font, clearly separated from the description.

### Chips & Tags
Use chips for neighborhood locations and item condition (e.g., "Comme neuf"). These should have a light tint of the primary color (Forest Green at 10% opacity) with dark green text to maintain legibility and professional tone.

### Inputs
Search bars and contact forms should use the 8px roundedness with a 1px subtle border. Focus states should transition the border to Forest Green with a soft glow to guide the user.

### Reputation Indicators
Small badges or icons indicating "Verified Seller" should use the Ivorian Orange to draw attention to high-trust community members without appearing like a "sale" or "discount" alert.