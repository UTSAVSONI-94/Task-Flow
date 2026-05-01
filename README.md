# TaskFlow

![TaskFlow Overview](https://img.shields.io/badge/Status-Active-success)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)

TaskFlow is a modern, full-stack Task & Project Management web application designed for teams to easily organize, track, and collaborate on tasks using a beautiful Kanban-style interface. 

## ✨ Features
* **Secure Authentication:** JWT-based authentication with `HttpOnly` refresh token rotation.
* **Role-Based Access Control (RBAC):** Project-level roles (Admin vs. Member). Admins can add/remove members and manage tasks, while members can manage their own assigned tasks.
* **Interactive Kanban Board:** Drag-and-drop style organization moving tasks between Todo, In Progress, and Done.
* **Dashboard Analytics:** Visual data representations using Recharts (Task Status breakdown, Open/Overdue metrics).
* **Responsive Design:** A premium user interface with dark mode, built using Tailwind CSS v4 and shadcn/ui components.

## 🛠️ Technology Stack
### Frontend (`/client`)
* **Framework:** React.js (Vite) + TypeScript
* **Styling:** Tailwind CSS v4 + shadcn/ui
* **Routing:** React Router v6
* **State Management:** TanStack Query (React Query)
* **Charts:** Recharts

### Backend (`/server`)
* **Runtime:** Node.js + Express.js + TypeScript
* **Database:** MongoDB with Mongoose ODM
* **Validation:** Zod schemas
* **Security:** bcryptjs (password hashing), JWT (Auth)

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
* Node.js (v18+ recommended)
* MongoDB (or a MongoDB Atlas connection string)

### 2. Clone the repository
```bash
git clone https://github.com/UTSAVSONI-94/Task-Flow.git
cd Task-Flow
```

### 3. Environment Setup
Create a `.env` file in the **root** of the project:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
CLIENT_URL=http://localhost:5173
```
*(Note: Create a `.env` file in the `/client` directory as well if you need to override `VITE_API_URL`, default is `http://localhost:5001/api`)*

### 4. Install Dependencies
**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### 5. Run the Application
Start both the backend and frontend development servers.

**Run Backend:**
```bash
cd server
npm run dev
```

**Run Frontend:**
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📦 Deployment (Railway)
This project is configured as a Monorepo, meaning both the frontend and backend can be deployed from this single repository.

1. **Backend Service:** Connect your Railway project to this repository. Set the **Root Directory** to `/server` and add your Environment Variables.
2. **Frontend Service:** Create a second service in Railway from the same repository. Set the **Root Directory** to `/client`. Set the `VITE_API_URL` variable to your new Railway backend domain.
3. Update the `CLIENT_URL` in the backend service variables to point to your new live frontend domain to ensure CORS works correctly.
