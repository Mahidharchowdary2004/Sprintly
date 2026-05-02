# Sprintly

**Sprintly** is a high-performance, intelligence-driven project and task management engine designed for modern strategic teams. 

## 🚀 Core Features

- **Relational Integrity**: Built on PostgreSQL (via Neon) with Prisma ORM for mission-critical data persistence.
- **Sovereign Control**: Advanced Role-Based Access Control (RBAC) to delegate with precision and maintain oversight.
- **Operational Velocity**: Real-time task tracking and performance metrics visualization.
- **Premium Interface**: A high-tech, glassmorphic UI designed for extreme focus and productivity.

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Deployment**: Optimized for Vercel (Frontend) and Render/Railway (Backend)

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mahidharchowdary2004/Sprintly.git
   cd Sprintly
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Add your .env file with DATABASE_URL and JWT_SECRET
   npx prisma generate
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Add your .env file with VITE_API_URL
   npm run dev
   ```

## 📄 License
This project is licensed under the ISC License.
