# ServiceGraph - Product Improvement Plan

> **Goal:** Make ServiceGraph a production-ready, real-time microservice visualization tool that engineering teams actually want to use.

> **Timeline:** 3-4 Weeks | **Deployment:** Vercel + MongoDB Atlas | **Model:** Free Open Source | **Collaboration:** Real-time multi-user

---

## Current State Assessment

### Backend - Code Quality: 7/10 (Well-structured but incomplete security)

| Area | Status | Details |
|------|--------|---------|
| CRUD APIs (Apps, Services, Edges) | ✅ DONE | Full REST endpoints with controllers |
| JWT Auth (httpOnly cookies) | ✅ DONE | Secure token storage |
| Zod Validation | ✅ DONE | All endpoints validated |
| Error Handling | ✅ DONE | Centralized with dev/prod modes |
| Rate Limiters | ❌ BROKEN | Imported in `server.js:12` but NEVER mounted on routes |
| .env in Git | ❌ SECURITY | Real MongoDB Atlas credentials exposed in repo |
| CORS for Production | ❌ MISSING | Only allows `localhost:5173` |

### Frontend - Code Quality: 6/10 (Good foundation, incomplete UX)

| Area | Status | Details |
|------|--------|---------|
| Auth Flow + Backend Integration | ✅ DONE | Real API calls, no MockApi |
| ReactFlow Canvas | ✅ DONE | Custom ServiceNode with status dots |
| Graph Persistence | ✅ DONE | Save/Load from MongoDB |
| Dark/Light Theme | ✅ DONE | Persisted to localStorage |
| Mobile Responsive | ✅ DONE | Drawer panel on mobile |
| `TobBar.tsx` Typo | ❌ BROKEN | Should be `TopBar.tsx` |
| TS Type Error | ❌ BROKEN | `GraphContext.tsx:107` references non-existent type |
| LeftRail Navigation | ❌ STATIC | All buttons are non-functional |
| Share Button | ❌ NO-OP | Not implemented |
| Error Boundaries | ❌ MISSING | White screen of death possible |
| Search/Filter | ❌ MISSING | Can't find services in large graphs |
| Undo/Redo | ❌ MISSING | No way to revert changes |
| Export | ❌ MISSING | No PNG/SVG/JSON export |
| WebSocket | ❌ MISSING | No real-time updates |
| Tests | ❌ MISSING | Zero test files |
| Edge Labels | ❌ MISSING | Can't see protocol (HTTP/gRPC) on connections |
| Drag & Drop | ❌ MISSING | Can only add nodes via button |

---

## Product Architecture

### Tech Stack

```
Frontend                          Backend
─────────                         ───────
React 19 + TypeScript             Express.js 5
Vite 8 (build tool)              MongoDB (Mongoose 9)
Tailwind CSS v4 + shadcn/ui      JWT (httpOnly cookies)
React Flow (canvas)              Zod v4 (validation)
Zustand (state)                  Helmet + CORS
TanStack Query (data fetching)   Rate Limiting
Socket.io-client (real-time)     Socket.io (real-time)
html-to-image (export)           swagger-jsdoc (docs)
```

### Database Schema

```
User
├── name: String
├── email: String (unique)
├── password: String (hashed, select: false)
│
└── owns → [App]

App
├── name: String
├── description: String
├── owner → User (ref)
├── services → [Service] (ref)
├── edges → [Edge] (ref)
├── status: enum (active, archived)
│
Service
├── name: String
├── type: enum (api, database, queue, cache, gateway, worker, frontend, other)
├── status: enum (healthy, degraded, down, unknown)
├── app → App (ref)
├── config: { port, protocol, healthCheck, endpoint }
├── runtime: { cpu, memory, requests, errors, latency }
├── position: { x, y }
├── metadata: { version, language, framework }
│
Edge
├── source → Service (ref)
├── target → Service (ref)
├── label: enum (HTTP, HTTPS, gRPC, TCP, UDP, WebSocket, Event, Other)
├── app → App (ref)
├── metadata: { timeout, retries, circuitBreaker }
```

### API Route Map

```
AUTH
POST   /api/auth/signup          → Register new user
POST   /api/auth/login           → Login (sets JWT cookie)
POST   /api/auth/logout          → Logout (clears cookie)
GET    /api/auth/me              → Get current user

APPS
GET    /api/apps                 → List user's apps
POST   /api/apps                 → Create new app
GET    /api/apps/:id             → Get app with services + edges
PUT    /api/apps/:id             → Update app
DELETE /api/apps/:id             → Delete app (cascading)
GET    /api/apps/:id/graph       → Get graph in ReactFlow format

SERVICES
GET    /api/apps/:appId/services           → List services
POST   /api/apps/:appId/services           → Create service
GET    /api/apps/:appId/services/:id       → Get service
PUT    /api/apps/:appId/services/:id       → Update service
DELETE /api/apps/:appId/services/:id       → Delete service (cascading)
PATCH  /api/apps/:appId/services/:id/position → Update position
PATCH  /api/apps/:appId/services/:id/metrics  → Update metrics

EDGES
GET    /api/apps/:appId/edges              → List edges
POST   /api/apps/:appId/edges              → Create edge
PUT    /api/apps/:appId/edges/:id          → Update edge
DELETE /api/apps/:appId/edges/:id          → Delete edge

HEALTH
GET    /api/health                          → Health check (for monitoring)
```

---

## Week 1: Foundation Fixes + Critical Bugs

### Backend Fixes

| # | Task | What to Do | Why | Files to Touch |
|---|------|-----------|-----|----------------|
| 1 | **Mount rate limiters** | Add `app.use('/api/auth', authLimiter)` and `app.use('/api', apiLimiter)` in `server.js` | Security - prevent brute force & DDoS attacks | `backend/server.js` |
| 2 | **Remove .env from git** | Add `.env` to `.gitignore`, rotate MongoDB password, remove from git history | Security - secrets exposed in public repo | `.gitignore`, `.env` |
| 3 | **Fix TS type error** | Export `UpdateServiceInput` from `services.ts` OR import directly from `../types` in `GraphContext.tsx` | Build will fail on TypeScript check | `GraphContext.tsx`, `api/services.ts` |
| 4 | **Add production CORS** | Update CORS origin to include deployed frontend URL (e.g., `https://servicegraph.vercel.app`) | Cross-origin requests will fail in production | `backend/server.js` |
| 5 | **Health check endpoint** | Add `GET /api/health` returning `{ status: "ok", timestamp: Date.now() }` | Monitoring, uptime checks, deployment health | `backend/server.js` |
| 6 | **Environment validation** | Add validation that `MONGODB_URI` and `JWT_SECRET` exist on startup | Prevent silent failures in production | `backend/server.js` |

### Frontend Fixes

| # | Task | What to Do | Why | Files to Touch |
|---|------|-----------|-----|----------------|
| 1 | **Rename TobBar → TopBar** | Rename `TobBar.tsx` to `TopBar.tsx`, update all imports | Code quality, naming convention | `TopBar.tsx`, `App.tsx` |
| 2 | **Add Error Boundaries** | Create `ErrorBoundary.tsx` component, wrap at app level + each route | Prevent white screen of death | New `ErrorBoundary.tsx`, `App.tsx` |
| 3 | **Fix landing page mobile** | Make MockCanvas responsive - stack nodes vertically on small screens | Mobile users can't see the preview | `LandingPage.tsx` |
| 4 | **Add loading skeletons** | Replace generic loading spinners with skeleton UI | Better perceived performance | `Loading.tsx`, various components |

---

## Week 2: Core UX Features

### Canvas Features

| # | Task | What to Do | Why | Tech/Libraries |
|---|------|-----------|-----|----------------|
| 1 | **Edge labels** | Show protocol labels (HTTP, gRPC, TCP) on connections between nodes | Users need to know communication protocol between services | ReactFlow `EdgeLabelRenderer` |
| 2 | **Search/Filter services** | Add search bar in top bar + status filter dropdown (healthy/degraded/down) | Finding services in large graphs with 50+ nodes | ReactFlow `useReactFlow` + Zustand filter state |
| 3 | **Drag & Drop from sidebar** | Make LeftRail service types draggable to canvas. On drop, create service at drop position with correct type | Natural UX for adding nodes (like Figma/Excalidraw) | React Flow `useDraggable` + custom drop handler |
| 4 | **Minimap** | Show minimap of entire graph in corner | Navigate large architectures without losing context | ReactFlow `<MiniMap>` component |
| 5 | **Zoom controls** | Add zoom in/out/fit buttons + double-click to zoom to node | Better navigation for complex graphs | ReactFlow `fitView()`, `zoomIn()`, `zoomOut()` |
| 6 | **Undo/Redo** | Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts for all canvas operations | Essential for any editing tool - users make mistakes | Zustand `zundo` middleware + command pattern |
| 7 | **Multi-select** | Shift+click or drag to select multiple nodes, then move/delete together | Batch operations on large graphs | ReactFlow multi-select + custom handler |

### Inspector Panel Enhancements

| # | Task | What to Do | Why | Tech/Libraries |
|---|------|-----------|-----|----------------|
| 1 | **Full service config** | Add fields for port, protocol, health check endpoint, version, language, framework in NodeInspector | Users need to configure services properly | Update `NodeInspector.tsx` |
| 2 | **Service metrics display** | Show CPU, memory, requests, errors, latency with mini charts (sparklines) | Real-time monitoring without leaving the canvas | Recharts or Chart.js sparklines |
| 3 | **Edge editing panel** | Click edge to open inspector: edit label, timeout, retries, circuit breaker settings | Configure service dependency details | New `EdgeInspector.tsx` component |
| 4 | **Delete confirmation** | AlertDialog before deleting service or edge | Prevent accidental deletions | shadcn AlertDialog |
| 5 | **Status toggle** | Quick buttons to change service status (healthy/degraded/down) | Manual status override for testing | Status buttons in NodeInspector |

### LeftRail (Make Functional)

| # | Task | What to Do | Why |
|---|------|-----------|-----|
| 1 | **Service type palette** | Make LeftRail show draggable service types (API Gateway, Database, Cache, Queue, etc.) | Users need quick access to add services |
| 2 | **Recent services** | Show recently added services with quick-add button | Speed up workflow |
| 3 | **App settings** | Add app settings section (rename, description, delete app) | Manage app configuration |

---

## Week 3: Real-time + Collaboration

### WebSocket Implementation

| # | Task | What to Do | Why | Tech/Libraries |
|---|------|-----------|-----|----------------|
| 1 | **Socket.io server setup** | Install `socket.io`, create WebSocket server attached to Express | Real-time communication layer | `socket.io` on backend |
| 2 | **Socket.io client setup** | Install `socket.io-client`, create connection hook with auto-reconnect | Frontend connects to WebSocket | `useSocket.ts` hook |
| 3 | **Live service status** | Services emit status changes via WebSocket events (`service:status-changed`) | Real-time monitoring without page refresh | Socket.io events + React Query cache invalidation |
| 4 | **Cursor presence** | Show other users' cursors on canvas with their name/avatar | Know who's looking at what, where | Socket.io rooms + ReactFlow cursor overlay |
| 5 | **Live node movement** | When user drags node, broadcast position to all connected clients | Collaborative editing - see others moving nodes | Socket.io broadcast + ReactFlow state sync |
| 6 | **Live node/edge CRUD** | When one user adds/edits/deletes a node or edge, all others see it instantly | True collaboration | Socket.io events + React Query invalidation |
| 7 | **Connection status indicator** | Show "Connected" / "Reconnecting..." / "Offline" indicator | Users need to know connection state | Socket.io connection events + UI badge |

### Share & Collaboration

| # | Task | What to Do | Why | Tech/Libraries |
|---|------|-----------|-----|----------------|
| 1 | **Share dialog** | Button in TopBar opens dialog: generate shareable link, set permissions (view/edit), copy link | Teams need to share architectures | New `ShareDialog.tsx` + share API endpoint |
| 2 | **Share API** | Backend: `POST /api/apps/:id/share` with email/permission, `GET /api/shared` to list shared apps | Backend support for sharing | New `shareController.js` + `shareRoutes.js` |
| 3 | **Read-only mode** | Shared users with "view" permission can see but not edit canvas | Control who can modify | Backend permission check + frontend disable interactions |
| 4 | **Online users panel** | Show avatars of currently connected users in TopBar | Know who's active on the canvas | Socket.io presence + avatar UI |
| 5 | **Activity feed** | Small panel showing recent actions (who added what, who moved what) | Awareness of team activity | Socket.io events + activity log component |

---

## Week 4: Polish + Deployment

### Export & Import

| # | Task | What to Do | Why | Tech/Libraries |
|---|------|-----------|-----|----------------|
| 1 | **PNG export** | Export graph as high-resolution PNG image | Share in presentations, Slack, docs | `html-to-image` library |
| 2 | **SVG export** | Export graph as vector SVG | For design teams, editing in Figma/Illustrator | `html-to-image` with SVG format |
| 3 | **JSON export** | Export graph configuration as JSON file | Backup, sharing configs, version control | ReactFlow `toObject()` + `JSON.stringify` |
| 4 | **JSON import** | Import graph from JSON file | Restore from backup, share configurations | Custom JSON parser + ReactFlow state restore |
| 5 | **Export dialog** | UI dialog with format selection (PNG/SVG/JSON) + preview | Nice UX for export flow | New `ExportDialog.tsx` |

### Performance Optimization

| # | Task | What to Do | Why | Tech/Libraries |
|---|------|-----------|-----|----------------|
| 1 | **React.memo for nodes** | Wrap `ServiceNode` in `React.memo` with custom comparator | Prevent unnecessary re-renders when other nodes change | `React.memo` on ServiceNode |
| 2 | **Lazy loading routes** | Use `React.lazy()` for Dashboard, Login, Signup pages | Faster initial load (smaller bundle) | `React.lazy()` + `Suspense` |
| 3 | **Memoize expensive computations** | Memoize graph transformation, filter results | Avoid recalculating on every render | `useMemo` in hooks |
| 4 | **Debounce search** | Debounce search input by 300ms | Don't filter on every keystroke | `useDebounce` hook |
| 5 | **Virtualization for large graphs** | Enable ReactFlow virtualization for 100+ nodes | Smooth performance at scale | ReactFlow built-in virtualization |

### Testing

| # | Task | What to Do | Why | Tech/Libraries |
|---|------|-----------|-----|----------------|
| 1 | **Backend API tests** | Test all CRUD endpoints (auth, apps, services, edges) | Catch regressions, ensure API works | Jest + Supertest |
| 2 | **Frontend component tests** | Test key components (NodeInspector, AppList, CreateAppDialog) | Catch UI regressions | Vitest + React Testing Library |
| 3 | **E2E tests** | Test critical flows: signup → create app → add service → connect → export | Ensure product works end-to-end | Playwright |
| 4 | **Setup test config** | Configure Vitest for frontend, Jest for backend | Test infrastructure | `vitest.config.ts`, `jest.config.js` |

### Deployment

| # | Task | What to Do | Why | Tech/Libraries |
|---|------|-----------|-----|----------------|
| 1 | **Vercel config (frontend)** | Create `vercel.json` with SPA rewrite rules, set env vars | Deploy frontend to Vercel (free CDN) | `vercel.json` |
| 2 | **Backend deployment** | Deploy to Railway or Render with MongoDB Atlas | Free tier available for backend | `Dockerfile` or `Procfile` |
| 3 | **Environment variables** | Set `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` in deployment dashboard | Security + config for production | Vercel/Railway dashboard |
| 4 | **GitHub Actions CI** | Create workflow: lint → typecheck → test → build on every push | Code quality gate | `.github/workflows/ci.yml` |
| 5 | **CORS production URL** | Update CORS origin in backend to allow deployed frontend URL | Cross-origin requests in production | `backend/server.js` |

### Documentation

| # | Task | What to Do | Why | Tech/Libraries |
|---|------|-----------|-----|----------------|
| 1 | **README update** | Setup instructions, screenshots, features list, tech stack, live demo link | Users need to know how to use it | Markdown |
| 2 | **API documentation** | Swagger/OpenAPI for all endpoints | Developer experience, API consumers | `swagger-jsdoc` + `swagger-ui-express` |
| 3 | **Contributing guide** | How to set up dev environment, coding standards, PR process | Open source community | `CONTRIBUTING.md` |
| 4 | **Architecture diagram** | Visual diagram of system architecture | New contributors understand the system | Mermaid diagram in README |
| 5 | **Changelog** | Track version changes | Users know what's new | `CHANGELOG.md` |

---

## Priority Order (Execute in This Sequence)

### P0 - Must Fix (Week 1) - Security & Stability
1. Mount rate limiters (security gap)
2. Remove `.env` from git (security)
3. Fix TS type error (build breaks)
4. Add Error Boundaries (prevents crashes)
5. Health check endpoint (monitoring)

### P1 - Core Features (Week 2) - Essential UX
6. Edge labels
7. Search/Filter
8. Drag & Drop from sidebar
9. Undo/Redo
10. Full inspector panel
11. Functional LeftRail
12. Minimap + Zoom controls

### P2 - Collaboration (Week 3) - Team Features
13. WebSocket real-time
14. Multi-user cursors
15. Share dialog
16. Activity feed

### P3 - Polish (Week 4) - Production Ready
17. Export (PNG/SVG/JSON)
18. Performance optimization
19. Testing
20. Deployment
21. Documentation

---

## File Structure (After Implementation)

```
Service-graph/
├── PRODUCT_PLAN.md                    # This file
├── PROJECT_STATUS.md                  # Old status (update after each phase)
├── README.md                          # Project documentation
├── CONTRIBUTING.md                    # Contributing guide
├── CHANGELOG.md                       # Version history
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI
│
├── backend/
│   ├── .env.example                   # Environment template
│   ├── .gitignore                     # Ignores .env, node_modules
│   ├── Dockerfile                     # For deployment
│   ├── package.json
│   ├── server.js                      # Express setup + Socket.io
│   └── src/
│       ├── config/
│       │   └── db.js                  # MongoDB connection
│       ├── models/
│       │   ├── User.js
│       │   ├── App.js
│       │   ├── Service.js
│       │   ├── Edge.js
│       │   └── Share.js               # NEW: Share permissions
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── appController.js
│       │   ├── serviceController.js
│       │   ├── edgeController.js
│       │   └── shareController.js     # NEW: Share logic
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── appRoutes.js
│       │   ├── serviceRoutes.js
│       │   ├── edgeRoutes.js
│       │   └── shareRoutes.js         # NEW: Share routes
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   ├── rateLimiter.js
│       │   ├── validate.js
│       │   └── shareAuth.js           # NEW: Share permission check
│       ├── socket/
│       │   └── socketHandler.js       # NEW: WebSocket events
│       ├── utils/
│       │   ├── AppError.js
│       │   └── validators.js
│       └── tests/                     # NEW: Backend tests
│           ├── auth.test.js
│           ├── apps.test.js
│           ├── services.test.js
│           └── edges.test.js
│
└── Service-graph-dashboard/
    ├── vercel.json                    # NEW: Vercel config
    ├── package.json
    ├── vite.config.ts
    ├── vitest.config.ts               # NEW: Test config
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── lib/
        │   └── utils.ts
        ├── types/
        │   └── index.ts
        ├── api/
        │   ├── client.ts
        │   ├── auth.ts
        │   ├── apps.ts
        │   ├── services.ts
        │   ├── edges.ts
        │   └── share.ts               # NEW: Share API
        ├── store/
        │   ├── useAuthStore.ts
        │   └── useAppStore.ts
        ├── hooks/
        │   ├── useApps.ts
        │   ├── useGraphQuery.ts
        │   ├── useSocket.ts           # NEW: WebSocket hook
        │   ├── useDragDrop.ts         # NEW: Drag & drop hook
        │   ├── useUndoRedo.ts         # NEW: Undo/redo hook
        │   └── useDebounce.ts         # NEW: Debounce hook
        ├── context/
        │   └── GraphContext.tsx
        ├── components/
        │   ├── ErrorBoundary.tsx       # NEW: Error boundary
        │   ├── canvas/
        │   │   ├── FlowCanvas.tsx
        │   │   ├── ServiceNode.tsx
        │   │   ├── EdgeLabel.tsx       # NEW: Edge labels
        │   │   └── CursorOverlay.tsx   # NEW: Multi-user cursors
        │   ├── layout/
        │   │   ├── TopBar.tsx          # FIXED: Renamed from TobBar
        │   │   ├── LeftRail.tsx        # UPDATED: Functional with drag & drop
        │   │   ├── RightPanel.tsx
        │   │   ├── AppList.tsx
        │   │   └── CreateAppDialog.tsx
        │   ├── inspector/
        │   │   ├── NodeInspector.tsx   # UPDATED: Full config + metrics
        │   │   └── EdgeInspector.tsx   # NEW: Edge editing
        │   ├── search/
        │   │   └── SearchFilter.tsx    # NEW: Search + filter bar
        │   ├── share/
        │   │   └── ShareDialog.tsx     # NEW: Share dialog
        │   ├── export/
        │   │   └── ExportDialog.tsx    # NEW: Export dialog
        │   ├── collaboration/
        │   │   ├── OnlineUsers.tsx     # NEW: Online users panel
        │   │   └── ActivityFeed.tsx    # NEW: Activity feed
        │   └── ui/                     # shadcn/ui components
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── badge.tsx
        │       ├── dialog.tsx
        │       ├── input.tsx
        │       ├── label.tsx
        │       ├── separator.tsx
        │       ├── sheet.tsx
        │       ├── skeleton.tsx
        │       ├── slider.tsx
        │       ├── tabs.tsx
        │       ├── textarea.tsx
        │       ├── alert-dialog.tsx    # NEW: Delete confirmation
        │       ├── dropdown-menu.tsx   # NEW: Dropdown menus
        │       ├── tooltip.tsx         # NEW: Tooltips
        │       ├── Error.tsx
        │       └── Loading.tsx
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── LoginPage.tsx
        │   ├── SignupPage.tsx
        │   └── DashboardPage.tsx       # NEW: Dashboard wrapper
        └── tests/                      # NEW: Frontend tests
            ├── components/
            │   ├── NodeInspector.test.tsx
            │   └── AppList.test.tsx
            └── hooks/
                └── useApps.test.ts
```

---

## Interview-Ready Features (Highlight These)

| Feature | What It Shows | Complexity |
|---------|---------------|------------|
| JWT Auth with httpOnly cookies | Security awareness | Medium |
| Real-time collaboration (WebSocket) | Complex backend architecture | High |
| Zustand + TanStack Query | Modern state management | Medium |
| ReactFlow custom nodes + edges | Complex UI library integration | High |
| Responsive design (mobile drawer) | UX thinking | Low |
| Dark/Light theme | Accessibility | Low |
| Error boundaries + retry | Error handling patterns | Medium |
| TypeScript throughout | Type safety | Low |
| Zod validation on all endpoints | Input validation patterns | Medium |
| Drag & Drop from sidebar | DnD libraries, event handling | Medium |
| Undo/Redo (Command pattern) | Design patterns | High |
| Graph export (PNG/SVG/JSON) | Canvas manipulation | Medium |
| Multi-user cursor presence | Real-time UX | High |
| API documentation (Swagger) | Developer experience | Low |
| CI/CD pipeline | DevOps awareness | Medium |
| Cascading deletes | Data integrity | Low |

---

## Commands Reference

```bash
# Backend
cd backend
npm run dev              # Start with nodemon (port 5000)
npm test                 # Run tests (after setup)

# Frontend
cd Service-graph-dashboard
npm run dev              # Start Vite dev server (port 5173)
npm run build            # Production build
npm run typecheck        # TypeScript check
npm run lint             # ESLint check
npm test                 # Run tests (after setup)

# Git
git status               # Check changes
git diff                 # See what changed
git log --oneline -10    # Recent commits
```

---

## Success Metrics

After 3-4 weeks, ServiceGraph should have:

- [ ] Zero security vulnerabilities (rate limiting, no secrets in git)
- [ ] Zero TypeScript compilation errors
- [ ] All core features working (search, filter, drag-drop, undo/redo)
- [ ] Real-time collaboration functional
- [ ] Export working (PNG, SVG, JSON)
- [ ] 80%+ test coverage on critical paths
- [ ] Deployed and accessible via URL
- [ ] API documented with Swagger
- [ ] README with screenshots and setup guide
