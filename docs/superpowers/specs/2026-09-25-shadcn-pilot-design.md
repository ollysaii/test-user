# Shadcn pilot design

## Goal

Prove that the Prototype UI Library can theme and guide a real interactive shadcn prototype without manually redesigning every screen.

## Architecture

- Local React + Vite application.
- shadcn/ui using the Radix base and CSS Variables.
- Tailwind CSS v4 as configured by the current shadcn initializer.
- The approved `prototype-ui-shadcn-theme.css` is the source of theme overrides.
- Figma remains unchanged during the pilot.
- GitHub, Code Connect, dark mode, and bidirectional synchronization are deferred.

## Initial component scope

Install and verify only:

1. Button
2. Input
3. Select
4. Switch
5. Checkbox

The pilot page will be an account-settings scenario because it exercises all five controls with meaningful state changes while remaining small.

## Prototype behavior

- Edit a display name.
- Choose a language or region.
- Toggle email notifications.
- Accept a preference checkbox.
- Save changes and show an in-page success confirmation.
- Preserve state during the current browser session only; no backend or persistence.

## Responsive behavior

- One component API is used at every width.
- Desktop and mobile geometry is expressed through responsive classes rather than duplicated components.
- Interactive hit areas remain at least 44 px on touch layouts, even where the visual control is smaller.

## Data flow

Figma Variables → exported DTCG → generated theme CSS → shadcn CSS Variables → local components → interactive pilot screen.

## Error handling

- Required display name shows an inline error when empty.
- Save is blocked while the field is invalid.
- Installation or build failures stop the phase and are recorded in the experiment log.
- No external API or backend errors are in scope.

## Verification

- Production build succeeds.
- Theme CSS has no unresolved Variable references.
- The five components render with the approved light theme.
- Keyboard focus is visible.
- Form validation and save confirmation work.
- Desktop and mobile layouts are visually checked.

## Deliverables

- Local source project under `work/prototype-ui-pilot/`.
- User-facing build or preview artifact under `outputs/` when the pilot is verified.
- Updated workflow experiment and decision logs.
