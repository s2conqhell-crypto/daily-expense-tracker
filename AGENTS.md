# ExpenseFlow Agent Instructions

## Summary of Work So Far

### Fixed: Recurring Rule Creation (`RecurringRuleDialog.tsx`)
- **Undefined values spread into Firestore payload**: `category`, `source`, `notes`, `dayOfMonth` were being spread into the Firestore document even when `undefined`, causing Firestore `undefined` errors. Fixed by collecting only defined fields.
- **Catch block swallowing errors**: `catch { }` → `catch (error) { console.error(...) }` with specific error message.
- **`new Date(defaults.nextExecution)` crash**: `defaults.nextExecution` was a Firestore Timestamp object, not a native Date. Added `toDate()` import and call.

### Migrated: Firestore Persistence
- Replaced deprecated `getFirestore` + `enableMultiTabIndexedDbPersistence` with `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })` in `config.ts`.
- Removed `enableFirestorePersistence` function and its call from `PWARegistration.tsx`.

### Fixed: div-in-p Hydration Errors
3 files had `<div>` inside `<p>` during loading skeleton state. Changed to `<span className="inline-block ...">`:

- `dashboard/page.tsx:152`
- `income/page.tsx:130`
- `expenses/page.tsx:177`

### Fixed: Wrong Date in Loan Card
`nextEmiDate` in `LoanDialog.tsx` was calculated with `startDate` frozen at creation. Changed to iterate month-by-month from `startDate` until a date past today, so new loans show the correct upcoming EMI date.

### Added: EMI Due Day Feature
- Added `emiDay?: number` to `Loan` type in `types/index.ts`.
- Added "EMI Due Day" number input in `LoanDialog.tsx` between "Total Amount" and "Interest Rate".
- `useLoans.recordPayment` now uses `loan.emiDay` for next EMI date calculation, clamping to month length with `Math.min(targetDay, lastDay)`.

### Fixed: Currency Display in Loans, Subscriptions, Recurring
- Added `useAuth` + `userData?.currency` to all `formatCurrency()` calls:
  - `loans/page.tsx` (7 calls)
  - `subscriptions/page.tsx` (6 calls)
  - `recurring/page.tsx` (2 calls)
- Dashboard was already fixed in redesign.

### Fixed: Recurring Action Buttons Always Visible
Removed `opacity-0 group-hover:opacity-100 transition-opacity` from `recurring/page.tsx` action button container so Edit/Delete buttons are always visible.

### Built: Notification System
- **`firebase/services.ts`**: Added `subscribe` method on `notifications` that calls `onSnapshot(collection, callback, error)` and returns unsubscribe function.
- **`useNotifications` hook** (`src/hooks/useNotifications.ts`): Returns `{ notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading }`. Subscribes to real-time Firestore listener on mount.
- **`NotificationBell` component** (`src/components/shared/NotificationBell.tsx`): Bell icon with unread badge; dropdown with "Mark all read" button; individual notifications click-to-read; delete button on hover; empty state; loading skeletons.
- **Budget alerts now show toasts**: `useExpenses.addExpense` imports `toast` from `sonner` and shows each budget alert notification title with an emoji prefix.
- **Budget alerts return notification titles**: `budgetAlerts.ts` returns `Promise<string[]>` with created notification titles.
- **AppLayout renders Header**: `AppLayout.tsx` now imports and renders `<Header />` component.
- **Fixed Header position**: Changed from `left: 0` to `left: 240px` on desktop to align with sidebar.
- **Fixed mobile top padding**: Changed `pt-4` to `pt-16` in `AppLayout.tsx` for fixed header clearance.

### Redesigned: Dashboard Layout
- Increased max-width to `1400px`.
- Reduced overall spacing (`space-y-5` → `space-y-4`).
- **Quick Actions**: Replaced large action cards with compact header buttons (+ Expense / + Income / Reports).
- **Hero Balance Card**: Reduced height (~30%), softer gradient, 3 mini stats (Income/Expenses/Savings) with colored text.
- **KPI Cards**: Expanded to 4 columns: Monthly Income, Monthly Expenses, Savings Rate (%), Current Balance. Colored icon containers. Larger value fonts.
- **Chart**: Increased height 220px → 260px. Added proper empty state. Added legend row beneath chart. Better tooltip styling.
- **Budget Card**: Shows "No budget set" empty state with link to budgets page. Progress bar with color zones (green <80%, yellow 80-100%, red >100%).
- **Financial Overview Cards**: 3 mini KPI cards (Subscriptions total, Active Recurring count, Upcoming EMI count).
- **Upcoming + Transactions**: Side-by-side on large screens (2:3 ratio when upcoming items exist, full width otherwise).
- **Transaction filter chips**: All/Today/Week/Month.
- **FAB**: Floating action button on mobile for quick expense add.
- **Empty states**: All sections show proper empty states.

### Fixed: Timestamp Date Filtering in Dashboard `useEffect`
Replaced `new Date(timestamp)` with `toDate(timestamp)` in the `useEffect` that fetches upcoming recurring rules, subscriptions, and EMIs. Firestore Timestamp objects produce `Invalid Date` when passed to `new Date()`.

### Visual Quality Pass
Applied premium fintech visual refinements across the entire dashboard, sidebar, header, and notification bell:

- **Dashboard**: Card backgrounds `#141822` (brighter than before), stronger `border-white/[0.08]`, soft `shadow-sm`, KPI value fonts `text-xl sm:text-2xl font-extrabold`, icon containers 32×32 with `rounded-xl` and colored backgrounds at 15% opacity, hero gradient softened with overlay circles, chart axis/legend/tooltip contrast improved, tighter 3px spacing grid.
- **Sidebar**: Background `#0E1116`, `shadow-xl shadow-black/20`, nav text `#8899AA` → white on hover/active, icon containers with hover `bg-white/5`, active `bg-[#8B6FFF]/15`, profile card `bg-[#141822]` with `border-white/[0.08]`, logout `hover:bg-[#FF5A6E]/10`.
- **Header**: Background `#0E1116` with `shadow-sm`, icon buttons `text-[#8899AA] hover:text-white hover:bg-white/5`, border `border-white/[0.06]` throughout, sheet mobile menu same dark style.
- **NotificationBell**: Dropdown `bg-[#141822]` with `border-white/[0.08]` and `shadow-2xl shadow-black/40`, unread bg `bg-[#8B6FFF]/5`, read text `#D0D8E0`, title `font-bold`, timestamp `text-[#5A6B7D]`, empty state icon `text-white/10`.

### Responsive Optimization Pass (Latest)
Made the entire application responsive across all screen sizes (320px–1920px) while preserving all business logic, Firebase integration, and design language.

#### Pages Improved (20)
- Dashboard, Expenses, Income, Budgets, Savings, Loans, Subscriptions, Recurring, Analytics, Reports, Calendar, Search, Settings, Profile, Login, Register, Forgot-password, Reset-password, Verify-email

#### Components Updated (5)
- `AppLayout.tsx` — Added `safe-area-bottom` mobile padding; increased `pb-20` → `pb-24` for bottom nav clearance
- `BottomNav.tsx` — Dark theme consistency (`bg-[#0E1116]/95`); `safe-area-bottom` padding; improved visual contrast; proper `backdrop-blur-2xl`
- `Header.tsx` — Added `safe-area-top` padding for iPhone notch/Dynamic Island; `env(safe-area-inset-left/right)` for landscape mode
- `Input.tsx` — Changed `text-sm` → `text-[16px] sm:text-sm` to prevent iOS zoom on focus; increased height `h-10` → `h-11` for better touch targets
- `Dialog.tsx` — Added `max-h-[85dvh] overflow-y-auto` for small screen overflow prevention; horizontal margin `sm:mx-0 mx-3`

#### Responsive Issues Fixed (12)
1. **iOS zoom on focus**: All input fields across auth pages and forms now use `text-[16px]` to prevent automatic zoom on iPhone
2. **Hidden action buttons on mobile**: 6 pages (expenses, income, budgets, savings, loans, subscriptions) had `opacity-0 group-hover:opacity-100` on action buttons, making Edit/Delete/Pay invisible on touch devices. Changed to `md:opacity-0 md:group-hover:opacity-100` so buttons are always visible on mobile
3. **Safe area insets**: Added `safe-area-top`, `safe-area-bottom`, `safe-area-left`, `safe-area-right` utility classes; applied to Header (top), AppLayout (bottom), and BottomNav (bottom) for iPhone notch, Dynamic Island, Home Indicator
4. **Viewport fit**: Added `viewportFit: 'cover'` to layout metadata for proper edge-to-edge display
5. **Pagination touch targets**: Expenses page pagination buttons increased from 32px (`h-8 w-8`) to 36px+ with `touch-target` class
6. **Dialog overflow**: All Radix dialogs now capped at `85dvh` with `overflow-y-auto` to prevent content clipping on small screens
7. **Bottom nav visual consistency**: Updated from `bg-background/70` to solid dark `bg-[#0E1116]/95` matching sidebar/header
8. **Form auto-complete**: Added `autoComplete` attributes to all auth form inputs
9. **Header safe area edges**: Header now uses `env(safe-area-inset-left)` and `env(safe-area-inset-right)` for landscape iPhone
10. **Touch target minimums**: Added `.touch-target` utility class (44px min-height/width) for interactive elements
11. **Auth form inputs**: All inputs on login, register, forgot-password, reset-password pages now have `text-[16px]` for iOS zoom prevention
12. **Mobile nav padding**: AppLayout mobile main area uses `safe-area-bottom` to avoid bottom nav overlap

#### Tailwind Classes Modified
- `.safe-area-bottom` — Pre-existing, kept
- `.safe-area-top`, `.safe-area-left`, `.safe-area-right`, `.safe-area-x`, `.safe-area-y`, `.safe-area-all`, `.safe-area-bottom-mobile`, `.touch-target` — New utility classes

#### Performance Improvements
- Dialog `max-h-[85dvh]` prevents unnecessary layout shifts on mobile
- `overflow-y-auto` on dialogs prevents content clipping without virtual scrolling

#### Accessibility Improvements
- `autoComplete` attributes on auth form inputs for better browser autofill
- Minimum 44px touch targets on interactive elements
- Better color contrast in bottom nav and mobile "More" drawer
- Prevented iOS zoom on input focus (WCAG success criterion 1.4.4)

### Key Decisions
- **`toDate()` helper** (`src/utils/helpers.ts`): Universal date converter that handles: `null`/`undefined` → `new Date()`, `Date` → return as-is, object with `toDate()` method (Firestore Timestamp) → call `.toDate()`, everything else → `new Date(value)`.
- **Undefined stripping safety net**: `Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined))` applied to: `loans.add`, `loans.update`, `recurringTransactions.add`, `recurringTransactions.update`, `subscriptions.add`, `subscriptions.update`, and `notifications.add`.
- **Header was dead code**: `Header` component existed at `src/components/layout/Header.tsx` but was never imported/rendered in any layout. The non-functional Bell button reported by user was this orphaned component.
- **Dashboard stays single file**: No new sub-components created; all markup remains in `page.tsx` for consistency.
- **Notification bell in header**: Moved from sidebar; Header is the single location.
- **Responsive strategy**: Used `md:` breakpoint prefix patterns to differentiate mobile/desktop behavior (e.g., `md:opacity-0 md:group-hover:opacity-100`) rather than duplicating DOM elements or using JS media queries. All changes are CSS-only where possible.

### Relevant Files
- `src/app/(dashboard)/dashboard/page.tsx` — Complete visual redesign
- `src/components/layout/Sidebar.tsx` — Visual refinements
- `src/components/layout/Header.tsx` — Visual refinements, safe areas, NotificationBell
- `src/components/layout/BottomNav.tsx` — Dark theme, safe areas, visual polish
- `src/components/layout/AppLayout.tsx` — Safe area bottom, imports Header
- `src/components/shared/NotificationBell.tsx` — Visual refinements
- `src/components/ui/dialog.tsx` — Max-height, overflow, mobile margin
- `src/components/ui/input.tsx` — iOS zoom fix (text-[16px]), h-11 touch target
- `src/components/recurring/RecurringRuleDialog.tsx` — Undefined + catch + Timestamp fix
- `src/firebase/services.ts` — Undefined stripping, notifications.subscribe
- `src/firebase/config.ts` — Persistence migration
- `src/components/shared/PWARegistration.tsx` — Removed enableFirestorePersistence
- `src/types/index.ts` — `emiDay` added to Loan
- `src/components/loans/LoanDialog.tsx` — nextEmiDate advance, emiDay field
- `src/hooks/useLoans.ts` — emiDay-based payment scheduling
- `src/hooks/useNotifications.ts` — New notification hook
- `src/hooks/useExpenses.ts` — Budget alert toasts
- `src/utils/budgetAlerts.ts` — Returns notification titles
- `src/app/layout.tsx` — Added `viewportFit: 'cover'`
- `src/app/globals.css` — Safe area utilities, touch-target class
- `src/app/(dashboard)/expenses/page.tsx` — Hidden buttons fix, pagination touch targets
- `src/app/(dashboard)/income/page.tsx` — Hidden buttons fix
- `src/app/(dashboard)/budgets/page.tsx` — Hidden buttons fix
- `src/app/(dashboard)/savings/page.tsx` — Hidden buttons fix
- `src/app/(dashboard)/loans/page.tsx` — Currency fix, hidden buttons fix
- `src/app/(dashboard)/subscriptions/page.tsx` — Currency fix, hidden buttons fix
- `src/app/(dashboard)/recurring/page.tsx` — Currency fix, always-visible buttons
- `src/app/(auth)/login/page.tsx` — iOS zoom fix, autoComplete
- `src/app/(auth)/register/page.tsx` — iOS zoom fix, autoComplete
- `src/app/(auth)/forgot-password/page.tsx` — iOS zoom fix, autoComplete
- `src/app/(auth)/reset-password/page.tsx` — iOS zoom fix, autoComplete

### Next Steps
- Test on actual iOS/Android devices for safe area behavior
- Verify iPhone landscape mode layout
- Consider adding responsive table-to-card conversion for Analytics/Reports if needed
- Add motion preference media query (`prefers-reduced-motion`) for accessibility
