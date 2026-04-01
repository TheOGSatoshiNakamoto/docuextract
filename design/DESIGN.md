```markdown
# Design System Specification: Technical Editorial

## 1. Overview & Creative North Star: "The Terminal Elite"

This design system is engineered for the high-performance developer. It moves away from the "generic SaaS" look of rounded bubbles and flat white surfaces, instead embracing a **Technical Editorial** aesthetic. We treat data and code as high-art, utilizing expansive negative space, aggressive contrast, and a sophisticated layering system.

**The Creative North Star: "Hyper-Precision Architecture"**
The layout should feel like a high-end, custom-themed IDE—dark, focused, and powerful. We break the traditional grid through intentional asymmetry: code snippets might bleed off-grid while functional labels remain tightly locked. We use overlapping elements to create a sense of depth that mimics a terminal environment where windows and panels are stacked with purpose.

---

### 2. Colors: Tonal Depth & Functional Vibrancy

The palette is anchored in a deep, atmospheric charcoal-blue, providing a "void" for high-contrast information to reside in.

* **Primary & Functional:** Use `primary` (#b4c5ff) for highlights and `primary_container` (#6c8ef5) for high-impact CTAs. This creates a "neon-on-midnight" effect that guides the developer’s eye instantly to actions.
* **Surface Hierarchy:** Instead of flat backgrounds, use the `surface_container` tiers to create hierarchy.
* `surface_container_lowest`: Background for code editors or input areas.
* `surface`: General page background.
* `surface_container_high`: Navigation bars or floating side-panels.

**The "No-Line" Rule**
Standard 1px solid borders are strictly prohibited for sectioning. To separate content, use **Tonal Transitions**. A section shift should be signaled by a move from `surface` to `surface_container_low`. Boundaries are felt, not seen.

**The "Glass & Gradient" Rule**
For primary calls to action or hero section elements, utilize a subtle linear gradient from `primary_container` to `primary` at 135 degrees. For floating elements (like hover menus or tooltips), apply a `surface_container_highest` background with a 20px backdrop-blur to achieve a "frosted tech" glassmorphism.

---

### 3. Typography: The Engineering Lexicon

This system pairs the technical, wide-stance of **Space Grotesk** with the functional clarity of **Inter**, accented by high-density monospace for code.

* **Display & Headlines (Space Grotesk):** Used for large-scale statements. The wide character spacing conveys an authoritative, technical personality.
* **Body & Title (Inter):** Used for documentation and UI labels. Inter provides maximum readability at small scales against dark backgrounds.
* **Label & Code (SF Mono/Monospace):** Labels (label-sm/md) should be set in uppercase with a +5% letter-spacing to mimic blueprint annotations.

**Hierarchy as Identity**
Large `display-lg` headings should be high-contrast (`on_surface`), while secondary descriptions use `on_surface_variant` at a smaller scale. This "Big/Small" contrast is the hallmark of high-end editorial design.

---

### 4. Elevation & Depth: Tonal Layering

We move beyond the "drop shadow" of the early 2010s. Elevation in this design system is achieved through light and material density.

* **The Layering Principle:** Depth is created by stacking. For example, a card shouldn't have a border; it should be a `surface_container_low` block sitting on a `surface` background. The change in hex code provides all the separation needed.
* **Ambient Shadows:** If a component must "float" (e.g., a modal), use a shadow with a blur radius of 40px, an opacity of 6%, and a color tint derived from `surface_tint`. This mimics a soft glow rather than a heavy shadow.
* **The Ghost Border:** If high-density data requires a container, use a `outline_variant` at 15% opacity. This "Ghost Border" provides a structural hint without cluttering the visual field.

---

### 5. Components: Technical Primitives

**Buttons**
* **Primary:** `primary_container` background with `on_primary_container` text. Use `lg` rounding (0.5rem). No border.
* **Secondary/Ghost:** `outline` border at 20% opacity. On hover, transition to `surface_container_high` with 100% opacity.
* **Tertiary:** Text-only, using `label-md` uppercase styling with a `primary` color toggle on hover.

**Code Blocks & Syntax Highlighting**
The core of the experience. Use `surface_container_lowest` for the block background. Ensure 1.5rem padding (spacing level 6) to let the code breathe. Syntax highlighting should strictly use the `primary` and `tertiary` palettes to remain cohesive with the brand.

**Input Fields**
Inputs must feel like a terminal. Use `surface_container_low` for the field background with a `sm` (0.125rem) bottom border of `primary` only when focused. Labels should be `label-sm` and persistent (no floating labels).

**Cards & Lists**
Forbid divider lines. Use `spacing-4` (1rem) of vertical white space to separate list items. For cards, use a subtle background shift to `surface_container_low` on hover to indicate interactivity.

**Additional Component: The "Status Badge"**
Used for API status or versioning. Use a `surface_container_highest` pill with a 2px `primary` dot (blinking for "live" states).

---

### 6. Do's and Don'ts

**Do:**
* **Do** use asymmetrical margins (e.g., 8rem left, 4rem right) in hero sections to create an editorial feel.
* **Do** leverage the `primary_fixed_dim` for subtle text highlights within paragraphs.
* **Do** maintain high density in data tables but use wide padding in marketing sections.

**Don't:**
* **Don't** use 100% white (#FFFFFF). Always use `on_surface` (#e2e2eb) to reduce eye strain on dark backgrounds.
* **Don't** use standard "Material" shadows. If it looks like a standard shadow, it’s too heavy.
* **Don't** use rounded corners larger than `xl` (0.75rem) for main containers; keep the edges crisp and technical.
* **Don't** use dividers or horizontal rules. Let the spacing scale do the work.

---
*Document Version 1.0 - Directed for Technical Excellence.*```