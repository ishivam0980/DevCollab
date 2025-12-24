# DevCollab

## Overview

DevCollab is a developer collaboration platform where developers can post project ideas and find teammates based on skill matching. The platform uses an algorithm to calculate compatibility between developers and projects, making it easier to find the right collaborators.

**Who it's for:** Developers looking for teammates, side project enthusiasts, and anyone wanting to collaborate on software projects.

**What problem it solves:** Finding collaborators with complementary skills is hard. DevCollab matches developers to projects based on their tech stack, experience level, and interests - eliminating the guesswork from team formation.

---

## Features Included

### Authentication & Authorization
- [x] Google OAuth integration
- [x] GitHub OAuth integration  
- [x] Email/Password credentials authentication
- [x] JWT-based session management with encrypted cookies
- [x] Password reset via email with secure token
- [x] Email verification for new accounts
- [x] Protected route groups - unauthenticated users redirected to sign-in
- [x] Callback URL preservation - users return to intended page after login
- [x] Session persistence across browser refresh
- [x] Multi-provider account linking (same email = same account)

### Landing Page
- [x] Animated hero section with floating developer profile cards
- [x] "How it Works" section with 3-step visual guide
- [x] Features grid showcasing platform capabilities
- [x] Stats section with animated counters
- [x] Final CTA section with call to action
- [x] Footer with navigation links and social icons
- [x] Automatic redirect to dashboard if already logged in
- [x] Responsive design for mobile and desktop

### Dashboard
- [x] Personalized welcome message with user's name
- [x] Profile completion percentage indicator with color coding
- [x] Stats cards showing: Projects Created, Interests Received, Projects Interested In
- [x] Quick action buttons for common tasks
- [x] "Recommended Projects" section based on skill matching
- [x] Projects sorted by match percentage (best matches first)
- [x] Empty states with helpful prompts for new users
- [x] Links to create new project or browse existing ones

### Browse Projects
- [x] Grid view of all projects with card layout
- [x] Live search with 500ms debounce (prevents API spam while typing)
- [x] Filter by category dropdown
- [x] Filter by experience level dropdown
- [x] Filter by tech stack (multi-select)
- [x] Clear all filters button
- [x] Skill match percentage badge on each project card
- [x] Match percentage color coding (green 80%+, blue 60%+, yellow below)
- [x] Projects sorted by match relevance
- [x] Owner avatar and name on each card (clickable to view profile)
- [x] GitHub/Live Demo/Figma icons with external links
- [x] Interest count display
- [x] Load more pagination
- [x] Empty state when no projects match filters

### Project Management
- [x] Multi-step form wizard for creating projects (3 steps)
  - Step 1: Basic Info (title, description, category, experience, team size, duration)
  - Step 2: Tech Stack (searchable multi-select from 50+ skills)
  - Step 3: Links (GitHub URL, Live Demo URL, Figma URL - all optional)
- [x] Progress indicator showing current step
- [x] Validation per step before proceeding
- [x] Edit existing projects with same multi-step form
- [x] Delete project with confirmation
- [x] Project detail page with full information
- [x] Owner-only edit/delete buttons
- [x] Project status indicator (Looking for Team, In Progress, Completed)

### Interest System
- [x] "Show Interest" button on project cards and detail page
- [x] Toggle functionality - click again to withdraw interest
- [x] Instant count update on the project
- [x] "My Interests" page showing all projects user is interested in
- [x] View list of interested developers (owner only)
- [x] Each interested user shows: name, avatar, skills, match percentage
- [x] Compound unique index prevents duplicate interests
- [x] Atomic increment/decrement of interest count

### Profile Page
- [x] Edit name, bio, location
- [x] Experience level selector (Beginner, Intermediate, Advanced, Expert)
- [x] Skills multi-select with search (50+ tech options)
- [x] Profile image upload via UploadThing
- [x] Fallback to DiceBear avatar if no image uploaded
- [x] Social links section:
  - GitHub URL
  - LinkedIn URL
  - LeetCode URL
  - CodeChef URL
  - Codeforces URL
- [x] Save changes with loading state
- [x] Success/error toast notifications
- [x] Profile completion percentage calculation

### Public User Profiles
- [x] View any user's profile at /users/[id]
- [x] Display user's bio, location, experience level
- [x] Show all user's skills as badges
- [x] Social links with platform icons (clickable)
- [x] List of all projects created by that user
- [x] Clickable project cards leading to project details
- [x] Self-detection: clicking own name redirects to editable /profile
- [x] Works from: project cards, project detail page, interested users list

### Notifications
- [x] Bell icon in sidebar with unread count badge
- [x] Red highlight on notification nav when unread > 0
- [x] Full-page notification center at /notifications
- [x] Notification triggered when someone shows interest in your project
- [x] Each notification shows: sender avatar, message, time ago
- [x] Unread notifications highlighted with purple border
- [x] Click notification to navigate to the project
- [x] Auto-mark all as read when visiting notification page
- [x] Delete individual notifications
- [x] Clear all notifications button
- [x] Polling every 30 seconds for new notifications
- [x] Self-notification prevention (you don't notify yourself)

### Email System
- [x] Password reset emails via Nodemailer
- [x] Secure token generation for reset links
- [x] Token expiration (1 hour)
- [x] Email verification for new credential-based accounts
- [x] Gmail SMTP with App Password support

### UI & Components
- [x] Glassmorphism design with backdrop blur
- [x] Dark theme throughout
- [x] Collapsible sidebar (expands on hover)
- [x] Mobile hamburger menu
- [x] Responsive layout (mobile-first)
- [x] Framer Motion animations on page load
- [x] Staggered list animations
- [x] Hover effects on interactive elements
- [x] Loading spinners and skeleton states
- [x] Empty states with helpful messages
- [x] Click-outside detection for dropdowns
- [x] Tooltip on sidebar icons when collapsed

### Developer Experience
- [x] TypeScript throughout
- [x] Next.js 16 App Router
- [x] Server Actions (no REST API endpoints)
- [x] ESLint configuration
- [x] Path aliases (@/ imports)
- [x] Centralized constants file
- [x] Reusable utility functions
- [x] Mongoose ODM with schemas
- [x] Environment variable management

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 16, React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Database | MongoDB with Mongoose |
| Authentication | NextAuth.js with OAuth (Google, GitHub) |
| File Upload | UploadThing |
| Email | Nodemailer |
| Deployment | Vercel |

---

## Prerequisites

Before running this project, make sure you have:

- Node.js 18 or higher
- npm or yarn
- MongoDB database (local or Atlas)
- Google Cloud Console account (for OAuth credentials)
- GitHub Developer account (for OAuth credentials)
- Gmail account with App Password enabled (for sending emails)
- UploadThing account (for file uploads)

---

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/ishivam0980/DevCollab.git
cd devcollab
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials. Here's what each variable does:

```env
# Database connection string for MongoDB
# Get this from MongoDB Atlas: Database > Connect > Drivers
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devcollab

# Base URL of your application
# Use http://localhost:3000 for local development
# Use your production URL when deployed
NEXTAUTH_URL=http://localhost:3000

# Secret key for encrypting session tokens
# Generate one with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth credentials
# Get these from Google Cloud Console > APIs & Services > Credentials
# Create OAuth 2.0 Client ID, set redirect URI to: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth credentials
# Get these from GitHub > Settings > Developer Settings > OAuth Apps
# Set callback URL to: http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email credentials for password reset functionality
# Use Gmail with App Password (not your regular password)
# Enable 2FA, then generate App Password at: https://myaccount.google.com/apppasswords
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# UploadThing token for file uploads
# Get this from UploadThing dashboard after creating an app
UPLOADTHING_TOKEN=your-uploadthing-token
```

### 3. Database Setup

No manual database setup required. The application will:
- Connect to MongoDB using your connection string
- Automatically create collections on first write
- Create indexes as defined in the Mongoose schemas

If using MongoDB Atlas:
1. Create a free cluster at mongodb.com
2. Add your IP to the whitelist (Network Access > Add IP Address)
3. Create a database user (Database Access > Add New Database User)
4. Get connection string (Database > Connect > Drivers)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
devcollab/
│
├── app/                              # Next.js 16 App Router
│   │
│   ├── (auth)/                       # Auth route group (public)
│   │   ├── sign-in/
│   │   │   └── page.tsx              # Sign in page with OAuth + credentials
│   │   └── sign-up/
│   │       ├── page.tsx              # Sign up page
│   │       └── verify/
│   │           └── page.tsx          # Email verification page
│   │
│   ├── (protected)/                  # Protected route group (requires auth)
│   │   ├── layout.tsx                # Sidebar layout with navigation
│   │   ├── dashboard/
│   │   │   └── page.tsx              # User dashboard with stats and recommendations
│   │   ├── browse/
│   │   │   └── page.tsx              # Browse all projects with search and filters
│   │   ├── my-projects/
│   │   │   └── page.tsx              # List of user's created projects
│   │   ├── my-interests/
│   │   │   └── page.tsx              # Projects user has shown interest in
│   │   ├── notifications/
│   │   │   └── page.tsx              # Notification center
│   │   ├── profile/
│   │   │   └── page.tsx              # Edit user profile
│   │   ├── projects/
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create new project (multi-step form)
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Project detail page
│   │   │       └── edit/
│   │   │           └── page.tsx      # Edit existing project
│   │   └── users/
│   │       └── [id]/
│   │           └── page.tsx          # Public user profile
│   │
│   ├── api/                          # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # NextAuth.js handler
│   │   └── uploadthing/
│   │       ├── core.ts               # UploadThing file router config
│   │       └── route.ts              # UploadThing API endpoint
│   │
│   ├── reset-password/
│   │   └── page.tsx                  # Password reset page
│   │
│   ├── page.tsx                      # Landing page (public)
│   ├── layout.tsx                    # Root layout with providers
│   ├── globals.css                   # Global styles and Tailwind
│   └── providers.tsx                 # SessionProvider wrapper
│
├── actions/                          # Server Actions (business logic)
│   ├── auth.actions.ts               # Register user, password reset
│   ├── user.actions.ts               # Get/update profile, get user by ID
│   ├── project.actions.ts            # CRUD projects, get with matching
│   ├── interest.actions.ts           # Toggle interest, get interested users
│   └── notification.actions.ts       # Create, get, mark read, delete notifications
│
├── components/                       # Reusable React components
│   └── NotificationBell.tsx          # Notification bell with dropdown
│
├── lib/                              # Utilities and configurations
│   ├── auth.ts                       # NextAuth.js configuration
│   ├── mongodb.ts                    # MongoDB connection handler
│   ├── constants.ts                  # App constants (skills, categories, etc.)
│   ├── email.ts                      # Nodemailer email sending utility
│   ├── uploadthing.ts                # UploadThing configuration
│   └── utils.ts                      # Helper functions (getCurrentUser, etc.)
│
├── models/                           # Mongoose schemas
│   ├── User.ts                       # User schema (profile, skills, social links)
│   ├── Project.ts                    # Project schema (title, tech, owner ref)
│   ├── Interest.ts                   # Interest schema (user-project relation)
│   └── Notification.ts               # Notification schema (recipient, sender, message)
│
├── types/                            # TypeScript definitions
│   └── next-auth.d.ts                # NextAuth session type extensions
│
├── public/                           # Static assets
│   ├── logo.png                      # App logo
│   └── [social icons]                # Platform icons for profile links
│
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies and scripts
```

---

## Author

Shivam Srivastava
- GitHub: [ishivam0980](https://github.com/ishivam0980)
- LinkedIn: [Shivam Srivastava](https://www.linkedin.com/in/shivam-srivastava-817b33331)
