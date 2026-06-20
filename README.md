




# NexusMart - Full Stack Ecommerce Application

This is a production-ready eCommerce application built with React (Vite) and Node.js + Express.

## Project Structure
- `/frontend` - React application built with Vite, React Router, Axios, and Vanilla CSS with theming.
- `/backend` - Scalable Node.js, Express backend with MongoDB schema, JWT auth, and protected API routes.

## Quick Start

### 1. Database Setup
1. Create a MongoDB Atlas cluster (or run MongoDB locally).
2. Get your connection string.
3. Edit `/backend/.env` and replace `MONGO_URI` with your connection string.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The API server will run on "https://amora-cafe-backend.onrender.com"

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React development server will start and you can access the frontend.

## API Routes Overview
- **POST** `/api/auth/register` - Create user
- **POST** `/api/auth/login` - Authenticate
- **GET** `/api/products` - Fetch all products
- **POST** `/api/orders` - Place order (Protected)

## Deployment Instructions

### Frontend (Vercel or Netlify)
1. Push your repository to GitHub.
2. Sign in to Vercel/Netlify.
3. Create a New Project -> Import your Github Repo.
4. Framework Preset: `Vite`
5. Build Command: `npm run build` (In Vercel, change Root Directory to `/frontend`).
6. Deploy!

### Backend (Render or AWS EC2)
1. Sign in to Render.com.
2. Add a new **Web Service**.
3. Connect your GitHub repository.
4. Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add Environment Variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT=5000`
8. Deploy Service.

Enjoy your scalable ecommerce store!
