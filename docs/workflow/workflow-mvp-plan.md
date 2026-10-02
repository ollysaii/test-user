# Fast-track MVP: Figma → tokens → shadcn → clickable prototype

## Question this experiment must answer

Can an existing Figma design system provide the visual language for a real interactive shadcn prototype without manually redesigning every screen?

## Success criteria

1. The approved Figma colors and radius appear in the coded prototype.
2. At least one real user scenario is clickable end to end.
3. Only the components used by that scenario are adapted.
4. The prototype works at desktop and mobile widths.
5. The result can be regenerated from the saved token and mapping artifacts.
6. The team receives a short record of steps, errors, and decisions.

## Fast-track scope

- Light theme only.
- One user scenario.
- Approximately 1–3 screens or states.
- Button, Text Field, Select, Switch, Checkbox, and Tabs only when the scenario needs them.
- Existing Figma naming remains unchanged during the pilot.
- Local code project first; GitHub is optional until the approach is accepted.

## Deferred until the MVP proves the idea

- Renaming Figma components and variant properties.
- Full component-library parity.
- Dark mode.
- Charts, Sidebar, File Upload, and design elements not used by the scenario.
- Code Connect.
- Bidirectional token synchronization.
- Production-ready package structure and publishing.

## Execution path

1. Receive one user story or hypothesis.
2. Generate the smallest shadcn prototype that can test it.
3. Apply the already generated Figma-based theme.
4. Adapt only the components visible in the flow.
5. Test interactions, responsive behavior, keyboard behavior, and obvious contrast issues.
6. Review the result and decide whether to continue, revise the mapping, or stop.
7. Only after success, capture the approved prototype back into Figma and generalize the workflow for the team.

## Why this is faster

The previous steps established the reusable foundation. Repeating a full audit for every prototype would not improve the hypothesis test. The fast track reuses the exported DTCG files, theme CSS, and mapping, and spends effort only on the screen being tested.
