# ExpenseFlow 🚀

**Smart Expense Tracking for Modern Life**

A production-ready, enterprise-grade personal finance management application built with Next.js 15, React 19, Firebase, and TypeScript. Features a premium UI inspired by CRED, Jupiter, and modern fintech applications.

---

## ✨ Features

### Core Features
- **Dashboard** - Real-time financial overview with charts and insights
- **Expense Management** - Full CRUD with categories, tags, receipts, and recurring transactions
- **Income Tracking** - Multiple income sources with detailed tracking
- **Budget Management** - Category-wise budgets with progress tracking and alerts
- **Savings Goals** - Set and track financial goals with visual progress
- **Analytics** - Deep insights with interactive charts (Recharts)
- **Calendar View** - Visual expense calendar with daily breakdown
- **Reports** - Generate and export reports (CSV, JSON, PDF)
- **Search** - Global search across all transactions

### Authentication & Security
- Firebase Authentication
- Google Login
- Email & Password Login
- Password Reset
- Email Verification
- Protected Routes
- Remember Me

### Premium UI/UX
- **Responsive Design** - Mobile-first, works on all devices
- **Dark/Light/System Theme** - Persisted preference
- **Glassmorphism** - Modern glass effects
- **Smooth Animations** - Framer Motion powered
- **Skeleton Loading** - Beautiful loading states
- **Empty States** - Contextual empty state messages
- **Toast Notifications** - React Hot Toast
- **Bottom Navigation** (Mobile) / **Sidebar** (Desktop)
- **Floating Action Buttons**

### PWA Support
- Installable on mobile & desktop
- Offline mode with Service Worker
- Background sync
- Fast loading with caching
- App-like experience

### Technical Features
- Server Components & Client Components
- Server Actions
- Route Handlers
- Real-time Firestore updates
- Image compression
- Type-safe throughout
- Zod validation
- React Hook Form
- Recharts for data visualization
- Modular architecture

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Components** | shadcn/ui + Radix UI |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Forms** | React Hook Form + Zod |
| **Auth** | Firebase Authentication |
| **Database** | Cloud Firestore |
| **Storage** | Firebase Storage |
| **Notifications** | Firebase Cloud Messaging |
| **PDF** | jsPDF |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
expenseflow/
├── public/
│   ├── icons/           # PWA icons
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service Worker
├── src/
│   ├── actions/         # Server Actions
│   ├── app/
│   │   ├── (auth)/      # Auth pages (login, register, etc.)
│   │   ├── (dashboard)/ # Protected pages
│   │   ├── api/         # Route Handlers
│   │   └── layout.tsx   # Root layout
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # App layout (Sidebar, Header, etc.)
│   │   ├── dashboard/   # Dashboard widgets
│   │   ├── shared/      # Shared components
│   │   └── ...          # Feature-specific components
│   ├── constants/       # App constants
│   ├── contexts/        # React contexts
│   ├── firebase/        # Firebase config & services
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Validation schemas & utils
│   ├── providers/       # App providers
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── proxy.ts         # Auth middleware (Next.js 16 proxy)
├── .env.example         # Environment variables template
├── firestore.rules      # Firestore security rules
├── storage.rules        # Storage security rules
├── next.config.ts       # Next.js configuration
└── vercel.json          # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9+ (LTS)
- npm 10+
- Firebase account (free tier is fine)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expenseflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   b. Create a new project (or use existing)
   c. Enable **Authentication**:
      - Email/Password
      - Google provider
   d. Create **Cloud Firestore** database (start in test mode, then apply rules)
   e. Create **Firebase Storage** bucket
   f. Register a **Web App** to get Firebase config

4. **Configure environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
   ```

5. **Apply Firestore security rules**

   Copy the contents of `firestore.rules` and `storage.rules` to your Firebase project:
   - Firestore: Rules tab > Copy & Save
   - Storage: Rules tab > Copy & Save

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment to Vercel

### Automatic Deployment (Recommended)

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
4. Deploy! Vercel will auto-detect Next.js configuration

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy using Vercel CLI
npx vercel --prod
```

### Environment Variables on Vercel

Add the following in **Vercel Dashboard > Project > Settings > Environment Variables**:

| Variable | Secret |
|----------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | ✅ |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | ✅(optional) |

---

## 🔒 Security

### Firestore Security Rules
The application uses strict security rules ensuring:
- Users can only access their own data
- Authentication is required for all operations
- Data validation on writes
- No public access to sensitive collections

### Storage Security Rules
- Profile pictures: Read by any authenticated user, write by owner only
- Receipts: Accessible only by the owner
- Public assets: Read-only for everyone

### Best Practices
- Environment variables for all secrets (never hardcoded)
- Input validation using Zod
- TypeScript strict mode
- Protected routes via proxy (Next.js 16)
- Rate limiting on API routes
- Sanitized user inputs

---

## 📊 Database Collections

| Collection | Purpose |
|------------|---------|
| `users` | User profiles and preferences |
| `expenses` | Expense transactions |
| `income` | Income transactions |
| `budgets` | Monthly category budgets |
| `savingGoals` | Savings goals |
| `receipts` | Uploaded receipt metadata |
| `notifications` | User notifications |
| `settings` | User settings and preferences |
| `recurringTransactions` | Recurring transaction templates |

---

## 🎨 Design Decisions

### Why shadcn/ui?
- Copy-paste components (no npm dependency)
- Full control over styling
- Accessible by default (Radix UI primitives)
- Tailwind CSS native
- Easy customization

### Why Server + Client Components?
- Server Components for data fetching and static content
- Client Components for interactivity and real-time updates
- Optimal bundle size and performance

### Why Firebase over a custom backend?
- Zero server management (ideal for Vercel)
- Real-time updates via Firestore listeners
- Built-in authentication with social login
- Scalable NoSQL database
- Generous free tier

---

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📱 Features by Role

### Dashboard
- Real-time spending summary (Today, Yesterday, Weekly, Monthly, Yearly)
- Income vs Expenses chart
- Category breakdown pie chart
- Weekly spending trend
- Cash flow analysis
- Recent transactions
- Quick add buttons

### Expense Management
- Add/Edit/Delete expenses
- Categories with sub-categories
- Payment methods
- Receipt upload
- Location tagging
- Recurring transactions
- Favorites
- Search, filter, sort

### Analytics
- Monthly/Weekly/Yearly trends
- Category analysis
- Income vs Expense comparison
- Financial health score
- Average daily/monthly spending

### Budget Management
- Category-wise monthly budgets
- Progress tracking
- Over-budget alerts
- Budget utilization %

### Savings Goals
- Multiple goals with target dates
- Progress tracking
- Goal completion celebration
- Overall savings summary

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Vercel](https://vercel.com/) - Deployment platform
- [Recharts](https://recharts.org/) - Composable charting library
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

*Built with ❤️ using Next.js, Firebase, and TypeScript*
