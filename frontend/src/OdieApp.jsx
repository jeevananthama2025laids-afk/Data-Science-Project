import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  Database,
  Download,
  Edit2,
  Gauge,
  HelpCircle,
  History,
  Info,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MessageSquare,
  Minus,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
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
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./Odie.css";

const API_URL = import.meta.env.VITE_API_URL || "";
const DataContext = createContext(null);

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/business-analytics", label: "Business Analytics", icon: BarChart3 },
  { to: "/predictions", label: "Predictions & ML", icon: TrendingUp },
  { to: "/decision-engine", label: "Decision Engine", icon: Lightbulb },
  { to: "/risk-analysis", label: "Risk Analysis", icon: ShieldAlert },
  { to: "/what-if-simulator", label: "What-If Simulator", icon: Gauge },
  { to: "/data-management", label: "Data Management", icon: Database },
  { to: "/organization", label: "Organization", icon: Users },
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("en-IN");

// ----------------- Data Provider ----------------- //

function DataProvider({ children }) {
  const [businessData, setBusinessData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [predictiveProblems, setPredictiveProblems] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [riskMatrixData, setRiskMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [toast, setToast] = useState(null);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.id === Date.now() ? null : prev));
    }, 4000);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dataRes, insRes, probRes, decRes, foreRes, riskRes] =
        await Promise.all([
          fetch(`${API_URL}/api/business-data`),
          fetch(`${API_URL}/api/ai-insights`),
          fetch(`${API_URL}/api/predictive-problems`),
          fetch(`${API_URL}/api/decisions`),
          fetch(`${API_URL}/api/forecast?periods=4`),
          fetch(`${API_URL}/api/risk-matrix`),
        ]);

      if (!dataRes.ok) throw new Error(`Data service error: ${dataRes.status}`);

      const [bData, aIns, pProb, decs, fore, rMat] = await Promise.all([
        dataRes.json(),
        insRes.ok ? insRes.json() : [],
        probRes.ok ? probRes.json() : [],
        decRes.ok ? decRes.json() : [],
        foreRes.ok ? foreRes.json() : null,
        riskRes.ok ? riskRes.json() : null,
      ]);

      setBusinessData(bData);
      setAiInsights(aIns);
      setPredictiveProblems(pProb);
      setDecisions(decs);
      setForecastData(fore);
      setRiskMatrixData(rMat);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not connect to ODIE API.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRecord = async (newRecord) => {
    try {
      const res = await fetch(`${API_URL}/api/business-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to add record");
      }
      showToast(`Record for ${newRecord.Month} added successfully!`);
      await refresh();
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  const updateRecord = async (month, updatedRecord) => {
    try {
      const res = await fetch(`${API_URL}/api/business-data/${encodeURIComponent(month)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecord),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update record");
      }
      showToast(`Record for ${month} updated successfully!`);
      await refresh();
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  const deleteRecord = async (month) => {
    try {
      const res = await fetch(`${API_URL}/api/business-data/${encodeURIComponent(month)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete record");
      }
      showToast(`Record for ${month} deleted!`);
      await refresh();
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  const resetData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/business-data/reset`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reset dataset");
      showToast("Dataset restored to default demo records.");
      await refresh();
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  const uploadCsv = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/api/business-data/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "CSV upload failed");
      }
      const data = await res.json();
      showToast(data.message || "CSV imported successfully!");
      await refresh();
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  const updateDecisionStatus = async (decisionId, status) => {
    try {
      const res = await fetch(`${API_URL}/api/decisions/${encodeURIComponent(decisionId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setDecisions((prev) =>
        prev.map((d) => (d.id === decisionId ? { ...d, status } : d)),
      );
      showToast(`Decision marked as ${status}`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const addCustomDecision = async (newDecision) => {
    try {
      const res = await fetch(`${API_URL}/api/decisions/custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDecision),
      });
      if (!res.ok) throw new Error("Failed to add custom decision");
      showToast("Strategic decision created!");
      await refresh();
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  const contextValue = useMemo(
    () => ({
      businessData,
      aiInsights,
      predictiveProblems,
      decisions,
      forecastData,
      riskMatrixData,
      loading,
      error,
      updatedAt,
      toast,
      showToast,
      copilotOpen,
      setCopilotOpen,
      refresh,
      addRecord,
      updateRecord,
      deleteRecord,
      resetData,
      uploadCsv,
      updateDecisionStatus,
      addCustomDecision,
    }),
    [
      businessData,
      aiInsights,
      predictiveProblems,
      decisions,
      forecastData,
      riskMatrixData,
      loading,
      error,
      updatedAt,
      toast,
      showToast,
      copilotOpen,
      refresh,
    ],
  );

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

function useOdieData() {
  return useContext(DataContext);
}

// ----------------- Layout Components ----------------- //

function AppLayout({ title, subtitle, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { error, loading, refresh, updatedAt, toast, setCopilotOpen } =
    useOdieData();
  const updatedLabel = updatedAt
    ? updatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "Waiting for data";

  return (
    <div className="app-shell">
      {toast && (
        <div className={`floating-toast ${toast.type}`}>
          {toast.type === "error" ? (
            <AlertTriangle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {menuOpen && (
        <button
          aria-label="Close navigation"
          className="mobile-scrim"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark">
            <Brain size={22} strokeWidth={2.4} />
          </div>
          <div className="brand-copy">
            <strong>ODIE</strong>
            <span>Decision Intelligence</span>
          </div>
          <button
            className="icon-button mobile-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="nav-caption">WORKSPACE NAVIGATION</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={17} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-copilot-banner">
          <div className="copilot-badge">
            <Sparkles size={14} /> AI Copilot Ready
          </div>
          <p>Ask tactical questions against current business data.</p>
          <button
            className="copilot-btn"
            onClick={() => setCopilotOpen(true)}
          >
            <Bot size={15} /> Launch Copilot
          </button>
        </div>

        <div className="sidebar-footer">
          <span className="online-indicator" />
          <span>Decision Engine</span>
          <strong>Active v2.0</strong>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="heading-group">
            <button
              className="icon-button mobile-trigger"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">{subtitle}</div>
            <h1>{title}</h1>
          </div>

          <div className="topbar-actions">
            <button
              className="copilot-top-trigger"
              onClick={() => setCopilotOpen(true)}
              title="Open AI Decision Assistant"
            >
              <Sparkles size={15} />
              <span>Ask ODIE AI</span>
            </button>

            <div className="sync-status">
              <span className={`sync-dot${loading ? " syncing" : ""}`} />
              <span>{loading ? "Updating..." : `Synced ${updatedLabel}`}</span>
            </div>

            <button
              className="icon-button refresh-button"
              aria-label="Refresh data"
              title="Refresh data"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw size={16} />
            </button>

            <div className="user-chip">
              <span className="user-avatar">DM</span>
              <span className="user-label">
                <strong>Decision Manager</strong>
                <small>Enterprise Admin</small>
              </span>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            <div className="error-copy">
              <AlertTriangle size={16} />
              <span>{error} Ensure the ODIE FastAPI backend is active.</span>
            </div>
            <button onClick={refresh}>Retry</button>
          </div>
        )}

        {children}
      </main>

      <ExecutiveCopilotDrawer />
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action && <div className="heading-action-wrap">{action}</div>}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  trend,
  tone = "teal",
}) {
  return (
    <article className="metric-card">
      <div className="metric-card-top">
        <div className={`metric-symbol ${tone}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <span
            className={`metric-trend ${trend.positive ? "up" : trend.neutral ? "neutral" : "down"}`}
          >
            {trend.positive ? (
              <ArrowUpRight size={13} />
            ) : trend.neutral ? (
              <Minus size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {trend.label}
          </span>
        )}
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </article>
  );
}

function EmptyState({ title, message, loading }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        {loading ? <RefreshCw className="spin" size={20} /> : <Check size={20} />}
      </span>
      <strong>{loading ? "Crunching intelligence..." : title}</strong>
      <p>{loading ? "Connecting to your live dataset." : message}</p>
    </div>
  );
}

// ----------------- AI Decision Copilot Drawer ----------------- //

function ExecutiveCopilotDrawer() {
  const { copilotOpen, setCopilotOpen } = useOdieData();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am **ODIE Intelligence Copilot**. I analyze your live business data, predictive anomalies, and risk indices to provide actionable strategic guidance.\n\nAsk any question or pick a suggested query below.",
      sources: ["Live Engine"],
    },
  ]);
  const [asking, setAsking] = useState(false);

  const presets = [
    "Why is inventory dropping?",
    "How to reduce risk below 15?",
    "What is our profit margin trajectory?",
    "What are our highest priority decisions?",
  ];

  const handleAsk = async (textToSend) => {
    const q = (textToSend || query).trim();
    if (!q || asking) return;

    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    setQuery("");
    setAsking(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error("Copilot response error");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I encountered an error querying the intelligence engine. Please ensure the backend is running.",
          sources: ["Error Handler"],
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  if (!copilotOpen) return null;

  return (
    <div className="copilot-drawer-backdrop" onClick={() => setCopilotOpen(false)}>
      <div
        className="copilot-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="copilot-header">
          <div className="copilot-title-group">
            <div className="copilot-avatar">
              <Sparkles size={17} />
            </div>
            <div>
              <h3>ODIE Intelligence Copilot</h3>
              <span>Enterprise Decision Assistant</span>
            </div>
          </div>
          <button
            className="icon-button"
            aria-label="Close Copilot"
            onClick={() => setCopilotOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="copilot-presets">
          {presets.map((p, idx) => (
            <button
              key={idx}
              className="preset-pill"
              onClick={() => handleAsk(p)}
              disabled={asking}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="copilot-chat-feed">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`copilot-msg ${m.sender === "user" ? "user-msg" : "bot-msg"}`}
            >
              <div className="msg-content">
                {m.text.split("\n").map((line, i) => {
                  if (line.startsWith("• ")) {
                    return (
                      <p key={i} className="bullet-line">
                        {renderBoldText(line)}
                      </p>
                    );
                  }
                  if (line.match(/^\d+\.\s/)) {
                    return (
                      <p key={i} className="num-line">
                        {renderBoldText(line)}
                      </p>
                    );
                  }
                  return <p key={i}>{renderBoldText(line)}</p>;
                })}
              </div>
              {m.sources && (
                <div className="msg-sources">
                  <span>Sources:</span>
                  {m.sources.map((s, sIdx) => (
                    <span key={sIdx} className="source-tag">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {asking && (
            <div className="copilot-msg bot-msg">
              <div className="msg-content thinking">
                <Sparkles className="spin" size={15} />
                <span>Synthesizing decision intelligence...</span>
              </div>
            </div>
          )}
        </div>

        <form
          className="copilot-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about margins, inventory buffers, risks..."
            disabled={asking}
          />
          <button
            type="submit"
            className="copilot-send-btn"
            disabled={asking || !query.trim()}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

function renderBoldText(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ----------------- 1. Executive Dashboard ----------------- //

function Dashboard() {
  const {
    businessData,
    aiInsights,
    predictiveProblems,
    decisions,
    loading,
    setCopilotOpen,
  } = useOdieData();
  const [period, setPeriod] = useState("all");
  const navigate = useNavigate();

  const latest = businessData.at(-1);
  const first = businessData[0];
  const totalSales = businessData.reduce((sum, row) => sum + row.Sales, 0);
  const totalProfit = businessData.reduce((sum, row) => sum + row.Profit, 0);
  const growth =
    first && latest
      ? ((latest.Revenue - first.Revenue) / first.Revenue) * 100
      : 0;
  const riskAverage = businessData.length
    ? businessData.reduce((sum, row) => sum + row.Operational_Risk, 0) /
      businessData.length
    : 0;

  const chartData =
    period === "all" ? businessData : businessData.slice(-Number(period));
  const signals = predictiveProblems.length
    ? predictiveProblems
    : aiInsights;

  return (
    <AppLayout title="Executive Decision Dashboard" subtitle="Workspace / Overview">
      <section className="welcome-band">
        <div className="welcome-copy">
          <span className="welcome-overline">
            <span className="welcome-pulse" /> ORGANIZATIONAL DECISION INTELLIGENCE
          </span>
          <h2>
            {latest
              ? `Operational Pulse: ${latest.Month} Status Report`
              : "Connecting to Organizational Data"}
          </h2>
          <p>
            Real-time decision telemetry synthesizing {businessData.length}{" "}
            reporting periods across commercial, supply, and risk indicators.
          </p>
        </div>
        <div className="welcome-period">
          <span>REPORTING CYCLE</span>
          <strong>
            {first && latest
              ? `${first.Month} – ${latest.Month}`
              : "Dataset Syncing"}
          </strong>
          <button
            className="welcome-action-btn"
            onClick={() => setCopilotOpen(true)}
          >
            <Sparkles size={14} /> Audit with AI
          </button>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Business metrics">
        <MetricCard
          label="Latest Monthly Revenue"
          value={latest ? currency.format(latest.Revenue) : "—"}
          detail={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}% since baseline period`}
          icon={TrendingUp}
          trend={{ label: `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`, positive: growth >= 0 }}
          tone="teal"
        />
        <MetricCard
          label="Cumulative Sales Volume"
          value={number.format(totalSales)}
          detail={`${businessData.length} active reporting cycles`}
          icon={BarChart3}
          trend={{ label: `${latest?.Sales || 0} latest units`, neutral: true }}
          tone="green"
        />
        <MetricCard
          label="Retained Operating Profit"
          value={currency.format(totalProfit)}
          detail={
            latest
              ? `${((latest.Profit / latest.Revenue) * 100).toFixed(1)}% current operating margin`
              : "No records"
          }
          icon={Gauge}
          trend={{
            label: latest ? `${((latest.Profit / latest.Revenue) * 100).toFixed(0)}% margin` : "0%",
            positive: (latest?.Profit / latest?.Revenue) > 0.25,
          }}
          tone="gold"
        />
        <MetricCard
          label="Operational Risk Index"
          value={`${riskAverage.toFixed(0)} / 100`}
          detail={
            riskAverage < 20
              ? "Healthy operational baseline"
              : "Review risk mitigation queue"
          }
          icon={ShieldAlert}
          trend={{
            label: `${latest?.Operational_Risk || 0} / 100 current`,
            positive: (latest?.Operational_Risk || 0) <= riskAverage,
          }}
          tone="coral"
        />
      </section>

      <section className="chart-grid">
        <article className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">FINANCIAL TRAJECTORY</span>
              <h3>Revenue and Operating Profit</h3>
              <p>Monthly trends with margin expansion</p>
            </div>
            <label className="select-wrap">
              <span className="sr-only">Chart period</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option value="all">All periods</option>
                <option value="3">Last 3 periods</option>
                <option value="6">Last 6 periods</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
          {businessData.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height={290}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#147d70" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#147d70" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d89b3d" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#d89b3d" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e9eeeb" />
                  <XAxis
                    dataKey="Month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#89928e", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#89928e", fontSize: 11 }}
                    tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                    width={44}
                  />
                  <Tooltip
                    formatter={(value) => currency.format(value)}
                    contentStyle={{
                      border: "1px solid #e1e8e4",
                      borderRadius: 6,
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Revenue"
                    stroke="#147d70"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Profit"
                    stroke="#d89b3d"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorProf)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No records found"
              message="Import business data to activate analytics."
              loading={loading}
            />
          )}
        </article>

        <article className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">SUPPLY &amp; CUSTOMER DYNAMICS</span>
              <h3>Inventory Buffer vs Customers</h3>
              <p>Operational fulfillment capacity check</p>
            </div>
          </div>
          {businessData.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height={290}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 0, left: -14, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#e9eeeb" />
                  <XAxis
                    dataKey="Month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#89928e", fontSize: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#89928e", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #e1e8e4",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                  />
                  <Bar
                    dataKey="Inventory"
                    fill="#147d70"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                  />
                  <Bar
                    dataKey="Customers"
                    fill="#d89b3d"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No records"
              message="Operating metrics appear when data is loaded."
              loading={loading}
            />
          )}
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel list-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">EARLY WARNING &amp; SIGNALS</span>
              <h3>Predictive Intelligence Flags</h3>
              <p>Automated anomaly checks across current performance</p>
            </div>
            <NavLink className="text-link" to="/predictions">
              Forecast models <span aria-hidden="true">→</span>
            </NavLink>
          </div>
          {signals.length ? (
            <div className="signal-list">
              {signals.slice(0, 4).map((item, index) => (
                <div className="signal-row" key={`${item.title}-${index}`}>
                  <span
                    className={`signal-icon ${
                      item.severity === "High" || item.type === "warning"
                        ? "attention"
                        : ""
                    }`}
                  >
                    {item.severity === "High" || item.type === "warning" ? (
                      <ShieldAlert size={17} />
                    ) : (
                      <TrendingUp size={17} />
                    )}
                  </span>
                  <div className="signal-copy">
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                  <span
                    className={`signal-tag ${
                      item.severity === "High" || item.type === "warning"
                        ? "tag-alert"
                        : "tag-normal"
                    }`}
                  >
                    {item.severity ||
                      (item.type === "warning" ? "Watch" : "Positive")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="All systems nominal"
              message="No operational anomalies detected."
              loading={loading}
            />
          )}
        </article>

        <article className="panel decision-summary">
          <span className="panel-kicker">STRATEGIC BOARD</span>
          <div className="decision-count">
            <span className="decision-count-number">{decisions.length}</span>
            <span>
              Actionable
              <br />
              Recommendations
            </span>
          </div>
          <p>
            The Decision Intelligence Engine has generated operational
            protocols to protect margins and replenish inventory.
          </p>
          <div className="decision-summary-btns">
            <button
              className="primary-button"
              onClick={() => navigate("/decision-engine")}
            >
              Open Decision Engine <span aria-hidden="true">→</span>
            </button>
            <button
              className="secondary-dark-button"
              onClick={() => navigate("/what-if-simulator")}
            >
              Simulate Scenarios
            </button>
          </div>
        </article>
      </section>
    </AppLayout>
  );
}

// ----------------- 2. Business Analytics Page ----------------- //

function BusinessAnalytics() {
  const { businessData, loading } = useOdieData();
  const revenue = businessData.reduce((sum, row) => sum + row.Revenue, 0);
  const profit = businessData.reduce((sum, row) => sum + row.Profit, 0);
  const sales = businessData.reduce((sum, row) => sum + row.Sales, 0);
  const customers = businessData.reduce((sum, row) => sum + row.Customers, 0);
  const latest = businessData.at(-1);

  const avgRevPerCustomer = customers > 0 ? revenue / customers : 0;
  const overallMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <AppLayout
      title="Business Analytics & Telemetry"
      subtitle="Workspace / Analytics"
    >
      <PageHeading
        eyebrow="FINANCIAL & COMMERCIAL TELEMETRY"
        title="Comprehensive Performance Breakdown"
        description="Audit sales volume throughput, margin yield, and cohort economics across all observed operational periods."
      />

      <section className="metrics-grid">
        <MetricCard
          label="Cumulative Revenue"
          value={currency.format(revenue)}
          detail="Aggregate across all periods"
          icon={TrendingUp}
        />
        <MetricCard
          label="Total Units Dispatched"
          value={number.format(sales)}
          detail="Cumulative sales units"
          icon={BarChart3}
          tone="green"
        />
        <MetricCard
          label="Blended Operating Margin"
          value={`${overallMargin.toFixed(1)}%`}
          detail={
            latest
              ? `${((latest.Profit / latest.Revenue) * 100).toFixed(1)}% in ${latest.Month}`
              : "—"
          }
          icon={Gauge}
          tone="gold"
        />
        <MetricCard
          label="Avg Value / Account"
          value={currency.format(avgRevPerCustomer)}
          detail={`${number.format(customers)} customer-periods`}
          icon={Users}
          tone="coral"
        />
      </section>

      <article className="panel chart-panel full-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">MONTHLY PERFORMANCE CURVES</span>
            <h3>Revenue, Operating Profit, and Sales Volume</h3>
            <p>Direct period-by-period comparative trajectory</p>
          </div>
        </div>
        {businessData.length ? (
          <div className="chart">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart
                data={businessData}
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e9eeeb" />
                <XAxis
                  dataKey="Month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                  width={44}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                  width={44}
                />
                <Tooltip
                  formatter={(val, name) =>
                    name === "Sales Volume"
                      ? `${number.format(val)} units`
                      : currency.format(val)
                  }
                  contentStyle={{
                    border: "1px solid #e1e8e4",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Revenue"
                  name="Revenue"
                  stroke="#147d70"
                  strokeWidth={2.6}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Profit"
                  name="Operating Profit"
                  stroke="#d89b3d"
                  strokeWidth={2.6}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Sales"
                  name="Sales Volume"
                  stroke="#4f7290"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="No records"
            message="Analytics require historical business data."
            loading={loading}
          />
        )}
      </article>

      <section className="analytics-split-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">UNIT ECONOMICS</span>
              <h3>Period Margins &amp; Efficiency</h3>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Costs</th>
                  <th>Profit</th>
                  <th>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {businessData.map((row, idx) => {
                  const costs = row.Revenue - row.Profit;
                  const marginPct =
                    row.Revenue > 0 ? (row.Profit / row.Revenue) * 100 : 0;
                  return (
                    <tr key={idx}>
                      <td>
                        <strong>{row.Month}</strong>
                      </td>
                      <td>{currency.format(row.Revenue)}</td>
                      <td>{currency.format(costs)}</td>
                      <td>{currency.format(row.Profit)}</td>
                      <td>
                        <span
                          className={`badge ${marginPct >= 30 ? "badge-success" : "badge-warning"}`}
                        >
                          {marginPct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">OPERATIONAL VELOCITY</span>
              <h3>Inventory Turnover &amp; Customer Ratio</h3>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Inventory</th>
                  <th>Customers</th>
                  <th>Units / Cust</th>
                  <th>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {businessData.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{row.Month}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${row.Inventory < 600 ? "badge-danger" : "badge-success"}`}
                      >
                        {number.format(row.Inventory)} units
                      </span>
                    </td>
                    <td>{number.format(row.Customers)}</td>
                    <td>
                      {(row.Customers > 0
                        ? row.Sales / row.Customers
                        : 0
                      ).toFixed(1)}
                    </td>
                    <td>{row.Operational_Risk} / 100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AppLayout>
  );
}

// ----------------- 3. Machine Learning Predictions ----------------- //

function Predictions() {
  const { businessData, predictiveProblems, forecastData, loading } =
    useOdieData();
  const [horizon, setHorizon] = useState("4");
  const latest = businessData.at(-1);

  const forecastSummary = forecastData?.metrics_summary?.Revenue;
  const projectedRevenue = forecastSummary?.projected_next;
  const growthRate = forecastSummary?.projected_growth_pct;

  const chartTimeline = forecastData?.combined_timeline || [];

  return (
    <AppLayout
      title="Machine Learning Predictions & Trends"
      subtitle="Workspace / Predictions"
    >
      <PageHeading
        eyebrow="PREDICTIVE INTELLIGENCE"
        title="Machine Learning Trend Models & Horizon Forecast"
        description="Trained scikit-learn regression models forecasting future revenue, operating costs, and inventory replenishment curves with 90% confidence intervals."
        action={
          <div className="horizon-controls">
            <span>Forecast Horizon:</span>
            <button
              className={`pill-btn ${horizon === "3" ? "active" : ""}`}
              onClick={() => setHorizon("3")}
            >
              3 Months
            </button>
            <button
              className={`pill-btn ${horizon === "4" ? "active" : ""}`}
              onClick={() => setHorizon("4")}
            >
              4 Months
            </button>
            <button
              className={`pill-btn ${horizon === "6" ? "active" : ""}`}
              onClick={() => setHorizon("6")}
            >
              6 Months
            </button>
          </div>
        }
      />

      <section className="metrics-grid forecast-metrics">
        <MetricCard
          label="Latest Reported Revenue"
          value={latest ? currency.format(latest.Revenue) : "—"}
          detail={`Actual in ${latest?.Month || "baseline"}`}
          icon={BarChart3}
        />
        <MetricCard
          label="ML Next Period Estimate"
          value={
            projectedRevenue !== undefined
              ? currency.format(projectedRevenue)
              : "—"
          }
          detail="Linear trend extrapolation"
          icon={TrendingUp}
          trend={{
            label: `${growthRate >= 0 ? "+" : ""}${growthRate || 0}%`,
            positive: (growthRate || 0) >= 0,
          }}
          tone="green"
        />
        <MetricCard
          label="Trend Slope Velocity"
          value={
            forecastSummary
              ? `₹${Math.round(forecastSummary.slope).toLocaleString()}/mo`
              : "—"
          }
          detail="Calculated monthly momentum"
          icon={Gauge}
          tone="gold"
        />
        <MetricCard
          label="Model Data Points"
          value={businessData.length}
          detail="Historical training points"
          icon={Database}
          tone="coral"
        />
      </section>

      <article className="panel chart-panel full-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">PREDICTIVE ENVELOPE</span>
            <h3>Historical Revenue vs Machine Learning Forecast</h3>
            <p>
              Dashed line indicates model forecast; shaded band indicates 90%
              confidence interval (* = projected periods)
            </p>
          </div>
        </div>
        {chartTimeline.length ? (
          <div className="chart">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart
                data={chartTimeline}
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e9eeeb" />
                <XAxis
                  dataKey="Month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                  width={44}
                />
                <Tooltip
                  formatter={(val, name) =>
                    val == null ? "—" : currency.format(val)
                  }
                  contentStyle={{
                    border: "1px solid #e1e8e4",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  name="Reported / Projected Revenue"
                  stroke="#147d70"
                  strokeWidth={2.6}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Revenue_Upper"
                  name="Upper Confidence (90%)"
                  stroke="#8eb8a6"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Revenue_Lower"
                  name="Lower Confidence (90%)"
                  stroke="#8eb8a6"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Profit"
                  name="Projected Profit"
                  stroke="#d89b3d"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="Model requires more data"
            message="At least two reporting cycles are needed for forecasting."
            loading={loading}
          />
        )}
      </article>

      <article className="panel signals-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">EARLY WARNING RADAR</span>
            <h3>Statistical Anomaly &amp; Bottleneck Checks</h3>
          </div>
        </div>
        {predictiveProblems.length ? (
          <div className="signal-list">
            {predictiveProblems.map((problem, index) => (
              <div className="signal-row" key={`${problem.title}-${index}`}>
                <span
                  className={`signal-icon ${
                    problem.severity === "High" ? "attention" : ""
                  }`}
                >
                  <ShieldAlert size={17} />
                </span>
                <div className="signal-copy">
                  <div className="signal-headline">
                    <strong>{problem.title}</strong>
                    <span className="category-pill">
                      {problem.category || "Operations"}
                    </span>
                  </div>
                  <p>{problem.description}</p>
                  <div className="signal-subdetail">
                    <span>
                      <strong>Impact:</strong> {problem.impact}
                    </span>
                    {problem.metric && (
                      <span>
                        <strong>Reading:</strong> {problem.metric}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`signal-tag ${
                    problem.severity === "High" ? "tag-alert" : "tag-normal"
                  }`}
                >
                  {problem.severity} · {problem.confidence}% Conf.
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No predictive checks"
            message="Predictive checks will show once data is processed."
            loading={loading}
          />
        )}
      </article>
    </AppLayout>
  );
}

// ----------------- 4. Decision Engine Page ----------------- //

function DecisionEngine() {
  const { decisions, updateDecisionStatus, addCustomDecision, loading } =
    useOdieData();
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("High");
  const [newCategory, setNewCategory] = useState("Operations");
  const [newImpact, setNewImpact] = useState("");

  const filteredDecisions = decisions.filter((d) => {
    if (filter === "all") return true;
    return d.status?.toLowerCase() === filter.toLowerCase();
  });

  const handleCreateDecision = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const ok = await addCustomDecision({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      category: newCategory,
      estimated_impact: newImpact || "Operational Enhancement",
    });
    if (ok) {
      setShowAddModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewImpact("");
    }
  };

  return (
    <AppLayout
      title="Strategic Decision Intelligence Engine"
      subtitle="Workspace / Decision Engine"
    >
      <PageHeading
        eyebrow="ACTIONABLE RECOMMENDATIONS"
        title="Operational Protocol Execution Board"
        description="Rule-based strategic interventions synthesized from current inventory levels, risk scores, and margin variances. Manage their lifecycle from review to completion."
        action={
          <button
            className="primary-button"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} /> Add Custom Initiative
          </button>
        }
      />

      <div className="decision-filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Recommendations ({decisions.length})
        </button>
        <button
          className={`filter-tab ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending Review (
          {decisions.filter((d) => (d.status || "Pending") === "Pending").length}
          )
        </button>
        <button
          className={`filter-tab ${filter === "in progress" ? "active" : ""}`}
          onClick={() => setFilter("in progress")}
        >
          In Progress (
          {decisions.filter((d) => d.status === "In Progress").length})
        </button>
        <button
          className={`filter-tab ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed (
          {decisions.filter((d) => d.status === "Completed").length})
        </button>
      </div>

      <div className="decision-list">
        {filteredDecisions.length ? (
          filteredDecisions.map((decision, index) => {
            const status = decision.status || "Pending";
            return (
              <article
                className={`decision-card ${status.toLowerCase().replace(" ", "-")}`}
                key={`${decision.id || decision.title}-${index}`}
              >
                <span
                  className={`priority-mark ${decision.priority?.toLowerCase() || "medium"}`}
                >
                  <Lightbulb size={20} />
                </span>

                <div className="decision-card-copy">
                  <div className="decision-card-top">
                    <div className="decision-tags">
                      <span className="panel-kicker">
                        {decision.category || "STRATEGY"}
                      </span>
                      <span
                        className={`priority-label ${decision.priority?.toLowerCase() || "medium"}`}
                      >
                        {decision.priority} Priority
                      </span>
                      <span
                        className={`status-pill ${status.toLowerCase().replace(" ", "-")}`}
                      >
                        {status}
                      </span>
                    </div>
                    {decision.timeline && (
                      <span className="decision-timeline">
                        <History size={13} /> {decision.timeline}
                      </span>
                    )}
                  </div>

                  <h3>{decision.title}</h3>
                  <p>{decision.description}</p>

                  <div className="decision-card-bottom">
                    {decision.estimated_impact && (
                      <div className="impact-box">
                        <strong>Expected ROI / Impact:</strong>
                        <span>{decision.estimated_impact}</span>
                      </div>
                    )}

                    <div className="decision-action-btns">
                      {status === "Pending" && (
                        <button
                          className="decision-btn start"
                          onClick={() =>
                            updateDecisionStatus(decision.id, "In Progress")
                          }
                        >
                          <Play size={13} /> Begin Implementation
                        </button>
                      )}
                      {status === "In Progress" && (
                        <button
                          className="decision-btn complete"
                          onClick={() =>
                            updateDecisionStatus(decision.id, "Completed")
                          }
                        >
                          <Check size={13} /> Mark as Executed
                        </button>
                      )}
                      {status === "Completed" && (
                        <button
                          className="decision-btn reset"
                          onClick={() =>
                            updateDecisionStatus(decision.id, "Pending")
                          }
                        >
                          <RotateCcw size={13} /> Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <article className="panel">
            <EmptyState
              title={loading ? "Loading decisions..." : "No decisions found"}
              message={`No strategic initiatives matching the '${filter}' filter.`}
              loading={loading}
            />
          </article>
        )}
      </div>

      <div className="method-note">
        <Brain size={18} />
        <p>
          Strategic decisions combine algorithmic threshold analysis, supply
          chain lead-time safety factors, and margin preservation rules.
        </p>
      </div>

      {showAddModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="modal-header">
              <h3>Create Strategic Initiative</h3>
              <button
                className="icon-button"
                onClick={() => setShowAddModal(false)}
              >
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleCreateDecision}>
              <div className="form-group">
                <label>Initiative Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Audit logistics partner SLA"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Operational Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the action steps and expected change..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Growth & Marketing">Growth & Marketing</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Estimated ROI / Impact (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., +₹40k Margin or -15% fulfillment lag"
                  value={newImpact}
                  onChange={(e) => setNewImpact(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ----------------- 5. Risk Analysis Page ----------------- //

function RiskAnalysis() {
  const { businessData, riskMatrixData, predictiveProblems, loading } =
    useOdieData();
  const latest = businessData.at(-1);
  const averageRisk = businessData.length
    ? businessData.reduce((sum, row) => sum + row.Operational_Risk, 0) /
      businessData.length
    : 0;

  const categories = riskMatrixData?.categories || [];
  const overallIndex = riskMatrixData?.overall_index || 0;
  const rating = riskMatrixData?.rating || "Evaluating...";

  return (
    <AppLayout
      title="Risk Analytics & Operational Exposure"
      subtitle="Workspace / Risk Analysis"
    >
      <PageHeading
        eyebrow="ENTERPRISE RESILIENCE"
        title="Multi-Factor Risk Assessment & Exposure Matrix"
        description="Continuous monitoring of operational friction scores, supply chain stockout vulnerability, and profitability compression."
      />

      <section className="metrics-grid risk-metrics">
        <MetricCard
          label="Overall Risk Index"
          value={`${overallIndex} / 100`}
          detail={rating}
          icon={ShieldAlert}
          tone="coral"
        />
        <MetricCard
          label="Operational Risk Score"
          value={latest ? `${latest.Operational_Risk} / 100` : "—"}
          detail={`Historical mean: ${averageRisk.toFixed(1)} / 100`}
          icon={Gauge}
          tone="gold"
        />
        <MetricCard
          label="Current Inventory Buffer"
          value={latest ? number.format(latest.Inventory) : "—"}
          detail={
            (latest?.Inventory || 0) < 600
              ? "Deficit beneath 600 safe threshold"
              : "Adequate buffer"
          }
          icon={Database}
          tone="teal"
        />
        <MetricCard
          label="Active Risk Alerts"
          value={
            predictiveProblems.filter((p) => p.severity !== "Low").length
          }
          detail="Non-nominal indicators"
          icon={AlertTriangle}
          tone="green"
        />
      </section>

      <section className="risk-quadrant-section panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">EXPOSURE BREAKDOWN</span>
            <h3>Risk Categories &amp; Mitigation Action Protocols</h3>
            <p>Calculated multi-dimensional risk scores</p>
          </div>
        </div>
        <div className="risk-categories-grid">
          {categories.map((cat, idx) => (
            <div className="risk-cat-card" key={idx}>
              <div className="cat-top">
                <h4>{cat.category}</h4>
                <span
                  className={`cat-score-badge ${
                    cat.score > 60
                      ? "high"
                      : cat.score > 35
                      ? "medium"
                      : "low"
                  }`}
                >
                  {cat.score} / 100
                </span>
              </div>
              <div className="cat-progress-track">
                <div
                  className={`cat-progress-fill ${
                    cat.score > 60
                      ? "fill-high"
                      : cat.score > 35
                      ? "fill-medium"
                      : "fill-low"
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <p className="cat-desc">{cat.description}</p>
              <div className="cat-mitigation">
                <Info size={14} />
                <span>
                  <strong>Protocol:</strong> {cat.mitigation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <article className="panel chart-panel full-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">STRESS CURVES</span>
            <h3>Operational Risk vs Inventory Cushion</h3>
            <p>Correlation between inventory depletion and operational friction</p>
          </div>
        </div>
        {businessData.length ? (
          <div className="chart">
            <ResponsiveContainer width="100%" height={310}>
              <LineChart
                data={businessData}
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e9eeeb" />
                <XAxis
                  dataKey="Month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 40]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                  width={38}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e1e8e4",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Operational_Risk"
                  name="Operational Risk Index (/100)"
                  stroke="#c9564b"
                  strokeWidth={2.6}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Inventory"
                  name="Inventory Units"
                  stroke="#147d70"
                  strokeWidth={2.2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="No records"
            message="Risk charts populate with historical records."
            loading={loading}
          />
        )}
      </article>
    </AppLayout>
  );
}

// ----------------- 6. What-If Simulator Page ----------------- //

function WhatIfSimulator() {
  const { businessData } = useOdieData();
  const [revenueChange, setRevenueChange] = useState(0);
  const [costChange, setCostChange] = useState(0);
  const [inventoryChange, setInventoryChange] = useState(0);
  const [marketingSpend, setMarketingSpend] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const runSimulation = useCallback(async () => {
    setSimulating(true);
    try {
      const res = await fetch(`${API_URL}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revenue_change_pct: revenueChange,
          cost_change_pct: costChange,
          inventory_change_pct: inventoryChange,
          marketing_spend_pct: marketingSpend,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      }
    } catch {
      // fallback
    } finally {
      setSimulating(false);
    }
  }, [revenueChange, costChange, inventoryChange, marketingSpend]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const applyPreset = (rev, cost, inv, mkt) => {
    setRevenueChange(rev);
    setCostChange(cost);
    setInventoryChange(inv);
    setMarketingSpend(mkt);
  };

  const baseline = simResult?.baseline;
  const sim = simResult?.simulation;
  const deltas = simResult?.deltas;

  return (
    <AppLayout
      title="Strategic What-If Scenario Simulator"
      subtitle="Workspace / Scenario Planning"
    >
      <PageHeading
        eyebrow="SCENARIO MODELING"
        title="Test Operational & Commercial Levers Before Execution"
        description="Simulate the bottom-line financial yield, customer volume, and operational risk impact of price increases, vendor cost swings, or inventory buffers."
        action={
          <div className="preset-button-bar">
            <span>Presets:</span>
            <button
              className="preset-btn"
              onClick={() => applyPreset(10, 0, 15, 5)}
            >
              Growth Expansion
            </button>
            <button
              className="preset-btn"
              onClick={() => applyPreset(0, -8, 0, 0)}
            >
              Cost Optimization
            </button>
            <button
              className="preset-btn"
              onClick={() => applyPreset(0, 0, 30, 0)}
            >
              Buffer Rebuild
            </button>
            <button
              className="preset-btn reset"
              onClick={() => applyPreset(0, 0, 0, 0)}
            >
              Reset
            </button>
          </div>
        }
      />

      <div className="simulator-layout">
        <section className="panel assumption-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">ASSUMPTION LEVERS</span>
              <h3>Adjust Strategy Variables</h3>
              <p>Simulating against {baseline?.period || "latest reported period"}</p>
            </div>
            {simulating && (
              <span className="simulating-indicator">
                <RefreshCw className="spin" size={13} /> Modeling...
              </span>
            )}
          </div>

          <ScenarioSlider
            label="Revenue / Pricing Adjustment"
            value={revenueChange}
            onChange={setRevenueChange}
            min={-25}
            max={25}
            unit="%"
          />
          <ScenarioSlider
            label="Operating Cost / COGS Variance"
            value={costChange}
            onChange={setCostChange}
            min={-25}
            max={25}
            unit="%"
          />
          <ScenarioSlider
            label="Inventory Buffer Adjustment"
            value={inventoryChange}
            onChange={setInventoryChange}
            min={-40}
            max={40}
            unit="%"
          />
          <ScenarioSlider
            label="Marketing & Growth Investment"
            value={marketingSpend}
            onChange={setMarketingSpend}
            min={-20}
            max={50}
            unit="%"
          />

          <div className="assumption-footnote">
            Interactions model volume elasticity and inventory carrying costs
            simultaneously to project net risk and margin yield.
          </div>
        </section>

        <section className="scenario-results">
          <article className="scenario-hero">
            <span className="panel-kicker">PROJECTED MONTHLY PROFIT</span>
            <div className="scenario-profit">
              {sim ? currency.format(sim.profit) : "—"}
            </div>
            {deltas && (
              <div
                className={`scenario-delta ${
                  deltas.profit_delta >= 0 ? "up" : "down"
                }`}
              >
                {deltas.profit_delta >= 0 ? "+" : "−"}
                {currency.format(Math.abs(deltas.profit_delta))} vs reported baseline (
                {deltas.profit_growth_pct >= 0 ? "+" : ""}
                {deltas.profit_growth_pct}%)
              </div>
            )}
            <div className="scenario-viability-box">
              <span>Model Viability Score:</span>
              <strong>{simResult?.viability_score || 85} / 100</strong>
            </div>
          </article>

          <article className="panel scenario-breakdown">
            <h3>Baseline vs Simulation Telemetry</h3>
            <div className="breakdown-row">
              <span>Gross Revenue</span>
              <div>
                <small className="baseline-sub">
                  Base: {baseline ? currency.format(baseline.revenue) : "—"}
                </small>
                <strong>{sim ? currency.format(sim.revenue) : "—"}</strong>
              </div>
            </div>
            <div className="breakdown-row">
              <span>Operating Costs</span>
              <div>
                <small className="baseline-sub">
                  Base: {baseline ? currency.format(baseline.costs) : "—"}
                </small>
                <strong>{sim ? currency.format(sim.costs) : "—"}</strong>
              </div>
            </div>
            <div className="breakdown-row">
              <span>Profit Margin</span>
              <div>
                <small className="baseline-sub">
                  Base: {baseline?.margin_pct}%
                </small>
                <strong>{sim ? `${sim.margin_pct}%` : "—"}</strong>
              </div>
            </div>
            <div className="breakdown-row">
              <span>Inventory After Adjustment</span>
              <div>
                <small className="baseline-sub">
                  Base: {baseline ? number.format(baseline.inventory) : "—"}
                </small>
                <strong>
                  {sim ? `${number.format(sim.inventory)} units` : "—"}
                </strong>
              </div>
            </div>
            <div className="breakdown-row">
              <span>Projected Operational Risk</span>
              <div>
                <small className="baseline-sub">
                  Base: {baseline?.risk_score}/100
                </small>
                <strong
                  className={
                    (sim?.risk_score || 0) > 25 ? "text-danger" : "text-success"
                  }
                >
                  {sim ? `${sim.risk_score} / 100` : "—"}
                </strong>
              </div>
            </div>
            <div className="breakdown-row total">
              <span>Net Monthly Variance</span>
              <strong>
                {deltas?.profit_delta >= 0 ? "+" : ""}
                {currency.format(deltas?.profit_delta || 0)}
              </strong>
            </div>
          </article>
        </section>
      </div>

      <div className="method-note">
        <Gauge size={18} />
        <p>
          Simulations are mathematical models evaluating marginal profit elasticity
          and unit holding costs against your latest actual baseline.
        </p>
      </div>
    </AppLayout>
  );
}

function ScenarioSlider({ label, value, onChange, min, max, unit }) {
  return (
    <label className="scenario-control">
      <span className="scenario-control-head">
        <span>{label}</span>
        <strong>
          {value > 0 ? "+" : ""}
          {value}
          {unit}
        </strong>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="range-labels">
        <span>
          {min}
          {unit}
        </span>
        <span>0</span>
        <span>
          +{max}
          {unit}
        </span>
      </span>
    </label>
  );
}

// ----------------- 7. Data Management Page ----------------- //

function DataManagement() {
  const {
    businessData,
    loading,
    refresh,
    updatedAt,
    addRecord,
    updateRecord,
    deleteRecord,
    resetData,
    uploadCsv,
  } = useOdieData();

  const [query, setQuery] = useState("");
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingRow, setEditingRow] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formMonth, setFormMonth] = useState("");
  const [formSales, setFormSales] = useState("");
  const [formRevenue, setFormRevenue] = useState("");
  const [formProfit, setFormProfit] = useState("");
  const [formInventory, setFormInventory] = useState("");
  const [formCustomers, setFormCustomers] = useState("");
  const [formRisk, setFormRisk] = useState("");

  const filteredData = businessData.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(query.toLowerCase()),
    ),
  );

  const columns = businessData[0] ? Object.keys(businessData[0]) : [];

  const openAddModal = () => {
    setModalMode("add");
    setFormMonth("");
    setFormSales("");
    setFormRevenue("");
    setFormProfit("");
    setFormInventory("");
    setFormCustomers("");
    setFormRisk("20");
  };

  const openEditModal = (row) => {
    setModalMode("edit");
    setEditingRow(row.Month);
    setFormMonth(row.Month);
    setFormSales(String(row.Sales));
    setFormRevenue(String(row.Revenue));
    setFormProfit(String(row.Profit));
    setFormInventory(String(row.Inventory));
    setFormCustomers(String(row.Customers));
    setFormRisk(String(row.Operational_Risk));
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      Month: formMonth.trim(),
      Sales: Number(formSales) || 0,
      Revenue: Number(formRevenue) || 0,
      Profit: Number(formProfit) || 0,
      Inventory: Number(formInventory) || 0,
      Customers: Number(formCustomers) || 0,
      Operational_Risk: Number(formRisk) || 0,
    };

    let ok = false;
    if (modalMode === "add") {
      ok = await addRecord(payload);
    } else {
      ok = await updateRecord(editingRow, payload);
    }

    setIsSubmitting(false);
    if (ok) setModalMode(null);
  };

  const handleDelete = async (month) => {
    if (
      window.confirm(
        `Are you sure you want to delete the record for '${month}'?`,
      )
    ) {
      await deleteRecord(month);
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        "Reset all business data to original baseline demonstration records?",
      )
    ) {
      await resetData();
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsSubmitting(true);
    const ok = await uploadCsv(uploadFile);
    setIsSubmitting(false);
    if (ok) {
      setShowUploadModal(false);
      setUploadFile(null);
    }
  };

  function exportCsv() {
    if (!columns.length) return;
    const escapeCell = (val) => `"${String(val).replaceAll('"', '""')}"`;
    const csv = [
      columns,
      ...filteredData.map((row) => columns.map((col) => row[col])),
    ]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `odie-business-data-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppLayout
      title="Data Management & Synchronization"
      subtitle="Workspace / Data Management"
    >
      <PageHeading
        eyebrow="ENTERPRISE DATA FABRIC"
        title="Active Business Records & Dataset Integration"
        description="Directly edit telemetry records, ingest corporate CSV files, or export dataset snapshots for external auditing."
        action={
          <div className="page-actions">
            <button className="secondary-button" onClick={openAddModal}>
              <Plus size={15} /> Add Record
            </button>
            <button
              className="secondary-button"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={15} /> Import CSV
            </button>
            <button
              className="secondary-button"
              onClick={exportCsv}
              disabled={!columns.length}
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              className="secondary-button text-danger"
              onClick={handleResetData}
              title="Reset data to default demo set"
            >
              <RotateCcw size={15} /> Reset Demo Data
            </button>
          </div>
        }
      />

      <section className="data-summary">
        <div>
          <span>TOTAL PERIODS</span>
          <strong>{businessData.length}</strong>
        </div>
        <div>
          <span>COLUMNS / METRICS</span>
          <strong>{columns.length}</strong>
        </div>
        <div>
          <span>LAST SYNCHRONIZED</span>
          <strong>
            {updatedAt
              ? updatedAt.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "—"}
          </strong>
        </div>
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search records"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search month, revenue, sales..."
          />
        </label>
      </section>

      <article className="panel table-panel">
        <div className="table-heading">
          <div>
            <span className="panel-kicker">DATABASE RECORDS</span>
            <h3>
              {filteredData.length}{" "}
              {filteredData.length === 1 ? "record" : "records"} displayed
            </h3>
          </div>
          <button
            className="icon-button refresh-button"
            onClick={refresh}
            title="Refresh table"
            disabled={loading}
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {columns.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column.replaceAll("_", " ")}</th>
                  ))}
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={`${row.Month || "record"}-${index}`}>
                    {columns.map((column) => (
                      <td key={column}>
                        {column === "Revenue" || column === "Profit"
                          ? currency.format(row[column])
                          : typeof row[column] === "number"
                          ? number.format(row[column])
                          : row[column]}
                      </td>
                    ))}
                    <td style={{ textAlign: "right" }}>
                      <div className="row-actions">
                        <button
                          className="table-action-btn edit"
                          title="Edit record"
                          onClick={() => openEditModal(row)}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="table-action-btn delete"
                          title="Delete record"
                          onClick={() => handleDelete(row.Month)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredData.length && (
              <EmptyState
                title="No matching records"
                message="Try adjusting your search criteria."
                loading={false}
              />
            )}
          </div>
        ) : (
          <EmptyState
            title="Dataset empty"
            message="No records currently loaded in the database."
            loading={loading}
          />
        )}
      </article>

      <p className="data-footnote">
        <Database size={15} /> Records are synced with backend{" "}
        <code>data/business_data.csv</code>. Any modifications update the ML
        models and Decision Engine in real time.
      </p>

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="modal-backdrop" onClick={() => setModalMode(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="modal-header">
              <h3>
                {modalMode === "add" ? "Add Business Record" : `Edit Record (${formMonth})`}
              </h3>
              <button
                className="icon-button"
                onClick={() => setModalMode(null)}
              >
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleSaveRecord}>
              <div className="form-group">
                <label>Month / Period Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. July, August"
                  disabled={modalMode === "edit"}
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sales Volume (units)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 5000"
                    value={formSales}
                    onChange={(e) => setFormSales(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Revenue (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 500000"
                    value={formRevenue}
                    onChange={(e) => setFormRevenue(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Operating Profit (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 180000"
                    value={formProfit}
                    onChange={(e) => setFormProfit(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Inventory Buffer (units)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 700"
                    value={formInventory}
                    onChange={(e) => setFormInventory(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Active Customers</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 1500"
                    value={formCustomers}
                    onChange={(e) => setFormCustomers(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Operational Risk (0-100)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    placeholder="e.g. 20"
                    value={formRisk}
                    onChange={(e) => setFormRisk(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalMode(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="modal-header">
              <h3>Upload CSV Dataset</h3>
              <button
                className="icon-button"
                onClick={() => setShowUploadModal(false)}
              >
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="upload-dropzone">
                <Upload size={32} />
                <p>Select a CSV file with columns:</p>
                <code>Month,Sales,Revenue,Profit,Inventory,Customers,Operational_Risk</code>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
                {uploadFile && (
                  <span className="selected-filename">
                    Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!uploadFile || isSubmitting}
                >
                  {isSubmitting ? "Importing..." : "Upload & Ingest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ----------------- 8. Organization Page ----------------- //

function Organization() {
  const { businessData, loading } = useOdieData();
  const latest = businessData.at(-1);

  const indicators = [
    {
      label: "Commercial Velocity",
      value: latest ? number.format(latest.Sales) : "—",
      detail: `${latest?.Month || "Latest period"} sales units`,
      color: "teal",
    },
    {
      label: "Active Accounts",
      value: latest ? number.format(latest.Customers) : "—",
      detail: "Active customer accounts",
      color: "green",
    },
    {
      label: "Profit Margin",
      value: latest
        ? `${((latest.Profit / latest.Revenue) * 100).toFixed(1)}%`
        : "—",
      detail: "Net operational return",
      color: "gold",
    },
    {
      label: "Process Health",
      value: latest ? `${latest.Operational_Risk} / 100` : "—",
      detail: "Operational risk score",
      color: "coral",
    },
  ];

  return (
    <AppLayout
      title="Organizational Scorecard & Throughput"
      subtitle="Workspace / Organization"
    >
      <PageHeading
        eyebrow="CROSS-FUNCTIONAL ALIGNMENT"
        title="Enterprise Departmental Health & KPIs"
        description="Unified corporate view aligning commercial sales throughput, customer account expansion, and supply chain readiness."
      />

      <section className="organization-grid">
        {indicators.map((item) => (
          <article className="panel organization-card" key={item.label}>
            <span className={`organization-marker ${item.color}`} />
            <span className="panel-kicker">{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <article className="panel chart-panel full-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">CROSS-FUNCTIONAL MIX</span>
            <h3>Sales Dispatch Units vs Customer Accounts</h3>
            <p>Direct reporting values across historical cycles</p>
          </div>
        </div>
        {businessData.length ? (
          <div className="chart">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={businessData}
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e9eeeb" />
                <XAxis
                  dataKey="Month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#89928e", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e1e8e4",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                />
                <Bar
                  dataKey="Sales"
                  name="Sales Dispatched"
                  fill="#147d70"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Customers"
                  name="Active Customers"
                  fill="#d89b3d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="No records"
            message="Organizational telemetry will populate with data."
            loading={loading}
          />
        )}
      </article>

      <div className="org-department-split">
        <article className="panel dept-card">
          <h4>Commercial &amp; Sales</h4>
          <p>
            Sales volume reached <strong>{latest?.Sales || 0} units</strong>,
            driving steady top-line cash generation.
          </p>
          <div className="dept-status healthy">Status: On Target</div>
        </article>
        <article className="panel dept-card">
          <h4>Supply Chain &amp; Logistics</h4>
          <p>
            Inventory level sits at <strong>{latest?.Inventory || 0} units</strong>.
            Restocking protocol active.
          </p>
          <div
            className={`dept-status ${
              (latest?.Inventory || 0) < 600 ? "warning" : "healthy"
            }`}
          >
            {(latest?.Inventory || 0) < 600 ? "Status: Restock Required" : "Status: Nominal"}
          </div>
        </article>
        <article className="panel dept-card">
          <h4>Finance &amp; Operations</h4>
          <p>
            Operating profit of{" "}
            <strong>{latest ? currency.format(latest.Profit) : "—"}</strong> maintains
            healthy reinvestment reserves.
          </p>
          <div className="dept-status healthy">Status: High Yield</div>
        </article>
      </div>
    </AppLayout>
  );
}

// ----------------- Router Root ----------------- //

function AppRouter() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/business-analytics"
            element={<BusinessAnalytics />}
          />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/decision-engine" element={<DecisionEngine />} />
          <Route path="/risk-analysis" element={<RiskAnalysis />} />
          <Route
            path="/what-if-simulator"
            element={<WhatIfSimulator />}
          />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="/organization" element={<Organization />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default AppRouter;
