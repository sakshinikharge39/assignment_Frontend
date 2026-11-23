# Personal Task Planner — Design System & Figma Architecture

> **Author**: UI/UX & Angular Engineering  
> **Brief**: Comzent Technologies UI/UX + Angular Developer Assignment  
> **Figma File Reference**: View-accessible Figma design specifications and design tokens documented below.

---

## 1. Executive Summary & Design Vision

The **Personal Task Planner** is built for professionals and engineering teams who need to swiftly identify high-priority, overdue tasks, advance workflow states without friction, and reliably recover from unexpected network faults without losing work.

The interface adheres to modern design systems (inspired by Linear, Apple HIG, and Tailwind), prioritizing **speed, clarity, accessibility (WCAG AA/AAA)**, and **resilience**.

---

## 2. Desktop vs. Mobile Layouts & Responsive Strategy

### A. Desktop Layout (≥ 1024px)
* **Master-Detail Flow via Slide-over Panel**: When a user selects a task to review, a 480px slide-over drawer animates from the right, keeping the main task grid contextualized and visible in the background.
* **Persistent Top Header**: Brand logo, real-time aggregate metrics pills (`Total`, `Overdue`, `Active`), a dedicated **Simulate Save Failure** toggle switch with animated status badge, and primary action `+ New Task`.
* **Multi-column Filter & Search Bar**: Integrated full-width search input with clear button, horizontal status filter chips with live counter badges, and sort controls (Due Date, Priority, Title, Status + Asc/Desc toggle).
* **Responsive 2–3 Column Grid**: Task cards display priority badges with geometric shape indicators, quick status advancement buttons, overdue warning badges, and quick-action tooltips.

### B. Mobile Layout (< 768px)
* **Thumb-Zone Optimization**: Critical actions are positioned within natural thumb reach. A Floating Action Button (FAB) at the bottom-right allows immediate `+ New Task` creation on mobile.
* **Horizontal Swipeable Filter Carousel**: Filter chips scroll smoothly on the x-axis with compact badge counters and snap alignment.
* **Single Column Full-Width Cards**: Cards expand to 100% viewport width with a minimum tap target of 48px × 48px to prevent accidental taps.
* **Bottom Sheet Drawer**: When reviewing or creating a task on mobile, the modal slides up from the bottom (bottom sheet behavior), feeling native to iOS and Android touch ergonomics.

---

## 3. Two Core Design Decisions

### Decision 1: Inline Error Recovery with Persistent Form State vs. Modal Dismissal
* **Problem**: Traditional task management apps often close modals or clear forms when an API call fails, forcing users to retype lengthy descriptions or losing critical notes.
* **Decision**: We implemented an **Inline Error Alert Banner** that renders directly inside the active form modal. The form retains all user-entered inputs (`title`, `description`, `priority`, `dueDate`, `status`). An inline `🔄 Retry Save` button allows immediate re-attempt once the network is restored.
* **User Benefit**: Zero data loss, high user trust, and friction-free recovery.

### Decision 2: Status Cues Beyond Color (WCAG 1.4.1 Non-Text Contrast & Distinguishability)
* **Problem**: Relying solely on colors (e.g., green for done, red for overdue, yellow for medium) excludes color-blind users and violates accessibility guidelines.
* **Decision**: Every status and priority token incorporates distinct geometric shapes and iconography:
  * **High Priority**: Crimson background + `▲` upward triangle icon + text label.
  * **Medium Priority**: Amber background + `■` solid square icon + text label.
  * **Low Priority**: Slate/Blue background + `▼` downward triangle icon + text label.
  * **Overdue State**: Prominent `⚠️` warning triangle icon with explicit relative time (`Overdue (3d)`).
  * **Workflow Status**:
    * `Todo`: `○` hollow circle.
    * `In Progress`: `◐` half-filled circle.
    * `Done`: `✓` checkmark with text strike-through.

---

## 4. Design System Tokens & Typography

### Typography Scale
* **Font Family**: `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif.
* **Hierarchy**:
  * `Display Title`: 28px (1.85rem), Bold 800, -0.025em tracking.
  * `Section / Card Heading`: 16px (1.05rem), SemiBold 600, -0.01em tracking.
  * `Body Text`: 15px (0.95rem), Regular 400, 1.5 line height.
  * `Badges / Chips / Buttons`: 12px–13px (0.75rem–0.82rem), Bold 700.

### Color Tokens
| Token | HEX / Value | Contrast Ratio | Usage |
| :--- | :--- | :--- | :--- |
| `--color-bg-base` | `#F8FAFC` | Base | App backdrop |
| `--color-bg-surface` | `#FFFFFF` | 15.8:1 against text | Card & modal background |
| `--color-text-main` | `#0F172A` | 15.8:1 | Primary text |
| `--color-text-secondary`| `#475569` | 7.1:1 (AAA) | Subtitles, labels |
| `--color-primary` | `#4F46E5` | 4.6:1 (AA) | Primary buttons, active tabs |
| `--priority-high-bg` | `#FEE2E2` / Text `#991B1B` | 5.8:1 (AA) | High priority badge |
| `--priority-med-bg` | `#FEF3C7` / Text `#92400E` | 4.8:1 (AA) | Medium priority badge |
| `--color-overdue-bg` | `#FEF2F2` / Text `#B91C1C` | 6.2:1 (AA) | Overdue alert badge |
| `--status-done-bg` | `#DCFCE7` / Text `#166534` | 5.2:1 (AA) | Completed task status |

---

## 5. State Matrix & Edge Cases

1. **Loading State**: Shimmer skeleton cards mirroring the exact layout of task cards to prevent layout shift (CLS = 0).
2. **Empty State**: Context-aware illustrations and messages:
   * When `Overdue` filter has 0 tasks: *"No Overdue Tasks! All scheduled deadlines are on track. 🎉"*
   * When `Search` has no results: Shows query term and a 1-click *"View All Tasks"* button.
3. **Validation State**:
   * Whitespace-only title rejection (e.g. `"   "` fails validation).
   * Minimum 3 characters (trimmed).
   * Maximum 120 characters with live character counter (`35 / 120`).
   * Red focus ring with `aria-invalid="true"` and `role="alert"`.
4. **Duplicate-Save Prevention**:
   * Submit button disabled and shows a spinning loader.
   * Internal code guard (`if (this.saving()) return;`) prevents double submission from keyboard shortcuts or rapid clicks.
5. **Failure Simulation & Recovery State**:
   * Header switch triggers simulated network failure (503 Service Unavailable).
   * Modal displays retry banner with data intact.
   * Disabling switch and clicking `Retry` saves the task seamlessly.

---

## 6. Clickable Prototype Walkthrough (Required User Journey)

1. **Step 1: Open Planner**
   * Review aggregate task metrics in the top header.
2. **Step 2: Filter for Overdue Work**
   * Click the `⚠️ Overdue (N)` filter chip or the hero overdue banner.
   * View updates dynamically using Angular Signals; only incomplete tasks with due dates before today are listed.
3. **Step 3: Review a Task**
   * Click on an overdue task card (e.g., *"Review quarterly team sprint deliverables"*).
   * Slide-over detail drawer opens smoothly.
4. **Step 4: Change Priority**
   * Click the `Medium` or `High` priority chip in the detail drawer.
   * Task priority updates instantly and stores into `localStorage`.
5. **Step 5: Start Task**
   * Click the blue action button: `▶ Start Task (Move to In Progress)`.
   * Task transitions from `Todo` to `In Progress`.
6. **Step 6: Create New Task**
   * Click `+ New Task` (top header or mobile FAB).
   * Form modal appears.
7. **Step 7: Simulate Failed Save**
   * Toggle the top bar switch **Simulate Save Failure** to **ON**.
   * Fill out the form: Title *"Refactor data repository"*, Description *"Add retry decorator"*, Priority *"High"*.
   * Click `Create Task`.
   * Save fails with simulated network error. Form remains open, all typed text is preserved, and an alert banner with `Retry Save` appears.
8. **Step 8: Retry and Succeed**
   * Toggle **Simulate Save Failure** to **OFF**.
   * Click `🔄 Retry Save` inside the error banner.
   * Task saves successfully, toast confirmation appears, and task is displayed at the top of the list!
