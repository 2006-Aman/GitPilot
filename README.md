# GitPilot

See all your GitHub repos, code, and live deployments in one dashboard.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Server Components)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with GitHub OAuth + MongoDB adapter
- **Database**: MongoDB Atlas (Mongoose + native MongoDB driver)
- **GitHub API**: Octokit REST
- **Deployment**: Vercel

## Prerequisites

- Node.js 20+
- A MongoDB Atlas account (free M0 tier is fine)
- A GitHub account for creating the OAuth App

## Setup Instructions

### 1. MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in
2. Click **Build a Database** → choose the **Free (M0)** tier → pick a cloud region
3. Create a **Database User** (username + password) under Database Access
4. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere for dev — restrict for production)
5. Click **Connect → Drivers** and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gitpilot?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database user credentials
7. Your `MONGODB_URI` is this full string

### 2. GitHub OAuth App

1. Go to **GitHub Settings → Developer settings → OAuth Apps → New OAuth App**
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and generate a **Client Secret**

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/gitpilot?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=           # Generate with: openssl rand -base64 32
GITHUB_CLIENT_ID=          # From GitHub OAuth App
GITHUB_CLIENT_SECRET=      # From GitHub OAuth App
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and click **Continue with GitHub** to log in.

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Add the same environment variables in Vercel's dashboard
4. Set `NEXTAUTH_URL` to your production domain (e.g., `https://gitpilot.vercel.app`)
5. Add the production callback URL to your GitHub OAuth App settings:
   `https://yourdomain.com/api/auth/callback/github`

## Architecture Notes

- **NextAuth MongoDB adapter** manages its own `users`, `accounts`, `sessions`, and `verification_tokens` collections automatically via the native MongoDB driver
- The **Mongoose User model** is synced from NextAuth user data during the session callback — the app's Repository documents reference the NextAuth user's `_id` as `userId`
- **GitHub access tokens** are stored in the `accounts` collection by the MongoDB adapter and are never exposed to client-side code
- The **lib/mongodb.ts** singleton MongoClient is used by the NextAuth adapter; **lib/mongoose.ts** is used by app code for Mongoose queries
