# Tasks: PT Training Session Management & Calendar

**Input**: Design documents from `specs/001-pt-training-sessions/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/training-session-api.yaml`, `quickstart.md`  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Core types, date math utilities, and API service client initialization.

- [x] T001 Create TypeScript types and interfaces (`TrainingSession`, `TrainingSessionCalendarItem`, `TrainingSessionCalendarResponse`, `TrainingSessionStatus`, `CalendarViewType`, request payloads, and filter params) in `src/types/session.types.ts`
- [x] T002 [P] Implement zero-dependency native calendar helpers (`getWeekRange` with Monday-Sunday ISO calculation, `getMonthInterval`, `formatIsoDate`, and display formatters) in `src/utils/calendarUtils.ts`
- [x] T003 [P] Implement centralized API client service `trainingSessionApi` calling `/api/training-sessions` endpoints using `axiosClient` in `src/api/trainingSessionApi.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI building blocks that MUST be complete before user story components can be implemented.

- [x] T004 [P] Create reusable `SessionStatusBadge` component with standardized styling and icons for `SCHEDULED` (blue), `CONFIRMED` (cyan), `COMPLETED` (green), `NO_SHOW` (amber), and `CANCELLED` (gray line-through) in `src/components/schedule/SessionStatusBadge.tsx`
- [x] T005 [P] Create `PtCalendarHeader` component featuring view mode switchers (`DAY`, `WEEK`, `MONTH`, `TABLE`), date stepper (`<`, `Hôm nay`, `>`), active date range label, and action trigger in `src/components/schedule/PtCalendarHeader.tsx`
- [x] T006 Connect `SchedulePage` layout with active date state, view mode state, loading skeletons, and error alert handling in `src/pages/pt/SchedulePage.tsx`

---

## Phase 3: User Story 1 - PT Calendar Schedule & Multi-View Navigation (Priority: P1) 🎯 MVP

**Goal**: Personal Trainers can visualize their scheduled appointments across Weekly, Daily, and Monthly views, navigate between date ranges, and view chronologically ordered sessions.

**Independent Test**: Load `/pt/schedule`, toggle between Day, Week, and Month views, and verify that sessions are accurately distributed across date slots with correct start times and status badges.

- [x] T007 [US1] Implement 7-column responsive Monday-to-Sunday weekly grid view displaying day headers, date badges, and session cards in `src/components/schedule/PtCalendarWeekView.tsx`
- [x] T008 [P] [US1] Implement focused vertical hourly timeline view for single-day schedule display in `src/components/schedule/PtCalendarDayView.tsx`
- [x] T009 [P] [US1] Implement monthly overview calendar grid rendering date cells with session badges and item count indicators in `src/components/schedule/PtCalendarMonthView.tsx`
- [x] T010 [US1] Integrate Weekly, Daily, and Monthly view components into `src/pages/pt/SchedulePage.tsx` with date-stepper listeners and empty state displays

---

## Phase 4: User Story 2 - Scheduling New Training Sessions with Conflict Detection (Priority: P1)

**Goal**: Personal Trainers can book new training sessions for clients tied to active contracts, with automatic detection and user-friendly toast alerts for 409 double-booking conflicts.

**Independent Test**: Open the create modal, select a client, select an active contract, enter session details, and book successfully. Then attempt to book the same time slot to verify conflict prevention.

- [x] T011 [US2] Implement `CreateSessionModal` with searchable Client dropdown, dynamic active PT contract selector (filtering contracts with remaining sessions > 0), date picker, time picker, and notes in `src/components/schedule/CreateSessionModal.tsx`
- [x] T012 [US2] Implement 409 Conflict error interception displaying toast warning *"Thời điểm này Huấn luyện viên hoặc học viên đã có lịch tập khác, vui lòng chọn giờ khác!"* in `src/components/schedule/CreateSessionModal.tsx`
- [x] T013 [US2] Wire `+ Lên lịch tập mới` button in `PtCalendarHeader.tsx` to launch `CreateSessionModal` and trigger calendar data refresh upon successful creation in `src/pages/pt/SchedulePage.tsx`

---

## Phase 5: User Story 3 - Training Session Lifecycle & Attendance Management (Priority: P1)

**Goal**: Personal Trainers can perform real-time attendance check-in, mark workout completion, register client no-shows, or cancel scheduled sessions.

**Independent Test**: Transition a scheduled session through Check-in (`CONFIRMED`) and Complete (`COMPLETED`), verifying recorded timestamps and lockouts of terminal states.

- [x] T014 [US3] Implement quick-action dropdown menu on session cards for Check-in (`/check-in`), Hoàn thành (`/complete`), Báo vắng (`/no-show`), and Hủy lịch (`/cancel`) in `src/components/schedule/PtCalendarWeekView.tsx` and `src/components/schedule/PtCalendarDayView.tsx`
- [x] T015 [US3] Add optimistic state updates and feedback toasts for attendance operations calling `trainingSessionApi` in `src/pages/pt/SchedulePage.tsx`
- [x] T016 [US3] Enforce terminal state restrictions: disable action triggers on sessions with status `COMPLETED`, `CANCELLED`, or `NO_SHOW` across all calendar views

---

## Phase 6: User Story 4 - Session Detail Viewing & Rescheduling (Priority: P2)

**Goal**: Personal Trainers can click any session to inspect full metadata (contract, timestamps, notes) and edit/reschedule date, start time, or notes for non-completed sessions.

**Independent Test**: Click a session card, view detail modal, modify the scheduled date and start time, save, and confirm that the calendar reflects the rescheduled slot.

- [x] T017 [US4] Implement `SessionDetailModal` presenting client info, contract details, check-in timestamp (`checkInAt`), completion timestamp (`completedAt`), and notes in `src/components/schedule/SessionDetailModal.tsx`
- [x] T018 [US4] Implement inline editing and rescheduling form for `SCHEDULED` and `CONFIRMED` sessions with 409 collision validation in `src/components/schedule/SessionDetailModal.tsx`
- [x] T019 [US4] Connect session card click listeners across Day, Week, and Month views to launch `SessionDetailModal` and handle refresh callbacks in `src/pages/pt/SchedulePage.tsx`

---

## Phase 7: User Story 5 - Tabular Search, Multi-Criteria Filtering & Pagination (Priority: P2)

**Goal**: Trainers and Administrators can view session history in an alternate tabular list format with pagination, search, and multi-criteria filters.

**Independent Test**: Switch to table view, apply status filter (`COMPLETED`), filter by date range, and navigate across paginated result pages.

- [x] T020 [US5] Implement `PtSessionTableListView` with search by client name, status dropdown filter, date range picker, and pagination controls in `src/components/schedule/PtSessionTableListView.tsx`
- [x] T021 [US5] Integrate table list view mode switcher into `PtCalendarHeader.tsx` and render `PtSessionTableListView` conditionally in `src/pages/pt/SchedulePage.tsx`

---

## Phase 8: User Story 6 - Role-Based Data Isolation & Administrative Oversight (Priority: P3)

**Goal**: Personal Trainers see only their own training schedule by default, while Administrators can filter and inspect the calendar of any trainer.

**Independent Test**: Log in as a PT to confirm personal calendar isolation; log in as Admin to confirm trainer selector dropdown availability.

- [x] T022 [US6] Ensure PT calendar requests scope automatically to the authenticated trainer ID from `useAuth` context in `src/pages/pt/SchedulePage.tsx`
- [x] T023 [US6] Implement Trainer filter dropdown for Administrator role in `src/components/schedule/PtCalendarHeader.tsx` enabling schedule lookup across all staff PTs

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Visual refinements, accessibility, build verification, and end-to-end scenario validation.

- [x] T024 [P] Verify dark mode contrast, responsive layouts on mobile viewports, and custom scrollbars in `src/components/schedule/`
- [x] T025 Run full TypeScript compile check and production build (`npm run build`) to ensure 0 compile errors
- [x] T026 Validate all 7 end-to-end scenarios against `specs/001-pt-training-sessions/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — blocks all user stories.
- **Phase 3 (User Story 1 - MVP)**: Depends on Phase 2 completion.
- **Phase 4 (User Story 2)**: Depends on Phase 2 & 3.
- **Phase 5 (User Story 3)**: Depends on Phase 3.
- **Phase 6 (User Story 4)**: Depends on Phase 4 & 5.
- **Phase 7 (User Story 5)**: Depends on Phase 2.
- **Phase 8 (User Story 6)**: Depends on Phase 2 & 3.
- **Phase 9 (Polish)**: Depends on all desired user stories being complete.

### User Story Dependencies
- **US1 (P1)**: Foundation ready $\rightarrow$ Calendar views (Day/Week/Month).
- **US2 (P1)**: Foundation + US1 $\rightarrow$ Session creation & conflict handling.
- **US3 (P1)**: Foundation + US1 $\rightarrow$ Attendance lifecycle transitions.
- **US4 (P2)**: Foundation + US1 + US3 $\rightarrow$ Detail modal & rescheduling.
- **US5 (P2)**: Foundation $\rightarrow$ Tabular view & pagination.
- **US6 (P3)**: Foundation + US1 $\rightarrow$ Admin trainer filter.

---

## Parallel Opportunities

- **Phase 1**: `T002` (calendarUtils) and `T003` (trainingSessionApi) can execute in parallel.
- **Phase 2**: `T004` (SessionStatusBadge) and `T005` (PtCalendarHeader) can execute in parallel.
- **Phase 3**: `T008` (DayView) and `T009` (MonthView) can execute in parallel once `T007` (WeekView) foundation is set.
- **Phase 9**: `T024` (Visual/responsive polish) can run in parallel with build verification.

---

## Implementation Strategy: MVP First

1. **Step 1**: Complete Phase 1 (Setup: Types, Date Utils, API Service).
2. **Step 2**: Complete Phase 2 (Foundational: StatusBadge, CalendarHeader, SchedulePage frame).
3. **Step 3**: Complete Phase 3 (US1: Week/Day/Month calendar rendering) $\rightarrow$ **MVP Achieved!**
4. **Step 4**: Complete Phase 4 (US2: Create Session & 409 conflict detection).
5. **Step 5**: Complete Phase 5 (US3: Attendance check-in, completion, no-show, cancel).
6. **Step 6**: Complete Phase 6, 7, 8 (Detail modal, Table view, Admin filter).
7. **Step 7**: Complete Phase 9 (Polish, production build verification).

