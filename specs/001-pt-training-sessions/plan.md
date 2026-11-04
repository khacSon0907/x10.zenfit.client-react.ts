# Implementation Plan: PT Training Session Management & Calendar

**Branch**: `001-pt-training-sessions` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-pt-training-sessions/spec.md`

---

## Summary

Build and integrate the comprehensive Personal Trainer (PT) Training Session Management & Calendar module for the ZenFit Web Application (`/pt/schedule`). The system interfaces directly with the Spring Boot `/api/training-sessions` REST API, providing multi-view calendar scheduling (Day, Week, Month), full session attendance lifecycle transitions (Check-in, Complete, No-Show, Cancel), intelligent double-booking collision prevention (409 Conflict), modal-based session creation and inspection, and an alternate paginated table view with multi-criteria filtering.

---

## Technical Context

**Language/Version**: TypeScript ~6.0 / JavaScript ECMAScript 2022+  
**Primary Dependencies**: React 19.2, Vite 8.3, React Router DOM 7.18, Axios 1.20, Lucide React 1.48, Sonner 2.0, Tailwind CSS v4, React Hook Form 7.90, Zod 4.6  
**Storage**: Client LocalStorage (auth Bearer token session), Spring Boot backend REST endpoints  
**Testing**: Manual scenario verification via [quickstart.md](./quickstart.md), production TypeScript build verification (`tsc -b && vite build`)  
**Target Platform**: Evergreen Web Browsers (Chrome, Edge, Safari, Firefox) on Desktop, Tablet, and Mobile  
**Project Type**: React Single-Page Application (Frontend)  
**Performance Goals**: Calendar view switching in < 1 second; quick-action attendance operations in < 3 seconds; bundle size overhead < 20KB  
**Constraints**: Zero heavy external calendar dependencies (e.g. no FullCalendar or Moment.js); full dark/light mode compatibility; strict ISO-8601 week calculations (Monday to Sunday)  
**Scale/Scope**: 1 primary schedule view page, 5 calendar subcomponents, 2 action modals, 1 API service client, 1 TypeScript types module  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate / Principle | Status | Evaluation |
|:---|:---:|:---|
| **I. Clean Separation of Concerns** | PASS | Types, API services, calendar utilities, and UI views are strictly separated into dedicated files. |
| **II. Component Modularity** | PASS | Calendar header, week grid, day timeline, month view, and modals are decoupled into reusable components. |
| **III. Testable Scenarios** | PASS | 7 clear validation scenarios documented in [quickstart.md](./quickstart.md) covering all critical user flows. |
| **IV. Data Integrity & Validation** | PASS | Explicit state machine enforcement; double-booking collisions (409 Conflict) handled with clear toasts; active contract validation enforced. |
| **V. Simplicity & YAGNI** | PASS | Native date math utilities used instead of heavy 150KB+ calendar libraries, keeping performance optimal. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-pt-training-sessions/
├── spec.md              # Feature specification & requirements
├── plan.md              # Architecture implementation plan (this file)
├── research.md          # Technical research & zero-dependency date math decisions
├── data-model.md        # Data models, entity fields & lifecycle state transitions
├── quickstart.md        # Step-by-step developer validation guide
├── contracts/
│   └── training-session-api.yaml # OpenAPI 3.0 REST specification
└── checklists/
    └── requirements.md  # Spec quality validation checklist (16/16 Passed)
```

### Source Code Layout (repository root)

```text
src/
├── types/
│   └── session.types.ts                 # TrainingSession, Calendar, Request, and Filter types
├── api/
│   └── trainingSessionApi.ts            # Centralized API service for all session endpoints
├── utils/
│   └── calendarUtils.ts                 # Native date range, ISO Monday-Sunday, and view helpers
├── components/
│   └── schedule/
│       ├── PtCalendarHeader.tsx         # View mode toggles, date steppers, search & action buttons
│       ├── PtCalendarWeekView.tsx       # 7-column responsive Monday-Sunday weekly calendar grid
│       ├── PtCalendarDayView.tsx        # Vertical hourly timeline for focused daily schedule
│       ├── PtCalendarMonthView.tsx      # Monthly grid overview with session indicators
│       ├── PtSessionTableListView.tsx   # Alternate tabular search with pagination & filters
│       ├── SessionStatusBadge.tsx       # Standardized status badges with colors & icons
│       ├── CreateSessionModal.tsx       # Modal for creating sessions with contract selection
│       └── SessionDetailModal.tsx       # Modal for viewing, editing, check-in, completion & cancel
└── pages/
    └── pt/
        └── SchedulePage.tsx             # Main PT Schedule entry point connecting all components
```

**Structure Decision**: Modular component hierarchy within `src/components/schedule/` keeping `SchedulePage.tsx` clean and readable, supported by dedicated service `trainingSessionApi.ts`, date utility module `calendarUtils.ts`, and types `session.types.ts`.

---

## Complexity Tracking

> **No Constitution violations detected. All design decisions adhere to project principles.**
