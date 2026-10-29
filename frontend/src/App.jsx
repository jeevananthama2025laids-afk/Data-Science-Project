import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  BarChart3,
  Brain,
  Database,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Menu,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/business-analytics", label: "Business Analytics", icon: BarChart3 },
  { to: "/predictions", label: "Predictions", icon: TrendingUp },
  { to: "/decision-engine", label: "Decision Engine", icon: Lightbulb },
  { to: "/risk-analysis", label: "Risk Analysis", icon: ShieldAlert },
  { to: "/what-if-simulator", label: "What-If Simulator", icon: Gauge },
  { to: "/data-management", label: "Data Management", icon: Database },
  { to: "/organization", label: "Organization", icon: Users },
];

function AppLayout({ children, title, subtitle = "Enterprise / Overview" }) {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <Brain size={24} />
          </div>
          <div>
            <h2>ODIE</h2>
            <span>Decision Intelligence</span>
          </div>
        </div>

        <nav>
          <div className="nav-title">MAIN</div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>
            AI Engine Online
          </div>
          <p>ODIE v1.0</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="mobile-menu">
              <Menu size={22} />
            </div>
            <p className="breadcrumb">{subtitle}</p>
            <h1>{title}</h1>
          </div>

          <div className="header-right">
            <div className="date-box">
              <span>Last updated</span>
              <strong>Today, 10:30 AM</strong>
            </div>
            <div className="profile">
              <div className="profile-avatar">JD</div>
              <div>
                <strong>Decision Manager</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [predictiveProblems, setPredictiveProblems] = useState([]);
  const [decisions, setDecisions] = useState([]);

  const latestRevenue = businessData.length
    ? Number(businessData[businessData.length - 1].Revenue)
    : 0;
  const revenueGrowth =
    businessData.length > 1
      ? ((latestRevenue - Number(businessData[0].Revenue)) /
          (Number(businessData[0].Revenue) || 1)) *
        100
      : 0;

  const salesData = useMemo(
    () =>
      businessData.map((item) => ({
        month: item.Month,
        sales: item.Revenue,
        profit: item.Profit,
      })),
    [businessData]
  );

  const departmentData = useMemo(
    () => [
      {
        name: "Sales",
        value: Math.round(
          (businessData.reduce((sum, item) => sum + item.Sales, 0) /
            (businessData.length || 1)) /
            100
        ),
      },
      {
        name: "Finance",
        value: Math.round(
          (businessData.reduce((sum, item) => sum + item.Profit, 0) /
            (businessData.length || 1)) /
            3000
        ),
      },
      {
        name: "Inventory",
        value: Math.round(
          (businessData.reduce((sum, item) => sum + item.Inventory, 0) /
            (businessData.length || 1)) /
            10
        ),
      },
      {
        name: "Operations",
        value: Math.round(
          100 -
            businessData.reduce((sum, item) => sum + item.Operational_Risk, 0) /
              (businessData.length || 1)
        ),
      },
    ],
    [businessData]
  );

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/business-data")
      .then((response) => response.json())
      .then((data) => setBusinessData(data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/ai-insights")
      .then((response) => response.json())
      .then((data) => setAiInsights(data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/predictive-problems")
      .then((response) => response.json())
      .then((data) => setPredictiveProblems(data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/decisions")
      .then((response) => response.json())
      .then((data) => setDecisions(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <AppLayout title="Executive Dashboard">
      <section className="welcome-card">
        <div>
          <span className="welcome-label">AI DECISION INTELLIGENCE</span>
          <h2>Good morning, Decision Manager</h2>
          <p>
            ODIE has analyzed your latest enterprise data and identified several
            important business insights.
          </p>
        </div>
        <div className="ai-badge">
          <Brain size={22} />
          AI Analysis Ready
        </div>
      </section>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon revenue">
            <TrendingUp size={21} />
          </div>
          <div className="metric-label">Revenue Total Analysis</div>
          <div className="metric-value">
            ₹{latestRevenue.toLocaleString()}
          </div>
          <div className="metric-change positive">
            {revenueGrowth >= 0 ? "+" : ""}
            {revenueGrowth.toFixed(1)}% vs start period
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon sales">
            <BarChart3 size={21} />
          </div>
          <div className="metric-label">Total Sales</div>
          <div className="metric-value">
            {businessData.reduce((sum, item) => sum + item.Sales, 0).toLocaleString()}
          </div>
          <div className="metric-change positive">+8.4% vs last period</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon profit">
            <Gauge size={21} />
          </div>
          <div className="metric-label">Net Profit</div>
          <div className="metric-value">
            ₹{businessData.reduce((sum, item) => sum + item.Profit, 0).toLocaleString()}
          </div>
          <div className="metric-change positive">+15.2% vs last period</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon risk">
            <ShieldAlert size={21} />
          </div>
          <div className="metric-label">Risk Score</div>
          <div className="metric-value">
            {Math.round(
              businessData.reduce((sum, item) => sum + item.Operational_Risk, 0) /
                (businessData.length || 1)
            )}
            <span>/100</span>
          </div>
          <div className="metric-change neutral">Low business risk</div>
        </div>
      </section>

      <section className="chart-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <h3>Revenue & Profit Trend</h3>
              <p>Monthly enterprise performance</p>
            </div>
            <select>
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
            </select>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="profit" strokeWidth={3} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Department Performance</h3>
              <p>Current performance index</p>
            </div>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Performance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>AI Insights</h3>
              <p>Predictive problem analysis</p>
            </div>
          </div>

          <div className="insight-list">
            {(predictiveProblems.length ? predictiveProblems : aiInsights).slice(0, 3).map((item, index) => (
              <div key={`${item.title}-${index}`} className="insight">
                <div className="insight-icon">
                  {item.severity === "High" ? (
                    <ShieldAlert size={18} />
                  ) : item.severity === "Medium" ? (
                    <Gauge size={18} />
                  ) : (
                    <TrendingUp size={18} />
                  )}
                </div>
                <div>
                  <strong>{item.title || "Loading..."}</strong>
                  <p>{item.description || "Analyzing business data..."}</p>
                  {item.confidence ? (
                    <small className="insight-meta">
                      Confidence {item.confidence}% • {item.impact || "Operational impact"}
                    </small>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel decision-panel">
          <div className="panel-header">
            <div>
              <h3>Decision Center</h3>
              <p>AI-generated recommendations</p>
            </div>
          </div>

          <div className="decision-box">
            <Brain size={25} />
            <div>
              <strong>{decisions.length} decisions require attention</strong>
              <p>
                {decisions.length > 0
                  ? "Review the AI-generated decisions before making operational decisions."
                  : "No immediate decisions require attention."}
              </p>
            </div>
          </div>

          <button className="decision-button" onClick={() => navigate("/decision-engine")}>
            Open Decision Engine
          </button>
        </div>
      </section>
    </AppLayout>
  );
}

function DetailPage({ title, subtitle, children }) {
  return (
    <AppLayout title={title} subtitle={subtitle}>
      <section className="panel detail-page-panel">{children}</section>
    </AppLayout>
  );
}

function BusinessAnalytics() {
  return (
    <DetailPage title="Business Analytics" subtitle="Enterprise / Business Analytics">
      <h3>Revenue and operating performance</h3>
      <p>Monthly revenue, profit, and branch efficiency continue to trend upward with a controlled risk profile.</p>
      <div className="detail-grid">
        <div className="mini-tile"><strong>Revenue</strong><span>₹3.10M</span></div>
        <div className="mini-tile"><strong>Profit</strong><span>₹1.03M</span></div>
        <div className="mini-tile"><strong>Efficiency</strong><span>92%</span></div>
      </div>
    </DetailPage>
  );
}

function Predictions() {
  return (
    <DetailPage title="Predictions" subtitle="Enterprise / Predictions">
      <h3>Forecast outlook</h3>
      <p>Current trend modeling indicates continued revenue acceleration, with projected margin improvements over the next two quarters.</p>
      <div className="detail-grid">
        <div className="mini-tile"><strong>Q3 forecast</strong><span>₹3.4M</span></div>
        <div className="mini-tile"><strong>Growth</strong><span>+14.6%</span></div>
        <div className="mini-tile"><strong>Risk</strong><span>Moderate</span></div>
      </div>
    </DetailPage>
  );
}

function DecisionEngine() {
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/decisions")
      .then((response) => response.json())
      .then((data) => setDecisions(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <DetailPage title="Decision Engine" subtitle="Enterprise / Decision Engine">
      <h3>AI-generated recommendations</h3>
      <div className="decision-list">
        {decisions.length > 0 ? (
          decisions.map((decision, index) => (
            <div key={`${decision.title}-${index}`} className="decision-card">
              <h4>{decision.title}</h4>
              <p>{decision.description}</p>
              <strong>{decision.priority} Priority</strong>
            </div>
          ))
        ) : (
          <div className="decision-card empty">
            <h4>Loading recommendations...</h4>
            <p>Checking the latest operational signals.</p>
          </div>
        )}
      </div>
      <div className="back-link-wrap">
        <Link to="/" className="back-link">Return to dashboard</Link>
      </div>
    </DetailPage>
  );
}

function RiskAnalysis() {
  return (
    <DetailPage title="Risk Analysis" subtitle="Enterprise / Risk Analysis">
      <h3>Operational risk posture</h3>
      <p>Risk is trending down across the current cycle, though inventory volatility remains the most sensitive operating variable.</p>
      <div className="detail-grid">
        <div className="mini-tile"><strong>Current score</strong><span>21/100</span></div>
        <div className="mini-tile"><strong>Trend</strong><span>Improving</span></div>
        <div className="mini-tile"><strong>Watchlist</strong><span>Inventory</span></div>
      </div>
    </DetailPage>
  );
}

function WhatIfSimulator() {
  return (
    <DetailPage title="What-If Simulator" subtitle="Enterprise / What-If Simulator">
      <h3>Scenario planning</h3>
      <p>Model alternative production, pricing, and inventory scenarios to compare projected profit and service outcomes.</p>
      <div className="detail-grid">
        <div className="mini-tile"><strong>Base case</strong><span>₹1.03M</span></div>
        <div className="mini-tile"><strong>Upside</strong><span>₹1.35M</span></div>
        <div className="mini-tile"><strong>Downside</strong><span>₹0.82M</span></div>
      </div>
    </DetailPage>
  );
}

function DataManagement() {
  return (
    <DetailPage title="Data Management" subtitle="Enterprise / Data Management">
      <h3>Operational data health</h3>
      <p>Source accuracy remains strong; most recent inputs are synchronized and validated against the enterprise KPI model.</p>
      <div className="detail-grid">
        <div className="mini-tile"><strong>Records</strong><span>6 months</span></div>
        <div className="mini-tile"><strong>Quality</strong><span>98.4%</span></div>
        <div className="mini-tile"><strong>Sync</strong><span>Live</span></div>
      </div>
    </DetailPage>
  );
}

function Organization() {
  return (
    <DetailPage title="Organization" subtitle="Enterprise / Organization">
      <h3>Decision owner view</h3>
      <p>Leadership alignment remains stable, with sales, operations, and finance coordinated around the current growth plan.</p>
      <div className="detail-grid">
        <div className="mini-tile"><strong>Teams</strong><span>8</span></div>
        <div className="mini-tile"><strong>Leaders</strong><span>3</span></div>
        <div className="mini-tile"><strong>Focus</strong><span>Growth</span></div>
      </div>
    </DetailPage>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/business-analytics" element={<BusinessAnalytics />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/decision-engine" element={<DecisionEngine />} />
        <Route path="/risk-analysis" element={<RiskAnalysis />} />
        <Route path="/what-if-simulator" element={<WhatIfSimulator />} />
        <Route path="/data-management" element={<DataManagement />} />
        <Route path="/organization" element={<Organization />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;