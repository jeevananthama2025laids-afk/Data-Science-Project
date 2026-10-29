import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.main import app, read_business_data, get_ai_insights, get_predictive_problems, get_decisions, get_ml_forecast, run_what_if_simulation, SimulationRequest, get_risk_matrix

print("Reading data:", len(read_business_data()))
print("Insights:", len(get_ai_insights()))
print("Problems:", len(get_predictive_problems()))
print("Decisions:", len(get_decisions()))
print("Forecast:", list(get_ml_forecast(3).keys()))
print("Simulation:", run_what_if_simulation(SimulationRequest(revenue_change_pct=10))["simulation"]["profit"])
print("Risk Matrix:", get_risk_matrix()["rating"])
print("ALL BACKEND TESTS PASSED!")
