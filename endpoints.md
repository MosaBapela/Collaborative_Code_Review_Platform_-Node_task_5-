# API Endpoints  Full Reference & Postman Test Cases

> **Base URL:** `http://localhost:3000`
>
> **Authentication:** All protected endpoints require the following header:
> ```
> Authorization: Bearer <JWT_TOKEN>
> ```
> You get the JWT token from `POST /api/auth/login`.
>
> **How to use this file with Postman:**
> 1. Open Postman and create a new Collection called `Code Review Platform`.
> 2. For each test case below, create a new Request inside the collection.
> 3. Set the **Method**, **URL**, **Headers**, and **Body** as shown.
> 4. After a successful login, copy the `token` from the response and paste it into the `Authorization` header of protected requests.
> 5. You can also use Postman **Environment Variables**  set `{{base_url}}` = `http://localhost:3000` and `{{token}}` = your JWT token for reuse across requests.

---

## Table of Contents

1. [General](#1-general)
2. [Authentication](#2-authentication)
3. [Users](#3-users)
4. [Projects](#4-projects)
5. [Submissions](#5-submissions)
6. [Comments](#6-comments)
7. [WebSocket](#7-websocket)
8. [End-to-End Workflow](#8-end-to-end-workflow)

---

## 1. General

### GET `/health`

Checks that the server is running. No database interaction involved. Use this first to confirm the server started correctly.

- **Auth Required:** No
- **Request Body:** None

---

#### Test Case 1  Server is running (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/health` |
| Auth | None |
| Body | None |

**Expected Response  `200 OK`:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2026-03-25T10:00:00.000Z"
}
```

---

#### Test Case 2  Confirm timestamp is a valid ISO 8601 date

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/health` |
| Auth | None |
| Body | None |

**Expected Response  `200 OK`:**  
The `timestamp` field must be a valid ISO 8601 date string. Use Postman's **Tests** tab to validate:
```javascript
pm.test("Timestamp is a valid ISO date", () => {
  const body = pm.response.json();
  pm.expect(new Date(body.timestamp).toISOString()).to.equal(body.timestamp);
});
```

---

#### Test Case 3  No Authorization header needed

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/health` |
| Auth | None |
| Body | None |

**Expected Response  `200 OK`:**  
The endpoint returns `200` even without an `Authorization` header, confirming it is public.

---

#### Test Case 4  Response time is under 500ms

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/health` |
| Auth | None |
| Body | None |

**Postman Test:**
```javascript
pm.test("Response time is under 500ms", () => {
  pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

#### Test Case 5  Status field in body equals "ok"

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/health` |
| Auth | None |
| Body | None |

**Postman Test:**
```javascript
pm.test("Status is ok", () => {
  pm.expect(pm.response.json().status).to.equal("ok");
});
```

---

### GET `/test-db`

Tests the PostgreSQL database connection and lists all tables in the `public` schema. Use this after the health check to confirm the DB is reachable.

- **Auth Required:** No
- **Request Body:** None

---

#### Test Case 1  Database is connected (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/test-db` |
| Auth | None |
| Body | None |

**Expected Response  `200 OK`:**
```json
{
  "status": "success",
  "message": "Database connected",
  "current_time": "2026-03-25T10:00:00.000Z",
  "postgresql_version": "PostgreSQL 15.x on x86_64-pc-linux-gnu ...",
  "tables": ["comments", "notifications", "project_members", "projects", "reviews", "submissions", "users"]
}
```

---

#### Test Case 2  All 7 required tables are present

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/test-db` |
| Auth | None |
| Body | None |

**Postman Test:**
```javascript
const expected = ["comments", "notifications", "project_members", "projects", "reviews", "submissions", "users"];
const tables = pm.response.json().tables;
expected.forEach(t => pm.test(`Table "${t}" exists`, () => pm.expect(tables).to.include(t)));
```

---

#### Test Case 3  PostgreSQL version field is present

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/test-db` |
| Auth | None |
| Body | None |

**Postman Test:**
```javascript
pm.test("postgresql_version is present", () => {
  pm.expect(pm.response.json().postgresql_version).to.be.a("string").and.not.empty;
});
```

---

#### Test Case 4  Response status code is 200

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/test-db` |
| Auth | None |
| Body | None |

**Postman Test:**
```javascript
pm.test("Status code is 200", () => pm.response.to.have.status(200));
```

---

#### Test Case 5  Database not running returns 500

> To test this: stop PostgreSQL first, then send the request.

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/test-db` |
| Auth | None |
| Body | None |

**Expected Response  `500 Internal Server Error`:**
```json
{
  "status": "error",
  "message": "Database connection failed",
  "error": "connect ECONNREFUSED 127.0.0.1:5432"
}
```

---

## 2. Authentication

### POST `/api/auth/register`

Creates a new user account. Returns a JWT token immediately  no need to login separately after registering.

- **Auth Required:** No
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Must be a valid email address |
| `password` | string | Yes | Minimum 6 characters |
| `name` | string | Yes | Must not be empty |
| `role` | string | No | `"submitter"` or `"reviewer"`  defaults to `"submitter"` |

---

#### Test Case 1  Register a submitter (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/register` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "alice@example.com",
  "password": "password123",
  "name": "Alice Submitter",
  "role": "submitter"
}
```

**Expected Response  `201 Created`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice Submitter",
    "role": "submitter"
  }
}
```
> Save this token  you will need it for all protected requests made as Alice.

---

#### Test Case 2  Register a reviewer (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/register` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "bob@example.com",
  "password": "password123",
  "name": "Bob Reviewer",
  "role": "reviewer"
}
```

**Expected Response  `201 Created`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "bob@example.com",
    "name": "Bob Reviewer",
    "role": "reviewer"
  }
}
```
> Save this token  you will use it for all reviewer actions.

---

#### Test Case 3  Register with default role (no role field)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/register` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "charlie@example.com",
  "password": "password123",
  "name": "Charlie Default"
}
```

**Expected Response  `201 Created`:**  
`role` must default to `"submitter"` when not provided.

---

#### Test Case 4  Register with invalid email format

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/register` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "not-a-valid-email",
  "password": "password123",
  "name": "Invalid Email User"
}
```

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "email", "location": "body" }
  ]
}
```

---

#### Test Case 5  Register with password shorter than 6 characters

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/register` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "shortpass@example.com",
  "password": "123",
  "name": "Short Pass User"
}
```

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "password", "location": "body" }
  ]
}
```

---

#### Test Case 6  Register with a duplicate email

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/register` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "alice@example.com",
  "password": "password123",
  "name": "Alice Again"
}
```

**Expected Response  `400 Bad Request`:**
```json
{
  "error": "Email already registered"
}
```

---

#### Test Case 7  Register with an invalid role value

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/register` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin User",
  "role": "admin"
}
```

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "role", "location": "body" }
  ]
}
```

---

### POST `/api/auth/login`

Authenticates an existing user and returns a JWT token.

- **Auth Required:** No
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Must be a valid email |
| `password` | string | Yes | Must not be empty |

---

#### Test Case 1  Successful login as submitter (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/login` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Expected Response  `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice Submitter",
    "role": "submitter"
  }
}
```
> Copy the `token` value and set it as the `Authorization: Bearer <token>` header in subsequent requests.

---

#### Test Case 2  Successful login as reviewer (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/login` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "bob@example.com",
  "password": "password123"
}
```

**Expected Response  `200 OK`**  role must be `"reviewer"`.

---

#### Test Case 3  Login with wrong password

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/login` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "alice@example.com",
  "password": "wrongpassword"
}
```

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "Invalid credentials"
}
```

---

#### Test Case 4  Login with non-existent email

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/login` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "nobody@example.com",
  "password": "password123"
}
```

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "Invalid credentials"
}
```

---

#### Test Case 5  Login with empty body

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/login` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | `{}` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "email" },
    { "msg": "Invalid value", "param": "password" }
  ]
}
```

---

#### Test Case 6  Login with missing password field

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/login` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "email": "alice@example.com"
}
```

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "password" }
  ]
}
```

---

## 3. Users

> Replace `1` in all examples with the actual user ID returned at registration.  
> Set `Authorization: Bearer <TOKEN>` in the Headers tab for every request in this section.

---

### GET `/api/users/:id`

Returns a user profile by ID.

- **Auth Required:** Yes
- **URL Param:** `id`  the user ID

---

#### Test Case 1  Get own profile (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "email": "alice@example.com",
  "name": "Alice Submitter",
  "display_picture": null,
  "role": "submitter",
  "created_at": "2026-03-25T10:00:00.000Z"
}
```

---

#### Test Case 2  Get another user profile

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/users/2` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
{
  "id": 2,
  "name": "Bob Reviewer",
  "role": "reviewer"
}
```

---

#### Test Case 3  Get non-existent user

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/users/9999` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "User not found"
}
```

---

#### Test Case 4  Request without Authorization header

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 5  Request with expired or invalid JWT token

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | `Authorization: Bearer invalidtoken.abc.xyz` |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "Invalid or expired token"
}
```

---

### PUT `/api/users/:id`

Updates the authenticated user's own profile. You can only edit your own account.

- **Auth Required:** Yes (own account only)
- **URL Param:** `id`  the user ID
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | No | Must not be empty if provided |
| `display_picture` | string | No | Must be a valid URL if provided |

---

#### Test Case 1  Update name (Happy Path)

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "name": "Alice Updated" }` |

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "name": "Alice Updated",
  "role": "submitter"
}
```

---

#### Test Case 2  Update display picture (Happy Path)

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "display_picture": "https://example.com/avatar.png"
}
```

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "name": "Alice Submitter",
  "display_picture": "https://example.com/avatar.png"
}
```

---

#### Test Case 3  Attempt to update another user's profile

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/users/2` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "name": "Hacked Name" }` |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Forbidden"
}
```

---

#### Test Case 4  Update with invalid display_picture URL

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "display_picture": "not-a-url" }` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "display_picture" }
  ]
}
```

---

#### Test Case 5  Update with empty name string

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "name": "" }` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "name" }
  ]
}
```

---

#### Test Case 6  Update both name and picture at once

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "name": "Alice Smith",
  "display_picture": "https://example.com/new-avatar.jpg"
}
```

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "name": "Alice Smith",
  "display_picture": "https://example.com/new-avatar.jpg"
}
```

---

### DELETE `/api/users/:id`

Permanently deletes the authenticated user's own account.

- **Auth Required:** Yes (own account only)
- **URL Param:** `id`  the user ID

---

#### Test Case 1  Delete own account (Happy Path)

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `204 No Content`** (empty body)

---

#### Test Case 2  Attempt to delete another user's account

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/users/2` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Forbidden"
}
```

---

#### Test Case 3  Delete without auth token

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 4  Delete non-existent user

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/users/9999` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Forbidden"
}
```

---

#### Test Case 5  Verify account is gone after deletion

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/users/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

> Run this after Test Case 1.

**Expected Response  `404 Not Found`:**
```json
{
  "error": "User not found"
}
```

---

## 4. Projects

> Set `Authorization: Bearer <TOKEN>` in Headers for every request in this section.

---

### POST `/api/projects`

Creates a new project. The authenticated user automatically becomes the project owner.

- **Auth Required:** Yes
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | Yes | Must not be empty |
| `description` | string | No | Optional free text |

---

#### Test Case 1  Create a project with description (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "name": "TypeScript Review Project",
  "description": "A project for reviewing TypeScript code submissions"
}
```

**Expected Response  `201 Created`:**
```json
{
  "id": 1,
  "name": "TypeScript Review Project",
  "description": "A project for reviewing TypeScript code submissions",
  "owner_id": 1,
  "created_at": "2026-03-25T10:00:00.000Z"
}
```
> Save the `id`  you will use it in all subsequent project-related requests.

---

#### Test Case 2  Create a project without a description

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "name": "Minimal Project" }` |

**Expected Response  `201 Created`:**
```json
{
  "id": 2,
  "name": "Minimal Project",
  "description": null,
  "owner_id": 1
}
```

---

#### Test Case 3  Missing project name

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "description": "No name provided" }` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "name" }
  ]
}
```

---

#### Test Case 4  Empty name string

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "name": "" }` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "name" }
  ]
}
```

---

#### Test Case 5  Create project without auth token

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects` |
| Headers | `Content-Type: application/json` |
| Body (JSON) | `{ "name": "Unauthorized Project" }` |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

### GET `/api/projects`

Returns a list of all projects the authenticated user owns or is a member of.

- **Auth Required:** Yes

---

#### Test Case 1  Get all projects for a user with projects (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "TypeScript Review Project",
    "owner_id": 1,
    "created_at": "2026-03-25T10:00:00.000Z"
  }
]
```

---

#### Test Case 2  New user with no projects returns empty array

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects` |
| Headers | `Authorization: Bearer <NEW_USER_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[]
```

---

#### Test Case 3  Member user sees projects they were added to

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects` |
| Headers | `Authorization: Bearer <BOB_TOKEN>` |
| Body | None |

> Run this after Bob has been added as a member to Alice's project.

**Expected Response  `200 OK`**  includes Alice's project.

---

#### Test Case 4  Request without auth token

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 5  Response is always an array

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects` |
| Headers | `Authorization: Bearer <TOKEN>` |
| Body | None |

**Postman Test:**
```javascript
pm.test("Response is an array", () => {
  pm.expect(pm.response.json()).to.be.an("array");
});
```

---

### GET `/api/projects/:id`

Returns details for a specific project.

- **Auth Required:** Yes
- **URL Param:** `id`  project ID

---

#### Test Case 1  Get existing project (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "name": "TypeScript Review Project",
  "description": "A project for reviewing TypeScript code submissions",
  "owner_id": 1,
  "created_at": "2026-03-25T10:00:00.000Z"
}
```

---

#### Test Case 2  Non-existent project

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/9999` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Project not found"
}
```

---

#### Test Case 3  Response includes owner_id

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Postman Test:**
```javascript
pm.test("owner_id is present", () => {
  pm.expect(pm.response.json()).to.have.property("owner_id");
});
```

---

#### Test Case 4  Request without auth token

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 5  String ID returns 404

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/invalid-id` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Project not found"
}
```

---

### GET `/api/projects/:id/members`

Lists all members of a project.

- **Auth Required:** Yes
- **URL Param:** `id`  project ID

---

#### Test Case 1  Get members after adding one (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1/members` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[
  {
    "id": 2,
    "name": "Bob Reviewer",
    "email": "bob@example.com",
    "role": "reviewer"
  }
]
```

---

#### Test Case 2  Project with no members returns empty array

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/2/members` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[]
```

---

#### Test Case 3  Non-existent project

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/9999/members` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Project not found"
}
```

---

#### Test Case 4  Request without auth token

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1/members` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 5  Each member has id, name, email, and role

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1/members` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Postman Test:**
```javascript
const members = pm.response.json();
members.forEach((m, i) => {
  pm.test(`Member ${i} has required fields`, () => {
    pm.expect(m).to.have.all.keys("id", "name", "email", "role");
  });
});
```

---

### POST `/api/projects/:id/members`

Adds a user as a project member. Only the project owner can do this.

- **Auth Required:** Yes (owner only)
- **URL Param:** `id`  project ID
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `user_id` | integer | Yes | Must be a valid integer |

---

#### Test Case 1  Owner adds a reviewer (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects/1/members` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "user_id": 2 }` |

**Expected Response  `201 Created`:**
```json
{
  "message": "Member added"
}
```

---

#### Test Case 2  Non-owner tries to add a member

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects/1/members` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "user_id": 3 }` |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Only owner can add members"
}
```

---

#### Test Case 3  Add a member that is already in the project

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects/1/members` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "user_id": 2 }` |

> Run this after Test Case 1 (Bob is already a member).

**Expected Response  `400 Bad Request` or `409 Conflict`:**
```json
{
  "error": "User is already a member"
}
```

---

#### Test Case 4  Invalid (non-integer) user_id

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects/1/members` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "user_id": "abc" }` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "user_id" }
  ]
}
```

---

#### Test Case 5  Add a non-existent user

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/projects/1/members` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "user_id": 9999 }` |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "User not found"
}
```

---

### DELETE `/api/projects/:id/members/:userId`

Removes a member from the project. Only the project owner can do this.

- **Auth Required:** Yes (owner only)
- **URL Params:** `id`  project ID, `userId`  member user ID

---

#### Test Case 1  Owner removes a member (Happy Path)

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/projects/1/members/2` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `204 No Content`** (empty body)

---

#### Test Case 2  Non-owner tries to remove a member

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/projects/1/members/2` |
| Headers | `Authorization: Bearer <BOB_TOKEN>` |
| Body | None |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Only owner can remove members"
}
```

---

#### Test Case 3  Remove member who is not in the project

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/projects/1/members/999` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Member not found"
}
```

---

#### Test Case 4  Request without auth token

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/projects/1/members/2` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 5  Confirm member is gone after removal

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1/members` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

> Run this after Test Case 1.

**Expected Response  `200 OK`**  Bob no longer appears:
```json
[]
```

---

### GET `/api/projects/:id/submissions`

Lists all code submissions belonging to a project.

- **Auth Required:** Yes
- **URL Param:** `id`  project ID

---

#### Test Case 1  Get submissions (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1/submissions` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[
  {
    "id": 1,
    "project_id": 1,
    "submitter_id": 1,
    "title": "Fix login bug",
    "status": "pending",
    "created_at": "2026-03-25T10:00:00.000Z"
  }
]
```

---

#### Test Case 2  Project with no submissions returns empty array

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/2/submissions` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[]
```

---

#### Test Case 3  Each submission includes a status field

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1/submissions` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Postman Test:**
```javascript
pm.response.json().forEach((s, i) => {
  pm.test(`Submission ${i} has status`, () => pm.expect(s).to.have.property("status"));
});
```

---

#### Test Case 4  Non-existent project

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/9999/submissions` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Project not found"
}
```

---

#### Test Case 5  Request without auth token

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1/submissions` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

### GET `/api/projects/:id/stats`

Returns analytics for a project  submission counts, approval rates, and reviewer activity.

- **Auth Required:** Yes
- **URL Param:** `id`  project ID

---

#### Test Case 1  Get stats for a project with activity (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1/stats` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
{
  "total_submissions": 5,
  "approved": 3,
  "changes_requested": 1,
  "pending": 1,
  "approval_rate": 60,
  "avg_review_time_hours": 4.5,
  "reviewers": [
    { "name": "Bob Reviewer", "reviews_count": 3 }
  ]
}
```

---

#### Test Case 2  Stats for a project with no submissions

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/2/stats` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
{
  "total_submissions": 0,
  "approved": 0,
  "changes_requested": 0,
  "pending": 0,
  "approval_rate": 0,
  "reviewers": []
}
```

---

#### Test Case 3  Non-existent project

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/9999/stats` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Project not found"
}
```

---

#### Test Case 4  Request without auth token

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/projects/1/stats` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 5  Approval rate updates after a new approval

1. As Bob, send `POST /api/submissions/1/approve` with `{}`
2. Then send `GET /api/projects/1/stats` as Alice

**Expected**  `approved` count increases by 1 and `approval_rate` updates accordingly.

---

## 5. Submissions

> Set `Authorization: Bearer <TOKEN>` in Headers for every request.

---

### POST `/api/submissions`

Creates a new code submission. The user must be the project owner or a project member.

- **Auth Required:** Yes (project member)
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `project_id` | integer | Yes | Must be a valid integer |
| `title` | string | Yes | Must not be empty |
| `code_content` | string | Yes | Must not be empty |
| `description` | string | No | Optional |
| `filename` | string | No | Optional |

---

#### Test Case 1  Create a submission with all fields (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "project_id": 1,
  "title": "Fix login bug",
  "description": "Fixes the JWT expiry issue on token refresh",
  "code_content": "function login(payload, secret) { return jwt.sign(payload, secret, { expiresIn: '7d' }); }",
  "filename": "auth.ts"
}
```

**Expected Response  `201 Created`:**
```json
{
  "id": 1,
  "project_id": 1,
  "submitter_id": 1,
  "title": "Fix login bug",
  "status": "pending",
  "created_at": "2026-03-25T10:00:00.000Z"
}
```
> New submissions always start with `"status": "pending"`.

---

#### Test Case 2  Create a submission with only required fields

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "project_id": 1,
  "title": "Minimal submission",
  "code_content": "const x: string = 'hello';"
}
```

**Expected Response  `201 Created`:**
```json
{
  "id": 2,
  "title": "Minimal submission",
  "status": "pending"
}
```

---

#### Test Case 3  Non-member tries to submit

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions` |
| Headers | `Authorization: Bearer <NON_MEMBER_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "project_id": 1,
  "title": "Unauthorized submission",
  "code_content": "console.log('hello')"
}
```

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Not a project member"
}
```

---

#### Test Case 4  Missing required fields

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "project_id": 1 }` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "title" },
    { "msg": "Invalid value", "param": "code_content" }
  ]
}
```

---

#### Test Case 5  Non-integer project_id

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "project_id": "abc",
  "title": "Test",
  "code_content": "const x = 1;"
}
```

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "project_id" }
  ]
}
```

---

### GET `/api/submissions/:id`

Returns details of a specific submission including the full code content.

- **Auth Required:** Yes
- **URL Param:** `id`  submission ID

---

#### Test Case 1  Get existing submission (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "project_id": 1,
  "submitter_id": 1,
  "title": "Fix login bug",
  "code_content": "function login(payload, secret) { ... }",
  "status": "pending",
  "created_at": "2026-03-25T10:00:00.000Z"
}
```

---

#### Test Case 2  Non-existent submission

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/9999` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Submission not found"
}
```

---

#### Test Case 3  Request without auth token

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/1` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 4  Response includes code_content field

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Postman Test:**
```javascript
pm.test("code_content is present", () => {
  pm.expect(pm.response.json()).to.have.property("code_content");
});
```

---

#### Test Case 5  Status reflects latest update

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

> Run this after updating the status to `in_review`.

**Postman Test:**
```javascript
pm.test("Status is in_review", () => {
  pm.expect(pm.response.json().status).to.equal("in_review");
});
```

---

### PUT `/api/submissions/:id/status`

Manually updates the status of a submission.

- **Auth Required:** Yes
- **URL Param:** `id`  submission ID
- **Request Body:** JSON

| Field | Type | Required | Allowed Values |
|---|---|---|---|
| `status` | string | Yes | `"pending"`, `"in_review"`, `"approved"`, `"changes_requested"` |

---

#### Test Case 1  Set status to "in_review" (Happy Path)

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/submissions/1/status` |
| Headers | `Authorization: Bearer <TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "status": "in_review" }` |

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "status": "in_review"
}
```

---

#### Test Case 2  Set status to "approved"

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/submissions/1/status` |
| Headers | `Authorization: Bearer <TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "status": "approved" }` |

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "status": "approved"
}
```

---

#### Test Case 3  Set status to "changes_requested"

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/submissions/1/status` |
| Headers | `Authorization: Bearer <TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "status": "changes_requested" }` |

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "status": "changes_requested"
}
```

---

#### Test Case 4  Invalid status value

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/submissions/1/status` |
| Headers | `Authorization: Bearer <TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "status": "rejected" }` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "status" }
  ]
}
```

---

#### Test Case 5  Missing status field

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/submissions/1/status` |
| Headers | `Authorization: Bearer <TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{}` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "status" }
  ]
}
```

---

### DELETE `/api/submissions/:id`

Permanently deletes a submission. Only the original submitter can do this.

- **Auth Required:** Yes (submitter only)
- **URL Param:** `id`  submission ID

---

#### Test Case 1  Submitter deletes own submission (Happy Path)

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/submissions/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `204 No Content`** (empty body)

---

#### Test Case 2  Reviewer tries to delete a submission

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/submissions/1` |
| Headers | `Authorization: Bearer <BOB_TOKEN>` |
| Body | None |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Only submitter can delete"
}
```

---

#### Test Case 3  Delete without auth token

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/submissions/1` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 4  Delete non-existent submission

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/submissions/9999` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Submission not found"
}
```

---

#### Test Case 5  Confirm submission is gone after deletion

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

> Run this after Test Case 1.

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Submission not found"
}
```

---

### POST `/api/submissions/:id/approve`

Approves a submission. Only reviewers can do this. Triggers a real-time notification to the submitter.

- **Auth Required:** Yes (reviewer role only)
- **URL Param:** `id`  submission ID
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `comment` | string | No | Optional approval note |

---

#### Test Case 1  Reviewer approves with a comment (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions/1/approve` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "comment": "Looks great! Clean and well-structured." }` |

**Expected Response  `200 OK`:**
```json
{
  "message": "Submission approved"
}
```

---

#### Test Case 2  Reviewer approves without a comment

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions/1/approve` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{}` |

**Expected Response  `200 OK`:**
```json
{
  "message": "Submission approved"
}
```

---

#### Test Case 3  Submitter tries to approve (not a reviewer)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions/1/approve` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{}` |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Only reviewers can approve"
}
```

---

#### Test Case 4  Approve non-existent submission

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions/9999/approve` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{}` |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Submission not found"
}
```

---

#### Test Case 5  Approval creates a notification for the submitter

After approving, check Alice's notifications:

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/users/1/notifications` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`**  a notification for the approval must be present:
```json
[
  {
    "type": "review",
    "message": "Your submission was approved",
    "read": false
  }
]
```

---

### POST `/api/submissions/:id/request-changes`

Requests changes on a submission. Only reviewers can do this. Triggers a notification to the submitter.

- **Auth Required:** Yes (reviewer role only)
- **URL Param:** `id`  submission ID
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `comment` | string | No | Recommended  explain what changes are needed |

---

#### Test Case 1  Reviewer requests changes with a comment (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions/1/request-changes` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "comment": "Please add error handling to the catch block." }` |

**Expected Response  `200 OK`:**
```json
{
  "message": "Changes requested"
}
```

---

#### Test Case 2  Request changes without a comment

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions/1/request-changes` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{}` |

**Expected Response  `200 OK`:**
```json
{
  "message": "Changes requested"
}
```

---

#### Test Case 3  Submitter tries to request changes

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions/1/request-changes` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "comment": "I want to change my own code" }` |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Only reviewers can request changes"
}
```

---

#### Test Case 4  Request changes on non-existent submission

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/submissions/9999/request-changes` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "comment": "Fix this" }` |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Submission not found"
}
```

---

#### Test Case 5  Notification created for the submitter

After requesting changes, check Alice's notifications:

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/users/1/notifications` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`**  contains the changes-requested notification:
```json
[
  {
    "type": "review",
    "message": "Changes requested for your submission",
    "read": false
  }
]
```

---

### GET `/api/submissions/:id/reviews`

Returns the complete review history of a submission.

- **Auth Required:** Yes
- **URL Param:** `id`  submission ID

---

#### Test Case 1  Get review history with entries (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/1/reviews` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[
  {
    "id": 1,
    "submission_id": 1,
    "reviewer_id": 2,
    "action": "approve",
    "comment": "Looks great!",
    "created_at": "2026-03-25T10:05:00.000Z"
  }
]
```

---

#### Test Case 2  Submission with no reviews returns empty array

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/2/reviews` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[]
```

---

#### Test Case 3  History shows both approve and request_changes actions

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/1/reviews` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Postman Test:**
```javascript
const reviews = pm.response.json();
const actions = reviews.map(r => r.action);
pm.test("Has request_changes action", () => pm.expect(actions).to.include("request_changes"));
pm.test("Has approve action", () => pm.expect(actions).to.include("approve"));
```

---

#### Test Case 4  Non-existent submission

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/9999/reviews` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Submission not found"
}
```

---

#### Test Case 5  Request without auth token

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/submissions/1/reviews` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

## 6. Comments

> Comments can only be **created** by users with the `reviewer` role. Any authenticated user can read comments.

---

### POST `/api/comments/submissions/:id/comments`

Adds a comment to a submission. Supports both general comments and inline comments (tied to a specific line number). Triggers a notification to the submitter.

- **Auth Required:** Yes (reviewer role only)
- **URL Param:** `id`  submission ID
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `content` | string | Yes | Must not be empty |
| `line_number` | integer | No | Optional  used for inline comments |

---

#### Test Case 1  Add a general comment (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "content": "Overall the logic looks solid, but please add JSDoc comments."
}
```

**Expected Response  `201 Created`:**
```json
{
  "id": 1,
  "submission_id": 1,
  "user_id": 2,
  "content": "Overall the logic looks solid, but please add JSDoc comments.",
  "line_number": null,
  "created_at": "2026-03-25T10:10:00.000Z"
}
```

---

#### Test Case 2  Add an inline comment on a specific line

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | See below |

```json
{
  "content": "This variable should be typed as string, not any.",
  "line_number": 5
}
```

**Expected Response  `201 Created`:**
```json
{
  "id": 2,
  "submission_id": 1,
  "user_id": 2,
  "content": "This variable should be typed as string, not any.",
  "line_number": 5,
  "created_at": "2026-03-25T10:11:00.000Z"
}
```

---

#### Test Case 3  Submitter tries to comment (only reviewers can comment)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "content": "I am commenting on my own code" }` |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Only reviewers can comment"
}
```

---

#### Test Case 4  Empty content field

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "content": "" }` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "content" }
  ]
}
```

---

#### Test Case 5  Comment triggers a notification for the submitter

After posting a comment, check Alice's notifications:

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/users/1/notifications` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`**  notification for the comment must appear:
```json
[
  {
    "type": "comment",
    "message": "New comment on your submission",
    "read": false
  }
]
```

---

#### Test Case 6  Request without auth token

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | None |
| Body (JSON) | `{ "content": "Some comment" }` |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

### GET `/api/comments/submissions/:id/comments`

Returns all comments on a submission.

- **Auth Required:** Yes
- **URL Param:** `id`  submission ID

---

#### Test Case 1  Get all comments (Happy Path)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[
  {
    "id": 1,
    "submission_id": 1,
    "user_id": 2,
    "content": "Overall the logic looks solid.",
    "line_number": null,
    "created_at": "2026-03-25T10:10:00.000Z"
  },
  {
    "id": 2,
    "submission_id": 1,
    "user_id": 2,
    "content": "This variable should be typed.",
    "line_number": 5,
    "created_at": "2026-03-25T10:11:00.000Z"
  }
]
```

---

#### Test Case 2  Submission with no comments returns empty array

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/comments/submissions/2/comments` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `200 OK`:**
```json
[]
```

---

#### Test Case 3  Inline and general comments appear together

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Postman Test:**
```javascript
const comments = pm.response.json();
const hasGeneral = comments.some(c => c.line_number === null);
const hasInline = comments.some(c => c.line_number !== null);
pm.test("Both general and inline comments present", () => {
  pm.expect(hasGeneral).to.be.true;
  pm.expect(hasInline).to.be.true;
});
```

---

#### Test Case 4  Non-existent submission

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/comments/submissions/9999/comments` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Submission not found"
}
```

---

#### Test Case 5  Request without auth token

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

### PUT `/api/comments/:id`

Updates the content of an existing comment. Only the comment author can edit it.

- **Auth Required:** Yes (comment author only)
- **URL Param:** `id`  comment ID
- **Request Body:** JSON

| Field | Type | Required | Validation |
|---|---|---|---|
| `content` | string | Yes | Must not be empty |

---

#### Test Case 1  Author updates own comment (Happy Path)

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/comments/1` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "content": "Updated: actually this is fine after re-reading the spec." }` |

**Expected Response  `200 OK`:**
```json
{
  "id": 1,
  "content": "Updated: actually this is fine after re-reading the spec.",
  "updated_at": "2026-03-25T10:20:00.000Z"
}
```

---

#### Test Case 2  Another user tries to edit the comment

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/comments/1` |
| Headers | `Authorization: Bearer <OTHER_REVIEWER_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "content": "Overwriting someone else's comment" }` |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Not authorized to update this comment"
}
```

---

#### Test Case 3  Empty content string

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/comments/1` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "content": "" }` |

**Expected Response  `400 Bad Request`:**
```json
{
  "errors": [
    { "msg": "Invalid value", "param": "content" }
  ]
}
```

---

#### Test Case 4  Non-existent comment

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3000/api/comments/9999` |
| Headers | `Authorization: Bearer <BOB_TOKEN>`, `Content-Type: application/json` |
| Body (JSON) | `{ "content": "Does not exist" }` |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Comment not found"
}
```

---

#### Test Case 5  Verify updated content appears in GET comments

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

> Run this after Test Case 1.

**Postman Test:**
```javascript
const comment = pm.response.json().find(c => c.id === 1);
pm.test("Comment content was updated", () => {
  pm.expect(comment.content).to.include("actually this is fine");
});
```

---

### DELETE `/api/comments/:id`

Deletes a comment. Only the comment author can delete it.

- **Auth Required:** Yes (comment author only)
- **URL Param:** `id`  comment ID

---

#### Test Case 1  Author deletes own comment (Happy Path)

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/comments/1` |
| Headers | `Authorization: Bearer <BOB_TOKEN>` |
| Body | None |

**Expected Response  `204 No Content`** (empty body)

---

#### Test Case 2  Submitter tries to delete a reviewer comment

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/comments/1` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

**Expected Response  `403 Forbidden`:**
```json
{
  "error": "Not authorized to delete this comment"
}
```

---

#### Test Case 3  Delete a non-existent comment

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/comments/9999` |
| Headers | `Authorization: Bearer <BOB_TOKEN>` |
| Body | None |

**Expected Response  `404 Not Found`:**
```json
{
  "error": "Comment not found"
}
```

---

#### Test Case 4  Request without auth token

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3000/api/comments/1` |
| Headers | None |
| Body | None |

**Expected Response  `401 Unauthorized`:**
```json
{
  "error": "No token provided"
}
```

---

#### Test Case 5  Confirm comment is gone after deletion

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3000/api/comments/submissions/1/comments` |
| Headers | `Authorization: Bearer <ALICE_TOKEN>` |
| Body | None |

> Run this after Test Case 1.

**Postman Test:**
```javascript
const ids = pm.response.json().map(c => c.id);
pm.test("Deleted comment is no longer present", () => {
  pm.expect(ids).to.not.include(1);
});
```

---

## 7. WebSocket

Connect to receive real-time notifications whenever a review action or comment is performed on your submissions.

**Connection URL:**
```
ws://localhost:3000/ws?token=YOUR_JWT_TOKEN
```

> Postman supports WebSocket testing via **New Request  WebSocket**.  
> Set the URL to `ws://localhost:3000/ws?token=<YOUR_JWT_TOKEN>` and click **Connect**.

---

#### Test Case 1  Connect with a valid token

| Field | Value |
|---|---|
| Type | WebSocket |
| URL | `ws://localhost:3000/ws?token=<ALICE_TOKEN>` |

**Expected:** Connection opens successfully. Postman shows `Connected`.

---

#### Test Case 2  Receive notification when reviewer adds a comment

1. Open a WebSocket connection as Alice (Test Case 1 above).
2. As Bob, send `POST /api/comments/submissions/1/comments` with `{ "content": "Fix this line." }`.
3. Watch the WebSocket messages panel.

**Expected message received by Alice:**
```json
{
  "type": "comment",
  "message": "New comment on your submission",
  "related_id": 1
}
```

---

#### Test Case 3  Receive notification when submission is approved

1. Open a WebSocket connection as Alice.
2. As Bob, send `POST /api/submissions/1/approve` with `{ "comment": "LGTM!" }`.

**Expected message received by Alice:**
```json
{
  "type": "review",
  "message": "Your submission was approved",
  "related_id": 1
}
```

---

#### Test Case 4  Receive notification when changes are requested

1. Open a WebSocket connection as Alice.
2. As Bob, send `POST /api/submissions/1/request-changes` with `{ "comment": "Add error handling." }`.

**Expected message received by Alice:**
```json
{
  "type": "review",
  "message": "Changes requested for your submission",
  "related_id": 1
}
```

---

#### Test Case 5  Connect without a token (rejected)

| Field | Value |
|---|---|
| Type | WebSocket |
| URL | `ws://localhost:3000/ws` |

**Expected:** Connection is rejected or immediately closed.

---

#### Test Case 6  Connect with an invalid token (rejected)

| Field | Value |
|---|---|
| Type | WebSocket |
| URL | `ws://localhost:3000/ws?token=this.is.invalid` |

**Expected:** Connection is rejected or immediately closed.

---

## 8. End-to-End Workflow

Use this sequence to test the full platform from scratch in Postman. Run each step in order.

| Step | Action | Method | Endpoint | Who |
|---|---|---|---|---|
| 1 | Register Alice as submitter | POST | `/api/auth/register` |  |
| 2 | Register Bob as reviewer | POST | `/api/auth/register` |  |
| 3 | Login as Alice  save token | POST | `/api/auth/login` | Alice |
| 4 | Login as Bob  save token | POST | `/api/auth/login` | Bob |
| 5 | Create a project | POST | `/api/projects` | Alice |
| 6 | Add Bob as a project member | POST | `/api/projects/1/members` | Alice (owner) |
| 7 | Submit code for review | POST | `/api/submissions` | Alice |
| 8 | View project submissions | GET | `/api/projects/1/submissions` | Bob |
| 9 | Add an inline comment | POST | `/api/comments/submissions/1/comments` | Bob (reviewer) |
| 10 | Add a general comment | POST | `/api/comments/submissions/1/comments` | Bob (reviewer) |
| 11 | Request changes | POST | `/api/submissions/1/request-changes` | Bob (reviewer) |
| 12 | Alice checks notifications | GET | `/api/users/1/notifications` | Alice |
| 13 | Alice updates submission status | PUT | `/api/submissions/1/status` | Alice |
| 14 | Bob approves the submission | POST | `/api/submissions/1/approve` | Bob (reviewer) |
| 15 | View full review history | GET | `/api/submissions/1/reviews` | Alice |
| 16 | View project analytics | GET | `/api/projects/1/stats` | Alice |

---

*This document covers all endpoints in the Collaborative Code Review Platform.*  
*For setup and run instructions, see [README.md](./README.md).*
