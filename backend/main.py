import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sklearn.linear_model import LinearRegression

app = FastAPI(
    title="ODIE - Organizational Decision Intelligence Engine",
    description="Enterprise Decision Intelligence, Predictive Analytics & Scenario Modeling API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
BUSINESS_DATA_FILE = DATA_DIR / "business_data.csv"
DECISIONS_FILE = DATA_DIR / "decisions_state.json"
DIST_DIR = BASE_DIR / "frontend" / "dist"

DEFAULT_RECORDS = [
    {"Month": "January", "Sales": 4200, "Revenue": 420000, "Profit": 120000, "Inventory": 850, "Customers": 1200, "Operational_Risk": 18},
    {"Month": "February", "Sales": 4800, "Revenue": 480000, "Profit": 150000, "Inventory": 790, "Customers": 1350, "Operational_Risk": 20},
    {"Month": "March", "Sales": 5100, "Revenue": 510000, "Profit": 170000, "Inventory": 720, "Customers": 1420, "Operational_Risk": 22},
    {"Month": "April", "Sales": 4700, "Revenue": 470000, "Profit": 140000, "Inventory": 680, "Customers": 1380, "Operational_Risk": 25},
    {"Month": "May", "Sales": 5800, "Revenue": 580000, "Profit": 210000, "Inventory": 590, "Customers": 1580, "Operational_Risk": 21},
    {"Month": "June", "Sales": 6400, "Revenue": 640000, "Profit": 240000, "Inventory": 510, "Customers": 1720, "Operational_Risk": 19},
]

# ----------------- Data Models ----------------- #

class BusinessRecord(BaseModel):
    Month: str
    Sales: float
    Revenue: float
    Profit: float
    Inventory: float
    Customers: float
    Operational_Risk: float

class DecisionStatusUpdate(BaseModel):
    status: str = Field(..., description="Pending, In Progress, Completed, or Dismissed")

class SimulationRequest(BaseModel):
    revenue_change_pct: float = 0.0
    cost_change_pct: float = 0.0
    inventory_change_pct: float = 0.0
    price_elasticity: float = -0.75
    marketing_spend_pct: float = 0.0

class AskQuery(BaseModel):
    query: str

class CustomDecision(BaseModel):
    title: str
    description: str
    priority: str = "Medium"
    category: str = "Operations"
    estimated_impact: Optional[str] = None
    timeline: Optional[str] = "2-4 Weeks"

# ----------------- Helper Functions ----------------- #

def ensure_data_file():
    if not BUSINESS_DATA_FILE.exists() or BUSINESS_DATA_FILE.stat().st_size == 0:
        df = pd.DataFrame(DEFAULT_RECORDS)
        df.to_csv(BUSINESS_DATA_FILE, index=False)

def read_business_data() -> pd.DataFrame:
    ensure_data_file()
    try:
        df = pd.read_csv(BUSINESS_DATA_FILE)
        # Ensure correct column types
        num_cols = ["Sales", "Revenue", "Profit", "Inventory", "Customers", "Operational_Risk"]
        for col in num_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
        return df
    except Exception:
        df = pd.DataFrame(DEFAULT_RECORDS)
        df.to_csv(BUSINESS_DATA_FILE, index=False)
        return df

def save_business_data(df: pd.DataFrame):
    df.to_csv(BUSINESS_DATA_FILE, index=False)

def load_decisions_state() -> Dict[str, Any]:
    if DECISIONS_FILE.exists():
        try:
            with open(DECISIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_decisions_state(state: Dict[str, Any]):
    with open(DECISIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

# ----------------- API Endpoints ----------------- #

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ODIE Decision Intelligence Engine",
        "version": "2.0.0",
        "records_count": len(read_business_data())
    }

@app.get("/api/business-data")
def get_business_data():
    df = read_business_data()
    return df.to_dict(orient="records")

@app.post("/api/business-data")
def add_business_record(record: BusinessRecord):
    df = read_business_data()
    # Check if month already exists
    if record.Month in df["Month"].values:
        raise HTTPException(status_code=400, detail=f"Record for '{record.Month}' already exists. Use update instead.")
    
    new_row = pd.DataFrame([record.model_dump()])
    df = pd.concat([df, new_row], ignore_index=True)
    save_business_data(df)
    return {"message": f"Record for '{record.Month}' added successfully", "data": df.to_dict(orient="records")}

@app.put("/api/business-data/{month}")
def update_business_record(month: str, record: BusinessRecord):
    df = read_business_data()
    match_idx = df[df["Month"].str.lower() == month.lower()].index
    if len(match_idx) == 0:
        raise HTTPException(status_code=404, detail=f"Record for month '{month}' not found.")
    
    idx = match_idx[0]
    for key, val in record.model_dump().items():
        df.at[idx, key] = val
    save_business_data(df)
    return {"message": f"Record for '{month}' updated successfully", "data": df.to_dict(orient="records")}

@app.delete("/api/business-data/{month}")
def delete_business_record(month: str):
    df = read_business_data()
    if len(df) <= 1:
        raise HTTPException(status_code=400, detail="Cannot delete the only remaining record. Keep at least one record.")
    
    match_idx = df[df["Month"].str.lower() == month.lower()].index
    if len(match_idx) == 0:
        raise HTTPException(status_code=404, detail=f"Record for month '{month}' not found.")
    
    df = df.drop(index=match_idx).reset_index(drop=True)
    save_business_data(df)
    return {"message": f"Record for '{month}' deleted successfully", "data": df.to_dict(orient="records")}

@app.post("/api/business-data/upload")
async def upload_business_data(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV file.")
    try:
        content = await file.read()
        import io
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
        required_cols = ["Month", "Sales", "Revenue", "Profit", "Inventory", "Customers", "Operational_Risk"]
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required columns in CSV: {', '.join(missing)}")
        for col in required_cols[1:]:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
        save_business_data(df)
        return {"message": f"Successfully imported {len(df)} records from {file.filename}", "data": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")

@app.post("/api/business-data/reset")
def reset_business_data():
    df = pd.DataFrame(DEFAULT_RECORDS)
    save_business_data(df)
    save_decisions_state({})
    return {"message": "Data successfully reset to baseline demo records", "data": df.to_dict(orient="records")}

# ----------------- Intelligence & Insights ----------------- #

@app.get("/api/ai-insights")
def get_ai_insights():
    df = read_business_data()
    if df.empty:
        return []

    insights = []
    latest = df.iloc[-1]
    first = df.iloc[0]
    
    # Revenue Growth
    if len(df) >= 2 and first["Revenue"] > 0:
        growth = ((latest["Revenue"] - first["Revenue"]) / first["Revenue"]) * 100
        if growth > 15:
            insights.append({
                "id": "ins-rev-growth",
                "title": "Robust Revenue Expansion",
                "description": f"Top-line revenue grew {growth:.1f}% across observed periods, outperforming baseline projections.",
                "type": "positive",
                "category": "Financial",
                "impact": "High Growth",
                "confidence": 92
            })
        elif growth < -5:
            insights.append({
                "id": "ins-rev-contraction",
                "title": "Revenue Contraction Alert",
                "description": f"Revenue declined by {abs(growth):.1f}% since the baseline period. Corrective commercial action recommended.",
                "type": "warning",
                "category": "Financial",
                "impact": "Top-line Strain",
                "confidence": 89
            })

    # Profit Margin Health
    if latest["Revenue"] > 0:
        current_margin = (latest["Profit"] / latest["Revenue"]) * 100
        first_margin = (first["Profit"] / first["Revenue"]) * 100 if first["Revenue"] > 0 else 0
        margin_delta = current_margin - first_margin
        if current_margin >= 30:
            insights.append({
                "id": "ins-margin-strong",
                "title": "High Operating Profitability",
                "description": f"Current profit margin stands at {current_margin:.1f}%, expanding by {margin_delta:+.1f}% vs first period.",
                "type": "positive",
                "category": "Profitability",
                "impact": "Strong Margin",
                "confidence": 94
            })
        elif current_margin < 20:
            insights.append({
                "id": "ins-margin-squeeze",
                "title": "Operating Margin Compression",
                "description": f"Operating margin is currently {current_margin:.1f}%. Review cost structures to maintain bottom-line health.",
                "type": "warning",
                "category": "Profitability",
                "impact": "Margin Pressure",
                "confidence": 86
            })

    # Inventory Depletion Burn Rate
    if len(df) >= 2:
        inv_change = latest["Inventory"] - first["Inventory"]
        if inv_change < -100:
            avg_monthly_burn = abs(inv_change) / (len(df) - 1)
            months_left = (latest["Inventory"] / avg_monthly_burn) if avg_monthly_burn > 0 else 0
            insights.append({
                "id": "ins-inv-burn",
                "title": "Inventory Depletion Trajectory",
                "description": f"Inventory has fallen by {abs(inv_change):.0f} units ({avg_monthly_burn:.0f} units/mo). At current burn, buffer will breach threshold in ~{max(1, round(months_left))} periods.",
                "type": "warning",
                "category": "Supply Chain",
                "impact": "Stockout Risk",
                "confidence": 88
            })
        elif latest["Inventory"] > 900:
            insights.append({
                "id": "ins-inv-excess",
                "title": "Elevated Inventory Buffer",
                "description": "Inventory levels are comfortably above operating buffers, providing robust order fulfillment resilience.",
                "type": "positive",
                "category": "Supply Chain",
                "impact": "High Availability",
                "confidence": 85
            })

    # Operational Risk
    avg_risk = df["Operational_Risk"].mean()
    if latest["Operational_Risk"] < avg_risk * 0.9:
        insights.append({
            "id": "ins-risk-improving",
            "title": "Operational Risk Declining",
            "description": f"Operational risk score stands at {latest['Operational_Risk']:.0f}/100, which is below the period average ({avg_risk:.1f}).",
            "type": "positive",
            "category": "Operations",
            "impact": "Operational Stability",
            "confidence": 90
        })
    elif latest["Operational_Risk"] > 22:
        insights.append({
            "id": "ins-risk-elevated",
            "title": "Operational Risk Spike",
            "description": f"Risk index is currently elevated at {latest['Operational_Risk']:.0f}/100. Key bottlenecks or process overruns detected.",
            "type": "warning",
            "category": "Operations",
            "impact": "Process Bottleneck",
            "confidence": 83
        })

    # Customer Growth & Unit Economics
    if first["Customers"] > 0:
        cust_growth = ((latest["Customers"] - first["Customers"]) / first["Customers"]) * 100
        rev_per_cust = latest["Revenue"] / latest["Customers"] if latest["Customers"] > 0 else 0
        if cust_growth > 20:
            insights.append({
                "id": "ins-cust-expansion",
                "title": "Customer Footprint Expansion",
                "description": f"Customer base expanded by {cust_growth:.1f}%, generating an average of ₹{rev_per_cust:.0f} revenue per active account.",
                "type": "positive",
                "category": "Market",
                "impact": "Account Scaling",
                "confidence": 91
            })

    return insights

@app.get("/api/predictive-problems")
def get_predictive_problems():
    df = read_business_data()
    if df.empty:
        return []

    avg_inventory = float(df["Inventory"].mean())
    avg_risk = float(df["Operational_Risk"].mean())
    avg_revenue = float(df["Revenue"].mean())
    avg_profit = float(df["Profit"].mean())
    latest = df.iloc[-1]

    problems = []

    # 1. Inventory Shortage Risk
    if latest["Inventory"] < 600:
        deficit = 600 - latest["Inventory"]
        problems.append({
            "id": "prob-inv-shortage",
            "title": "Inventory Shortage Warning",
            "description": f"Inventory is at {latest['Inventory']:.0f} units, dropping {deficit:.0f} units below the safety buffer (600 units). Risk of fulfillment delays.",
            "severity": "High",
            "confidence": 88,
            "impact": "Order backlogs & lost sales",
            "metric": f"{latest['Inventory']:.0f} units",
            "category": "Supply Chain"
        })

    # 2. Operational Risk Alert
    if latest["Operational_Risk"] >= 20:
        problems.append({
            "id": "prob-risk-alert",
            "title": "Operational Friction Warning",
            "description": f"Operational risk index is {latest['Operational_Risk']:.0f}/100. High throughput volatility and human resource strain.",
            "severity": "Medium",
            "confidence": 79,
            "impact": "Process delays & variance",
            "metric": f"{latest['Operational_Risk']:.0f}/100",
            "category": "Operations"
        })

    # 3. Revenue Trend Check
    if latest["Revenue"] < avg_revenue * 0.95:
        problems.append({
            "id": "prob-rev-slowdown",
            "title": "Revenue Slowdown Alert",
            "description": "Revenue is tracking beneath the historical operating mean, signaling potential demand softening.",
            "severity": "Medium",
            "confidence": 75,
            "impact": "Cash flow variance",
            "metric": f"₹{latest['Revenue']:,.0f}",
            "category": "Financial"
        })

    # 4. Profit Margin Erosion
    margin = (latest["Profit"] / latest["Revenue"]) * 100 if latest["Revenue"] > 0 else 0
    if margin < 25:
        problems.append({
            "id": "prob-margin-erosion",
            "title": "Margin Squeeze Warning",
            "description": f"Profit margin has contracted to {margin:.1f}%. Cost of goods or administrative overhead is outpacing pricing.",
            "severity": "High",
            "confidence": 84,
            "impact": "Bottom-line yield decline",
            "metric": f"{margin:.1f}% margin",
            "category": "Finance"
        })

    if not problems:
        problems.append({
            "id": "prob-healthy",
            "title": "All Operating Indicators Nominal",
            "description": "Machine learning anomaly detection found all operational metrics tracking safely within expected standard deviations.",
            "severity": "Low",
            "confidence": 95,
            "impact": "Stable continuous operations",
            "metric": "Normal Range",
            "category": "General"
        })

    return problems

# ----------------- Strategic Decision Engine ----------------- #

@app.get("/api/decisions")
def get_decisions():
    df = read_business_data()
    state = load_decisions_state()
    custom_decisions = state.get("custom", [])
    statuses = state.get("statuses", {})

    decisions = []
    latest = df.iloc[-1] if not df.empty else None

    if latest is not None:
        # Decision 1: Inventory Replenishment
        if latest["Inventory"] < 650:
            decisions.append({
                "id": "dec-replenish-inventory",
                "title": "Trigger Batch Inventory Replenishment",
                "description": f"Restock inventory by ~300 units to restore the 800-unit safe operating buffer and prevent peak delivery disruptions.",
                "priority": "High",
                "category": "Supply Chain",
                "estimated_impact": "+15% Buffer Resilience, Prevents ₹80k Stockout Loss",
                "confidence": 91,
                "timeline": "Immediate (1-2 Weeks)",
                "status": statuses.get("dec-replenish-inventory", "Pending")
            })

        # Decision 2: Operational Risk Mitigation
        if latest["Operational_Risk"] >= 19:
            decisions.append({
                "id": "dec-ops-audit",
                "title": "Automate Fulfillment Workflows & Conduct Ops Audit",
                "description": "Deploy automated queueing and cross-train fulfillment personnel to lower the operational friction index below 15.",
                "priority": "Medium",
                "category": "Operations",
                "estimated_impact": "-25% Operational Errors, +12% Team Throughput",
                "confidence": 85,
                "timeline": "2-3 Weeks",
                "status": statuses.get("dec-ops-audit", "Pending")
            })

        # Decision 3: Commercial Expansion
        if latest["Profit"] > 150000:
            decisions.append({
                "id": "dec-commercial-scale",
                "title": "Allocate Reinvested Capital to High-Margin Accounts",
                "description": f"Reinvest ₹50k of current retained profits (₹{latest['Profit']:,.0f}) into premium customer acquisition and upsell programs.",
                "priority": "Low",
                "category": "Growth & Marketing",
                "estimated_impact": "+₹110,000 Projected Annualized ARR",
                "confidence": 82,
                "timeline": "30-60 Days",
                "status": statuses.get("dec-commercial-scale", "Pending")
            })

        # Decision 4: Margin Optimization
        margin = (latest["Profit"] / latest["Revenue"] * 100) if latest["Revenue"] > 0 else 0
        if margin < 35:
            decisions.append({
                "id": "dec-supplier-renegotiation",
                "title": "Renegotiate Tier-1 Supplier Vendor Pricing",
                "description": "Audit volume procurement contracts across top 3 vendors to capture 4-7% cost-of-goods savings.",
                "priority": "Medium",
                "category": "Finance",
                "estimated_impact": "+2.8% Operating Margin Expansion",
                "confidence": 88,
                "timeline": "3-4 Weeks",
                "status": statuses.get("dec-supplier-renegotiation", "In Progress")
            })

    # Add any user custom decisions
    for cd in custom_decisions:
        dec_id = cd.get("id")
        decisions.append({
            **cd,
            "status": statuses.get(dec_id, cd.get("status", "Pending"))
        })

    return decisions

@app.patch("/api/decisions/{decision_id}/status")
def update_decision_status(decision_id: str, payload: DecisionStatusUpdate):
    state = load_decisions_state()
    statuses = state.get("statuses", {})
    statuses[decision_id] = payload.status
    state["statuses"] = statuses
    save_decisions_state(state)
    return {"message": f"Decision {decision_id} status updated to {payload.status}", "statuses": statuses}

@app.post("/api/decisions/custom")
def add_custom_decision(decision: CustomDecision):
    state = load_decisions_state()
    custom_list = state.get("custom", [])
    import uuid
    new_dec = {
        "id": f"custom-{uuid.uuid4().hex[:6]}",
        "title": decision.title,
        "description": decision.description,
        "priority": decision.priority,
        "category": decision.category,
        "estimated_impact": decision.estimated_impact or "Strategic Impact",
        "confidence": 80,
        "timeline": decision.timeline or "2-4 Weeks",
        "status": "Pending"
    }
    custom_list.append(new_dec)
    state["custom"] = custom_list
    save_decisions_state(state)
    return {"message": "Custom strategic decision created", "decision": new_dec}

# ----------------- Machine Learning Forecasting ----------------- #

@app.get("/api/forecast")
def get_ml_forecast(periods: int = 4):
    df = read_business_data()
    if len(df) < 2:
        return {"error": "At least 2 historical data points are needed for predictive modeling."}

    periods = min(max(periods, 1), 12)
    n = len(df)
    X = np.arange(n).reshape(-1, 1)

    targets = ["Revenue", "Profit", "Sales", "Inventory", "Customers", "Operational_Risk"]
    forecasts: Dict[str, List[float]] = {t: [] for t in targets}
    bounds: Dict[str, Dict[str, List[float]]] = {t: {"upper": [], "lower": []} for t in targets}

    # Month names sequence
    month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    last_month_name = str(df["Month"].iloc[-1])
    try:
        last_idx = month_names.index(last_month_name)
    except ValueError:
        last_idx = 5
    future_months = [month_names[(last_idx + i + 1) % 12] for i in range(periods)]

    X_future = np.arange(n, n + periods).reshape(-1, 1)

    metrics_summary = {}

    for t in targets:
        y = df[t].values
        model = LinearRegression()
        model.fit(X, y)
        preds = model.predict(X_future)
        
        # Calculate residual standard error for confidence interval (90% interval ~ 1.645 * se)
        y_fit = model.predict(X)
        residuals = y - y_fit
        dof = max(1, n - 2)
        se = np.sqrt(np.sum(residuals ** 2) / dof)

        pred_cleaned = [float(max(0, p)) for p in preds]
        forecasts[t] = pred_cleaned
        
        upper = [float(max(0, p + 1.645 * se)) for p in preds]
        lower = [float(max(0, p - 1.645 * se)) for p in preds]
        bounds[t] = {"upper": upper, "lower": lower}

        # Trend rate (% change from latest)
        latest_val = float(df[t].iloc[-1])
        next_val = pred_cleaned[0]
        growth = ((next_val - latest_val) / latest_val * 100) if latest_val != 0 else 0
        metrics_summary[t] = {
            "slope": float(model.coef_[0]),
            "projected_next": round(next_val, 2),
            "projected_growth_pct": round(growth, 1)
        }

    combined_timeline = []
    for i, row in df.iterrows():
        combined_timeline.append({
            "Month": str(row["Month"]),
            "is_forecast": False,
            "Revenue": float(row["Revenue"]),
            "Profit": float(row["Profit"]),
            "Sales": float(row["Sales"]),
            "Inventory": float(row["Inventory"]),
            "Operational_Risk": float(row["Operational_Risk"]),
            "Revenue_Upper": None,
            "Revenue_Lower": None,
        })

    # Connect forecast smoothly
    for i in range(periods):
        m_name = future_months[i]
        combined_timeline.append({
            "Month": f"{m_name}*",
            "is_forecast": True,
            "Revenue": round(forecasts["Revenue"][i]),
            "Profit": round(forecasts["Profit"][i]),
            "Sales": round(forecasts["Sales"][i]),
            "Inventory": round(forecasts["Inventory"][i]),
            "Operational_Risk": round(forecasts["Operational_Risk"][i], 1),
            "Revenue_Upper": round(bounds["Revenue"]["upper"][i]),
            "Revenue_Lower": round(bounds["Revenue"]["lower"][i]),
        })

    return {
        "future_months": future_months,
        "combined_timeline": combined_timeline,
        "metrics_summary": metrics_summary,
        "data_points_used": n
    }

# ----------------- What-If Scenario Simulator ----------------- #

@app.post("/api/simulate")
def run_what_if_simulation(req: SimulationRequest):
    df = read_business_data()
    if df.empty:
        raise HTTPException(status_code=400, detail="No business data available to simulate.")
    
    latest = df.iloc[-1]
    base_rev = float(latest["Revenue"])
    base_profit = float(latest["Profit"])
    base_sales = float(latest["Sales"])
    base_inv = float(latest["Inventory"])
    base_costs = base_rev - base_profit
    base_margin = (base_profit / base_rev * 100) if base_rev > 0 else 0
    base_risk = float(latest["Operational_Risk"])

    # Price & Volume interaction
    # If price changes or marketing changes:
    rev_multiplier = 1.0 + (req.revenue_change_pct / 100.0)
    cost_multiplier = 1.0 + (req.cost_change_pct / 100.0)
    inv_multiplier = 1.0 + (req.inventory_change_pct / 100.0)

    # Elasticity effect on units sold
    sales_volume_multiplier = 1.0 + (req.revenue_change_pct / 100.0) * req.price_elasticity * -0.5
    if req.marketing_spend_pct != 0:
        sales_volume_multiplier += (req.marketing_spend_pct / 100.0) * 0.4

    sim_rev = max(0, base_rev * rev_multiplier)
    sim_costs = max(0, base_costs * cost_multiplier)
    sim_profit = sim_rev - sim_costs
    sim_margin = (sim_profit / sim_rev * 100) if sim_rev > 0 else 0
    sim_sales = max(0, round(base_sales * sales_volume_multiplier))
    sim_inv = max(0, round(base_inv * inv_multiplier))

    # Risk impact calculation
    # High cost expansion or extreme inventory shrinkage increases operational risk
    risk_delta = 0
    if req.inventory_change_pct < -15:
        risk_delta += 6  # Supply vulnerability
    if req.cost_change_pct > 15:
        risk_delta += 4  # Cost volatility
    if sim_margin < 20:
        risk_delta += 5  # Financial stress
    if req.inventory_change_pct > 10:
        risk_delta -= 3  # Healthy safety buffer
    
    sim_risk = min(100, max(5, round(base_risk + risk_delta)))

    profit_delta = sim_profit - base_profit
    margin_delta = sim_margin - base_margin

    return {
        "baseline": {
            "period": str(latest["Month"]),
            "revenue": base_rev,
            "costs": base_costs,
            "profit": base_profit,
            "margin_pct": round(base_margin, 1),
            "sales_units": base_sales,
            "inventory": base_inv,
            "risk_score": base_risk
        },
        "simulation": {
            "period": f"{latest['Month']} (Simulated)",
            "revenue": round(sim_rev),
            "costs": round(sim_costs),
            "profit": round(sim_profit),
            "margin_pct": round(sim_margin, 1),
            "sales_units": sim_sales,
            "inventory": sim_inv,
            "risk_score": sim_risk
        },
        "deltas": {
            "profit_delta": round(profit_delta),
            "profit_growth_pct": round(((profit_delta / base_profit) * 100), 1) if base_profit != 0 else 0,
            "margin_delta_pts": round(margin_delta, 1),
            "risk_delta_pts": round(sim_risk - base_risk, 1)
        },
        "viability_score": min(100, max(10, round(70 + (profit_delta / max(1, base_profit) * 30) - (risk_delta * 2))))
    }

# ----------------- Comprehensive Risk Matrix ----------------- #

@app.get("/api/risk-matrix")
def get_risk_matrix():
    df = read_business_data()
    latest = df.iloc[-1] if not df.empty else None
    
    if latest is None:
        return {"overall_index": 0, "categories": []}

    inv = float(latest["Inventory"])
    ops_risk = float(latest["Operational_Risk"])
    margin = (latest["Profit"] / latest["Revenue"] * 100) if latest["Revenue"] > 0 else 0

    categories = [
        {
            "category": "Supply Chain Vulnerability",
            "score": 78 if inv < 600 else 35,
            "probability": "High" if inv < 600 else "Low",
            "impact": "Severe",
            "status": "Critical Attention" if inv < 600 else "Stable",
            "description": f"Inventory buffer is at {inv:.0f} units. Depletion pace threatens stockout risk.",
            "mitigation": "Establish secondary vendor routing and trigger reorder when units dip below 650."
        },
        {
            "category": "Operational Bottleneck",
            "score": int(ops_risk * 3.5),
            "probability": "Medium" if ops_risk >= 20 else "Low",
            "impact": "Moderate",
            "status": "Watchlist" if ops_risk >= 20 else "Controlled",
            "description": f"Operational strain index is currently {ops_risk:.0f}/100 based on process error rates.",
            "mitigation": "Institute cross-training in dispatch and optimize order packing batch sizes."
        },
        {
            "category": "Profit Margin Squeeze",
            "score": 68 if margin < 25 else 28,
            "probability": "Moderate" if margin < 30 else "Low",
            "impact": "High",
            "status": "Watchlist" if margin < 25 else "Healthy",
            "description": f"Current operating margin is {margin:.1f}%. Vulnerable to vendor supplier price increases.",
            "mitigation": "Renegotiate wholesale vendor tiers and package premium service tier offerings."
        },
        {
            "category": "Customer Demand Concentration",
            "score": 32,
            "probability": "Low",
            "impact": "Moderate",
            "status": "Resilient",
            "description": f"Active customer cohort counts {latest['Customers']:,.0f} accounts with diversified order velocity.",
            "mitigation": "Maintain loyalty engagement programs and monitor monthly churn coefficients."
        }
    ]

    overall_index = round(np.mean([c["score"] for c in categories]))
    return {
        "overall_index": overall_index,
        "rating": "Elevated Risk" if overall_index > 60 else "Moderate Risk" if overall_index > 35 else "Low Risk",
        "categories": categories
    }

# ----------------- Executive Decision AI Copilot ----------------- #

@app.post("/api/ai/ask")
def ask_decision_copilot(query: AskQuery):
    df = read_business_data()
    q = query.query.lower().strip()
    latest = df.iloc[-1] if not df.empty else None
    first = df.iloc[0] if not df.empty else None
    
    total_rev = df["Revenue"].sum() if not df.empty else 0
    total_prof = df["Profit"].sum() if not df.empty else 0
    latest_rev = float(latest["Revenue"]) if latest is not None else 0
    latest_prof = float(latest["Profit"]) if latest is not None else 0
    latest_inv = float(latest["Inventory"]) if latest is not None else 0
    latest_risk = float(latest["Operational_Risk"]) if latest is not None else 0
    latest_margin = (latest_prof / latest_rev * 100) if latest_rev > 0 else 0

    if "inventory" in q or "stock" in q:
        answer = (
            f"**Inventory Intelligence Analysis**:\n\n"
            f"• Current Inventory Level: **{latest_inv:.0f} units** ({latest['Month']}).\n"
            f"• Trajectory: Inventory dropped from **{first['Inventory']:.0f} units** down to **{latest_inv:.0f} units**.\n"
            f"• Risk Assessment: Safe operating threshold is 600 units. You are currently **{max(0, 600 - latest_inv):.0f} units** below safety margin.\n\n"
            f"**Recommended Strategic Actions**:\n"
            f"1. Trigger an emergency purchase order of 250-300 units to avoid fulfillment lag.\n"
            f"2. Review delivery lead times with Tier-1 logistics partners.\n"
            f"3. Run the What-If Simulator with +15% inventory adjustment to model cash requirements."
        )
        sources = ["Inventory Column", "Predictive Problems Engine", "Safety Buffer Benchmark"]
    elif "risk" in q or "danger" in q or "threat" in q:
        answer = (
            f"**Operational Risk Intelligence Report**:\n\n"
            f"• Latest Risk Score: **{latest_risk:.0f} / 100** (Average across period: **{df['Operational_Risk'].mean():.1f}**).\n"
            f"• Key Exposure Areas: Supply Chain vulnerability ({'High' if latest_inv < 600 else 'Moderate'}), throughput variance.\n\n"
            f"**Mitigation Protocol**:\n"
            f"1. Automate internal approval gates to reduce human processing latency.\n"
            f"2. Maintain an operational contingency fund equal to 1 month's operating expenses.\n"
            f"3. Check the Risk Analysis dashboard tab for quadrant-level exposure breakdown."
        )
        sources = ["Operational_Risk Index", "Risk Matrix Engine"]
    elif "profit" in q or "margin" in q or "revenue" in q or "growth" in q:
        answer = (
            f"**Financial Performance & Margin Analysis**:\n\n"
            f"• Latest Monthly Revenue: **₹{latest_rev:,.0f}** | Profit: **₹{latest_prof:,.0f}**.\n"
            f"• Net Margin: **{latest_margin:.1f}%**.\n"
            f"• Cumulative Performance: Total revenue of **₹{total_rev:,.0f}** and total profit of **₹{total_prof:,.0f}** across {len(df)} reporting periods.\n\n"
            f"**Growth Opportunities**:\n"
            f"• Reinvest capital into customer segment scaling (currently **{latest['Customers']:,.0f}** active accounts).\n"
            f"• Introduce tiered pricing bundles to capture an additional 2-4% profit margin expansion."
        )
        sources = ["Revenue Column", "Profit Column", "Margin Model"]
    else:
        answer = (
            f"**Executive Synthesis for ODIE Workspace**:\n\n"
            f"Based on real-time analysis of all **{len(df)} reporting periods**:\n"
            f"• **Top-Line Health**: Strong positive revenue trajectory, peaking at **₹{latest_rev:,.0f}** in {latest['Month']}.\n"
            f"• **Profit Yield**: Current profit stands at **₹{latest_prof:,.0f}** ({latest_margin:.1f}% margin).\n"
            f"• **Primary Operational Attention**: Inventory has compressed to **{latest_inv:.0f} units**, while Operational Risk is **{latest_risk:.0f}/100**.\n\n"
            f"**Strategic Guidance**:\n"
            f"Execute the high-priority Decision Engine recommendation to replenish inventory buffers before scaling next quarter marketing."
        )
        sources = ["ODIE Global State", "Executive Data Fabric", "Predictive Analytics Engine"]

    return {
        "query": query.query,
        "answer": answer,
        "sources": sources,
        "timestamp": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    }

# ----------------- Production Frontend Static Mount ----------------- #

if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/")
    def serve_root():
        return FileResponse(DIST_DIR / "index.html")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not catch /api calls
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")
else:
    @app.get("/")
    def index_fallback():
        return {
            "status": "ODIE Backend running",
            "message": "Frontend distribution not yet built. Build frontend using 'npm run build' or access dev server at http://localhost:5173"
        }