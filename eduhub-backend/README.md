# EduHub Backend — API Server

**Node.js + TypeScript + Express + Prisma + PostgreSQL + Redis**

> Unified backend API for the EduHub multi-org EdTech platform.
> Powers: Super Admin Panel, Org Admin Panel, Student Portal, MockBook & Whiteboard app.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+  
- Docker Desktop (for PostgreSQL + Redis)

### 1. Clone & Install

```bash
cd eduhub-backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your local values
```

### 3. Start Database & Redis

```bash
docker compose up postgres redis -d
```

### 4. Setup Database

```bash
npm run db:generate   # Generate Prisma Client
npm run db:migrate    # Run migrations
npm run db:seed       # Seed: Super Admin + Global folders
```

### 5. Start Dev Server

```bash
npm run dev
# API running at http://localhost:4000
# Health check: http://localhost:4000/health
```

---

## 📦 Project Structure

```
eduhub-backend/
├── prisma/
│   ├── schema.prisma    ← All 30+ DB models
│   └── seed.ts          ← Seeder (Super Admin + Global Q-Bank folders)
├── src/
│   ├── config/          ← env, database, redis, logger
│   ├── middleware/       ← auth (JWT), errorHandler, notFound
│   ├── modules/
│   │   ├── auth/        ← Login/logout (all 4 user types)
│   │   ├── superAdmin/  ← Super Admin operations
│   │   ├── organizations/
│   │   ├── orgAdmin/    ← Org dashboard
│   │   ├── staff/       ← Staff CRUD
│   │   ├── students/    ← Student CRUD + plan limits
│   │   ├── batches/
│   │   ├── qbank/       ← Questions, folders, sets
│   │   ├── tests/       ← Mock tests + attempts
│   │   ├── attendance/
│   │   ├── fees/        ← Fee collection + receipts
│   │   ├── upload/      ← S3 image/PDF upload
│   │   ├── notifications/
│   │   └── mockbook/    ← Public MockVeda tests
│   ├── jobs/
│   │   └── queues.ts    ← BullMQ jobs (mastery, notifications, etc.)
│   └── server.ts        ← Express app entry point
├── .env.example
├── docker-compose.yml   ← Local dev (Postgres + Redis + API)
└── Dockerfile           ← Production container
```

---

## 🔑 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/login` | Login (all user types) |
| POST | `/api/auth/logout` | Logout + token blacklist |
| GET | `/api/auth/me` | Current user info |
| GET | `/api/super-admin/dashboard` | SA dashboard stats |
| GET | `/api/super-admin/organizations` | List all orgs |
| POST | `/api/super-admin/organizations` | Create org (GK-ORG-XXXXX) |
| GET | `/api/students` | List students |
| POST | `/api/students` | Create student (GK-STU-XXXXX) |
| GET | `/api/qbank/folders` | Q-Bank folder tree |
| POST | `/api/qbank/questions` | Create question (GK-Q-XXXXXXX) |
| GET | `/api/qbank/sets` | List question sets |
| GET | `/api/tests` | List tests |
| POST | `/api/tests` | Create mock test |
| POST | `/api/attendance/mark` | Bulk mark attendance |
| POST | `/api/fees/collect` | Collect fee + receipt |
| POST | `/api/upload/image` | Upload image to S3 |
| GET | `/api/mockbook/public` | Public MockVeda tests |

---

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

4 JWT types:
- **Super Admin**: sign with `JWT_SUPER_ADMIN_SECRET`
- **Org Staff**: sign with `JWT_SECRET` + orgId, role, permissions
- **Student**: sign with `JWT_SECRET` + studentId, orgId
- **Public**: open registration (MockVeda)

---

## 🐳 Docker (Full Stack)

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f api
```

---

## ☁️ Production (AWS)

See the [Architecture Guide](../EduHub_Architecture_Guide.md) for full AWS deployment plan.

| Component | Service |
|-----------|---------|
| API Server | ECS Fargate |
| Database | RDS Aurora PostgreSQL 16 |
| Cache/Queue | ElastiCache Redis 7 |
| Files | S3 + CloudFront |
| Email | AWS SES |
| Domain | Route 53 + ALB |

---

## 🌱 Default Credentials (After Seed)

| Role | Login | Password |
|------|-------|---------|
| Super Admin | admin@eduhub.in | `SuperAdmin@123` |
| Demo Org Admin | admin@demo-coaching.in | `DemoOrg@123` |
| Demo Org ID | `GK-ORG-00001` | — |
