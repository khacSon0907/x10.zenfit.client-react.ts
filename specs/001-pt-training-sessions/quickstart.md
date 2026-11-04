# Quickstart Validation Guide: PT Training Sessions & Calendar

**Feature**: `001-pt-training-sessions`  
**Date**: 2026-11-03  
**Status**: Ready for Implementation  

---

## Prerequisites
1. Spring Boot Backend running locally or on staging server with `/api/training-sessions` endpoints active.
2. An authenticated Personal Trainer (PT) account with an active JWT token.
3. At least one Client in the database with an `ACTIVE` PT contract having `remainingSessions > 0`.
4. Client frontend development server running:
   ```bash
   npm run dev
   ```
   Access: `http://localhost:5173/pt/schedule`

---

## Scenario 1: Accessing the PT Calendar in Weekly View
1. Navigate to `/pt/schedule` via the sidebar navigation item **"Lịch tập"**.
2. **Expected Outcome**:
   - The calendar displays the current week (7 columns from Thứ 2 / Monday to Chủ Nhật / Sunday).
   - The header displays the active week's date range (e.g., `03/11/2026 - 09/11/2026`).
   - The view mode toggle highlights **"Tuần"** (`WEEK`).
   - Any scheduled sessions for this week appear inside their corresponding day column, sorted by start time.

---

## Scenario 2: Scheduling a New Training Session
1. Click the **"+ Lên lịch tập mới"** button in the calendar header.
2. Select a Client from the searchable dropdown.
3. Select an `ACTIVE` contract belonging to that client.
4. Input session title: `Tập ngực & tay sau`.
5. Select a future date and time (e.g., Tomorrow at `09:00:00`).
6. Click **"Tạo buổi tập"**.
7. **Expected Outcome**:
   - Success toast appears: *"Tạo buổi tập mới thành công!"*.
   - Modal closes automatically.
   - The newly created session card immediately renders in the calendar under tomorrow's column with the blue **"Đã lên lịch"** (`SCHEDULED`) badge.

---

## Scenario 3: Double-Booking Conflict Validation (409 Conflict)
1. Click **"+ Lên lịch tập mới"** again.
2. Select any client.
3. Select the exact same date and start time used in Scenario 2 (Tomorrow at `09:00:00`).
4. Click **"Tạo buổi tập"**.
5. **Expected Outcome**:
   - The backend returns HTTP `409 Conflict`.
   - Toast warning surfaces clearly: *"Thời điểm này Huấn luyện viên hoặc học viên đã có lịch tập khác, vui lòng chọn giờ khác!"*.
   - The modal remains open so the user can adjust the time slot.

---

## Scenario 4: Attendance Check-In (Check-In $\rightarrow$ CONFIRMED)
1. On the session card from Scenario 2, click the action menu or click to open the **Session Detail Modal**.
2. Click **"Điểm danh"** (Check-in).
3. **Expected Outcome**:
   - Status badge transitions to cyan **"Đã check-in / Đã xác nhận"** (`CONFIRMED`).
   - Server timestamp for `checkInAt` is displayed.

---

## Scenario 5: Workout Completion (Complete $\rightarrow$ COMPLETED)
1. In the session actions, click **"Hoàn thành buổi tập"**.
2. **Expected Outcome**:
   - Status badge transitions to green **"Hoàn thành"** (`COMPLETED`).
   - Server timestamp for `completedAt` is recorded.
   - Action buttons to edit, reschedule, or cancel are locked/disabled.

---

## Scenario 6: Switching Calendar Views (Day, Week, Month)
1. Click the view switcher button **"Ngày"** (`DAY`):
   - **Expected Outcome**: Calendar switches to single-day vertical timeline mode displaying all sessions for the selected day.
2. Click the view switcher button **"Tháng"** (`MONTH`):
   - **Expected Outcome**: Calendar switches to monthly grid mode showing day boxes with summary badges and session counts.
3. Click **"Hôm nay"**:
   - **Expected Outcome**: Calendar focuses back on the current real-world date.

---

## Scenario 7: Tabular List View & Advanced Filtering
1. Toggle the display mode to **"Dạng bảng"** (List/Table view).
2. Filter by status: `COMPLETED`.
3. Select a date range.
4. **Expected Outcome**:
   - Table updates with paginated results showing only matching completed sessions.
   - Pagination controls allow advancing to next/previous pages.

