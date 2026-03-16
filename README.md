# DevPortal

DevPortal is a frontend dashboard experience for exposing localhost services, inspecting traffic, replaying requests, and testing endpoint behavior in an API playground.

## Features

- Marketing landing page with CLI onboarding
- Dashboard with tunnel list, request log, and request inspector
- Replay workflow with editable request payload validation
- API Playground with endpoint management (add/delete/select), headers, request body, and mock responses
- QR code sharing modal for active tunnel URLs
- Responsive desktop/mobile layouts

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui components
- React Router
- TanStack Query
- Vitest + Playwright test setup

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Build production bundle

```bash
npm run build
```

### 4. Run tests

```bash
npm run test
```

### 5. Lint codebase

```bash
npm run lint
```

## Available Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Production build
- `npm run build:dev`: Development-mode build
- `npm run preview`: Preview built app
- `npm run test`: Run Vitest once
- `npm run test:watch`: Run Vitest in watch mode
- `npm run lint`: Run ESLint

## Project Structure

- `src/pages`: Route-level pages (`Index`, `Dashboard`, `Docs`, `Pricing`, `NotFound`)
- `src/components`: Reusable UI and domain components
- `src/components/ui`: shadcn UI primitives
- `src/lib`: Mock data and utilities
- `src/hooks`: App-specific hooks

## Notes

- The current project uses mock tunnel and request data to demonstrate UX and flows.
- For backend integration, replace mock data and local state handlers in dashboard/playground components with API calls.
