# ODIE — Organizational Decision Intelligence Engine

**ODIE** is a full-stack, enterprise-grade Decision Intelligence Platform designed to synthesize organizational data into predictive forecasts, actionable strategic decisions, scenario simulations, and operational risk mitigation protocols.

---

## 🌟 Key Features

1. **Executive Decision Dashboard**
   - Real-time performance telemetry (Monthly Revenue, Dispatched Sales, Operating Margins, Operational Risk Index).
   - High-fidelity interactive area & bar charts comparing financial and supply chain dynamics.
   - Live early-warning flags and decision recommendations board.

2. **Business Analytics & Telemetry**
   - Period-by-period comparative financial curves.
   - Unit economics breakdown (COGS, Net Margins, Value per Account).
   - Operational velocity tracking (Inventory turnover & customer ratios).

3. **Machine Learning Predictions & Horizon Forecasting**
   - Trained regression models forecasting Revenue, Profit, Sales, Inventory, and Risk.
   - Horizon selector (3, 4, 6 months) with **90% confidence intervals** (Upper and Lower bounds).
   - Statistical anomaly and bottleneck detection algorithms.

4. **Strategic Decision Engine**
   - Actionable operational protocols categorized by department (Supply Chain, Finance, Operations, Strategy).
   - Full lifecycle management (**Pending**, **In Progress**, **Completed**).
   - Add custom strategic initiatives with priority tags, expected ROI, and timelines.

5. **Risk Analysis & Multi-Factor Exposure Matrix**
   - Multi-category risk breakdown (Supply Chain Vulnerability, Operational Bottlenecks, Margin Squeeze, Concentration Risk).
   - Risk gauges, progress meters, and dedicated mitigation action protocols.
   - Historical stress curves tracking Operational Risk vs Inventory Cushion.

6. **What-If Scenario Simulator**
   - Interactive levers for Revenue/Pricing (+/- 25%), Operating Costs (+/- 25%), Inventory (+/- 40%), and Growth Spend (+/- 50%).
   - One-click strategy presets: *Growth Expansion*, *Cost Optimization*, *Buffer Rebuild*, and *Baseline*.
   - Instant calculation of simulated profit deltas, margin shift, and overall scenario viability score.

7. **Executive AI Decision Copilot**
   - Interactive AI drawer to query live organizational datasets.
   - Ask complex business questions (e.g., *"Why is inventory dropping?"*, *"How to reduce risk below 15?"*).
   - Returns structured analyses, metric citations, and recommended executive actions.

8. **Enterprise Data Management & Synchronization**
   - Live editable table for business records.
   - Add new period records, update metrics, or delete records.
   - Ingest custom corporate datasets via **CSV Upload**.
   - Download snapshots via **CSV Export**.
   - Instant rollback with **Reset Demo Data**.

---

## 🏗️ Architecture & Technology Stack

- **Backend**: FastAPI (Python 3.14), Pandas, NumPy, Scikit-Learn (Linear & Trend Regression), Pydantic v2, Uvicorn.
- **Frontend**: React 19, Vite, Recharts, Lucide Icons, Vanilla CSS Enterprise Design System.
- **Serving Architecture**: FastAPI mounts the compiled Vite production bundle at `http://localhost:8000/`, providing a unified server for both the frontend web app and the REST API.

---

## 🚀 How to Run the Project

### Option 1: Quick Launch (Production Web App)

The backend server is currently running and serves both the website and API at:
👉 **[http://localhost:8000](http://localhost:8000)**

To start it at any time:
```powershell
.\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Then open your browser to **http://localhost:8000**.

---

### Option 2: Development Mode (Hot Reloading)

1. Start the FastAPI backend:
```powershell
.\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

2. In a second terminal, start the Vite frontend:
```powershell
cd frontend
npm.cmd run dev
```
Then open **http://localhost:5173**. Vite automatically proxies `/api` calls to the FastAPI backend.

---

## 📂 Project Directory Structure

```text
ODIE_Project   DS/
├── backend/
│   ├── main.py              # Complete FastAPI Decision Intelligence Engine
│   └── test_api.py          # Backend test verification suite
├── data/
│   ├── business_data.csv    # Live business dataset
│   └── decisions_state.json # Decision lifecycle & custom initiatives store
├── frontend/
│   ├── dist/                # Production build served by FastAPI
│   ├── src/
│   │   ├── OdieApp.jsx      # Main application with all 8 modules & Copilot
│   │   ├── Odie.css         # Enterprise responsive styling system
│   │   ├── main.jsx         # React application entry point
│   │   └── index.css        # Base typography resets
│   ├── index.html           # HTML template with metadata & fonts
│   ├── package.json         # React 19, Recharts & Lucide dependencies
│   └── vite.config.js       # Vite configuration with API proxy
├── run_odie.bat             # One-click Windows runner
└── README.md                # Project documentation
```
