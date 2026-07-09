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
- **Dashboard**: Card backgrounds `#141822` (brighter), stronger `border-white/[0.08]`, soft `shadow-sm`, KPI value fonts `text-xl sm:text-2xl font-extrabold`, icon containers 32×32 with `rounded-xl` and colored backgrounds at 15% opacity, hero gradient softened with overlay circles, chart axis/legend/tooltip contrast improved, tighter 3px spacing grid.
- **Sidebar**: Background `#0E1116`, `shadow-xl shadow-black/20`, nav text `#8899AA` → white on hover/active, icon containers with hover `bg-white/5`, active `bg-[#8B6FFF]/15`, profile card `bg-[#141822]` with `border-white/[0.08]`, logout `hover:bg-[#FF5A6E]/10`.
- **Header**: Background `#0E1116` with `shadow-sm`, icon buttons `text-[#8899AA] hover:text-white hover:bg-white/5`, border `border-white/[0.06]` throughout, sheet mobile menu same dark style.
- **NotificationBell**: Dropdown `bg-[#141822]` with `border-white/[0.08]` and `shadow-2xl shadow-black/40`, unread bg `bg-[#8B6FFF]/5`, read text `#D0D8E0`, title `font-bold`, timestamp `text-[#5A6B7D]`, empty state icon `text-white/10`.

### Responsive Optimization Pass
Made the entire application responsive across all screen sizes (320px–1920px) while preserving all business logic, Firebase integration, and design language.

#### Pages Improved (20)
- Dashboard, Expenses, Income, Budgets, Savings, Loans, Subscriptions, Recurring, Analytics, Reports, Calendar, Search, Settings, Profile, Login, Register, Forgot-password, Reset-password, Verify-email

#### Components Updated (5)
- `AppLayout.tsx` — Added `min-h-dvh`, `pb-[calc(64px+env(safe-area-inset-bottom))] pt-[calc(56px+env(safe-area-inset-top))]` on mobile, page transition animation
- `BottomNav.tsx` — Reduced height 64→56px, iOS-native indicator dot, dark `bg-[#0E1116]/95`, `safe-area-bottom`, `backdrop-blur-2xl`, "More" drawer with 3-col grid + logout
- `Header.tsx` — Compact mobile height (h-14), burger menu + Sheet for nav, `safe-area-top`, hidden theme/search on mobile, responsive avatar sizing
- `Input.tsx` — Changed `text-sm` → `text-[16px] sm:text-sm` to prevent iOS zoom on focus; increased height `h-10` → `h-11` for better touch targets
- `Dialog.tsx` — Added `max-h-[85dvh] overflow-y-auto` for small screen overflow prevention; horizontal margin `sm:mx-0 mx-3`

#### iOS PWA Optimizations
- **Safe area insets**: `safe-area-top/left/right/bottom` utilities applied to Header (top), AppLayout main (bottom), BottomNav (bottom)
- **100dvh**: Changed body from `min-h-screen`→`min-h-dvh` and all page wrappers from `min-h-screen`→`min-h-dvh` to prevent layout jumps when Safari address bar hides/shows
- **iOS zoom prevention**: All inputs force `font-size: 16px !important` globally via CSS
- **Touch callout suppression**: `-webkit-touch-callout: none` prevents iOS link/image context menu in PWA mode
- **Tap highlight**: `-webkit-tap-highlight-color: transparent` on all elements
- **Overscroll**: `overscroll-behavior: none` on body to prevent pull-to-refresh
- **Smooth scrolling**: `-webkit-overflow-scrolling: touch` for native inertial scrolling
- **Apple PWA meta**: `apple-mobile-web-app-capable: yes`, `apple-mobile-web-app-status-bar-style: black-translucent`, `viewportFit: cover`, `maximumScale: 1`
- **Splash screens**: 14 device-specific `apple-touch-startup-image` entries covering all iPhone/iPad portrait resolutions
- **Touch icons**: `apple-touch-icon` PNGs at 120×120, 152×152, 180×180
- **Typographic scale**: Added responsive utility classes (`txt-h1` through `txt-label`) with iPhone-native proportions (28px→40px headers, 15px→16px body)

#### Responsive Issues Fixed (10)
1. **iOS zoom on focus**: All inputs use `text-[16px]` + `font-size: 16px !important` via global CSS
2. **Hidden action buttons on mobile**: 6 pages use `md:opacity-0 md:group-hover:opacity-100` so buttons are visible on touch devices
3. **Safe area insets**: Utilities + applied to Header (top), AppLayout (bottom), BottomNav (bottom)
4. **Viewport fit**: `viewportFit: 'cover'` in layout metadata
5. **Pagination touch targets**: Minimum 44px via `touch-target` class
6. **Dialog overflow**: Radix dialogs capped at `85dvh` with `overflow-y-auto`
7. **Bottom nav**: Reduced to 56px, iOS indicator dot, "More" drawer
8. **Form auto-complete**: `autoComplete` attributes on auth form inputs
9. **Page container utility**: `page-container` class = `max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8` applied across all pages
10. **Mobile nav padding**: AppLayout main uses computed `pb-[calc(64px+...)]` instead of fixed `pb-24`

#### Tailwind Classes Added
- `.safe-area-top`, `.safe-area-bottom`, `.safe-area-left`, `.safe-area-right`, `.safe-area-x`, `.safe-area-y`, `.safe-area-all` — env(safe-area-inset*) wrappers
- `.touch-target` — 44px min-height/width
- `.txt-h1` through `.txt-label` — iPhone-native typography scale
- `.page-padding`, `.page-container`, `.page-space` — consistent page layout

### Mobile Redesign
Created separate mobile-specific layouts (LG screen and below) for all 9 dashboard pages while preserving desktop unchanged behind `hidden lg:block`.

#### Mobile Components Created
- `src/components/mobile/` — MobileHeader, MobileBottomNav (floating rounded), MobileFAB (animated + bottom sheet with 7 quick actions), MobileBalanceCard, MobileQuickStats, MobileTransactionItem (swipeable), MobileDashboard, MobileFormSheet (responsive bottom sheet — Sheet on mobile, Dialog on desktop)

#### Pages Converted (9)
- Dashboard, Expenses, Income, Budgets, Savings, Loans, Subscriptions, Recurring, Analytics

#### Forms Converted (6)
- TransactionDialog (expense/income), LoanDialog, SubscriptionDialog, RecurringRuleDialog, Budget inline dialog, Savings inline dialog — all wrapped in MobileFormSheet

### Fixed: Dialog Portal Clash — 8 Pages
All dashboard pages had dialog components rendered **inside** the `hidden lg:block` desktop wrapper. Radix dialogs use `createPortal` to render at the body level (escaping `display: none` on parent), so both the mobile `Sheet` AND desktop `Dialog` rendered simultaneously on iPhone — creating a broken overlay.

**Fix:** Moved all dialogs/sheets to be direct children of the fragment root (`<>`), outside both `lg:hidden` and `hidden lg:block` wrappers. Each dialog now renders once regardless of viewport.

**Pages fixed:**
- `subscriptions/page.tsx` — SubscriptionDialog
- `loans/page.tsx` — LoanDialog
- `recurring/page.tsx` — RecurringRuleDialog
- `expenses/page.tsx` — TransactionDialog + delete modal
- `income/page.tsx` — TransactionDialog + delete modal
- `budgets/page.tsx` — MobileFormSheet
- `savings/page.tsx` — MobileFormSheet + delete modal
- `dashboard/page.tsx` — Verified already correct

### Mobile UI Redesign (Premium Native iOS Look)
Complete mobile UI overhaul to match premium fintech apps (Monarch Money, Copilot, Rocket Money). Desktop unchanged.

#### Color System
- Background: `#09090B` (was `#0A0C10`)
- Cards: `#161A27` (was `#141822`/`#12142a`)
- Primary: `#7c5cff` (was `#8B6FFF`)
- Success: `#00d09c` (was `#00D09C`)
- Danger: `#ff5a7a` (was `#FF5A6E`)
- Warning: `#ffb020` (was `#FBBF24`)
- Muted text: `#6b7b8d` (was `#8899AA`/`#5A6B7D`)

#### Typography
- Switched `Plus Jakarta Sans` → `Inter` with weights 400/500/600/700/800
- New scale: `heading-xl` (36px), `heading-lg` (24px), `title-card` (15px), `body-base` (14px), `caption` (11px)
- Number display: `num-xl` (32px), `num-lg` (22px), `num-md` (17px)

#### Spacing System
- Horizontal padding: 20px (`px-5`)
- Between sections: 24px (`space-y-6`)
- Between cards: 16px (`gap-3`)
- Safe area support via `env(safe-area-inset-*)`

#### MobileHeader (`src/components/mobile/MobileHeader.tsx`)
- 72px height with safe-area-top awareness
- Hamburger menu (SVG icon) → opens slide-in drawer from left
- Purple gradient ExpenseFlow logo + title (centered)
- NotificationBell component + Avatar (right side)
- Slide drawer: user profile card (avatar, name, email), 10 nav items with colored icons, Settings, Sign Out

#### MobileBottomNav (`src/components/mobile/MobileBottomNav.tsx`)
- 90px height, fixed at bottom with safe-area-bottom
- Glassmorphism background (`bg-[#09090B]/92 backdrop-blur-2xl`)
- 5 tabs: Home, Expenses, Income, Budget, More
- Active tab with colored dot indicator above icon
- 11px labels, 22px icons, active state colored per tab
- "More" drawer: 3-column grid (Savings, Subscriptions, Loans, Recurring, Analytics, Calendar, Reports, Settings, Profile) + Sign Out

#### MobileFAB (`src/components/mobile/MobileFAB.tsx`)
- 64×64px, 20px border radius
- Positioned: `calc(96px + env(safe-area-inset-bottom))` from bottom
- Purple→Cyan gradient with soft shadow
- Framer Motion hover/tap animations
- Bottom sheet with 7 quick actions in 4-column grid

#### MobileBalanceCard (`src/components/mobile/MobileBalanceCard.tsx`)
- 24px border radius, gradient-balance (purple→cyan)
- `shadow-2xl` with purple tint, decorative blur circles
- Large `num-xl` amount with AnimatedCounter
- 3 mini stats (Income/Expenses/Savings) in emerald/rose/amber with evenly spaced columns

#### MobileQuickStats (`src/components/mobile/MobileQuickStats.tsx`)
- 2-column grid with `gap-3`
- 20px rounded cards with `bg-[#161a27]` and `border-white/[0.06]`
- Icon top-right in tinted 32px circle
- Large `num-md` values, savings rate in amber

#### MobileTransactionItem (`src/components/mobile/MobileTransactionItem.tsx`)
- 16px rounded containers with proper `card-shadow`
- 10×40px icon container, 14px description, 15px amount
- ⋮ overflow menu button → opens iOS bottom sheet with:
  - Edit, Duplicate, Mark as Favorite, Share, Delete
- Delete and Edit are no longer visible on the card directly

#### MobileFormSheet (`src/components/mobile/MobileFormSheet.tsx`)
- Rounded-t-[28px] (28px) top corners with blur background
- 52px buttons with 16px radius, gradient-primary on submit
- 20px horizontal padding in form content
- Proper keyboard avoidance via overflow scroll

#### Input Component (`src/components/ui/input.tsx`)
- Height increased: 48px → 52px
- Radius: `rounded-xl` → `rounded-[16px]`

#### Home Screen Quick Actions
- Row of pill buttons below greeting: Expense, Income, Transfer, Reports
- Each pill has tinted icon + white label
- Horizontally scrollable if needed

#### Page Updates (9 pages)
All mobile sections updated with consistent:
- `px-5 space-y-6` (20px padding, 24px section spacing)
- `bg-[#161a27]` card backgrounds, `border-white/[0.06]`
- `rounded-[20px]` for cards, `rounded-[16px]` for items
- `h-10 w-10 rounded-xl` icon containers
- `gap-3` for grids

#### Animations
- Framer Motion stagger children on MobileDashboard (0.06s delay)
- Individual item animations with cubic-bezier `[0.16, 1, 0.3, 1]`
- `active:scale-95/98` touch feedback on all interactive elements
- CSS keyframes: fadeIn, slideUp, scaleIn, shimmer, slideLeft/Right

### Key Decisions
- **`toDate()` helper** (`src/utils/helpers.ts`): Universal date converter that handles: `null`/`undefined` → `new Date()`, `Date` → return as-is, object with `toDate()` method (Firestore Timestamp) → call `.toDate()`, everything else → `new Date(value)`.
- **Undefined stripping safety net**: `Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined))` applied to: `loans.add`, `loans.update`, `recurringTransactions.add`, `recurringTransactions.update`, `subscriptions.add`, `subscriptions.update`, and `notifications.add`.
- **Header was dead code**: `Header` component existed at `src/components/layout/Header.tsx` but was never imported/rendered in any layout. The non-functional Bell button reported by user was this orphaned component.
- **Dashboard stays single file**: No new sub-components created; all markup remains in `page.tsx` for consistency.
- **Notification bell in header**: Moved from sidebar; Header is the single location.
- **Responsive strategy**: Used `md:` breakpoint prefix patterns to differentiate mobile/desktop behavior (e.g., `md:opacity-0 md:group-hover:opacity-100`) rather than duplicating DOM elements or using JS media queries. All changes are CSS-only where possible.
- **100dvh over 100vh**: Prevents layout jump when Safari address bar hides; all inputs forced to font-size:16px to prevent iOS zoom.
- **PNG + SVG dual icons in manifest**: SVG for modern browsers, PNG for iOS PWA (Apple requires PNG for manifest icons).
- **sharp-based icon generation**: `tools/generate-pwa-icons.js` runs on prebuild hook, generates 5 icons + 14 splash screens from single SVG source.
- **Media query splash screens**: 14 device-specific `apple-touch-startup-image` entries cover all iPhone/iPad portrait resolutions.

### Relevant Files
- `src/app/globals.css` — All iOS PWA body rules, safe area utilities, typography scale, page-container, layer-structuring fix
- `src/app/layout.tsx` — appleWebApp PWA config, viewportFit:'cover', apple-touch-icons, splash screens, 100dvh body
- `src/components/layout/AppLayout.tsx` — min-h-dvh, safe area padding, page transitions, responsive Header integration
- `src/components/layout/Header.tsx` — Compact mobile height (56px), Sheet mobile nav, safe-area-top, adaptive icon visibility
- `src/components/layout/BottomNav.tsx` — 56px iOS-native, indicator dot, "More" drawer with grid, safe-area-bottom
- `src/components/layout/Sidebar.tsx` — Visual refinements, active states, profile card, logout
- `src/components/shared/NotificationBell.tsx` — Visual refinements, dropdown styling, empty state
- `src/components/ui/dialog.tsx` — Max-height, overflow, mobile margin for small screens
- `src/components/ui/input.tsx` — iOS zoom fix (text-[16px]), h-11 touch target
- `src/components/ui/sheet.tsx` — Radix sheet component (used by Header mobile nav + BottomNav More drawer + mobile form sheets)
- `src/components/mobile/MobileHeader.tsx` — Compact 56px header with logo + notification bell + avatar
- `src/components/mobile/MobileBottomNav.tsx` — Floating rounded nav (Home/Expenses/Income/Budget/More) with `backdrop-blur-2xl`
- `src/components/mobile/MobileFAB.tsx` — Animated + button → bottom sheet with 7 quick action choices
- `src/components/mobile/MobileBalanceCard.tsx` — Compact gradient balance card with 3 mini stats
- `src/components/mobile/MobileQuickStats.tsx` — 2×2 grid (Income/Expenses/Savings Rate/Balance)
- `src/components/mobile/MobileTransactionItem.tsx` — Swipeable card with Framer Motion drag
- `src/components/mobile/MobileDashboard.tsx` — Full mobile dashboard with greeting, balance, stats, chart, transactions, budget, overview grid, goals, FAB
- `src/components/mobile/MobileFormSheet.tsx` — Responsive bottom sheet wrapper — Dialog on desktop, Sheet on mobile with sticky save
- `src/components/mobile/index.ts` — Exports all mobile components
- `src/app/(dashboard)/dashboard/page.tsx` — min-h-dvh, page-container, visual redesign, MobileDashboard
- `src/app/(dashboard)/expenses/page.tsx` — Hidden buttons fix, page-container, pagination touch targets, dialog portal fix, mobile styling pass
- `src/app/(dashboard)/income/page.tsx` — Hidden buttons fix, page-container, dialog portal fix, mobile styling pass
- `src/app/(dashboard)/budgets/page.tsx` — Hidden buttons fix, page-container, dialog portal fix, mobile styling pass
- `src/app/(dashboard)/savings/page.tsx` — Hidden buttons fix, page-container, dialog portal fix, mobile styling pass
- `src/app/(dashboard)/loans/page.tsx` — Hidden buttons fix, page-container, currency fix, dialog portal fix, mobile styling pass
- `src/app/(dashboard)/subscriptions/page.tsx` — Hidden buttons fix, page-container, currency fix, dialog portal fix, mobile styling pass
- `src/app/(dashboard)/recurring/page.tsx` — Currency fix, always-visible buttons, page-container, dialog portal fix, mobile styling pass
- `src/app/(dashboard)/analytics/page.tsx` — page-container, mobile styling pass
- `src/app/(auth)/login/page.tsx` — iOS zoom fix, autoComplete
- `src/app/(auth)/register/page.tsx` — iOS zoom fix, autoComplete
- `src/app/(auth)/forgot-password/page.tsx` — iOS zoom fix
- `src/app/(auth)/reset-password/page.tsx` — iOS zoom fix
- `src/components/recurring/RecurringRuleDialog.tsx` — Undefined values fix, catch block, Timestamp fix
- `src/firebase/services.ts` — Undefined stripping, notifications.subscribe, persistence migration
- `src/firebase/config.ts` — initializeFirestore with persistentLocalCache
- `src/components/shared/PWARegistration.tsx` — Removed enableFirestorePersistence
- `src/hooks/useNotifications.ts` — Real-time notification subscription hook
- `src/types/index.ts` — emiDay added to Loan
- `src/components/loans/LoanDialog.tsx` — nextEmiDate advance, emiDay field
- `src/hooks/useLoans.ts` — emiDay-based EMI payment scheduling
- `src/hooks/useExpenses.ts` — Budget alert toasts
- `src/utils/budgetAlerts.ts` — Returns notification titles
- `public/manifest.json` — Dark theme colors, PNG+SVG icons, display_override, launch_handler
- `public/icons/*.png` — Generated PWA icons (apple-touch-icons, splash screens, manifest icons)
- `public/sw.js` — Service Worker with stale-while-revalidate caching
- `tools/generate-pwa-icons.js` — sharp-based icon/splash generator
- `package.json` — generate-icons script, prebuild hook

### Next Steps
- Test on physical iPhone devices (SE, 13, 15 Pro, 16 Pro Max) for dialog fix, safe areas, splash screens, standalone mode
- Test install prompt on Chrome Android
- Test offline support via service worker
- Consider prefers-reduced-motion support
- Test iPhone landscape mode layout
