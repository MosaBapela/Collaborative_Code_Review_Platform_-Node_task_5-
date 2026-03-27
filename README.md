# Collaborative Code Review Platform

A **REST API** for peer code review — submit code, get feedback, track approvals, and receive real-time notifications via WebSockets.

**Stack:** Node.js · TypeScript · Express · PostgreSQL · JWT · WebSockets

---

## Overview

- **Submitters** create projects, invite teammates, and submit code for review.
- **Reviewers** leave inline or general comments and approve or request changes.
- **Both roles** get real-time WebSocket notifications on review activity.
- **Project owners** can view per-project analytics (approval rates, reviewer activity).

---

## Features

| | Feature |
|---|---|
| 🔐 | JWT auth with role-based access (`submitter` / `reviewer`) |
| 📁 | Project management with member control |
| 📝 | Code submissions with status tracking (`pending` → `in_review` → `approved` / `changes_requested`) |
| 💬 | Inline and general comments from reviewers |
| 🔔 | Real-time notifications via WebSocket |
| 📊 | Per-project analytics dashboard |

---

## How to Run

**Prerequisites:** Node.js 18+, PostgreSQL 14+, npm

```bash
# 1. Clone and install
git clone https://github.com/MosaBapela/Collaborative_Code_Review_Platform_-Node_task_5-.git
cd Collaborative_Code_Review_Platform_-Node_task_5-
npm install

# 2. Create the database
psql -U postgres -c "CREATE DATABASE code_review_db;"
psql -U postgres -d code_review_db -f src/db/schema.sql

# 3. Configure environment
cp .env.example .env   # then edit .env with your values
```

**`.env` values:**
```env
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/code_review_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
# 4. Start the server
npm run dev
```

Verify it's running:
- `GET http://localhost:3000/health` → `{ "status": "ok" }`
- `GET http://localhost:3000/test-db` → `{ "status": "success", "tables": [...] }`

**Scripts:** `npm run dev` · `npm run build` · `npm start`

---

## API Quick Reference

> Protected routes require `Authorization: Bearer <JWT_TOKEN>` (token from `POST /api/auth/login`).  
> 📄 **Full Postman test cases for every endpoint are in [`endpoints.md`](./endpoints.md).**

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/health` | — |
| GET | `/test-db` | — |
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET / PUT / DELETE | `/api/users/:id` | ✅ |
| POST / GET | `/api/projects` | ✅ |
| GET / (mgmt) | `/api/projects/:id` and sub-routes | ✅ |
| POST / GET / PUT / DELETE | `/api/submissions` and sub-routes | ✅ |
| POST / GET / PUT / DELETE | `/api/comments/...` | ✅ (create: reviewer only) |

---

## WebSocket

```
ws://localhost:3000/ws?token=YOUR_JWT_TOKEN
```

Notifications are pushed when a reviewer approves, requests changes, or comments on your submission.

---

## Troubleshooting

| Error | Fix |
|---|---|
| `password authentication failed` | Check `DATABASE_URL` in `.env` |
| `database does not exist` | Run `CREATE DATABASE code_review_db;` |
| `relation "users" does not exist` | Re-run `src/db/schema.sql` |
| `ECONNREFUSED :5432` | Start PostgreSQL service |
| `Port 3000 in use` | Change `PORT` in `.env` |

---

## Conclusion
You will find information regarding endpoints and their usage in the endpoints.md file