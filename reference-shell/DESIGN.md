# Design System Specification: Editorial Financial Intelligence

## 1. Overview & Creative North Star
This design system is built to transform complex financial data into an intuitive, high-end editorial experience. We move beyond the "utilitarian app" aesthetic to embrace a **"Creative North Star" defined as The Financial Curator.**

The system rejects the standard rigid grid in favor of **intentional asymmetry** and **tonal depth**. By utilizing oversized display typography, overlapping image-on-surface layouts (as seen in the hero and feature sections of the source), and a radical approach to boundary definition, we create an interface that feels both authoritative and breathable. The goal is to instill trust through sophisticated restraint, using white space as a functional tool rather than just a background.

---

## 2. Colors
Our palette is rooted in high-contrast neutrals and a signature "Growth Green." We utilize Material Design naming conventions to ensure a systematic implementation across all surfaces.

### The Palette
*   **Primary (`#000000`):** Used for high-impact typography and primary actions. It represents the "finality" and "solidity" of financial truth.
*   **Secondary (`#006C4F`):** Our "Growth Green." Used as a signal for positive financial movement, success states, and subtle accents.
*   **Tertiary (`#DE3341`):** A sophisticated red used for error states (`error`) and high-attention callouts, balanced by `tertiary_fixed` for a softer presence.
*   **Surface / Background (`#FBF9F8`):** An off-white, warm neutral that reduces eye strain and feels more premium than pure `#FFFFFF`.

### The "No-Line" Rule
To maintain an editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through:
1.  **Background Color Shifts:** Use `surface_container_low` sections sitting on a `surface` background.
2.  **Strategic Spacing:** Using the whitespace scale to imply separation.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked physical layers. 
*   **Level 0:** `surface` (The base canvas).
*   **Level 1:** `surface_container_low` (Large content blocks).
*   **Level 2:** `surface_container_highest` (Interactive cards or focused widgets).
*   **Glass & Gradient Rule:** For floating elements (like the "Savings Goal" overlays in the source images), use **Glassmorphism**. Apply `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur. 

---

## 3. Typography
We use a high-contrast pairing of **Manrope** (Display/Headlines) and **Inter** (Title/Body/Labels) to balance character with legibility.

*   **Display (Manrope, 3.5rem - 2.25rem):** Set with tight letter-spacing (-0.02em). These are used for "Big Moments"—hero statements that guide the user's emotional state.
*   **Headline (Manrope, 2rem - 1.5rem):** Used for section starts. The source site’s use of `Wintle` is translated here to Manrope for a modern, geometric feel that maintains professional weight.
*   **Title & Body (Inter, 1.375rem - 0.75rem):** Inter provides a neutral, highly readable foundation for financial data. Use `title-md` for data points and `body-md` for descriptive text.
*   **Label (Inter, 0.75rem):** All-caps with +0.05em tracking for category headers to create an editorial "tag" look.

---

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Place a `surface_container_lowest` (Pure White) card on a `surface_container_low` background to create a "soft lift." This mimics natural paper stacking.
*   **Ambient Shadows:** If a floating effect is required (e.g., a modal or a primary FAB), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(27, 28, 28, 0.06);`. The shadow color must be a tinted version of `on_surface`, never pure black.
*   **The "Ghost Border" Fallback:** If a container requires definition against a similar background, use a `1px` stroke of `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Background: `primary` (#000000); Text: `on_primary` (#FFFFFF). Corner radius: `full` (9999px) for a "Pill" shape that stands out against rectangular content.
*   **Secondary:** Background: `secondary_container` (#59FDC5); Text: `on_secondary_container` (#007354). Use for "Success" actions like "Automate Savings."
*   **Tertiary:** Ghost style. No background, `primary` text with a 10% `outline_variant` "Ghost Border" on hover.

### Cards & Lists
*   **Forbid Dividers:** Do not use horizontal lines between list items. Use 16px-24px of vertical padding and `surface_container_lowest` backgrounds for individual cards to create separation.
*   **Editorial Spacing:** Cards should feature generous internal padding (min 32px) to allow typography to breathe.

### Input Fields
*   **Default:** `surface_container_high` background with no border. `md` (12px) rounded corners.
*   **Focus:** A subtle `2px` stroke of `secondary` (#006C4F).

### Signature Component: The "Feature Overlap"
When showcasing app features or data visualizations, overlap a `surface_container_lowest` card over a `surface_variant` image container. This creates the "Signature" look seen in the Rocket Money marketing site, breaking the flat 2D plane.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use `secondary` (vibrant green) for progress bars and "Amount Saved" figures to reinforce positive financial habits.
*   **DO** lean into "Overhanging" layouts where images or charts bleed slightly outside their containers.
*   **DO** use `surface_bright` to highlight active navigation states or "Premium" features.

### Don't:
*   **DON'T** use 100% opaque borders. They clutter the UI and break the editorial flow.
*   **DON'T** use standard "Drop Shadows" (e.g., 0px 2px 4px). They feel dated; use tonal shifts instead.
*   **DON'T** crowd the screen. If a section feels "full," double the `spacing-lg` value. Financial clarity requires room to think.
*   **DON'T** use `error` (#BA1A1A) for everything negative. Reserve it for critical alerts; use `outline` for neutral empty states.