# Research & Technical Decisions: PT Training Session Management & Calendar

**Feature**: `001-pt-training-sessions`  
**Date**: 2026-11-03  
**Status**: Completed  

---

## 1. Calendar Generation & Date Interval Calculations

### Decision
Implement lightweight, zero-dependency date utility helpers (`src/utils/calendarUtils.ts`) natively using JavaScript `Date` API following the ISO-8601 calendar standard (Monday as day 1, Sunday as day 7).

### Rationale
- Spring Boot Backend expects standard `YYYY-MM-DD` query parameters (`date`, `startDate`, `endDate`).
- For `WEEK` view: Week strictly begins on Monday at 00:00:00 and ends on Sunday at 23:59:59. Native calculations:
  ```typescript
  export const getWeekRange = (currentDate: Date) => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { startDate: formatIsoDate(monday), endDate: formatIsoDate(sunday) };
  };
  ```
- For `MONTH` view: First day is `new Date(year, month, 1)` and last day is `new Date(year, month + 1, 0)`.
- Eliminates unnecessary external runtime dependencies (like heavy moment.js or date-fns bundles), keeping client bundle lean and performant.

### Alternatives Considered
- **date-fns / dayjs**: Adds additional package dependencies. While solid, native JavaScript `Date` with standard helpers easily achieves 100% of the required functionality with 0kb bundle overhead.
- **FullCalendar / react-big-calendar**: Heavy library (>150KB gzip) with rigid styles that clash with Zenfit's custom Tailwind design system, dark mode, and Lucide icon badges. Custom grid view gives total control over responsiveness, UX interactions, quick-action popovers, and mobile layouts.

---

## 2. API Communication, Types & Error Handling

### Decision
1. Standardize types in `src/types/session.types.ts` conforming directly to the Spring Boot REST schema.
2. Build service client `src/api/trainingSessionApi.ts` using the project's centralized `axiosClient` (which automatically provides Bearer token authentication and base URL configuration).
3. Handle `409 Conflict` specifically with user-friendly warnings.

### Rationale
- `axiosClient` already handles token injection, interceptors, and error unwrapping.
- Backend returns standard `ApiResponse<T>` with `{ status, code, message, data }`.
- When scheduling collisions occur, HTTP 409 responses carry descriptive backend messages:
  ```typescript
  try {
    await trainingSessionApi.create(payload);
    toast.success('Đã lên lịch tập thành công!');
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } }).response;
      if (res?.status === 409) {
        toast.error(res.data?.message || 'Thời điểm này Huấn luyện viên hoặc học viên đã có lịch tập khác, vui lòng chọn giờ khác!');
        return;
      }
    }
    toast.error('Không thể tạo buổi tập. Vui lòng thử lại.');
  }
  ```

---

## 3. Training Session Lifecycle & State Machine

### Decision
Strictly define allowed state transitions in the UI to prevent illegal state requests:

```
[SCHEDULED] ──┬──> [CONFIRMED] (Check-in) ──┬──> [COMPLETED] (Hoàn thành)
              │                             ├──> [NO_SHOW] (Vắng mặt)
              │                             └──> [CANCELLED] (Hủy)
              ├──> [COMPLETED] (Hoàn thành trực tiếp)
              ├──> [NO_SHOW] (Vắng mặt)
              └──> [CANCELLED] (Hủy buổi)
```

- `COMPLETED`, `CANCELLED`, `NO_SHOW`: **Terminal States**. Action buttons are disabled or hidden; session is read-only.
- `SCHEDULED`, `CONFIRMED`: **Active States**. Editing date, start time, and notes is permitted.

### Rationale
Matches backend lifecycle logic, prevents accidental cancellations of completed sessions, and guarantees historical audit integrity.

---

## 4. UI/UX Structure & Responsive Viewports

### Decision
Create a modular component hierarchy in `src/components/schedule/`:
1. `PtCalendarHeader`: View selector (`DAY`, `WEEK`, `MONTH`), date stepper (`<`, `Hôm nay`, `>`), date range label, quick filter, and `+ Lên lịch tập mới` button.
2. `PtCalendarWeekView`: 7-column grid (Mon-Sun) displaying session cards with start time, client name, workout name, status badge, and action dropdown.
3. `PtCalendarDayView`: Detailed vertical timeline for focused single-day workflow.
4. `PtCalendarMonthView`: 35/42-cell calendar grid displaying session badges and counts per day.
5. `PtSessionTableListView`: Tabular search with pagination and multi-criteria filters for auditing.
6. `CreateSessionModal`: Dynamic client selection $\rightarrow$ filter active contracts $\rightarrow$ date/time pickers $\rightarrow$ conflict validation.
7. `SessionDetailModal`: Complete session inspect/edit modal with direct action buttons (`Điểm danh`, `Hoàn thành`, `Báo vắng`, `Hủy`).

### Rationale
Ensures maximum maintainability, clean separation of concerns, and full responsiveness from mobile screens to widescreen dashboards.

