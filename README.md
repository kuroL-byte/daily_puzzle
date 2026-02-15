# Daily Puzzle — Phase 1 (Internship Submission)

An offline-first daily puzzle application built with **Next.js (App Router)**, **TypeScript**, **Prisma**, **PostgreSQL**, and **Firebase Auth**.

## 🏗 Architecture Approach (Offline-First)

### 1. IndexedDB as Primary Source of Truth
The core principle of this application is that the user's local state is always the authoritative source for the UI. 
- When a puzzle is solved, the result is saved immediately to **IndexedDB** using the `idb` library.
- The UI (Heatmap, Streak, Completion status) updates instantly by querying local storage.
- **Zero latency**: The user never waits for a server response to see their progress.

### 2. Smart Sync Strategy
Syncing is decoupled from the user interaction. We trigger sync events on:
- **App Load**: Ensuring any missed offline work is uploaded.
- **Auth State Change**: Syncing local work to the correct user account upon login.
- **Network Recovery**: Detecting `window.online` events to push pending local changes once the connection is restored.

### 3. PostgreSQL Scalability & Data Integrity
To handle millions of users efficiently:
- **Prisma Upsert**: The `/api/sync` endpoint uses the `upsert` pattern. This ensures that even if a record is sent twice (e.g., due to a retry), the database remains consistent without duplicates.
- **Unique Constraint**: A compound unique key `@@unique([userId, date])` is enforced at the database level.
- **Minimal Write Model**: Only aggregated stats (Date, Score, Time) are synced, minimizing bandwidth and database overhead.

### 4. Dynamic GitHub-Style Heatmap
The heatmap renders a full 365+ day grid (start-of-year to today) using vertical week columns.
- **Performance**: Cell rendering is optimized with `React.memo`, and grid generation is wrapped in `useMemo`.
- **Intensity Levels**: Mapped to 5 states (0-4) based on puzzle difficulty and performance metrics.

---

## 🛠 Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: Firebase Auth (Firebase SDK)
- **Local Storage**: IndexedDB (idb wrapper)
- **Time/Date**: dayjs

## 🚀 Scalability Reasoning
By moving the primary computation and storage to the client, we significantly reduce server load (O(1) writes per day/user). The use of **idempotent sync** allows for horizontal scaling of API nodes without risk of data corruption or race conditions.
