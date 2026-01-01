# TinyTech

A modern e-commerce web application built with **SvelteKit**, **TypeScript**, and **Supabase**, following the **Model-View-Controller (MVC)** architectural pattern.

## 🏗️ Architecture Overview

This project implements a clean MVC architecture:

```
src/
├── lib/
│   ├── models/          # MODEL: Data structures, types, interfaces
│   ├── services/        # SERVICE: Business logic & data access
│   ├── components/      # VIEW: Reusable UI components
│   ├── config/          # Configuration (Supabase, etc.)
│   └── utils/           # Utility functions
├── routes/
│   ├── +page.svelte     # VIEW: Pages
│   ├── +page.server.ts  # CONTROLLER: Server-side logic
│   └── [id]/
│       └── ...          # Dynamic routes
└── app.html             # HTML template
```

## 📁 Directory Structure

### **MODEL Layer** (`src/lib/models/`)
- **Purpose**: Define data structures, types, and interfaces
- **Files**: 
  - `User.ts` - User model with DTOs (Data Transfer Objects)
  - `index.ts` - Export all models

**Example:**
```typescript
// src/lib/models/User.ts
export interface User {
  id: string;
  email: string;
  name: string;
}
```

### **SERVICE Layer** (`src/lib/services/`)
- **Purpose**: Business logic and data access
- **Responsibilities**:
  - Database queries
  - Data validation
  - Business rules
  - Error handling
- **Files**:
  - `UserService.ts` - User business logic
  - `index.ts` - Export all services

**Example:**
```typescript
// src/lib/services/UserService.ts
export class UserService {
  async getAllUsers(): Promise<User[]> {
    // Business logic + data access
  }
}
```

### **CONTROLLER Layer** (`src/routes/**/+page.server.ts`)
- **Purpose**: Handle HTTP requests and coordinate between Model and View
- **Responsibilities**:
  - Load data for pages
  - Handle form submissions
  - Authentication
  - Request/response handling

**Example:**
```typescript
// src/routes/users/+page.server.ts
export const load: PageServerLoad = async () => {
  const users = await userService.getAllUsers();
  return { users };
};
```

### **VIEW Layer** (`src/lib/components/` & `src/routes/**/*.svelte`)
- **Purpose**: UI presentation and user interaction
- **Files**:
  - `UserCard.svelte` - Reusable component
  - `+page.svelte` - Page components

**Example:**
```svelte
<!-- src/lib/components/UserCard.svelte -->
<script lang="ts">
  export let user: User;
</script>
<div>{user.name}</div>
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Environment variables:**
The `.env` file has been configured with your Supabase credentials:
- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key (safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only, never expose to client)
- `DATABASE_URL` - Direct PostgreSQL connection string
- `SUPABASE_JWT_SECRET` - JWT secret for authentication
- `OPENAI_API_KEY` - OpenAI API key (optional, for AI features like product comparison insights)

**Note:** The `.env` file is in `.gitignore` and should never be committed to version control.

**To enable AI features:**
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add `OPENAI_API_KEY=your_key_here` to your `.env` file
3. AI features will automatically use OpenAI for enhanced analysis

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

## 📋 MVC Flow Example

Here's how a request flows through the MVC layers:

```
1. User visits /users
   ↓
2. +page.server.ts (CONTROLLER) receives request
   ↓
3. Controller calls UserService.getAllUsers() (SERVICE)
   ↓
4. Service uses Repository to query Supabase (MODEL)
   ↓
5. Data flows back: Model → Service → Controller → View
   ↓
6. +page.svelte (VIEW) renders UserCard components
```

## 🎯 Key Benefits

✅ **Separation of Concerns**: Clear boundaries between layers
✅ **Reusability**: Services can be used across multiple routes
✅ **Testability**: Easy to unit test services independently
✅ **Maintainability**: Changes in one layer don't affect others
✅ **Scalability**: Easy to add new features following the pattern

## 📝 Code Organization Rules

1. **Models**: Only data structures, no logic
2. **Services**: Business logic and data access, no UI
3. **Controllers**: Request handling, no business logic
4. **Views**: UI only, minimal logic (presentation logic only)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check with svelte-check
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 🚢 Deployment

### Vercel
The project is configured for Vercel deployment. Just push to GitHub and connect to Vercel.

### Supabase Hosting
Follow Supabase's hosting documentation for deploying SvelteKit apps.

## 📚 Learn More

- [SvelteKit Documentation](https://kit.svelte.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org)

## 📄 License

MIT

