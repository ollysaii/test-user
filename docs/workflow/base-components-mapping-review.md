# Figma → shadcn: mapping базових компонентів

Status: **awaiting approval**. Це read-only аудит; Figma та код компонентів не змінювалися.

## Рекомендований mapping

| Figma | shadcn основа | Рішення для адаптації | Складність |
|---|---|---|---|
| Button | `Button` | Зберегти `primary`, `secondary`, `ghost`; `default` у shadcn зробити сумісним alias для `primary`. Додати Figma-розміри `sm/md/lg`. | Низька |
| Link Button | `<a>` + `buttonVariants` | Не використовувати семантику `<button>` для навігаційного посилання. Візуально успадкувати Button. | Низька |
| Icon Button | `Button` | Використати icon sizes, Figma icon swap передавати як React child; вимагати `aria-label`. | Низька |
| Input | `Field` + `Input` + `InputGroup` | Figma-компонент є складеним полем: label, required, leading icon, help icon/text, phone/currency. Це не один голий `Input`. | Середня |
| Search | `InputGroup` + `Input` | Leading search icon, clear action для filled state, responsive height. | Середня |
| Textarea | `Field` + `Textarea` | Label/help/error живуть у `Field`; сам control — `Textarea`. | Низька |
| Tab — Text | `Tabs` | `TabsList` + `TabsTrigger`; underline/text recipe як окремий visual variant. | Середня |
| Tab — Filled | `Tabs` | Додати `variant="filled"`; не підміняти ToggleGroup, якщо елементи перемикають tab panels. | Середня |
| Toggle | `Switch` | Figma `Off/On` → `checked=false/true`; label через `Field`. | Низька |
| Switcher | `ToggleGroup` | `type="single"`, `spacing={0}`; Figma slot → дочірні `ToggleGroupItem`. | Низька |
| Checkbox | `Checkbox` + `Field` | Підтримати unchecked, checked, indeterminate та disabled. | Низька |
| Radiobutton | `RadioGroup` + `RadioGroupItem` | Checked/unchecked визначає `value`; disabled передається нативним prop. | Низька |
| Dropdown field + item + list | `Select` | Field → `SelectTrigger`; item → `SelectItem`; standalone list → `SelectContent`. Не змішувати з action-oriented `DropdownMenu`. | Середня |
| Badge | `Badge` | Розширити variants до `brand`, `success`, `warning`, `error`, `gray`; підтримати left/right icon slots. | Низька |
| File Upload | Custom composition | `Field` + native file input + Button + Progress; у shadcn немає одного прямого еквівалента. | Висока |

## Responsive component contract

У Figma desktop і mobile збережені як окремі component sets. У коді рекомендується один компонент з одним API та responsive recipes.

### Button sizes

| API size | Desktop | Mobile |
|---|---:|---:|
| `sm` | 32 px | 40 px visual; мінімальна hit area 44 px |
| `md` | 40 px | 44 px |
| `lg` | 48 px | 48 px |

### Other measured differences

- Search: 32 px desktop, 40 px mobile; mobile hit area має бути не менше 44 px.
- Input field wrapper: 56 px desktop, 72 px mobile.
- Textarea wrapper: 140 px desktop, 144 px mobile.
- Toggle control: 20 px desktop, 24 px mobile; інтерактивний wrapper має забезпечувати більшу hit area.
- Checkbox і Radio мають 20 px visual control; label/wrapper повинен бути клікабельним і забезпечувати touch target.
- Switcher item: 24 px desktop, 32 px mobile; container: 32 px desktop, 40 px mobile.

## State translation

| Figma state | Code state |
|---|---|
| `Default/default` | base styles |
| `Hover/hover` | `hover:` або `data-highlighted` для menu/select items |
| `Pressed` | `active:` / pressed interaction state |
| `Focus/Focused` | `focus-visible:` and focus ring |
| `Filled` | value-controlled `data-filled` state; не окремий public variant |
| `Error` | `aria-invalid=true` + `data-invalid` on Field |
| `Disabled` | native `disabled` + `data-disabled` on wrapper |
| `Active` for Tabs | `data-state="active"` |
| `On/Off` | boolean `checked` |
| `Indeterminate` | `data-state="indeterminate"` |
| `Selected` for Select item | selected value / `data-state="checked"` |

## Figma evidence

- Button: 36 desktop variants and 18 mobile variants; variants `Primary`, `Secondary`, `Ghost`; sizes L/M/S; desktop states Default/Hover/Pressed/Disabled.
- Input and Textarea: Default/Hover/Focus/Error/Disabled/Filled with exposed label, help text, required indicator, text, icons, and swaps.
- Tabs: Text and Filled recipes with Default/Hover/Active/Disabled.
- Toggle: Off/On/Disabled off/Disabled on.
- Switcher: item states plus a Slot-based container.
- Checkbox: Unchecked/Checked/Indeterminate/Disabled; Radio: Unchecked/Checked/Disabled.
- Dropdown: trigger and item component sets plus standalone list compositions.
- Badge: Brand/Success/Warning/Error/Gray intent, with icon visibility and swaps.
- Most geometry, colors, typography, spacing, and radii are already bound to Variables.

## Findings to preserve in the workflow guide

### Major

1. Code Connect could not be used because the current Figma account does not have the required Dev/Full seat on an Organization or Enterprise plan. Direct MCP inspection remains available and is sufficient for this pilot.
2. Component naming is not normalized: `Erorr`, `Dropdowm`, mixed state casing (`Default/default`, `Focus/Focused`) and spacing differences. String-based automation must use an explicit normalization table.
3. Two component sets share the name `1440px / Tab - Filled` but have different heights (36 px and 40 px). The intended device for the second set must be confirmed before any Figma rename.

### Accessibility

1. Mobile 40 px controls require at least a 44 px interactive hit area even when the visual size remains 40 px.
2. Icon Buttons require an accessible name in code.
3. Link Buttons must render as links when they navigate.
4. Figma does not prove keyboard behavior or ARIA semantics; those must be verified in the code prototype.

### Intentional omissions

- No Figma components were renamed or changed.
- No shadcn component source files were generated yet.
- Design Elements and Sections remain outside scope.
- Dark mode remains deferred.

## Approval decision

After approval, generate a reusable component-adapter layer and a small interactive test page for the scoped base components.
