# Test Project 2 progress

Last verified checkpoint: Orange DTCG generation and shadcn mapping proposal

## Completed

- Private project repository created from the shared template.
- Project configuration points to Figma file `46nPhujYaIS66Y0uJeCPit`, entry node `0:1`.
- Raw Variables, Styles, and scoped base-component inventory exported through Figma MCP.
- Export counts and aliases validated.
- Orange selected as the first prototype theme.
- Generated one DTCG 2025.10 bundle containing 129 tokens and 69 resolved aliases.
- Prepared the shadcn mapping proposal and measured key contrast pairs.

## Current source state

- Primitives: 43 Variables; modes `Orange` and `Blue`.
- Semantic: 69 Variables; mode `Orange`; all values are aliases.
- Spacing: 9 Variables.
- Radius: 8 Variables.
- Text Styles: 16; Effect Styles: 5; Paint Styles: 1.
- Base component assets in scope: 26; variants: 174.

## Pending approval

Choose how code should handle the existing `text-on-brand` contrast gap:

1. Preserve the exact Figma white label on `brand-500` (`3.17:1`; fails WCAG AA for normal text).
2. Use `text-primary` (`#1E1E1E`) for the shadcn primary foreground (`5.27:1`; passes AA) and record the deliberate code-only accessibility override.

## Stale template artifacts

The old mapping and theme files still describe the original pilot. They must not be treated as Test Project 2 output and will be replaced only after the new mapping proposal and accessibility decision are approved.
