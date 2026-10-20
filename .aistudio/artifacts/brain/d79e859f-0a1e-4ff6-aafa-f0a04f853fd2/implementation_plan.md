# DZ-Bridge: Sovereign Knowledge Transfer Portal & Dynamic KPI Management System

A prestigious national gateway and collaboration ecosystem connecting world-class Algerian diaspora scholars with national universities and research institutes, featuring role-dedicated workspaces, an interactive visual KPI builder, and live relational data governance.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed via interactive clarification:
> - **Navigation Architecture**: Seamless top navigation switcher with dedicated role portals (Public Landing, Scholar Workspace, University Portal, Super Admin Console).
> - **Visual Identity**: Prestigious sovereign institutional design with Algerian crimson (`#3B0D2C`), desert gold accents (`#C89B3C`), and crisp slate structural typography.
> - **KPI Management**: A visual KPI builder allowing administrators to define metrics, formulas/targets, categories, and chart types for dynamic consumption by the front-end.

---

## 1. Overview & Core Concept

### What It Does
DZ-Bridge is the sovereign digital infrastructure designed for the Algerian Ministry of Higher Education and Scientific Research (MESRS) and the Algerian Scholar Award. It coordinates knowledge transfer initiatives between high-caliber diaspora researchers across the globe and Algerian academic institutions. 

This update delivers:
1. **Public Sovereign Landing Page (`/landing`)**: A high-impact national showcase featuring strategic mission pillars, diaspora heatmaps, institutional partner highlights, laureate spotlight reels, and self-guided onboarding pathways.
2. **Dedicated Persona Portals**:
   - **Diaspora Scholar & Fellow Workspace**: Profile credentials, visit availability windows to Algeria, bilateral opportunity matching, and signed cooperation protocols.
   - **University & Research Institute Portal**: Strategic doctoral challenge submission, candidate evaluation, logistical support packages, and formal partnership protocol execution.
   - **MESRS Super Admin & Governance Console**: Macro-level system telemetry, custom KPI management engine, configurable API gateway, and audit log verification.
3. **Admin Custom KPI Builder & Management Engine**:
   - Allows administrators to visually construct custom platform KPIs (metric name, unit, formula/target, category, visualization mode: gauge, progress bar, sparkline, or bar counter).
   - Generates dynamic KPI records that the front-end dashboard, university portal, and public landing page render in real time.
4. **Relational Database & Project State Machine Linkage**:
   - Tying project statuses (`draft` → `submitted` → `under_review` → `matched` → `confirmed` → `in_progress` → `completed`) directly to database tables (`projects`, `matches`, `collaborations`, `activity_logs`).

### Target Audience & Personas
- **Algerian Diaspora Scholars & International Laureates**: Seeking high-impact academic missions, doctoral co-supervision, and research commercialization in Algeria.
- **University Rectors & Laboratory Directors**: Seeking top-tier global mentors, specialized curriculum co-design, and international joint publications.
- **MESRS Super Admins**: Requiring sovereign control over data, metrics, API integrations, and legal cooperation agreements.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Public Sovereign Landing Page                        │
│   [Hero Statement] ──► [Impact Metrics] ──► [Capabilities Bento]      │
│   [Diaspora Map]   ──► [Featured Laureates] ──► [Role Call-to-Actions] │
└──────────────────┬─────────────────┬───────────────────┬───────────────┘
                   │                 │                   │
         [Enter Scholar Space]  [Enter University]  [Enter Super Admin]
                   │                 │                   │
                   ▼                 ▼                   ▼
          ┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
          │ Scholar Portal  │ │ University    │ │ MESRS Admin     │
          │ · Profile/CV    │ │ · Challenges  │ │ · KPI Builder   │
          │ · Visit Dates   │ │ · Matchmaking │ │ · API Config    │
          │ · Partnerships  │ │ · Protocols   │ │ · Data Audits   │
          └─────────────────┘ └───────────────┘ └─────────────────┘
```

1. **Visitor Journey (Public Landing)**:
   - Welcomed by an authoritative sovereign hero section establishing the national mandate of the Algerian Scholar Award.
   - Explores verified national impact figures (missions hosted, researchers connected, universities participating).
   - Views an interactive 3-pillar feature breakdown for Scholars, Universities, and Regulators.
   - Selects a specialized persona entry point or registers interest via an accessible onboarding modal.
2. **Administrator Custom KPI Management Flow**:
   - Admin navigates to the *KPI Management Studio* within the Admin Console.
   - Clicks `+ New Custom KPI`, configures target threshold (e.g., `85% Match Acceptance Rate`, `50 Institutional Protocols`), selects visualization style, and saves.
   - The new KPI is instantly stored in the live database schema (`custom_kpis`) and dynamically rendered on the national overview cards.
3. **Bilateral Cooperation Flow**:
   - University posts a strategic research challenge with required skills.
   - Deterministic matchmaking pairs the project with available diaspora scholars.
   - Scholar accepts; status advances through the 8-stage state machine to generate a formal cooperation protocol.

### Visual Identity & Theme
- **Aesthetic Direction**: Prestigious sovereign institutional design — authoritative, uncluttered, and culturally anchored.
- **Color Palette (60-30-10 Rule)**:
  - `60% Neutral Canvas`: Crisp warm off-white (`#FDFCFB`) and deep slate (`#0F172A`) for high contrast and executive clarity.
  - `30% Structural Elements`: Subdued slate borders (`#E2E8F0`), hairline cards, and rich parchment surfaces.
  - `10% Sovereign Accents`: Deep Algerian Crimson (`#3B0D2C`) and Desert Gold (`#C89B3C`) concentrated on primary actions, key highlights, and active tabs.
- **Typography**:
  - *Display / Brand*: `Plus Jakarta Sans` (ExtraBold 800 / SemiBold 600) with tight tracking and balanced measure.
  - *Body / Descriptions*: `Plus Jakarta Sans` (Regular 400 / Medium 500) for scannability.
  - *Data & Metrics*: Monospace tabular numerals (`font-mono tabular-nums`) to prevent layout jitter across data tables and KPI counters.
- **Zero-Pill Discipline**: Metadata, tags, dates, and statuses use unboxed typographic separators (`·` or `/`) instead of colorful capsule pill sandwiches.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Landing Page Integration** | Embedded top-level route/tab view with dedicated navigation bar | Seamless single-page app transitions without breaking dev server state or page reloading | Standalone multi-page HTML build (rejected due to fragmented React state) |
| **Custom KPI Management** | Interactive client/backend visual builder stored in database table `custom_kpis` | Empowers MESRS admins to add, tune, and reorder metrics without touching source code | Hardcoded static metric cards (rejected as inflexible) |
| **State Machine Linkage** | Bidirectional link between project state, matches, and database tables | Ensures that every status change immediately updates the database and audit trail | Disconnected UI state (rejected as non-persistent) |
| **Multilingual Support** | Full Arabic (`ar`), French (`fr`), and English (`en`) dictionary bindings | Official sovereign languages of Algerian academic cooperation with RTL support | English-only (rejected by mandate) |

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DZ-Bridge App Core                            │
│                  (LanguageProvider & Reactive Context)                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌───────────────────┐    ┌───────────────────┐    ┌─────────────────────┐
│  Public Landing   │    │  Role Workspaces  │    │  Database Studio    │
│  · Hero & Mission │    │  · Scholar Portal │    │  · PostgreSQL DDL   │
│  · Impact Numbers │    │  · University Hub │    │  · Relational ERD   │
│  · Bento Features │    │  · Admin Console  │    │  · Custom KPI Table │
│  · Laureate Cards │    │    └─ KPI Builder │    │  · SQL/XLSX Export  │
└───────────────────┘    └───────────────────┘    └─────────────────────┘
         ▲                         ▲                         ▲
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                    ┌──────────────────────────────┐
                    │     In-Memory / Live DB      │
                    │   dataStore: users, projects,│
                    │   matches, custom_kpis, logs │
                    └──────────────────────────────┘
```

### Data Model Enhancements

1. **`custom_kpis` Entity**:
   - `id`: `UUID`
   - `name`: `VARCHAR(100)` (e.g., "Diaspora Doctoral Supervision Rate")
   - `description`: `TEXT`
   - `category`: `ENUM ('National Impact', 'Academic Research', 'Diaspora Outreach', 'Governance')`
   - `target_value`: `VARCHAR(50)` (e.g., "120 Protocols", "95%")
   - `current_value`: `VARCHAR(50)`
   - `status`: `ENUM ('exceeded', 'on_track', 'attention_required')`
   - `visualization_type`: `ENUM ('progress', 'gauge', 'stat_counter', 'sparkline')`
   - `display_on_landing`: `BOOLEAN`
   - `created_at`: `TIMESTAMP WITH TIME ZONE`

2. **Logical Entity Relations**:
   - `users` (Experts/Admins/Institutions) ──1:N──► `projects`
   - `projects` ──1:N──► `matches` ──1:1──► `collaborations`
   - `collaborations` ──1:N──► `activity_logs`
   - `custom_kpis` ──referenced by──► `DashboardOverview` & `LandingPage`

### Interactive Component & State Mapping

| View / Component | Primary User Actions | State Mutations & Side Effects |
| :--- | :--- | :--- |
| **`LandingPage.tsx`** | Click role gateway, view metrics, submit contact | Transitions active view to chosen role portal, fires lead logging |
| **`KpiManagementStudio.tsx`** | Create KPI, update target, toggle landing visibility | Mutates `dataStore.custom_kpis`, triggers immediate dashboard refresh |
| **`ExpertWorkspace.tsx`** | Post visit window, accept match, view documents | Inserts `expert_availabilities`, advances `matches.status` to `accepted` |
| **`OrganizationPortal.tsx`**| Create research project, advance FSM state | Inserts `projects`, updates project state, auto-computes matches |
| **`TopHeader.tsx`** | Switch persona, toggle language (AR/FR/EN) | Updates `activeRole`, toggles RTL layout, triggers instant translation |
