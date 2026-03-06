# EduHub — Frontend Monorepo Architecture
## PRD-FRONTEND-ARCH-001 | AI-IDE Ready Setup Guide

**Document ID:** EH-FRONTEND-ARCH-PRD-001
**Version:** 1.0
**Date:** March 2026
**Status:** Final — Ready for AI-IDE Code Generation
**Target:** Cursor / Windsurf
**Stack:** Next.js 14 (App Router) + Turborepo + Tailwind CSS + shadcn/ui

---

> **HOW TO USE THIS DOCUMENT**
> Paste this entire document into Cursor/Windsurf as context.
> Prompt: "Set up the EduHub frontend monorepo exactly as specified
> in this architecture PRD. Use Turborepo + pnpm workspaces.
> Create all folders, configs, and base files as described."

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Why This Structure](#2-why-this-structure)
3. [Monorepo Folder Structure](#3-monorepo-folder-structure)
4. [Tech Stack & Versions](#4-tech-stack--versions)
5. [Setup Commands](#5-setup-commands)
6. [Root Config Files](#6-root-config-files)
7. [packages/ui — Shared Component Library](#7-packagesui--shared-component-library)
8. [packages/hooks — Shared Hooks](#8-packageshooks--shared-hooks)
9. [packages/api-client — Shared API Layer](#9-packagesapi-client--shared-api-layer)
10. [packages/utils — Shared Utilities](#10-packagesutils--shared-utilities)
11. [packages/types — Shared TypeScript Types](#11-packagestypes--shared-typescript-types)
12. [apps/super-admin — Super Admin Panel](#12-appssuper-admin--super-admin-panel)
13. [apps/org-admin — Org Admin Panel](#13-appsorg-admin--org-admin-panel)
14. [apps/student — Student Portal](#14-appsstudent--student-portal)
15. [Shared vs App-Specific — Decision Guide](#15-shared-vs-app-specific--decision-guide)
16. [Authentication Per App](#16-authentication-per-app)
17. [Theming — Per-App Colors](#17-theming--per-app-colors)
18. [How Super Admin Features Become Org Admin](#18-how-super-admin-features-become-org-admin)
19. [Development Workflow](#19-development-workflow)
20. [Deployment Setup](#20-deployment-setup)

---

## 1. Architecture Overview

```
eduhub-frontend/                    ← Monorepo root (Turborepo)
│
├── apps/                           ← 3 separate Next.js applications
│   ├── super-admin/                → superadmin.eduhub.in
│   ├── org-admin/                  → orgadmin.eduhub.in
│   └── student/                    → [slug].eduhub.in / mockveda.in
│
└── packages/                       ← Shared code (used by all apps)
    ├── ui/                         → All UI components (Button, Table, Modal...)
    ├── hooks/                      → Shared React hooks
    ├── api-client/                 → Backend API call functions
    ├── utils/                      → Helper functions
    └── types/                      → TypeScript interfaces & types

KEY PRINCIPLE:
  → packages/ = write once, use everywhere
  → apps/     = only app-specific pages, layouts, logic
  → NEVER duplicate a component across apps
```

### 1.1 What Each App Is

```
apps/super-admin/
  URL: superadmin.eduhub.in
  Users: Platform Super Admin only
  Auth: Email + Password (super_admin JWT)
  Features: All org management, platform settings,
            global Q-Bank, impersonation, billing

apps/org-admin/
  URL: orgadmin.eduhub.in
  Users: Org Admin + Staff (Teacher, Fee Manager etc.)
  Auth: Org ID + Password (org_admin / staff JWT)
  Features: Students, Tests, Q-Bank, Fees, Attendance,
            Notifications, Settings
  IMPORTANT: Shares 80% UI with super-admin
             but DIFFERENT routes, auth, permissions

apps/student/
  URL: [slug].eduhub.in / mockveda.in
  Users: Students
  Auth: Student ID + Password / OTP
  Features: Mock tests, results, practice, progress
```

---

## 2. Why This Structure

### 2.1 Problem With Simple Clone

```
CLONE APPROACH (BAD):
  Month 1: Clone super-admin → org-admin ✓
  Month 3: Fix bug in super-admin Table component
           → Same bug still in org-admin ❌
  Month 6: Add dark mode to super-admin
           → org-admin still light mode ❌
  Month 9: 200+ files out of sync between two codebases
           → Refactoring nightmare 💀
```

### 2.2 Monorepo Solution

```
MONOREPO APPROACH (GOOD):
  Fix bug in packages/ui/Table → BOTH apps fixed ✅
  Add dark mode to packages/ui → ALL apps get it ✅
  Update API call in packages/api-client → ALL apps updated ✅

  Each app only has:
  → Its own pages (routes)
  → Its own layout (sidebar items)
  → Its own auth logic
  → Its own environment variables
  → NOTHING duplicated
```

---

## 3. Monorepo Folder Structure

```
eduhub-frontend/
│
├── apps/
│   │
│   ├── super-admin/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx          ← Super Admin sidebar
│   │   │   │   ├── page.tsx            ← Dashboard
│   │   │   │   ├── organizations/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── create/page.tsx
│   │   │   │   │   └── [orgId]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── [...]
│   │   │   │   ├── org-admin-control/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── q-bank/
│   │   │   │   ├── mockbook/
│   │   │   │   ├── billing/
│   │   │   │   └── settings/
│   │   │   └── api/                    ← Next.js API routes (if needed)
│   │   ├── components/                 ← SUPER ADMIN ONLY components
│   │   │   ├── OrgSwitcher.tsx
│   │   │   ├── ImpersonationBanner.tsx
│   │   │   ├── SuperAdminSidebar.tsx
│   │   │   └── OrgViewBanner.tsx
│   │   ├── lib/
│   │   │   ├── auth.ts                 ← Super admin auth logic
│   │   │   └── permissions.ts
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── org-admin/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   │       └── page.tsx        ← Org ID + Password login
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx          ← Org Admin sidebar
│   │   │   │   ├── page.tsx            ← Dashboard
│   │   │   │   ├── students/
│   │   │   │   ├── batches/
│   │   │   │   ├── tests/
│   │   │   │   ├── q-bank/
│   │   │   │   │   └── recommendations/ ← NEW (personalization)
│   │   │   │   ├── staff/
│   │   │   │   ├── fees/
│   │   │   │   ├── attendance/
│   │   │   │   ├── notifications/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   │       └── personalization/ ← NEW
│   │   │   └── api/
│   │   ├── components/                 ← ORG ADMIN ONLY components
│   │   │   ├── OrgAdminSidebar.tsx
│   │   │   ├── SuperAdminBanner.tsx    ← Orange banner when SA views
│   │   │   └── StaffPermissionGate.tsx
│   │   ├── lib/
│   │   │   ├── auth.ts                 ← Org auth (orgId + password)
│   │   │   └── rbac.ts                 ← Staff permissions
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── student/
│       ├── app/
│       │   ├── (auth)/
│       │   │   └── login/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── tests/
│       │   │   ├── results/
│       │   │   ├── practice/           ← Personalization feature
│       │   │   │   ├── page.tsx
│       │   │   │   ├── generate/
│       │   │   │   ├── study-plan/
│       │   │   │   └── suggestions/
│       │   │   └── profile/
│       │   └── api/
│       ├── components/                 ← STUDENT ONLY components
│       │   ├── StudentSidebar.tsx
│       │   ├── ExamInterface.tsx       ← Full screen exam
│       │   ├── UnlockProgress.tsx      ← 50 tests progress bar
│       │   └── MasteryBadge.tsx
│       ├── lib/
│       │   └── auth.ts
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   │
│   ├── ui/                             ← @eduhub/ui
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Sidebar.tsx         ← Generic sidebar shell
│   │   │   │   │   ├── TopBar.tsx
│   │   │   │   │   ├── PageHeader.tsx
│   │   │   │   │   └── Breadcrumb.tsx
│   │   │   │   ├── data-display/
│   │   │   │   │   ├── DataTable.tsx       ← Sortable, filterable table
│   │   │   │   │   ├── StatsCard.tsx
│   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   ├── Avatar.tsx
│   │   │   │   │   └── EmptyState.tsx
│   │   │   │   ├── forms/
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Select.tsx
│   │   │   │   │   ├── MultiSelect.tsx
│   │   │   │   │   ├── DatePicker.tsx
│   │   │   │   │   ├── FileUpload.tsx
│   │   │   │   │   └── SearchBar.tsx
│   │   │   │   ├── feedback/
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   │   ├── Toast.tsx
│   │   │   │   │   ├── Alert.tsx
│   │   │   │   │   ├── Skeleton.tsx
│   │   │   │   │   └── ProgressBar.tsx
│   │   │   │   ├── navigation/
│   │   │   │   │   ├── Tabs.tsx
│   │   │   │   │   ├── Pagination.tsx
│   │   │   │   │   └── Stepper.tsx         ← For multi-step wizards
│   │   │   │   └── charts/
│   │   │   │       ├── LineChart.tsx
│   │   │   │       ├── BarChart.tsx
│   │   │   │       └── DonutChart.tsx
│   │   │   └── index.ts                    ← Re-export everything
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── hooks/                          ← @eduhub/hooks
│   │   ├── src/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useToast.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── usePermission.ts        ← Check if user has permission
│   │   │   ├── useFeatureFlag.ts       ← Check if feature enabled
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api-client/                     ← @eduhub/api-client
│   │   ├── src/
│   │   │   ├── client.ts               ← Base axios/fetch instance
│   │   │   ├── auth.api.ts
│   │   │   ├── organizations.api.ts
│   │   │   ├── students.api.ts
│   │   │   ├── tests.api.ts
│   │   │   ├── qbank.api.ts
│   │   │   ├── fees.api.ts
│   │   │   ├── attendance.api.ts
│   │   │   ├── notifications.api.ts
│   │   │   ├── personalization.api.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/                          ← @eduhub/utils
│   │   ├── src/
│   │   │   ├── formatDate.ts
│   │   │   ├── formatCurrency.ts       ← ₹ formatting
│   │   │   ├── formatNumber.ts
│   │   │   ├── generateInitials.ts     ← "Rahul Kumar" → "RK"
│   │   │   ├── getMasteryColor.ts      ← mastery% → color
│   │   │   ├── cn.ts                   ← clsx + twMerge utility
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── types/                          ← @eduhub/types
│       ├── src/
│       │   ├── auth.types.ts
│       │   ├── org.types.ts
│       │   ├── student.types.ts
│       │   ├── qbank.types.ts
│       │   ├── test.types.ts
│       │   ├── fee.types.ts
│       │   ├── attendance.types.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── turbo.json                          ← Turborepo pipeline config
├── pnpm-workspace.yaml                 ← pnpm workspaces config
├── package.json                        ← Root package.json
└── tsconfig.base.json                  ← Base TypeScript config
```

---

## 4. Tech Stack & Versions

```json
{
  "monorepo": "Turborepo 2.x",
  "packageManager": "pnpm 9.x",
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript 5.x (strict)",
  "styling": "Tailwind CSS 3.x",
  "components": "shadcn/ui (base) + custom components",
  "stateManagement": "Zustand 4.x (client state)",
  "serverState": "TanStack Query v5 (server state + caching)",
  "httpClient": "Axios 1.x",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts 2.x",
  "icons": "Lucide React",
  "notifications": "Sonner (toasts)",
  "testing": "Vitest + Testing Library"
}
```

---

## 5. Setup Commands

### 5.1 Initial Monorepo Setup

```bash
# Create root directory
mkdir eduhub-frontend && cd eduhub-frontend

# Initialize with pnpm
pnpm init

# Install Turborepo globally
pnpm add -g turbo

# Create workspace structure
mkdir -p apps/super-admin apps/org-admin apps/student
mkdir -p packages/ui packages/hooks packages/api-client packages/utils packages/types
```

### 5.2 pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 5.3 Create All Next.js Apps

```bash
# Super Admin
cd apps/super-admin
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Org Admin
cd ../org-admin
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Student
cd ../student
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

### 5.4 Install Shared Dependencies (Root)

```bash
cd ../../  # back to root

# Install turbo as dev dep
pnpm add -D turbo -w

# TypeScript base
pnpm add -D typescript@5 @types/node@20 -w
```

---

## 6. Root Config Files

### 6.1 turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### 6.2 Root package.json

```json
{
  "name": "eduhub-frontend",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "dev:super-admin": "turbo dev --filter=@eduhub/super-admin",
    "dev:org-admin": "turbo dev --filter=@eduhub/org-admin",
    "dev:student": "turbo dev --filter=@eduhub/student",
    "build": "turbo build",
    "build:super-admin": "turbo build --filter=@eduhub/super-admin",
    "build:org-admin": "turbo build --filter=@eduhub/org-admin",
    "build:student": "turbo build --filter=@eduhub/student",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "test": "turbo test",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 6.3 tsconfig.base.json (Root)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "target": "ES2017",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules"]
}
```

---

## 7. packages/ui — Shared Component Library

### 7.1 package.json

```json
{
  "name": "@eduhub/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18",
    "react-dom": "^18",
    "next": "^14"
  },
  "devDependencies": {
    "@types/react": "^18",
    "typescript": "^5"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.263.1",
    "recharts": "^2.10.0",
    "tailwind-merge": "^2.2.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "sonner": "^1.4.0"
  }
}
```

### 7.2 Sidebar Component (Generic Shell)

```typescript
// packages/ui/src/components/layout/Sidebar.tsx

import React from 'react';
import { cn } from '@eduhub/utils';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number | string;
  children?: NavItem[];
  isActive?: boolean;
  isSection?: boolean;  // section header (non-clickable)
  isAdminOnly?: boolean; // show only for specific roles
}

interface SidebarProps {
  logo: React.ReactNode;
  navItems: NavItem[];
  footer?: React.ReactNode;
  theme?: 'super-admin' | 'org-admin' | 'student';
  className?: string;
}

export const Sidebar = ({
  logo, navItems, footer, theme = 'org-admin', className
}: SidebarProps) => {
  const themeClasses = {
    'super-admin': 'bg-[#0e1420] border-[#1a2235]',
    'org-admin':   'bg-[#1e293b] border-[#2d3f55]',
    'student':     'bg-[#0f172a] border-[#1e293b]',
  };

  return (
    <aside className={cn(
      'w-60 h-screen flex flex-col border-r',
      themeClasses[theme],
      className
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-inherit">
        {logo}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item, i) => (
          <SidebarItem key={i} item={item} theme={theme} />
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-inherit">
          {footer}
        </div>
      )}
    </aside>
  );
};
```

### 7.3 DataTable Component

```typescript
// packages/ui/src/components/data-display/DataTable.tsx

import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRows?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  rowKey?: keyof T;
}

export function DataTable<T>({
  columns, data, isLoading, emptyMessage = 'No data found',
  onRowClick, selectedRows, onSelectRow, onSelectAll, rowKey = 'id' as keyof T
}: DataTableProps<T>) {
  // Full implementation with:
  // - Loading skeleton rows
  // - Sortable column headers
  // - Row selection checkboxes
  // - Empty state
  // - Row click handler
}
```

### 7.4 StatsCard Component

```typescript
// packages/ui/src/components/data-display/StatsCard.tsx

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;      // +12 or -5
    label: string;      // "vs last month"
    direction: 'up' | 'down' | 'neutral';
  };
  accentColor?: string; // Tailwind color class
  onClick?: () => void;
}

export const StatsCard = ({
  title, value, subtitle, icon, trend, accentColor, onClick
}: StatsCardProps) => {
  // Renders a stat card with optional trend indicator
  // Used in: all 3 apps for dashboard stats
};
```

### 7.5 Stepper Component (For Wizards)

```typescript
// packages/ui/src/components/navigation/Stepper.tsx
// Used in: Auto Set Generator, Create Test, Add Staff, Create Org wizards

interface Step {
  label: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  isError?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
}

export const Stepper = ({ steps, currentStep, orientation = 'horizontal' }: StepperProps) => {
  // Multi-step wizard progress indicator
  // Used across Super Admin, Org Admin, Student apps
};
```

### 7.6 packages/ui/src/index.ts

```typescript
// packages/ui/src/index.ts — Re-export all components

// Layout
export { Sidebar } from './components/layout/Sidebar';
export { TopBar } from './components/layout/TopBar';
export { PageHeader } from './components/layout/PageHeader';
export { Breadcrumb } from './components/layout/Breadcrumb';

// Data Display
export { DataTable } from './components/data-display/DataTable';
export { StatsCard } from './components/data-display/StatsCard';
export { Badge } from './components/data-display/Badge';
export { Avatar } from './components/data-display/Avatar';
export { EmptyState } from './components/data-display/EmptyState';

// Forms
export { Input } from './components/forms/Input';
export { Select } from './components/forms/Select';
export { MultiSelect } from './components/forms/MultiSelect';
export { DatePicker } from './components/forms/DatePicker';
export { FileUpload } from './components/forms/FileUpload';
export { SearchBar } from './components/forms/SearchBar';

// Feedback
export { Modal } from './components/feedback/Modal';
export { ConfirmDialog } from './components/feedback/ConfirmDialog';
export { Alert } from './components/feedback/Alert';
export { Skeleton } from './components/feedback/Skeleton';
export { ProgressBar } from './components/feedback/ProgressBar';

// Navigation
export { Tabs } from './components/navigation/Tabs';
export { Pagination } from './components/navigation/Pagination';
export { Stepper } from './components/navigation/Stepper';

// Charts
export { LineChart } from './components/charts/LineChart';
export { BarChart } from './components/charts/BarChart';
export { DonutChart } from './components/charts/DonutChart';
```

---

## 8. packages/hooks — Shared Hooks

```typescript
// packages/hooks/src/useAuth.ts
// Used by all 3 apps — each app passes its own config

import { create } from 'zustand';

export type AppType = 'super-admin' | 'org-admin' | 'student';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

export const createAuthStore = (appType: AppType) =>
  create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    login: async (credentials) => { /* ... */ },
    logout: () => {
      set({ user: null, token: null });
      window.location.href = `/${appType}/login`;
    }
  }));

// ─────────────────────────────────────────────────────
// packages/hooks/src/usePermission.ts

export const usePermission = (permission: string): boolean => {
  // Get user from auth store
  // Check if user has permission
  // Super Admin → always true
  // Others → check permissions array in JWT
};

// ─────────────────────────────────────────────────────
// packages/hooks/src/useFeatureFlag.ts

export const useFeatureFlag = (featureKey: string): boolean => {
  // Check if feature enabled for current org
  // Fetches from /api/org-admin/feature-flags
  // Caches in TanStack Query
};

// ─────────────────────────────────────────────────────
// packages/hooks/src/usePagination.ts

export const usePagination = (defaultPerPage = 20) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  return { page, perPage, setPage, setPerPage, offset: (page - 1) * perPage };
};
```

---

## 9. packages/api-client — Shared API Layer

### 9.1 Base Client

```typescript
// packages/api-client/src/client.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach token
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('auth_token')
    : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data ?? error);
  }
);
```

### 9.2 Per-Module API Files

```typescript
// packages/api-client/src/organizations.api.ts

import { apiClient } from './client';
import type { Organization, CreateOrgDto, ListOrgsQuery } from '@eduhub/types';

export const organizationsApi = {
  list: (query: ListOrgsQuery) =>
    apiClient.get<ListResponse<Organization>>('/api/v1/admin/organizations', { params: query }),

  create: (data: CreateOrgDto) =>
    apiClient.post<{ organization: Organization }>('/api/v1/admin/organizations', data),

  getById: (orgId: string) =>
    apiClient.get<Organization>(`/api/v1/admin/organizations/${orgId}`),

  update: (orgId: string, data: Partial<CreateOrgDto>) =>
    apiClient.patch<Organization>(`/api/v1/admin/organizations/${orgId}`, data),

  suspend: (orgId: string, data: { reason: string; customMessage?: string }) =>
    apiClient.post(`/api/v1/admin/organizations/${orgId}/suspend`, data),

  switchContext: (orgId: string) =>
    apiClient.post<{ orgViewToken: string }>(
      `/api/v1/admin/organizations/${orgId}/switch-context`
    ),
};

// packages/api-client/src/personalization.api.ts
export const personalizationApi = {
  // Student side
  getUnlockStatus: () =>
    apiClient.get('/api/v1/student/personalization/status'),

  previewAutoSet: (config: StudentAutoSetConfig) =>
    apiClient.post('/api/v1/student/personalization/auto-set/preview', config),

  saveAutoSet: (previewId: string) =>
    apiClient.post('/api/v1/student/personalization/auto-set/save', { previewId }),

  // Admin side
  getSettings: () =>
    apiClient.get('/api/v1/org-admin/personalization/settings'),

  updateSettings: (data: Partial<OrgPersonalizationSettings>) =>
    apiClient.patch('/api/v1/org-admin/personalization/settings', data),

  getCuratedSuggestions: () =>
    apiClient.get('/api/v1/org-admin/personalization/suggestions'),

  createSuggestion: (data: CreateSuggestionDto) =>
    apiClient.post('/api/v1/org-admin/personalization/suggestions', data),
};
```

---

## 10. packages/utils — Shared Utilities

```typescript
// packages/utils/src/formatCurrency.ts
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
  // ₹8,45,000
};

// packages/utils/src/getMasteryColor.ts
export const getMasteryColor = (score: number) => {
  if (score === 0)   return { bg: 'bg-gray-500',   text: 'text-gray-500',   label: 'Unattempted' };
  if (score <= 30)   return { bg: 'bg-red-500',    text: 'text-red-500',    label: 'Weak' };
  if (score <= 60)   return { bg: 'bg-yellow-500', text: 'text-yellow-500', label: 'Developing' };
  if (score <= 85)   return { bg: 'bg-blue-500',   text: 'text-blue-500',   label: 'Proficient' };
  return               { bg: 'bg-green-500',  text: 'text-green-500',  label: 'Mastered' };
};

// packages/utils/src/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// packages/utils/src/generateInitials.ts
export const getInitials = (name: string): string =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
```

---

## 11. packages/types — Shared TypeScript Types

```typescript
// packages/types/src/org.types.ts

export interface Organization {
  id: string;
  orgId: string;           // GK-ORG-XXXXX
  name: string;
  slug: string;
  category: string;
  appType: 'BOTH' | 'STUDENT' | 'MOCKBOOK';
  plan: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
  status: 'PENDING_SETUP' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  logoUrl?: string;
  primaryColor: string;
  adminUserId: string;
  aiCreditsBalance: number;
  mrr: number;
  createdAt: string;
}

// packages/types/src/auth.types.ts
export interface SuperAdminUser {
  userId: string;
  role: 'SUPER_ADMIN';
  email: string;
}

export interface OrgStaffUser {
  userId: string;
  staffId: string;
  orgId: string;
  role: 'ORG_ADMIN' | 'TEACHER' | 'CONTENT_MANAGER' | 'FEE_MANAGER' | 'RECEPTIONIST';
  permissions: string[];
  orgName: string;
  orgSlug: string;
}

export interface StudentUser {
  userId: string;
  studentId: string;
  orgId: string;
  role: 'STUDENT';
  fullName: string;
}

// packages/types/src/api.types.ts
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

---

## 12. apps/super-admin — Super Admin Panel

### 12.1 package.json

```json
{
  "name": "@eduhub/super-admin",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@eduhub/ui": "workspace:*",
    "@eduhub/hooks": "workspace:*",
    "@eduhub/api-client": "workspace:*",
    "@eduhub/utils": "workspace:*",
    "@eduhub/types": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "axios": "^1.0.0"
  }
}
```

### 12.2 Super Admin Sidebar Config

```typescript
// apps/super-admin/components/SuperAdminSidebar.tsx

import { Sidebar, NavItem } from '@eduhub/ui';

const SUPER_ADMIN_NAV: NavItem[] = [
  { label: 'OVERVIEW', isSection: true },
  { label: 'Dashboard',       href: '/dashboard',     icon: <LayoutDashboard /> },
  { label: 'Analytics',       href: '/analytics',     icon: <BarChart2 /> },

  { label: 'PLATFORM', isSection: true },
  { label: 'Organizations',   href: '/organizations', icon: <Building2 />, badge: 8 },
  { label: 'Unique IDs',      href: '/unique-ids',    icon: <Hash /> },
  { label: 'Billing',         href: '/billing',       icon: <CreditCard /> },

  { label: 'CONTENT', isSection: true },
  { label: 'Question Bank',   href: '/q-bank',        icon: <BookOpen /> },
  { label: 'MockBook',        href: '/mockbook',      icon: <FileText /> },

  { label: 'APPS', isSection: true },
  { label: 'Student App',     href: '/student-app',   icon: <Smartphone /> },
  { label: 'Org Admin Control',href: '/org-admin-control', icon: <Settings2 /> },

  { label: 'MANAGEMENT', isSection: true },
  { label: 'Users',           href: '/users',         icon: <Users /> },
  { label: 'Staff',           href: '/staff',         icon: <UserCog /> },
  { label: 'Roles',           href: '/roles',         icon: <Shield /> },
  { label: 'White-Label',     href: '/white-label',   icon: <Palette /> },
];

export const SuperAdminSidebar = () => (
  <Sidebar
    theme="super-admin"
    navItems={SUPER_ADMIN_NAV}
    logo={<EduHubLogo />}
    footer={<SuperAdminUserMenu />}
  />
);
```

### 12.3 Super Admin Layout

```typescript
// apps/super-admin/app/(dashboard)/layout.tsx

import { SuperAdminSidebar } from '@/components/SuperAdminSidebar';
import { TopBar } from '@eduhub/ui';
import { OrgViewBanner } from '@/components/OrgViewBanner';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#080c12]">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrgViewBanner />  {/* Orange banner when viewing org context */}
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 12.4 Super Admin-Only Components

```typescript
// apps/super-admin/components/OrgViewBanner.tsx
// Shows ONLY when Super Admin is in org-view context
// Uses orange banner as specified in PRD-ORG-01

// apps/super-admin/components/ImpersonationBanner.tsx
// Shows when Super Admin has impersonated an Org Admin

// apps/super-admin/components/OrgSwitcher.tsx
// Dropdown to switch between orgs in org-view mode
```

---

## 13. apps/org-admin — Org Admin Panel

### 13.1 package.json

```json
{
  "name": "@eduhub/org-admin",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@eduhub/ui": "workspace:*",
    "@eduhub/hooks": "workspace:*",
    "@eduhub/api-client": "workspace:*",
    "@eduhub/utils": "workspace:*",
    "@eduhub/types": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "axios": "^1.0.0"
  }
}
```

### 13.2 Org Admin Sidebar Config

```typescript
// apps/org-admin/components/OrgAdminSidebar.tsx

import { Sidebar, NavItem } from '@eduhub/ui';
import { usePermission, useFeatureFlag } from '@eduhub/hooks';
import { useAuth } from '@/lib/auth';

const useOrgAdminNav = (): NavItem[] => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';  // viewing via Org Admin Control
  const canViewFees = usePermission('fees.view');
  const canViewAttendance = usePermission('attendance.view');

  return [
    { label: 'OVERVIEW', isSection: true },
    { label: 'Dashboard',    href: '/dashboard',    icon: <LayoutDashboard /> },

    { label: 'ACADEMICS', isSection: true },
    { label: 'Tests & Exams',href: '/tests',        icon: <FileText /> },
    { label: 'Q-Bank',       href: '/q-bank',       icon: <BookOpen /> },
    ...(canViewAttendance ? [
      { label: 'Attendance', href: '/attendance',   icon: <CheckSquare /> }
    ] : []),

    { label: 'MANAGEMENT', isSection: true },
    { label: 'Students',     href: '/students',     icon: <Users /> },
    { label: 'Batches',      href: '/batches',      icon: <Layers /> },
    { label: 'Staff',        href: '/staff',        icon: <UserCog /> },
    ...(canViewFees ? [
      { label: 'Fee Collection', href: '/fees',     icon: <IndianRupee /> }
    ] : []),
    { label: 'Notifications',href: '/notifications',icon: <Bell /> },

    { label: 'SETTINGS', isSection: true },
    { label: 'Org Settings', href: '/settings',    icon: <Settings /> },

    // SUPER ADMIN ONLY — shown when SA views via Org Admin Control
    ...(isSuperAdmin ? [
      { label: '─────────────', isSection: true },
      { label: '🔒 SUPER ADMIN', isSection: true },
      { label: 'Billing & Plan', href: '/sa/billing',       icon: <CreditCard /> },
      { label: 'AI Credits',     href: '/sa/credits',       icon: <Zap /> },
      { label: 'Feature Flags',  href: '/sa/feature-flags', icon: <Flag /> },
      { label: 'Suspend Org',    href: '/sa/suspend',       icon: <PauseCircle /> },
      { label: 'Audit Log',      href: '/sa/audit',         icon: <ScrollText /> },
    ] : []),
  ];
};
```

### 13.3 Super Admin Banner in Org Admin

```typescript
// apps/org-admin/components/SuperAdminBanner.tsx
// Shows when Super Admin is viewing org panel via Org Admin Control

'use client';
import { useAuth } from '@/lib/auth';

export const SuperAdminBanner = () => {
  const { user, currentOrg, exitOrgView } = useAuth();

  if (user?.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="
      fixed top-0 left-0 right-0 z-50 h-12
      bg-gradient-to-r from-orange-600 to-orange-500
      flex items-center justify-between px-4
      font-mono text-white text-sm
    ">
      <span>
        🔀 Managing: <strong>{currentOrg?.name}</strong>
        ({currentOrg?.orgId}) · {currentOrg?.plan}
      </span>
      <button
        onClick={exitOrgView}
        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs"
      >
        Exit Org View ✕
      </button>
    </div>
  );
};
```

### 13.4 Permission Gate Component

```typescript
// apps/org-admin/components/StaffPermissionGate.tsx
// Wraps any section that requires specific permission

'use client';
import { usePermission } from '@eduhub/hooks';

interface Props {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate = ({ permission, children, fallback = null }: Props) => {
  const hasPermission = usePermission(permission);
  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
};

// Usage in a page:
// <PermissionGate permission="fees.collect">
//   <CollectFeeButton />
// </PermissionGate>
```

---

## 14. apps/student — Student Portal

### 14.1 Student Sidebar

```typescript
// apps/student/components/StudentSidebar.tsx

import { Sidebar } from '@eduhub/ui';
import { usePersonalizationUnlock } from '@/hooks/usePersonalization';

const useStudentNav = () => {
  const { isUnlocked } = usePersonalizationUnlock();

  return [
    { label: 'Dashboard',  href: '/dashboard',          icon: <Home /> },
    { label: 'Mock Tests', href: '/tests',               icon: <FileText /> },
    { label: 'My Results', href: '/results',             icon: <BarChart2 /> },

    ...(isUnlocked ? [
      { label: '──────────', isSection: true },
      { label: '⚡ My Practice', isSection: true },
      { label: 'Generate Set', href: '/practice/generate',  icon: <Zap /> },
      { label: 'Study Plan',   href: '/practice/study-plan',icon: <Calendar /> },
      { label: 'Suggested',    href: '/practice/suggestions',icon: <Lightbulb /> },
      { label: 'My Sets',      href: '/practice/sets',      icon: <FolderOpen /> },
    ] : [
      // Show locked section with progress
      { label: '🔒 My Practice (unlock at 50 tests)', href: '/practice/unlock' },
    ]),

    { label: '──────────', isSection: true },
    { label: 'My Progress', href: '/progress', icon: <TrendingUp /> },
    { label: 'My Profile',  href: '/profile',  icon: <User /> },
  ];
};
```

---

## 15. Shared vs App-Specific — Decision Guide

```
ASK: "Would multiple apps use this exact component?"

YES → packages/ui/ or packages/hooks/
  Examples:
  ✅ DataTable — all 3 apps have tables
  ✅ Modal — all 3 apps have modals
  ✅ StatsCard — all 3 apps have dashboards
  ✅ Pagination — all 3 apps paginate data
  ✅ ProgressBar — org analytics + student mastery + unlock progress
  ✅ Stepper — org create wizard + auto set wizard + add staff

NO → apps/[app-name]/components/
  Examples:
  ❌ OrgViewBanner — only super admin (when in org context)
  ❌ ImpersonationBanner — only super admin
  ❌ ExamInterface — only student (full-screen test UI)
  ❌ UnlockProgress — only student (50 tests progress)
  ❌ MasteryBadge — only student/analytics panels
  ❌ SuperAdminBanner — only org-admin (when SA views it)
  ❌ StaffPermissionGate — only org-admin
  ❌ FeePendingAlert — only org-admin fees module

SHARED LOGIC (hooks/api-client/utils):
  ✅ useAuth — different implementation per app, same interface
  ✅ usePagination — same logic everywhere
  ✅ usePermission — org-admin + super-admin both need
  ✅ formatINR — fee display everywhere
  ✅ getMasteryColor — student + admin analytics
  ✅ API calls — same backend, different endpoints per role
```

---

## 16. Authentication Per App

```typescript
// Each app has its own auth.ts in lib/ — same interface, different logic

// apps/super-admin/lib/auth.ts
export const loginSuperAdmin = async (email: string, password: string) => {
  const res = await authApi.superAdminLogin({ email, password });
  localStorage.setItem('auth_token', res.accessToken);
  // Store: role = SUPER_ADMIN
};

// apps/org-admin/lib/auth.ts
export const loginOrgAdmin = async (orgId: string, password: string) => {
  const res = await authApi.orgAdminLogin({ orgId, password });
  localStorage.setItem('auth_token', res.accessToken);
  // Store: role = ORG_ADMIN, orgId, permissions[]
};

// apps/student/lib/auth.ts
export const loginStudent = async (studentId: string, password: string) => {
  const res = await authApi.studentLogin({ studentId, password });
  localStorage.setItem('auth_token', res.accessToken);
  // Store: role = STUDENT, studentId, orgId
};
```

---

## 17. Theming — Per-App Colors

```typescript
// packages/ui/src/themes.ts

export const THEMES = {
  'super-admin': {
    bgBase:      '#080c12',
    surface1:    '#1a2235',
    sidebarBg:   '#0e1420',
    accentPrimary:   '#4f8eff',  // Blue
    accentSecondary: '#7b5fff',  // Purple
    borderColor: '#1a2235',
  },
  'org-admin': {
    bgBase:      '#0f172a',
    surface1:    '#1e293b',
    sidebarBg:   '#1e293b',
    accentPrimary:   '#f97316',  // Orange
    accentSecondary: '#4f8eff',  // Blue
    borderColor: '#2d3f55',
  },
  'student': {
    bgBase:      '#0f172a',
    surface1:    '#1e293b',
    sidebarBg:   '#0f172a',
    accentPrimary:   '#6366f1',  // Indigo
    accentSecondary: '#22c55e',  // Green (for mastery)
    borderColor: '#1e293b',
  },
};

// Each app's tailwind.config.js extends with its theme:
// apps/org-admin/tailwind.config.js
module.exports = {
  content: [
    './app/**/*.tsx',
    './components/**/*.tsx',
    '../../packages/ui/src/**/*.tsx',  // ← include shared UI
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',      // org-admin orange
        'bg-base': '#0f172a',
        surface: '#1e293b',
      }
    }
  }
};
```

---

## 18. How Super Admin Features Become Org Admin

```
Super Admin has: Organizations List page
                 (shows all orgs, create new, manage)

Org Admin does NOT have this page.
Org Admin HAS: Settings → Org Profile
               (edit own org only)

NOT a clone — completely different pages.

─────────────────────────────────────────────────────

What IS shared (same component, different data):

  COMPONENT: DataTable (from @eduhub/ui)
    Super Admin → /organizations → shows list of ALL orgs
    Org Admin   → /students     → shows list of org's students
    Student     → /tests        → shows list of available tests
    Same DataTable component, different columns, different API call

  COMPONENT: StatsCard (from @eduhub/ui)
    Super Admin dashboard → Total Orgs, MRR, Students, AI Usage
    Org Admin dashboard   → Students, Staff, Tests, Revenue
    Same card component, different data

  COMPONENT: Modal (from @eduhub/ui)
    Super Admin → Suspend Org modal
    Org Admin   → Collect Fee modal
    Student     → Share Result modal
    Same Modal shell, different content inside

─────────────────────────────────────────────────────

WHAT HAPPENS when Super Admin views Org Admin panel:

  Super Admin clicks "Org Admin Control" → selects org
  → Orange banner appears (OrgViewBanner in super-admin app)
  → Super Admin is STILL in super-admin app
  → URL: superadmin.eduhub.in/org-admin-control/GK-ORG-00142/dashboard
  → Sidebar changes to show Org Admin nav items
  → PLUS extra "Super Admin Controls" section at bottom

  This is NOT opening orgadmin.eduhub.in
  This is super-admin app rendering org-admin-style pages
  with super admin's elevated permissions
```

---

## 19. Development Workflow

### 19.1 Running All Apps

```bash
# Run ALL apps simultaneously (Turborepo parallel)
pnpm dev

# Output:
# @eduhub/super-admin:dev → localhost:3000
# @eduhub/org-admin:dev   → localhost:3001
# @eduhub/student:dev     → localhost:3002
# @eduhub/ui watching for changes...
```

### 19.2 Working on Shared Component

```bash
# Edit packages/ui/src/components/data-display/DataTable.tsx
# → Turborepo watches for changes
# → All 3 apps hot-reload automatically ✅
```

### 19.3 Adding New Component

```bash
# 1. Create in packages/ui/
touch packages/ui/src/components/data-display/MasteryBar.tsx

# 2. Export in packages/ui/src/index.ts
# export { MasteryBar } from './components/data-display/MasteryBar';

# 3. Use in any app:
# import { MasteryBar } from '@eduhub/ui';
```

### 19.4 Cursor/Windsurf Prompts

```
PROMPT 1: Monorepo Setup
"Set up the EduHub frontend monorepo as specified in PRD-FRONTEND-ARCH-001.
Create the complete folder structure using Turborepo + pnpm workspaces.
Create all config files: turbo.json, pnpm-workspace.yaml, root package.json,
tsconfig.base.json.
Then scaffold all 3 Next.js apps (super-admin port 3000, org-admin port 3001,
student port 3002) and all 5 packages (ui, hooks, api-client, utils, types).
Use Next.js 14 App Router with TypeScript strict mode."

PROMPT 2: Shared UI Library
"In packages/ui, create all components specified in Section 7:
- Sidebar (generic, theme-aware)
- TopBar
- DataTable (with sorting, selection, pagination)
- StatsCard (with trend indicator)
- Modal, ConfirmDialog, Alert, Skeleton
- Input, Select, MultiSelect, SearchBar, FileUpload
- Stepper (horizontal + vertical)
- Pagination
- LineChart, BarChart, DonutChart (using Recharts)
All components must use Tailwind CSS only.
Export all from src/index.ts."

PROMPT 3: Super Admin App
"In apps/super-admin, set up:
1. Auth: login page with email+password form
2. Layout: SuperAdminSidebar using @eduhub/ui Sidebar with nav items from Section 12.2
3. OrgViewBanner component (orange, fixed top, shows org name + Exit button)
4. Organizations list page using DataTable from @eduhub/ui
5. Dashboard page with StatsCard grid from @eduhub/ui
Connect to backend APIs using @eduhub/api-client."

PROMPT 4: Org Admin App
"In apps/org-admin, set up:
1. Auth: login page with Org ID + Password (different from super admin)
2. Layout: OrgAdminSidebar with conditional items based on permissions
3. SuperAdminBanner (orange, shows when SA views via Org Admin Control)
4. StaffPermissionGate component
5. Dashboard page
6. Reuse all DataTable, Modal, StatsCard etc. from @eduhub/ui
Key difference from super-admin: different auth, different nav, different routes.
Same shared UI components."
```

---

## 20. Deployment Setup

### 20.1 Environment Variables Per App

```bash
# apps/super-admin/.env.local
NEXT_PUBLIC_API_URL=https://api.eduhub.in
NEXT_PUBLIC_APP_NAME=EduHub Super Admin
NEXT_PUBLIC_APP_TYPE=super-admin

# apps/org-admin/.env.local
NEXT_PUBLIC_API_URL=https://api.eduhub.in
NEXT_PUBLIC_APP_NAME=EduHub Org Admin
NEXT_PUBLIC_APP_TYPE=org-admin

# apps/student/.env.local
NEXT_PUBLIC_API_URL=https://api.eduhub.in
NEXT_PUBLIC_APP_NAME=MockVeda
NEXT_PUBLIC_APP_TYPE=student
```

### 20.2 Vercel / Self-Hosted Deployment

```
Each app deploys independently:

Vercel Project 1: eduhub-super-admin
  Root Directory: apps/super-admin
  Build Command:  cd ../.. && pnpm turbo build --filter=@eduhub/super-admin
  URL: superadmin.eduhub.in

Vercel Project 2: eduhub-org-admin
  Root Directory: apps/org-admin
  Build Command:  cd ../.. && pnpm turbo build --filter=@eduhub/org-admin
  URL: orgadmin.eduhub.in

Vercel Project 3: eduhub-student
  Root Directory: apps/student
  Build Command:  cd ../.. && pnpm turbo build --filter=@eduhub/student
  URL: [slug].eduhub.in / mockveda.in
```

### 20.3 Build Order (Turborepo handles automatically)

```
1. packages/types      (no deps)
2. packages/utils      (no deps)
3. packages/hooks      (depends on types)
4. packages/api-client (depends on types, utils)
5. packages/ui         (depends on types, utils)
6. apps/*              (depend on all packages)
```

---

## Appendix A: Why NOT Simple Copy/Clone

```
Timeline comparison:

CLONE APPROACH:
  Week 1: Clone done, works ✅
  Month 3: 47 bugs fixed in super-admin, only 12 in org-admin ❌
  Month 6: Teams have diverged, merging impossible ❌
  Month 9: Rewrite needed — cost 3x original ❌

MONOREPO APPROACH:
  Week 1: Setup takes 2 days extra
  Month 3: All bug fixes apply to both apps automatically ✅
  Month 6: New feature added once → works in both apps ✅
  Month 9: Clean codebase, easy to onboard new devs ✅
  Year 2: Add 4th app (mobile web?) → takes 1 week, not 2 months ✅
```

## Appendix B: Component Ownership Map

| Component | Package/App | Used By |
|---|---|---|
| DataTable | @eduhub/ui | All 3 apps |
| StatsCard | @eduhub/ui | All 3 apps |
| Sidebar (shell) | @eduhub/ui | All 3 apps |
| Modal | @eduhub/ui | All 3 apps |
| Stepper | @eduhub/ui | Super Admin + Org Admin |
| LineChart | @eduhub/ui | All 3 apps |
| ProgressBar | @eduhub/ui | All 3 apps |
| OrgViewBanner | apps/super-admin | Super Admin only |
| ImpersonationBanner | apps/super-admin | Super Admin only |
| OrgSwitcher | apps/super-admin | Super Admin only |
| SuperAdminBanner | apps/org-admin | Org Admin only |
| PermissionGate | apps/org-admin | Org Admin only |
| ExamInterface | apps/student | Student only |
| UnlockProgress | apps/student | Student only |
| MasteryBadge | apps/student | Student only |

---

*Document End*

---

**EduHub Frontend Monorepo Architecture — PRD-FRONTEND-ARCH-001**
Version 1.0 | March 2026 | Confidential — Internal Use Only
*3 Next.js Apps + 5 Shared Packages + Turborepo*
