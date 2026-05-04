# Evently

Evently is a modern, full-stack web application designed for effortless event creation, management, and RSVP tracking. Built with the latest technologies including Next.js 16, React 19, and Tailwind CSS, it offers a seamless user experience from invitation to confirmation.

## Features

- **Event Creation & Management:** Authenticated users can create, edit, and manage their events.
- **Custom Invitations:** Generate unique, secure invite links (tokens) for guests.
- **RSVP Tracking:** Guests can respond to invites with their status (Going, Maybe, Not Going) without needing an account.
- **User Dashboard:** A centralized place for event organizers to view all their created events and monitor guest responses.
- **Modern UI/UX:** Clean, accessible, and responsive interface built with Shadcn UI and Tailwind CSS.
- **Secure Authentication:** Integrated with Neon Auth for robust user session management.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **Database:** PostgreSQL (hosted via [Neon Database](https://neon.tech/))
- **ORM:** [Prisma](https://www.prisma.io/) (`@prisma/client` & `@prisma/adapter-pg`)
- **Authentication:** Neon Database Auth (`@neondatabase/auth`)

## Project Structure

- `src/app/events` - Pages for creating and viewing events.
- `src/app/invite` - Public-facing RSVP routes where guests respond to tokens.
- `src/app/dashboard` - Organizer's dashboard to manage events and RSVPs.
- `src/app/auth` & `src/app/account` - Authentication flows and user settings.
- `src/components/ui` - Reusable UI components powered by Shadcn.
- `prisma/schema.prisma` - Database schema definitions (Events, Invites, RSVPs).

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- A PostgreSQL database (Neon Database recommended for auth integration)
- pnpm, npm, yarn, or bun

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/parfaitBashombe/evently.git
   cd evently
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Environment Variables:**

   Create a `.env` file in the root directory based on `.env.example` (if available), or ensure you have the following keys:

   ```env
   DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
   # Add your Neon Auth variables and any other required secrets
   ```

4. **Initialize the Database:**

   Run Prisma migrations to set up the schema:

   ```bash
   npx prisma generate
   npx prisma db push
   # or npx prisma migrate dev
   ```

5. **Start the Development Server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Learn More

To learn more about the tools used in this project, check out:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
