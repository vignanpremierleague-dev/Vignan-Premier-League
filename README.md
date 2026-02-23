# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Local admin API

This project now uses a small local backend API for admin authentication and admin-only database actions.

- Start frontend: `npm run dev`
- Start backend API: `npm run dev:api`
- API defaults to `http://localhost:8787` and frontend calls it through `/api` via Vite proxy.

Create a `.env` from `.env.example` and set backend variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `ADMIN_USER`
- `ADMIN_PASS`

If you want to keep the old admin login, set:

- `ADMIN_USER=admin`
- `ADMIN_PASS=vpl@admin2025`
