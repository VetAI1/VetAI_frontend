# Vet AI Frontend - System Description & Rules

## System Overview

Vet AI is a SaaS platform designed for veterinarians to manage patient (animal) records.
Key features include:

- **Patient Registration**: Veterinarians can register animals.
- **Medical Records**: Upload images and medical reports.
- **AI Analysis**: An AI module analyzes the uploaded images and reports to provide risk assessments, observations, and insights.

## Development Rules

### Technology Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Forms**: react-hook-form + `@hookform/resolvers` + yup
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style)
- **Icons**: lucide-react
- **Toast/Sonner**: sonner
- **Charts**: chart.js + react-chartjs-2
- **Real-time**: socket.io-client
- **AI**: @google/generative-ai
- **Package Manager**: bun
- **TypeScript**: strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`

### Naming Conventions

- **Components**: PascalCase (e.g., `InputWithLabel`, `TutorModal`)
- **Files**: kebab-case for utils, schemas, services (e.g., `patient.service.ts`)
- **Schemas**: camelCase with Schema suffix (e.g., `tutorSchema`, `loginSchema`)
- **Types**: `NomeData` inferred via `yup.InferType` (e.g., `TutorFormData`)
- **Route Groups**: `(public)` for unauthenticated, `(private)` for authenticated, `/admin` for admin section
- **Class composition**: Use `cn` for short conditional class lists. For long, visually grouped class lists, use `cnLines` from `@/infra/utils`, passing one array per visual concern; it preserves `tailwind-merge` conflict resolution.

### Form Patterns

All forms **must** follow these conventions:

1. **Schema**: Define yup schemas in `schemas/` files, one per domain:

   ```ts
   export const tutorSchema = yup.object({
     name: yup.string().required('Nome é obrigatório'),
     cpf: yup
       .string()
       .test('cpf-valid', 'CPF inválido', (v) => {
         if (!v) return false;
         return validateCPF(v);
       })
       .required('CPF é obrigatório'),
     phone: yup
       .string()
       .test('phone-valid', 'Telefone inválido', (v) => {
         if (!v) return false;
         return validatePhone(v);
       })
       .required('Telefone é obrigatório'),
   });
   export type TutorFormData = yup.InferType<typeof tutorSchema>;
   ```

2. **Validators**: Use `@/utils/validations` for CPF, phone, email, date, and password schemas. Reuse pre-built schemas from that file when possible: `cpfSchema`, `phoneSchema`, `emailSchema`, `dateSchema`, `passwordSchema`.

3. **Masks**: Always format inputs using `@/utils/masks` (`formatCPF`, `formatCNPJ`, `formatPhone`, `formatCEP`). Apply in the `onChange` of `<Controller>`:

   ```tsx
   <Controller
     name="cpf"
     control={control}
     render={({ field }) => (
       <InputWithLabel
         label="CPF"
         value={field.value}
         onChange={(e) => field.onChange(formatCPF(e.target.value))}
         error={errors.cpf?.message}
       />
     )}
   />
   ```

4. **Resolver**: Wire the schema using `yupResolver`:

   ```tsx
   const { control, handleSubmit } = useForm<TutorFormData>({
     resolver: yupResolver(tutorSchema),
   });
   ```

5. **Service calls**: On submit, call the corresponding service method (e.g., `tutorsService.create(data)`) and handle success/error with toast notifications.

### Component Structure

- `components/ui/` — shadcn/ui primitives (button, input, label, switch, tooltip, carousel, progress, skeleton)
- `app/components/layout/` — Sidebar, Header, AuthGuard
- `app/components/common/` — Modal, Badge, Card, Reveal, Counter, ConfirmModal, PasswordStrength, Switch, InfiniteScroll
- `app/components/forms/` — InputWithLabel, SelectInput, Autocomplete, DateInput, TimeInput, FormTextarea, FileDropzone, FieldShell
- `app/components/data/` — DataTable, SectionCard, StatCard
- `app/components/business/` — Domain components (PatientModal, TutorModal, UploadExamModal, ConsultationHistory, etc.)

### Skeleton Loading Patterns

All async data fetching states across pages, tables, cards, stat metrics, and section containers **must** use Skeleton loading components (`@/components/ui/skeleton` or dedicated skeleton sub-views):

1. **Primitive**: Use `<Skeleton className="..." />` (renders an animated pulse block with `bg-slate-200 dark:bg-slate-800`).
2. **Tables**: `DataTable` handles loading via `loading={true}` prop, rendering skeleton rows matching header count.
3. **Cards & Metrics**: Stat cards and analytics charts render skeleton blocks corresponding to their dimensions while fetching.
4. **Spinners Limit**: `<Loader2 className="animate-spin" />` is strictly reserved for inline button submission states (`<Button loading={saving}>`) or search input indicators (`Autocomplete`), NOT for layout or page data loading.

### Reusable Components and Hooks

- Prefer existing system components and hooks over page-specific implementations whenever they satisfy the requirement.
- For remote, searchable, paginated selectors, use `Autocomplete` with `useAutoComplete`; do not duplicate search debouncing, pagination, scroll loading, or option-list state in pages and modals.
- Use `InfiniteScroll` for reusable, paginated scroll containers instead of implementing scroll-end detection in feature components.

### Paginated Table Standard Pattern (usePaginatedResource + DataTable)

All paginated data listing pages **must** follow the standard pattern combining `usePaginatedResource` and `DataTable`:

1. **Custom Hook (`usePaginatedResource`)**:
   Use `usePaginatedResource<TItem, TFilters>` to handle list fetching, page management, search debouncing, and local mutation helpers (`prependItem`, `replaceItem`, `removeItem`, `refresh`):

   ```tsx
   const {
     items,
     meta,
     loading,
     page,
     filters,
     setPage,
     setFilters,
     prependItem,
     replaceItem,
     removeItem,
   } = usePaginatedResource<MyDomain, MyFilters>({
     fetcher: myDomainService.list,
     initialFilters: { status: '' },
     pageSize: 15,
   });
   ```

2. **Declarative Table (`DataTable`)**:
   Define `columns: DataTableColumn<TItem>[]` declaratively and pass `columns`, `data`, `loading`, and `getRowKey` to `DataTable`. Do NOT write custom `<tr>`/`<td>` loops manually or render custom loading spinners for data fetching:

   ```tsx
   const columns: DataTableColumn<MyDomain>[] = [
     {
       key: 'name',
       header: 'Nome',
       render: (item) => (
         <span className="font-medium text-slate-900 dark:text-white">
           {item.name}
         </span>
       ),
     },
     {
       key: 'actions',
       header: 'Ações',
       width: '100px',
       align: 'right',
       render: (item) => (
         <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item)}>
           <Pencil size={15} />
         </Button>
       ),
     },
   ];

   <DataTable
     columns={columns}
     data={items}
     getRowKey={(item) => item.id}
     loading={loading}
     emptyState="Nenhum registro encontrado."
   />
   ```

3. **Optimistic & Local Mutations**:
   - On creation: Call `prependItem(newItem)` upon successful service call to immediately display the new item without re-fetching the entire list.
   - On edition: Call `replaceItem((item) => item.id === updated.id, updated)` to update the row in-place.
   - On deletion: Call `removeItem((item) => item.id === targetId)` to remove the row cleanly.
   - On bulk/external changes: Call `refresh()` if full list re-fetch is necessary.

### Services & API

- Each domain has a service file in `services/` with CRUD methods: `.list()`, `.get()`, `.create()`, `.update()`, `.delete()`
- Use the generic `httpClient<T>(endpoint, options)` from `@/infra/http-client`
- Use `buildQuery(params)` for paginated query parameters
- Services return `Promise<T | undefined>` — `undefined` for 204 responses

### State Management

- **React Context**: AuthContext (`@/infra/auth-context`) for authentication state, ThemeContext (`@/contexts/theme-context`) for theme
- **Custom Hooks**: `usePaginatedResource` for paginated lists, `useConsultation` for real-time chat, `useReveal` for scroll animations
- **Modal Context**: Always use `useModal` from `@/contexts/modal-context` to open application modals. Do not create page-level `useState` solely to control modal visibility.
- **Local State**: `useState`/`useCallback` for page-level state

### Modal Pattern

Use the global modal stack through `useModal`. `open` receives one object and returns the modal id. It manages stacking, Escape, click outside, page scroll locking, focus restoration, position, and animations.

```tsx
const { open, close, closeAll } = useModal();

open({
  content: ({ close }) => <PatientForm onClose={close} />,
  position: 'center',
  closeOnOutsideClick: true,
  closeOnEscape: true,
});
```

- `close()` closes the current (top) modal.
- `close(id)` closes a specific modal returned by `open`.
- `closeAll()` closes every modal in the stack.
- `position` accepts `center` (default), `top`, `right`, `bottom`, or `left`; animation follows the chosen position.
- `content` owns its layout and dimensions. Do not add width options to the modal stack API.

### Confirmation Pattern

Use `useConfirmation` from `@/contexts/confirmation-context` for user confirmation flows. Do not create local state or render `ConfirmModal` directly for new confirmations.

```tsx
const { confirm } = useConfirmation();

confirm({
  title: 'Excluir paciente?',
  description: 'Esta ação não pode ser desfeita.',
  variant: 'danger',
  icon: Trash2,
  confirmLabel: 'Excluir',
  cancelLabel: 'Manter paciente',
  onConfirm: async () => {
    await patientsService.delete(patient.id);
    removeItem((item) => item.id === patient.id);
  },
  onCancel: () => {
    trackCancellation();
  },
});
```

- `variant` accepts `default`, `alert`, and `danger`.
- `onConfirm` may be asynchronous; the confirmation stays open with its primary button loading until it finishes successfully.
- An error thrown by `onConfirm` keeps the confirmation open. Handle user feedback, such as a toast, inside the callback.
- Customize `icon`, button labels, outside-click behavior, and Escape behavior through the options object.

### Design System & Styling Standards

All screens **must** use semantic design tokens from `app/globals.css` (shadcn-style, backed by Tailwind's default palette: `teal`, `amber`, `stone`, `emerald`, `sky`, `red`). Do **NOT** use raw palette utilities (`slate-*`, `teal-*`, `amber-*`, `emerald-*`, `red-*`, `green-*`, `gray-*`, hex colors) in class strings — map them to tokens.

#### Semantic tokens

- **Surfaces**: `bg-background`, `bg-card`, `bg-popover`, `bg-secondary`, `bg-muted`, `bg-accent`
- **Text**: `text-foreground`, `text-secondary-foreground`, `text-muted-foreground`, `text-primary`, `text-accent-foreground`
- **Brand**: `text-primary` (teal), `bg-brand-sun` / `text-brand-sun` / `text-brand-sun-strong` (amber accent)
- **Status**: `success` / `success-soft` (emerald), `warning` / `warning-soft` (amber), `info` / `info-soft` (sky), `danger` / `danger-soft` and `destructive` (red)
- **Borders**: `border-border`, `border-input`
- **Charts**: `--chart-1..5` (read via `constants/charts.ts` with hex fallback)

#### Quick mapping (raw → token)

| Raw | Token |
|---|---|
| `text-slate-900` / `text-gray-900` / `dark:text-white` | `text-foreground` |
| `text-slate-600` / `text-gray-600` | `text-muted-foreground` |
| `text-slate-400` | `text-muted-foreground/70` |
| `text-teal-600` / `text-teal-700` | `text-primary` |
| `bg-teal-600` / `bg-teal-700` (sólido) | `bg-primary` |
| `bg-teal-50` / `bg-teal-100` / `dark:bg-teal-900/20` | `bg-primary/10` |
| `text-amber-500` | `text-brand-sun` |
| `text-amber-600` / `text-amber-700` / `text-amber-800` | `text-brand-sun-strong` |
| `bg-amber-50` / `bg-amber-100` (aviso) | `bg-warning-soft` |
| `text-red-600` / `text-red-500` | `text-danger` |
| `bg-red-50` / `bg-red-100` | `bg-danger-soft` |
| `text-emerald-600` / `text-green-600` | `text-success` |
| `bg-emerald-50` / `bg-emerald-100` | `bg-success-soft` |
| `text-blue-600` / `text-sky-600` | `text-info` |
| `bg-blue-50` / `bg-blue-100` | `bg-info-soft` |
| `bg-white` / `dark:bg-slate-800` / `dark:bg-slate-900` (superfície) | `bg-card` |
| `border-slate-200` / `dark:border-slate-700` / `dark:border-slate-800` | `border-border` |
| `hover:bg-slate-100` | `hover:bg-secondary` |
| `bg-amber-600 hover:bg-amber-700 text-white` (botão) | `bg-warning text-white hover:bg-warning/90 dark:text-stone-950` |
| `bg-red-600 hover:bg-red-700 text-white` (botão) | `bg-destructive text-white hover:bg-destructive/90` |

Keep categorical colors (`indigo`, `violet`, `purple`, `rose`, `pink`, `orange`, `lime`, `cyan`, `fuchsia`) for multi-item color coding (monitoring parameters, chart series). Do NOT touch hex inside JS objects (chart.js, jsPDF, inline `style`). Tokens already switch light/dark — do NOT add redundant `dark:` variants once tokenized.

#### Layout standards

- **Page container** (root of every screen, private + admin): `mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8` inside a `min-h-screen bg-background w-full` wrapper. Intentional narrower layouts may keep `max-w-5xl`/`max-w-6xl` but must keep `px-4 sm:px-6 lg:px-8`.
- **Page header**: prefer the `Header` component (`<Header title="..." showStorage={false} />`). Custom headers follow `mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between`, title `text-2xl sm:text-3xl font-bold tracking-tight text-foreground`, subtitle `text-sm text-muted-foreground`.
- **Cards**: `rounded-lg border border-border bg-card p-5` (compact cards may use `p-4`). Modal panels: `rounded-xl`. Badges/pills: `rounded-full`. Buttons/inputs: `rounded-md`.
- **Gaps**: card grids `gap-4`; row lists `gap-3`; section stacks `space-y-6`; form fields `space-y-4`.
- **Table rows**: `px-4 py-3`, header `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground` (handled by `DataTable`).
- **Fonts**: `font-display` (Space Grotesk) only for hero/greeting/key numbers; `font-data` (IBM Plex Mono) for technical values (codes, prices, times).
- **Motion**: durations 150/200/250/300ms by frequency, ease `--ease-brand`; always respect `prefers-reduced-motion`.
- **Skeleton**: use `<Skeleton>` (`bg-muted`) for all async data loads; `Loader2` is reserved for button/input loading states.

### Workflow Rules

- **Final Verification**: Always run `bun run format`, `bun run lint`, and `bun run build` at the end of any process to ensure code quality and build stability.
- **No console.log** in production (ESLint rule set to `warn`).

### General Rules

- **Comments**: Avoid adding comments to the code.
- Follow the ESLint flat config: 2-space indent, single quotes, semicolons, trailing commas in multiline, import ordering (builtin → external → internal → parent/sibling/index).
