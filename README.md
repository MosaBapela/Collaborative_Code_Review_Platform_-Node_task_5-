# Collaborative Code Review Platform

A comprehensive API-driven platform that enables developers and teams to post code snippets, request feedback, and collaborate on reviews in real-time. This platform simplifies the peer review process by providing teams with a structured method for exchanging and collaborating on feedback asynchronously.

## Features

* **User Authentication & Authorization** - Secure JWT-based authentication with role-based access control (Reviewer/Submitter)
* **Project Management** - Create and organize projects with team member assignments
* **Code Submissions** - Upload code snippets or files for review with status tracking
* **Inline & General Comments** - Add comments to specific lines or provide general feedback
* **Review Workflow** - Approve submissions or request changes with full review history
* **Real-time Notifications** - WebSocket-powered live updates when feedback is received
* **Analytics Dashboard** - Project-level statistics including review times, approval rates, and reviewer activity
* **Activity Feed** - Track all notifications and updates in one place

## Tech Stack

### Backend
* **Node.js** - JavaScript runtime
* **Express.js** - Web application framework
* **TypeScript** - Type-safe JavaScript
* **PostgreSQL** - Relational database
* **JWT** - JSON Web Tokens for authentication
* **WebSocket (ws)** - Real-time communication
* **bcryptjs** - Password hashing
* **express-validator** - Request validation

### Development Tools
* **ts-node-dev** - TypeScript execution with auto-reload
* **dotenv** - Environment variable management

## Prerequisites

Before you begin, ensure you have the following installed:
* **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
* **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
* **npm** or **yarn** - Package manager (comes with Node.js)
* **Git** - Version control system

## How to Use

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/collaborative-code-review.git
cd collaborative-code-review
```

### 2. Install Dependencies

```bash
npm install
```

**Dependencies installed:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "ws": "^8.14.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/node": "^20.8.9",
    "@types/pg": "^8.10.7",
    "@types/bcryptjs": "^2.4.5",
    "@types/jsonwebtoken": "^9.0.4",
    "@types/ws": "^8.5.8",
    "@types/cors": "^2.8.15",
    "typescript": "^5.2.2",
    "ts-node-dev": "^2.0.0"
  }
}
```

### 3. Set Up PostgreSQL Database

**Create a new database:**
```bash
# Access PostgreSQL (or use pgAdmin)
psql -U postgres

# Inside psql console
CREATE DATABASE code_review_db;
\q
```

**Or using pgAdmin:**
1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name it `code_review_db`
4. Click Save

### 4. Run Database Schema

**Method A - Using pgAdmin (Recommended):**
1. Right-click on `code_review_db` → Query Tool
2. Click the folder icon (📁) to open file
3. Navigate to `src/db/schema.sql`
4. Click Execute (▶️) or press F5

**Method B - Using Command Line:**
```bash
psql -U postgres -d code_review_db -f src/db/schema.sql
```

**Verify tables were created:**
```sql
-- Run this query in pgAdmin Query Tool
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

You should see: `users`, `projects`, `project_members`, `submissions`, `comments`, `reviews`, `notifications`

### 5. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/code_review_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**⚠️ Important:** Replace `your_password` with your actual PostgreSQL password!

### 6. Start the Development Server

```bash
npm run dev
```

**Expected Output:**
```
============================================================
✅ Database connected successfully
============================================================

🚀 Server running on http://localhost:3000

📋 Available Endpoints:
────────────────────────────────────────────────────────────
...
============================================================
✨ Server is ready to accept requests!
============================================================
```

### 7. Test the API

**Test health endpoint:**
```bash
curl http://localhost:3000/health
```

**Test database connection:**
```bash
curl http://localhost:3000/test-db
```

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reviewer@example.com",
    "password": "password123",
    "name": "John Reviewer",
    "role": "reviewer"
  }'
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/:id` | Get user profile | Yes |
| PUT | `/api/users/:id` | Update user profile | Yes |
| DELETE | `/api/users/:id` | Delete user | Yes |
| GET | `/api/users/:id/notifications` | Get user notifications | Yes |

### Project Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/projects` | Create project | Yes |
| GET | `/api/projects` | List all projects | Yes |
| GET | `/api/projects/:id` | Get project details | Yes |
| POST | `/api/projects/:id/members` | Add member to project | Yes |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Yes |
| GET | `/api/projects/:id/submissions` | List submissions | Yes |
| GET | `/api/projects/:id/stats` | Get project statistics | Yes |

### Submission Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/submissions` | Create submission | Yes |
| GET | `/api/submissions/:id` | Get submission details | Yes |
| PUT | `/api/submissions/:id/status` | Update status | Yes |
| DELETE | `/api/submissions/:id` | Delete submission | Yes |
| POST | `/api/submissions/:id/approve` | Approve submission | Yes (Reviewer) |
| POST | `/api/submissions/:id/request-changes` | Request changes | Yes (Reviewer) |
| GET | `/api/submissions/:id/reviews` | Get review history | Yes |

### Comment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/comments/submissions/:id/comments` | Add comment | Yes (Reviewer) |
| GET | `/api/comments/submissions/:id/comments` | List comments | Yes |
| PUT | `/api/comments/:id` | Update comment | Yes |
| DELETE | `/api/comments/:id` | Delete comment | Yes |

## WebSocket Real-time Updates

Connect to WebSocket for live notifications:

```javascript
const token = 'YOUR_JWT_TOKEN'; // Get from login response
const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

## Project Structure

```
collaborative-code-review/
├── src/
│   ├── config/
│   │   ├── database.ts          # PostgreSQL connection pool
│   │   └── env.ts                # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.ts    # Authentication logic
│   │   ├── user.controller.ts    # User management
│   │   ├── project.controller.ts # Project management
│   │   ├── submission.controller.ts # Submission handling
│   │   ├── comment.controller.ts # Comment management
│   │   └── notification.controller.ts # Notifications
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication
│   │   ├── errorHandler.ts       # Error handling
│   │   └── validation.ts         # Request validation
│   ├── models/                   # (Type definitions in types/)
│   ├── routes/
│   │   ├── auth.routes.ts        # Auth routes
│   │   ├── user.routes.ts        # User routes
│   │   ├── project.routes.ts     # Project routes
│   │   ├── submission.routes.ts  # Submission routes
│   │   └── comment.routes.ts     # Comment routes
│   ├── services/
│   │   ├── auth.service.ts       # Auth business logic
│   │   ├── user.service.ts       # User operations
│   │   ├── project.service.ts    # Project operations
│   │   ├── submission.service.ts # Submission operations
│   │   ├── comment.service.ts    # Comment operations
│   │   ├── notification.service.ts # Notification handling
│   │   └── stats.service.ts      # Analytics
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── utils/
│   │   ├── jwt.ts                # JWT utilities
│   │   └── websocket.ts          # WebSocket manager
│   ├── db/
│   │   └── schema.sql            # Database schema
│   └── server.ts                 # Main application entry
├── .env                          # Environment variables (create this)
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

## Scripts

```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### Database Connection Issues

**Error: "password authentication failed"**
- Check your PostgreSQL password in `.env` file
- Ensure `DATABASE_URL` format is correct: `postgresql://user:password@host:port/database`

**Error: "database does not exist"**
- Create the database: `CREATE DATABASE code_review_db;`
- Verify database name matches the one in `.env`

**Error: "relation 'users' does not exist"**
- Run the schema file: `psql -U postgres -d code_review_db -f src/db/schema.sql`

### Server Issues

**Error: "Port 3000 already in use"**
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Or kill the process: `lsof -ti:3000 | xargs kill -9` (Mac/Linux)

**Error: "Cannot find module"**
- Run `npm install` to install all dependencies

### WebSocket Issues

**Cannot connect to WebSocket**
- Ensure you're using a valid JWT token in the connection URL
- Check that the server is running
- Verify WebSocket URL format: `ws://localhost:3000/ws?token=YOUR_TOKEN`

## Testing the Platform

### Example Workflow

1. **Register two users** (one submitter, one reviewer)
2. **Login** to get JWT tokens
3. **Create a project** (as submitter)
4. **Add reviewer** to the project
5. **Create a submission** with code
6. **Add comments** (as reviewer)
7. **Approve or request changes** (as reviewer)
8. **Check notifications** (as submitter)
9. **View project stats**

### Sample cURL Commands

See the individual endpoint documentation above for detailed examples.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write meaningful commit messages
5. Test your changes before submitting

## Security Considerations

⚠️ **Important for Production:**
- Change `JWT_SECRET` to a strong, random string
- Use environment-specific `.env` files
- Enable SSL/TLS for database connections
- Implement rate limiting
- Add input sanitization
- Use HTTPS in production
- Never commit `.env` file to version control

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues, questions, or contributions, please:
- Open an issue on GitHub
- Submit a pull request
- Contact the maintainers

---

**Built with ❤️ using Node.js, TypeScript, and PostgreSQL**