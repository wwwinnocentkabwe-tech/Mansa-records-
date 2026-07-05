# 🏛️ Mansa Municipal Council — Records Management System

A full-stack web application for managing Citizen, Land & Property, and Business Licence records.

**Stack:** React + Express + PostgreSQL | JWT Auth | Role-Based Access

---

## 📁 Project Structure

```
mansa-records/
├── backend/        ← Express API
└── frontend/       ← React App (Vite)
```

---

## ⚙️ Setup Instructions

### 1. PostgreSQL Database

```bash
# Create the database
psql -U postgres
CREATE DATABASE mansa_records;
\q

# Run the schema (creates tables + sample data)
psql -U postgres -d mansa_records -f backend/db/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Start the server
npm run dev        # development (with nodemon)
npm start          # production
```

Backend runs on: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 🔐 Default Login Credentials

| Username | Password  | Role   |
|----------|-----------|--------|
| admin    | admin123  | Admin  |
| mphiri   | admin123  | Clerk  |
| jmwale   | admin123  | Viewer |

> ⚠️ Change all passwords immediately in production!

---

## 👥 Role Permissions

| Feature                  | Admin | Clerk | Viewer |
|--------------------------|-------|-------|--------|
| View all records         | ✅    | ✅    | ✅     |
| Search & filter          | ✅    | ✅    | ✅     |
| Add new records          | ✅    | ✅    | ❌     |
| Edit records             | ✅    | ✅    | ❌     |
| Delete records           | ✅    | ❌    | ❌     |
| Manage staff users       | ✅    | ❌    | ❌     |

---

## 🛠️ API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `GET  /api/auth/me` — Current user
- `GET  /api/auth/users` — List users (admin)
- `POST /api/auth/users` — Create user (admin)

### Citizens
- `GET    /api/citizens` — List (search, filter, paginate)
- `GET    /api/citizens/:id` — Single record
- `POST   /api/citizens` — Create
- `PUT    /api/citizens/:id` — Update
- `DELETE /api/citizens/:id` — Delete (admin)

### Land & Property
- `GET    /api/land` — List
- `POST   /api/land` — Create
- `PUT    /api/land/:id` — Update
- `DELETE /api/land/:id` — Delete (admin)

### Business Licences
- `GET    /api/business` — List
- `GET    /api/business/stats` — Summary stats
- `POST   /api/business` — Create
- `PUT    /api/business/:id` — Update
- `DELETE /api/business/:id` — Delete (admin)

### Dashboard
- `GET /api/dashboard/stats` — Overview stats

---

## 🚀 Features

- ✅ Secure login with JWT (8-hour sessions)
- ✅ Role-based access (Admin / Clerk / Viewer)
- ✅ Citizens records with NRC tracking
- ✅ Land & property records with plot numbers
- ✅ Business licences with expiry alerts
- ✅ Real-time search and filtering
- ✅ Pagination for large datasets
- ✅ Dashboard with key statistics
- ✅ Staff user management (Admin only)

---

## 💡 Next Steps (Future Improvements)

- Export records to PDF or Excel
- SMS/email reminders for expiring licences
- Audit log (track who changed what and when)
- Document/file attachments per record
- Ward/zone map integration
- Mobile-responsive improvements
- Backup and restore functionality
