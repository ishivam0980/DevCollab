# DevCollab

A full-stack developer collaboration platform built with Next.js 16, TypeScript, MongoDB, and Tailwind CSS. Enables developers to find teammates based on skill matching, post project ideas, and collaborate on software projects.

**Live Demo:** [https://dev-collab-two.vercel.app](https://dev-collab-two.vercel.app)

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 16, React 18 |
| Language | TypeScript |
| Database | MongoDB, Mongoose ODM |
| Authentication | NextAuth.js, OAuth 2.0, JWT, bcrypt |
| Styling | Tailwind CSS, Framer Motion |
| File Upload | UploadThing |
| Email | Nodemailer |
| Deployment | Vercel, MongoDB Atlas |

---

## Features

### Authentication & Security
- Multi-provider authentication supporting Google OAuth 2.0, GitHub OAuth, and email/password credentials
- JWT-based session management with 30-day expiration and httpOnly cookies
- Secure password hashing using bcrypt with 10 salt rounds
- Email-based password reset with cryptographically generated tokens and 1-hour expiration
- Protected route groups with automatic redirect and callback URL preservation
- OAuth account linking for users signing in with multiple providers

### Database Architecture
- MongoDB schema with 4 interconnected collections (Users, Projects, Interests, Notifications)
- Compound unique indexes preventing duplicate entries and ensuring data integrity
- Mongoose population queries resolving cross-collection references efficiently
- Atomic database operations using findOneAndUpdate with $inc operator
- Connection pooling for persistent database connections

### Frontend & UI/UX
- 12+ responsive pages with glassmorphism design and gradient animations
- Collapsible sidebar navigation with 8 items and hover-expand functionality
- Framer Motion animations including page transitions and staggered list effects
- Multi-step form wizard with 3-step project creation and per-step validation
- Searchable multi-select dropdown with 50+ technology options
- Skeleton loading states and empty state components
- Mobile-first responsive design with dark theme

### Search & Matching Algorithm
- Skill-based matching algorithm calculating compatibility percentages with O(n) complexity
- Debounced live search with 500ms delay reducing unnecessary API calls by 90%
- Multi-filter system with 4 filter types (category, experience, tech stack, search)
- Match percentage badges with color coding (green 80%+, blue 60%+, yellow below)
- Results sorted by match relevance
- Load More pagination fetching 12 projects per request

### Notification System
- In-app notifications with dedicated notifications page
- Polling mechanism with 30-second intervals for near real-time updates
- Unread count badge with dynamic display in sidebar navigation
- Auto-mark-as-read on page visit
- Individual deletion and bulk clear functionality
- Self-notification prevention

### File Uploads & Media
- UploadThing integration with 4MB size limits and image type validation
- Profile image upload with real-time preview and loading states
- Fallback avatar generation using DiceBear API

### Project Management
- Complete CRUD operations with ownership validation
- Multi-step project creation with 10+ fields across 3 steps
- Project detail pages with dynamic routing
- My Projects dashboard with edit/delete actions
- My Interests page aggregating interested projects
- Project status system (Looking for Team, In Progress, Completed)

### Collaboration System
- Interest toggle for expressing collaboration interest
- Atomic increment/decrement of interest counts
- Interested users view for project owners
- Compound unique index preventing duplicate interests

### User Profiles
- 12+ editable profile fields including bio, skills, and social links
- Public profiles displaying user information and created projects
- Profile completion percentage calculator
- Self-profile detection with automatic redirect
- 5 social platform integrations (GitHub, LinkedIn, LeetCode, CodeChef, Codeforces)

---

## Project Structure

```
devcollab/
├── app/                          # Next.js App Router (12+ pages)
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/              # OAuth + credentials sign-in
│   │   └── sign-up/              # Registration with email verification
│   ├── (protected)/              # Protected routes (15+ server actions)
│   │   ├── browse/               # Project discovery with search/filters
│   │   ├── dashboard/            # User dashboard with stats
│   │   ├── my-interests/         # Interested projects list
│   │   ├── my-projects/          # User's created projects
│   │   ├── notifications/        # Notification center
│   │   ├── profile/              # Editable user profile
│   │   ├── projects/[id]/        # Project detail and edit pages
│   │   └── users/[id]/           # Public user profiles
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth.js handlers
│   │   └── uploadthing/          # File upload endpoints
│   └── reset-password/           # Password reset flow
├── actions/                      # Server Actions (15+ functions)
│   ├── auth.actions.ts           # Registration, password reset
│   ├── user.actions.ts           # Profile CRUD operations
│   ├── project.actions.ts        # Project CRUD with matching
│   ├── interest.actions.ts       # Interest toggle system
│   └── notification.actions.ts   # Notification management
├── lib/                          # Utilities and configurations
│   ├── auth.ts                   # NextAuth.js configuration
│   ├── mongodb.ts                # Database connection handler
│   ├── constants.ts              # 50+ skills, 8 categories
│   └── utils.ts                  # Helper functions
├── models/                       # Mongoose schemas (4 collections)
│   ├── User.ts                   # User profile schema
│   ├── Project.ts                # Project schema
│   ├── Interest.ts               # User-project relationship
│   └── Notification.ts           # Notification schema
└── components/                   # Reusable React components
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB database (local or Atlas)
- Google Cloud Console account (OAuth)
- GitHub Developer account (OAuth)
- Gmail with App Password (email)
- UploadThing account (file uploads)

### Installation

```bash
git clone https://github.com/ishivam0980/DevCollab.git
cd devcollab
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| MONGODB_URI | MongoDB connection string |
| NEXTAUTH_URL | Application base URL |
| NEXTAUTH_SECRET | JWT encryption secret |
| GOOGLE_CLIENT_ID | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret |
| GITHUB_CLIENT_ID | GitHub OAuth client ID |
| GITHUB_CLIENT_SECRET | GitHub OAuth client secret |
| EMAIL_USER | Gmail address for password reset |
| EMAIL_PASSWORD | Gmail app password |
| UPLOADTHING_TOKEN | UploadThing API token |

See `.env.example` for detailed setup instructions.

---

## Key Technical Decisions

- **Server Actions over REST API**: Reduced boilerplate while maintaining type-safety
- **JWT over Database Sessions**: Stateless authentication for horizontal scaling
- **Polling over WebSockets**: Simpler implementation for notification updates
- **Compound Indexes**: Database-level duplicate prevention
- **Debounced Search**: 90% reduction in unnecessary API calls

---

## Author

**Shivam Srivastava**
- GitHub: [ishivam0980](https://github.com/ishivam0980)
- LinkedIn: [Shivam Srivastava](https://www.linkedin.com/in/shivam-srivastava-817b33331)
