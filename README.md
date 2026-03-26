# Dreww. - Premium Golf Charity Platform

A fintech/web3-inspired golf scoring and charity platform with monthly draws, Stableford score tracking, and automated charity contributions.

## Features

- **Score Tracking**: Log Stableford scores (0-45 scale) from golf rounds
- **Rolling Analysis**: Track last 5 scores and performance averages
- **Monthly Draws**: Automatic eligibility for monthly competitions with prize distributions
- **Charity Integration**: Automatically contribute 10%+ of winnings to selected charities
- **Admin Dashboard**: Manage draws, verify winners, and audit trail logging
- **Subscription Tiers**: Free, Premium, and Elite memberships with different features
- **Dark Fintech Aesthetic**: Modern UI with orange accent, deep navy backgrounds, and ambient grid design

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with email/password
- **Validation**: Zod for schema validation
- **State Management**: React hooks with Supabase real-time listeners

## Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── auth/                    # Authentication pages
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── dashboard/               # User dashboard
│   │   └── page.tsx
│   ├── api/                     # API routes
│   │   ├── draws/route.ts
│   │   └── golf-scores/route.ts
│   └── layout.tsx
├── features/                    # Feature-based modules
│   ├── auth/                    # Authentication feature
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useProfile.ts
│   │   └── components/
│   │       ├── SignIn.tsx
│   │       └── SignUp.tsx
│   ├── golf/                    # Golf scoring feature
│   │   ├── hooks/
│   │   │   └── useGolfScores.ts
│   │   └── components/
│   │       ├── AddScoreForm.tsx
│   │       └── ScoresList.tsx
│   └── charity/                 # Charity integration
│       ├── hooks/
│       │   └── useCharities.ts
│       └── components/
│           └── CharitySelector.tsx
├── lib/
│   ├── schemas/                 # Zod validation schemas
│   │   ├── auth.ts
│   │   └── golf.ts
│   └── supabase/                # Supabase utilities
│       ├── client.ts            # Browser client
│       ├── server.ts            # Server client
│       └── middleware.ts        # Auth middleware
└── middleware.ts                # Next.js middleware
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Using the shadcn CLI (recommended)
npx shadcn-cli@latest init -d

# Or install manually
npm install
# or
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API → Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. The database schema was already set up via migrations

### 3. Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Database Schema

### Core Tables

- **profiles**: User profiles with subscription info
- **golf_scores**: Stableford scores from rounds
- **charities**: Verified charity organizations
- **draws**: Monthly competition draws
- **draw_results**: Winners and results
- **subscriptions**: Stripe subscription tracking
- **charity_contributions**: Donation tracking
- **admin_logs**: Audit trail for admin actions
- **notifications**: User notifications

All tables have Row Level Security (RLS) policies enabled for data protection.

## Key Features Breakdown

### Authentication

- Email/password registration and login
- Automatic profile creation on signup
- Protected routes with middleware
- Session management via Supabase Auth

### Golf Scoring

- Log Stableford scores (0-45 range)
- Track course name, par, date, and notes
- View last 5 scores and calculate averages
- Delete scores with confirmation

### Monthly Draws

- Automatic draw eligibility based on scores
- Two draw types: Random and Algorithmic (score-weighted)
- Prize distribution: 40% / 35% / 25%
- Admin verification workflow for winners

### Charity Integration

- Browse and select verified charities
- Automatic 10%+ contribution from prizes
- Track total charity donations
- Support multiple charity categories

### Subscription Management

- Free tier: Basic score tracking
- Premium tier: Advanced analytics and features
- Elite tier: Exclusive draws and support

## Validation

All forms use Zod schemas for type-safe validation:

- **Auth**: Email format, password strength, name requirements
- **Golf Scores**: Stableford range (0-45), course validation
- **Charities**: Name, URL format, category validation
- **Subscriptions**: Tier validation

## UX & Design Details

- **Dark Fintech Aesthetic**: Orange accent (#ff6b35) with deep navy background (#0a0e1a)
- **Typography**: 2 font weights (700 for headings, 400 for body)
- **Spacing**: 4px grid alignment for consistent layout
- **Micro-interactions**: Smooth 0.3s transitions, hover effects, loading states
- **Ambient Design**: Subtle grid background, gradient orbs for depth
- **Mobile-First**: Responsive across all screen sizes
- **Accessibility**: ARIA labels, keyboard navigation, color contrast compliance

## API Routes

### GET /api/golf-scores

Get user's golf scores (authenticated only)

### POST /api/golf-scores

Create new golf score (authenticated only)

### GET /api/draws

Get current month draws

### POST /api/draws

Create new draw (admin only)

## Next Steps - Payment Integration

The payment system is deferred per requirements. To integrate:

1. **Set up Stripe**: Add Stripe keys to environment
2. **Create subscription route**: `/api/subscriptions/create`
3. **Add webhook handling**: `/api/webhooks/stripe`
4. **Update profile**: Link `stripe_subscription_id` to profiles
5. **Add payment component**: Create Stripe checkout modal

## Performance Optimizations

- Server-side rendering for critical pages
- Real-time data sync with Supabase listeners
- Optimistic UI updates
- Memoized components to prevent re-renders
- Loading skeletons for better perceived performance

## Security Considerations

- Row Level Security (RLS) on all tables
- Authenticated API routes
- Middleware-based route protection
- Password hashing via Supabase Auth
- No sensitive data in client-side state
- CORS configuration for API calls

## Contributing

1. Follow the feature-based folder structure
2. Create custom hooks for component logic
3. Use Zod schemas for all form validation
4. Maintain the dark fintech design aesthetic
5. Add loading and error states
6. Test on mobile and desktop

## License

Private - Dreww.

## Support

For issues or questions, contact the developer.
