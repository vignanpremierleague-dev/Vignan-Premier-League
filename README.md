# Vignan Premier League (VPL)

The official application for managing the Vignan Premier League. This repository contains both the public-facing tournament website and the real-time administrative auction dashboard.

![VPL Banner](https://placehold.co/800x200/111111/ff6b22?text=Vignan+Premier+League&font=Montserrat)

## Features

*   **Public Portal:** Teams, schedules, rules, registration, and contact pages.
*   **Real-Time Auction Display (`/auction-display`):** A public, sub-50ms synchronized display screen showing the live player auction for viewers worldwide. Built on top of Supabase Realtime Broadcasts.
*   **Admin Dashboard (`/admin`):** Secure panel to manage site settings, verify player registrations, manage teams, and access the auction control room.
*   **Auction Control Room (`/admin/auction`):** Host controls to draft players, nominate, adjust live bids, execute sales, and toggle public visibility.
*   **Device Fingerprinting & Banning:** Secure local system to prevent malicious or spoofed access.

## Architecture & Tech Stack

This project is a decoupled monolith with a **React (Vite) Frontend** and a **Node.js/Express Backend API**, backed by **Supabase (PostgreSQL)**.

*   **Frontend:** React 18, Vite, React Router, Framer Motion (for animations), Lucide React (icons), Vanilla CSS.
*   **Backend:** Node.js, Express, `jsonwebtoken` (JWTs) for auth.
*   **Database & Real-Time Sync:** Supabase (PostgreSQL) and Supabase Realtime Channels.

---

## 🚀 Getting Started


### Prerequisites
*   Node.js 18+
*   Supabase Account / Project

### 1. Environment Configuration

Clone the repository and create a `.env` file from the `.env.example`:
```bash
cp .env.example .env
```

Fill in the required variables:
```env
# Frontend (Vite)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_API_BASE=http://localhost:8787/api

# Backend (Node API)
PORT=8787
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
ADMIN_USER=admin
ADMIN_PASS=secure_password
JWT_SECRET=your_super_secret_jwt_key
```

### 2. Installation
```bash
npm install
```

### 3. Development Server

Run the development command, which uses `concurrently` to start both the Vite frontend and the Node API backend simultaneously.
```bash
npm run dev
```

*   **Frontend Website:** `http://localhost:5173`
*   **Backend API:** `http://localhost:8787/api` (Proxied automatically by Vite during local dev).

### 4. Production Build

To build the frontend for production deployment:
```bash
npm run build
```
The output will be generated in the `dist` folder.

---

## 🏗️ Real-Time Auction System

The VPL application features an ultra-low latency real-time auction system. It uses a **Push architecture** instead of heavy database polling to support thousands of concurrent public viewers securely:

1.  **Initial Load:** The public display (`/auction-display`) securely calls the backend API once to fetch the current auction snapshot from the database.
2.  **WebSocket Channel:** The client immediately subscribes to the `'public-auction'` Supabase channel.
3.  **Host Broadcasting:** When the admin takes action in the control room (bid increase, sell, nominate), the browser updates the database *and* instantly broadcasts the new JSON state directly to all connected WebSockets.
4.  **Visibility Control:** The admin can dynamically toggle "Hide from Public" or "Show to Public", pushing holding screens to all viewers instantly.

---


## 🛠️ Scripts Overview
*   `npm run dev` - Starts both frontend and backend concurrently.
*   `npm run dev:api` - Starts only the Node API using `nodemon`.
*   `npm run dev:web` - Starts only the Vite frontend.
*   `npm run build` - Builds the frontend for production.
*   `npm run lint` - Runs ESLint across the source code.
