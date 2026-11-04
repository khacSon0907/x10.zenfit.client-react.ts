# Feature Specification: PT Training Session Management & Calendar

**Feature Branch**: `001-pt-training-sessions`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "Xây dựng và hoàn thiện module Quản lý Buổi tập & Lịch làm việc PT (Training Session Management & PT Calendar) cho dự án ZenFit Web theo bộ API REST chuẩn vừa được triển khai từ Spring Boot Backend."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - PT Calendar Schedule & Multi-View Navigation (Priority: P1)

Personal Trainers (PTs) need a unified, responsive calendar interface to visualize their upcoming training appointments across different time horizons (Daily, Weekly, and Monthly), navigate seamlessly between dates, and review scheduled commitments with clients.

**Why this priority**: Without an intuitive calendar view, trainers cannot plan their workdays, organize client sessions, or track their real-time commitments, leading to missed appointments and scheduling chaos.

**Independent Test**: Can be fully tested by loading the calendar view for the current authenticated trainer across Day, Week, and Month modes, confirming that sessions appear accurately sorted by date and start time with appropriate visual status tags.

**Acceptance Scenarios**:

1. **Given** a Personal Trainer is authenticated, **When** they access the Training Schedule page, **Then** the system displays the schedule in the default Weekly view showing Monday through Sunday of the current week with all assigned training sessions ordered by training date and start time.
2. **Given** a Personal Trainer is viewing their calendar, **When** they toggle between "Ngày" (Day), "Tuần" (Week), and "Tháng" (Month) view modes, **Then** the calendar updates immediately to present the corresponding date interval while preserving the currently focused date reference.
3. **Given** a Personal Trainer is viewing their schedule, **When** they use the date navigation controls (Next, Previous, Today), **Then** the calendar advances or rewinds by the selected interval (1 day in Day view, 1 week in Week view, 1 month in Month view) and returns instantly to the present day when clicking "Hôm nay".
4. **Given** a Personal Trainer has no scheduled sessions on a selected date or week, **When** the calendar loads, **Then** the system displays a clear, friendly empty state inviting the trainer to book their first training session.

---

### User Story 2 - Scheduling New Training Sessions with Conflict Detection (Priority: P1)

Personal Trainers need to book new training sessions for their clients against valid, active PT contracts while automatically detecting and preventing double-booking conflicts for both the trainer and the client.

**Why this priority**: Direct booking tied to active contracts ensures that training sessions are properly tracked, counted against package allowances, and scheduled without overlapping conflicts.

**Independent Test**: Can be tested by selecting a client with an active contract, entering session details, selecting a conflict-free date and time, and confirming session creation, followed by attempting to book an identical time slot to verify conflict prevention.

**Acceptance Scenarios**:

1. **Given** a Personal Trainer has a client with an active contract, **When** the trainer opens the "Lên lịch tập mới" modal, selects the client, selects an active contract, inputs session title (e.g., "Ngực & Tay sau"), training date, start time, and optional notes, and submits, **Then** the system creates the session with status "SCHEDULED" and updates the calendar display immediately.
2. **Given** a Personal Trainer selects a client with multiple active contracts, **When** viewing the contract selection dropdown, **Then** only active contracts are eligible for selection, and remaining sessions in each contract are visible.
3. **Given** a trainer or client already has a booked session at 09:00 on 2026-11-10, **When** the trainer attempts to schedule another session at the exact same date and start time, **Then** the system refuses the request with a clear warning: "Thời điểm này Huấn luyện viên hoặc học viên đã có lịch tập khác, vui lòng chọn giờ khác!".
4. **Given** a client has no active contracts (all expired or completed), **When** the trainer attempts to schedule a session, **Then** the system alerts the trainer that an active training contract is required before scheduling sessions.

---

### User Story 3 - Training Session Lifecycle & Real-Time Attendance Management (Priority: P1)

Personal Trainers need to manage the lifecycle of individual training sessions through quick status transitions: Check-in/Confirm attendance, Complete training, Mark No-Show, or Cancel an appointment.

**Why this priority**: Real-time attendance check-in and session completion are essential for accurate session counting, contract balance deductions, and operational accountability.

**Independent Test**: Can be tested by creating a scheduled session, checking in to change status to "CONFIRMED", marking it complete to transition to "COMPLETED", and verifying that completed timestamps are recorded and further status modifications are locked.

**Acceptance Scenarios**:

1. **Given** a session is in "SCHEDULED" status, **When** the trainer performs check-in, **Then** the session status transitions to "CONFIRMED" (Đã check-in / Đã xác nhận) with a recorded server check-in timestamp.
2. **Given** a session is in "CONFIRMED" or "SCHEDULED" status and the workout is concluded, **When** the trainer confirms session completion, **Then** the session transitions to "COMPLETED" (Hoàn thành) with a recorded completion timestamp, and its attendance status is locked.
3. **Given** a scheduled session time has passed and the client fails to attend, **When** the trainer marks "No-show", **Then** the session status changes to "NO_SHOW" (Vắng mặt) with visual distinction.
4. **Given** an upcoming session needs to be cancelled prior to workout, **When** the trainer executes session cancellation with an optional cancellation note, **Then** the status transitions to "CANCELLED" (Đã hủy) and appears crossed-out or dimmed in the calendar.
5. **Given** a session is already "COMPLETED", "CANCELLED", or "NO_SHOW", **When** viewed in the calendar or detail modal, **Then** status modification actions are disabled to preserve historical integrity.

---

### User Story 4 - Session Detail Viewing & Rescheduling (Priority: P2)

Personal Trainers need to inspect comprehensive session details (client profile, contract association, check-in timestamps, workout notes) and modify scheduled session timing or notes when needed before workout execution.

**Why this priority**: Training schedules frequently change due to client requests or emergencies; trainers must be able to adjust dates, start times, and notes cleanly without canceling and recreating sessions.

**Independent Test**: Can be tested by clicking an existing scheduled session, viewing its full details in a modal, editing the date and start time, and confirming that the calendar reflects the rescheduled slot.

**Acceptance Scenarios**:

1. **Given** any session card in the calendar, **When** the trainer clicks on the card, **Then** a Session Detail modal opens displaying client name, phone, contract code, workout name, training date, start time, current status badge, check-in timestamp (if any), completion timestamp (if any), and notes.
2. **Given** a session in "SCHEDULED" or "CONFIRMED" status, **When** the trainer edits the workout name, training date, start time, or notes and saves, **Then** the system validates against potential conflicts and updates the session details.
3. **Given** a session in "COMPLETED" or "CANCELLED" status, **When** the trainer opens its details, **Then** the form fields are read-only and no rescheduling actions are permitted.

---

### User Story 5 - Tabular Search, Multi-Criteria Filtering & Pagination (Priority: P2)

Trainers and Administrators need an alternate structured table view to audit historical sessions, filter by status, client, contract, or date ranges, and paginate through large sets of session records.

**Why this priority**: Calendar views are optimal for day-to-day operations, but tabular search and filtering are required for attendance audits, payroll calculation, and reporting over broad time windows.

**Independent Test**: Can be tested by opening the session list table, applying status filters (e.g., "COMPLETED"), selecting a date range, searching by client name, and navigating through paginated result pages.

**Acceptance Scenarios**:

1. **Given** the training sessions list table, **When** the user applies a status filter (e.g., "COMPLETED"), **Then** only sessions matching that status are displayed.
2. **Given** a large volume of training sessions, **When** navigating the table, **Then** records are presented in paginated pages with controls to switch pages, change page size, and view total item counts.
3. **Given** a date range filter (start date to end date), **When** submitted, **Then** the list displays sessions that fall strictly within the selected date boundary.

---

### User Story 6 - Role-Based Data Isolation & Administrative Oversight (Priority: P3)

The system must ensure that Personal Trainers only access and manipulate their own schedules, while Administrators have the authority to inspect, filter, and review the calendar of any trainer across the organization.

**Why this priority**: Guarantees privacy, security, and operational clarity among trainers while enabling management to oversee staff workload and client satisfaction.

**Independent Test**: Can be tested by logging in as PT-A to verify that only PT-A's sessions appear, followed by logging in as Admin to filter sessions by PT-A and PT-B.

**Acceptance Scenarios**:

1. **Given** a Personal Trainer is logged in, **When** fetching calendar or session records, **Then** the system automatically scopes the results to the authenticated trainer without displaying sessions belonging to other trainers.
2. **Given** an Administrator is logged in, **When** viewing the calendar, **Then** the interface provides a Trainer Filter selector allowing the admin to inspect any specific trainer's schedule.

---

### Edge Cases

- **Double-booking collision (409 Conflict)**: When a trainer or client is already booked for another session at the selected date and time, the interface must capture the conflict response and display an actionable toast message explaining the clash.
- **Contract session exhaustion**: If a contract has 0 remaining sessions, the scheduling dialog must inform the trainer that the contract has reached its capacity and advise purchasing or renewing sessions.
- **Midnight & Week Boundary Crossings**: In Weekly view, week boundary transitions (e.g., Sunday 23:59 transitioning into Monday 00:00 of the next week) must compute `startDate` (Monday) and `endDate` (Sunday) reliably regardless of local client timezones.
- **Month Length Differences & Leap Years**: Monthly views must adapt cleanly between 28, 29, 30, and 31-day months.
- **Rapid Status Transitions**: If a trainer rapidly clicks check-in and completion in quick succession, idempotent UI handling must prevent duplicate server requests.
- **Client Offline / Network Interruption**: If attendance check-in or completion fails due to network outage, an alert with a retry button must appear, preserving user inputs.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide three distinct calendar views: Daily (`DAY`), Weekly (`WEEK`), and Monthly (`MONTH`).
- **FR-002**: In Weekly view, the system MUST structure the week starting on Monday and ending on Sunday.
- **FR-003**: In Monthly view, the system MUST span from the first day to the final day of the selected month.
- **FR-004**: System MUST sort calendar items chronologically in ascending order first by training date, then by start time.
- **FR-005**: System MUST visually distinguish session statuses with standardized badges:
  - `SCHEDULED`: Blue / "Đã lên lịch"
  - `CONFIRMED`: Cyan / "Đã check-in / Đã xác nhận"
  - `COMPLETED`: Green / "Hoàn thành"
  - `NO_SHOW`: Amber-Red / "Vắng mặt"
  - `CANCELLED`: Gray line-through / "Đã hủy"
- **FR-006**: System MUST enable one-click attendance Check-in (`CONFIRMED`), recording server timestamp.
- **FR-007**: System MUST enable session Completion (`COMPLETED`), locking the session from future modifications.
- **FR-008**: System MUST enable marking No-Show (`NO_SHOW`) and Cancellation (`CANCELLED`) with optional reason notes.
- **FR-009**: System MUST allow creating training sessions tied to a client and an `ACTIVE` PT contract.
- **FR-010**: System MUST validate against overlapping schedules and surface clear user guidance when a 409 Conflict occurs.
- **FR-011**: System MUST allow editing session title, date, start time, and notes only while session is in `SCHEDULED` or `CONFIRMED` status.
- **FR-012**: System MUST provide quick actions directly on calendar items (Check-in, Hoàn thành, Báo vắng, Hủy, Sửa).
- **FR-013**: System MUST provide a paginated list view supporting filters by status, client, contract, trainer, and date range.
- **FR-014**: System MUST enforce data isolation so Personal Trainers only view their own calendar and sessions by default.
- **FR-015**: System MUST allow Administrators to filter and view calendars of any trainer in the organization.
- **FR-016**: System MUST provide responsive layout adapting smoothly from mobile screens to desktop widescreen monitors.

---

### Key Entities *(include if feature involves data)*

- **TrainingSession**: Represents an individual workout appointment between a Personal Trainer and a Client, associated with an active contract, having a date, start time, lifecycle status, check-in timestamp, completion timestamp, and notes.
- **TrainingSessionCalendar**: Aggregate calendar response representing a scheduled time interval (Day, Week, Month) with date boundaries and an ordered collection of session items.
- **PTContract**: The commercial agreement governing the training package, tracking total purchased sessions, bonus sessions, used sessions, remaining sessions, and active validity period.
- **ClientProfile**: Student/trainee recipient of the training session, including contact information and current training status.
- **TrainerProfile**: Huấn luyện viên assigned to deliver the session.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trainers can check-in or complete a session in fewer than 2 clicks directly from the calendar interface in under 3 seconds.
- **SC-002**: Schedule switching between Day, Week, and Month views renders calendar data smoothly in under 1 second under normal network conditions.
- **SC-003**: 100% of double-booking attempts are caught and clearly flagged before creating overlapping records.
- **SC-004**: Over 95% of trainers successfully create a new training session on their first attempt without encountering validation ambiguity.
- **SC-005**: All session status changes reflect accurately on the visual calendar immediately without requiring a full page refresh.

---

## Assumptions

- Standard workout duration defaults to 60 minutes per session unless specified otherwise by the trainer in notes.
- Backend handles session count decrement on the associated PT contract when a session transitions to `COMPLETED` or policy-defined attendance.
- Timezone handling is grounded in Vietnam Standard Time (Asia/Ho_Chi_Minh, UTC+7) across all UI date and time inputs.
- Active authentication token contains trainer identification used automatically by backend to filter sessions.
- Clients must already exist in the ZenFit system with at least one active contract to be scheduled for private training.

