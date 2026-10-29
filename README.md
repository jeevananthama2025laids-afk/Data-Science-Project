# 🚀 ODIE — Organizational Decision Intelligence Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3+-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**ODIE (Organizational Decision Intelligence Engine)** is an enterprise-grade, full-stack Decision Intelligence & Predictive Analytics Platform. It bridges the critical divide between raw business data and executive action by combining machine learning trend forecasting, multi-factor risk modeling, interactive what-if simulation, and an automated strategic decision engine.

---

## 📑 Table of Contents

- [Vision & Business Impact](#-vision--business-impact)
- [Tech Stack & Architecture (What & Why)](#-tech-stack--architecture-what--why)
  - [Backend Stack & Justification](#backend-stack--technical-justification)
  - [Frontend Stack & Technical Justification](#frontend-stack--technical-justification)
  - [Unified Serving Architecture](#unified-serving-architecture)
- [Key Features & Core Modules](#-key-features--core-modules)
  - [1. Executive Telemetry Dashboard](#1-executive-telemetry-dashboard)
  - [2. Business Analytics & Unit Economics](#2-business-analytics--unit-economics)
  - [3. Machine Learning Predictive Engine & Forecasting](#3-machine-learning-predictive-engine--forecasting)
  - [4. Strategic Decision Lifecycle Engine](#4-strategic-decision-lifecycle-engine)
  - [5. Risk Analysis & Exposure Matrix](#5-risk-analysis--exposure-matrix)
  - [6. What-If Scenario Simulator](#6-what-if-scenario-simulator)
  - [7. Executive AI Decision Copilot](#7-executive-ai-decision-copilot)
  - [8. Enterprise Data Management & Synchronization](#8-enterprise-data-management--synchronization)
- [Mathematical & Predictive Modeling](#-mathematical--predictive-modeling)
- [REST API Reference](#-rest-api-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Installation](#-getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [One-Click Launch (Windows)](#option-1-one-click-launch-windows)
  - [Manual Production Launch](#option-2-manual-production-launch)
  - [Development Mode (Hot Reloading)](#option-3-development-mode-hot-reloading)
- [Running Test Suite](#-running-test-suite)
- [License & Authors](#-license--authors)

---

## 🎯 Vision & Business Impact

Traditional Business Intelligence (BI) dashboards show **what happened** (historical reporting). ODIE transforms organizations by answering three fundamental questions:
1. **What is going to happen?** — Continuous linear & trend regression forecasting with **90% confidence bands**.
2. **What are the risks and bottlenecks?** — Automated supply chain depletion detection, margin erosion warnings, and multi-factor vulnerability scoring.
3. **What actions should we take?** — Algorithmic operational protocols with estimated impact, timeline, confidence scores, and lifecycle tracking.

---

## 🏗️ Tech Stack & Architecture (What & Why)

ODIE was built with a modern, high-performance technology stack selected specifically for speed, mathematical rigor, developer velocity, and premium user experience:

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React 19 + Vite                │
│   (Recharts 3.x, Lucide Icons, Glassmorphic CSS)       │
└───────────────────────────┬────────────────────────────┘
                            │ REST JSON & Static SPA Mount
┌───────────────────────────▼────────────────────────────┐
│                  Backend: FastAPI (ASGI)               │
│        (Uvicorn, Pydantic v2, Python-Multipart)        │
└───────────────────────────┬────────────────────────────┘
                            │ Vectorized Compute & ML
┌───────────────────────────▼────────────────────────────┐
│            Data Science & Modeling Layer               │
│      (Scikit-Learn, Pandas, NumPy, Residual SE)        │
└────────────────────────────────────────────────────────┘
```

### Backend Stack & Technical Justification

| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **Python 3.11+ / 3.14** | Core Language | Industry-standard language for data science, statistics, and machine learning, with seamless access to NumPy, Pandas, and Scikit-Learn. |
| **FastAPI** | REST API Framework | Extremely fast (based on Starlette & Pydantic), asynchronous non-blocking I/O, native auto-generation of interactive OpenAPI (Swagger) documentation, and strict type safety. |
| **Uvicorn** | ASGI Web Server | Lightning-fast ASGI web server implementation built on `uvloop` and `httptools`, offering enterprise-grade concurrency and sub-millisecond request routing. |
| **Pandas** | Data Ingestion & Manipulation | High-performance, columnar dataframe operations for rolling averages, period-by-period delta calculations, CSV parsing, and dynamic data cleansing. |
| **NumPy** | Vectorized Math & Array Operations | Low-level C-speed vectorized numerical computations for multi-factor risk indexing, confidence interval standard errors, and trend slope computations. |
| **Scikit-Learn** | Machine Learning Regression | Standard, production-proven linear regression models for horizon forecasting without unnecessary neural network overhead or heavy GPU dependencies. |
| **Pydantic v2** | Data Validation & Schemas | High-speed Rust-powered data parsing and validation, guaranteeing strict payload contracts for records, simulation requests, and decision states. |
| **Python-Multipart** | Streaming File Handling | Robust, secure streaming parsing of user CSV uploads without loading entire files into memory unbuffered. |

### Frontend Stack & Technical Justification

| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **React 19** | UI Library & Component Model | World-class component architecture, instantaneous state reconciliation, modular reusable UI components, and rich ecosystem support. |
| **Vite 8** | Build Tooling & Bundler | Native ES modules provide instant dev server startup, lightning-fast Hot Module Replacement (HMR), and highly optimized production tree-shaking via Rollup. |
| **Recharts 3** | Data Visualization | Declarative SVG-based charting built specifically for React; supports smooth responsive area gradients, tooltips, reference lines, and confidence band rendering. |
| **Lucide React** | Iconography | Lightweight, ultra-crisp SVG icon system maintaining consistent visual hierarchy across all 8 modules without heavy icon font overhead. |
| **Vanilla CSS Design System** | UI Styling & Aesthetics | Built with custom CSS custom properties (variables), modern glassmorphism (`backdrop-filter`), tailored dark mode palettes, and fluid layouts without bloated utility CSS libraries. |

### Unified Serving Architecture

In production, **FastAPI mounts the compiled React distribution directory (`frontend/dist`) directly**. This delivers significant operational advantages:
- **Zero CORS issues**: Frontend and API operate on the same origin (`http://localhost:8000`).
- **Single Process / Single Port**: Only one server needs to be deployed, monitored, and scaled.
- **Graceful SPA Routing**: Non-API routes automatically fall back to `index.html` for client-side routing.

---

## 🌟 Key Features & Core Modules

### 1. Executive Telemetry Dashboard
- **Live KPI Telemetry**: Real-time cards tracking Monthly Revenue, Sales Volume, Net Profit Margin, and Operational Risk Index.
- **Comparative Multi-Metric Charts**: Interactive visual timelines overlaying financial growth against inventory cushions.
- **Early-Warning Flags**: Real-time alerts highlighting active bottlenecks and operational anomalies.

### 2. Business Analytics & Unit Economics
- **Period-by-Period Telemetry**: Tracks month-over-month growth trajectories across all business dimensions.
- **Unit Economics**: Calculates Cost of Goods Sold (COGS), Gross Operating Margin, and Average Value per Customer Account.
- **Operational Velocity**: Monitors inventory turnover ratios and customer cohort dynamics.

### 3. Machine Learning Predictive Engine & Forecasting
- **Linear & Horizon Trend Regression**: Models future trajectory for 3, 4, or 6 months into the future.
- **90% Confidence Intervals**: Displays upper and lower bounds computed via Residual Standard Error (RSE) to capture forecast uncertainty.
- **Projected Growth Metrics**: Computes expected percentage change and directional slope for every key metric.

### 4. Strategic Decision Lifecycle Engine
- **Categorized Strategic Recommendations**: Automatically suggests prioritized actions for Supply Chain, Finance, Operations, and Growth.
- **Lifecycle Management**: Move decisions across **Pending**, **In Progress**, and **Completed** states with persistent storage.
- **Custom Strategic Initiatives**: Executive team can add custom initiatives with priority tags, expected ROI, and timelines.

### 5. Risk Analysis & Exposure Matrix
- **Four-Quadrant Risk Categorization**:
  - Supply Chain Vulnerability (Stockout probability and replenishment pacing)
  - Operational Bottlenecks (Human resource friction & process variance)
  - Profit Margin Squeeze (COGS inflation & vendor price vulnerability)
  - Customer Demand Concentration (Churn risks and account distribution)
- **Mitigation Playbooks**: Concrete, actionable mitigation steps for each identified vulnerability.

### 6. What-If Scenario Simulator
- **Interactive Levers**: Adjust Revenue/Pricing (+/- 25%), Operating Costs (+/- 25%), Inventory (+/- 40%), and Growth/Marketing Spend (+/- 50%).
- **Price Elasticity Modeling**: Simulates sales volume elasticity in response to pricing changes.
- **One-Click Strategy Presets**:
  - *Growth Expansion* (High marketing, scaled inventory)
  - *Cost Optimization* (Tightened OPEX, disciplined purchasing)
  - *Buffer Rebuild* (Restocked inventory, defensive margin posture)
  - *Baseline* (Reset to current state)
- **Viability Index**: Evaluates projected profit delta and risk exposure into a single 0-100 viability score.

### 7. Executive AI Decision Copilot
- **Live Data Querying**: Natural language query drawer allowing executives to ask targeted operational questions (e.g., *"Why is inventory dropping?"*, *"How to reduce risk below 15?"*).
- **Metric Citations**: Transparently cites the underlying dataset columns and mathematical models utilized.
- **Actionable Takeaways**: Generates step-by-step executive directives tailored to current performance.

### 8. Enterprise Data Management & Synchronization
- **Live Editable Table**: Add new periods, edit records inline, or delete historical rows.
- **CSV Import**: Drag-and-drop custom corporate CSV files with schema validation.
- **CSV Export**: Instantly download current business datasets for external audit or presentation.
- **Demo Reset**: Roll back to verified reference baseline with a single click.

---

## 📐 Mathematical & Predictive Modeling

### 1. Trend Forecasting Model
For historical time periods $X = [0, 1, \dots, n-1]$ and target metric $y$:

$$\hat{y} = \beta_0 + \beta_1 X$$

Where parameters $\beta_1$ (slope) and $\beta_0$ (intercept) are solved via ordinary least squares (OLS):

$$\beta_1 = \frac{\sum (X_i - \bar{X})(y_i - \bar{y})}{\sum (X_i - \bar{X})^2}, \quad \beta_0 = \bar{y} - \beta_1 \bar{X}$$

### 2. Residual Standard Error & 90% Confidence Interval
Uncertainty bands are calculated using the Residual Standard Error ($SE$):

$$SE = \sqrt{\frac{\sum_{i=1}^{n} (y_i - \hat{y}_i)^2}{n - 2}}$$

The upper and lower 90% confidence bounds for horizon step $k$ are computed as:

$$\text{Upper Bounds} = \hat{y}_{n+k} + 1.645 \times SE$$
$$\text{Lower Bounds} = \max\left(0, \hat{y}_{n+k} - 1.645 \times SE\right)$$

### 3. Scenario Viability Index Formula
The simulator balances bottom-line financial yield against operational friction:

$$\text{Viability Score} = \text{clamp}_{10}^{100}\left(70 + \left(\frac{\Delta \text{Profit}}{\text{Base Profit}} \times 30\right) - (\Delta \text{Risk} \times 2)\right)$$

---

## 📡 REST API Reference

The backend provides a fully documented REST API. Interactive Swagger documentation is available at **`http://localhost:8000/docs`**.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, service status, and record count |
| `GET` | `/api/business-data` | Retrieves all current business time-series records |
| `POST` | `/api/business-data` | Adds a new monthly business record |
| `PUT` | `/api/business-data/{month}` | Updates an existing monthly record |
| `DELETE` | `/api/business-data/{month}` | Deletes a monthly record |
| `POST` | `/api/business-data/upload` | Ingests and validates a uploaded CSV dataset |
| `POST` | `/api/business-data/reset` | Resets dataset to baseline demo records |
| `GET` | `/api/ai-insights` | Generates heuristic AI telemetry insights |
| `GET` | `/api/predictive-problems`| Detects critical operational bottlenecks and anomalies |
| `GET` | `/api/decisions` | Returns actionable strategic decision cards & custom initiatives |
| `PATCH` | `/api/decisions/{id}/status`| Updates decision status (`Pending`, `In Progress`, `Completed`) |
| `POST` | `/api/decisions/custom` | Creates a new custom strategic decision initiative |
| `GET` | `/api/forecast?periods=4` | Runs Scikit-Learn regression forecast with 90% CI bounds |
| `POST` | `/api/simulate` | Executes What-If scenario simulation on pricing, costs, inventory |
| `GET` | `/api/risk-matrix` | Evaluates multi-factor organizational risk exposure |
| `POST` | `/api/ai/ask` | Queries Executive Decision AI Copilot with natural language |

---

## 📂 Project Directory Structure

```text
ODIE_Project   DS/
├── backend/
│   ├── main.py              # Complete FastAPI Decision Intelligence Engine
│   └── test_api.py          # Pytest verification test suite
├── data/
│   ├── business_data.csv    # Live business time-series dataset
│   └── decisions_state.json # Decision status & custom initiatives store
├── frontend/
│   ├── dist/                # Production build served by FastAPI
│   ├── src/
│   │   ├── OdieApp.jsx      # Main application with all 8 modules & Copilot
│   │   ├── Odie.css         # Glassmorphic enterprise styling system
│   │   ├── main.jsx         # React application bootstrap
│   │   ├── App.jsx          # Root component router
│   │   └── index.css        # Base font typography & CSS resets
│   ├── index.html           # HTML template with metadata & Google Fonts
│   ├── package.json         # React 19, Recharts & Lucide dependencies
│   ├── vite.config.js       # Vite configuration with API proxy
│   └── .gitignore           # Frontend-specific exclusions
├── .gitignore               # Root gitignore (venv, node_modules, cache)
├── requirements.txt         # Python backend dependencies
├── run_odie.bat             # One-click Windows runner
└── README.md                # Comprehensive project documentation
```

---

## 🚀 Getting Started & Installation

### Prerequisites

- **Python 3.11+** installed (check with `python --version`)
- **Node.js 18+** & `npm` (optional, only needed if rebuilding frontend assets)
- **Git** (for version control)

---

### Option 1: One-Click Launch (Windows)

Simply double-click the included batch script:
```text
run_odie.bat
```
This automatically launches the FastAPI server and opens **`http://127.0.0.1:8000`** in your default web browser.

---

### Option 2: Manual Production Launch

1. **Activate your Python environment and install dependencies**:
   ```powershell
   # If using existing venv
   .\venv\Scripts\Activate.ps1

   # Or install dependencies
   pip install -r requirements.txt
   ```

2. **Start the FastAPI Unified Server**:
   ```powershell
   uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```

3. Open your browser to **`http://127.0.0.1:8000`**.

---

### Option 3: Development Mode (Hot Reloading)

For active frontend or backend feature development:

1. **Terminal 1: Start FastAPI with auto-reload**:
   ```powershell
   uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Terminal 2: Start Vite Dev Server**:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

3. Open your browser to **`http://localhost:5173`**. Vite will automatically proxy all `/api/*` network requests to FastAPI on port 8000.

4. **Rebuilding Frontend Production Bundle**:
   ```powershell
   cd frontend
   npm run build
   ```
   This compiles optimized bundles into `frontend/dist`, immediately available to FastAPI.

---

## 🧪 Running Test Suite

Verify that all endpoints, regression models, and scenario simulation calculations pass with `pytest`:

```powershell
pytest backend/test_api.py -v
```

The test suite covers:
- Service health & uptime status
- Historical data retrieval & CSV schema parsing
- Machine learning regression forecasts & confidence bounds
- What-If simulation delta & viability algorithms
- Decision lifecycle updates and custom creation
- Risk matrix computation & AI copilot synthesis

---

## 📄 License & Authors

- **Platform**: ODIE — Organizational Decision Intelligence Engine
- **Developer**: Jeevanantham A ([@jeevananthama2025laids-afk](https://github.com/jeevananthama2025laids-afk))
- **Repository**: [Data-Science-Project](https://github.com/jeevananthama2025laids-afk/Data-Science-Project)
- **License**: MIT License — open for academic, personal, and enterprise deployment.
