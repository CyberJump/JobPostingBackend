# Frontend Design System — Kinetic Enterprise

## 1. System Philosophy & Objectives

The **Kinetic Enterprise** design system was conceptualized through Stitch MCP exploration (Project ID: `10351703522126003575`, Asset: `f5cd4dadeb8a4cd38f81b0cc6cb2b07e`). It bridges deep data density and modern visual aesthetics to create a state-of-the-art recruitment platform experience.

---

## 2. Core Token Hierarchy

### 2.1 Color Palette & Surfaces
- **Canvas Base**: `#020617` (`--bg-canvas`) — Ultra-deep slate.
- **Surface Level 1**: `#0f172a` (`--bg-surface`) — Card containers, navbars, sidebars.
- **Surface Level 2**: `#1e293b` (`--bg-surface-elevated`) — Hover states, dropdowns, table headers.
- **Surface Inset**: `#0b1120` (`--bg-surface-inset`) — Filter bars, code blocks, input fills.

### 2.2 Semantic & Accent Colors
- **Primary Brand**: `#3b82f6` (`--primary-500`) / Hover: `#2563eb` (`--primary-600`) — Electric Azure.
- **Analytics & Accent**: `#6366f1` (`--color-indigo`) / `#8b5cf6` (`--color-purple`) — Indigo Violet.
- **Success / Verified**: `#10b981` (`--color-success`) — Emerald Green.
- **Warning / Pending**: `#f59e0b` (`--color-warning`) — Amber Gold.
- **Danger / Blocked / Rejected**: `#ef4444` (`--color-danger`) — Crimson Rose.

### 2.3 Typography & Readability
- **Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Scale**:
  - Display 1: `2.25rem` (36px), Line height: `1.2`, Weight: `800`
  - Heading 1: `1.75rem` (28px), Line height: `1.25`, Weight: `700`
  - Heading 2: `1.35rem` (21.6px), Line height: `1.3`, Weight: `700`
  - Heading 3: `1.1rem` (17.6px), Line height: `1.4`, Weight: `600`
  - Body Base: `0.9375rem` (15px), Line height: `1.5`, Weight: `400`
  - Caption / Micro: `0.8125rem` (13px), Line height: `1.4`, Weight: `500`

---

## 3. UI Component Catalog

### 3.1 Badge (`Badge.jsx`)
Semantic pill indicators with color tokens mapped to backend status enums:
- `ACTIVE`, `VERIFIED`, `OFFER` -> Emerald (`badge-active`, `badge-verified`, `badge-offer`)
- `PENDING`, `APPLIED`, `INTERNSHIP` -> Amber/Blue (`badge-pending`, `badge-applied`, `badge-internship`)
- `SHORTLISTED` -> Indigo (`badge-shortlisted`)
- `REJECTED`, `BLOCKED`, `INACTIVE` -> Rose (`badge-rejected`, `badge-blocked`, `badge-inactive`)
- `STUDENT`, `COMPANY`, `ADMIN` -> Role indicators (`badge-student`, `badge-company`, `badge-admin`)

### 3.2 Button (`Button.jsx`)
- Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`, `warning`.
- States: `loading` (with inline CSS spinner), `disabled`, `fullWidth`.

### 3.3 Timeline (`Timeline.jsx`)
Visual application progress stepper tracking:
- Step 1: `APPLIED`
- Step 2: `SHORTLISTED`
- Step 3: `OFFER` / `REJECTED`

### 3.4 Skeletons (`TableSkeleton.jsx`, `CardSkeleton.jsx`)
Animated pulse placeholders maintaining spatial layout stability during asynchronous data fetching.
