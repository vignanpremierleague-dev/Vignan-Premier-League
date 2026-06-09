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
