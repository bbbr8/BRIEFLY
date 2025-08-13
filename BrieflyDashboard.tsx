import React, { useEffect, useMemo, useState } from "react";
import { Menu, Settings, Info, PieChart as PieIcon, BarChart3, Plus } from "lucide-react";
// Basic UI components implemented locally to avoid depending on @/components/ui/*
const cn = (...classes) => classes.filter(Boolean).join(" ");

function Card({ className = "", children }) {
  return <div className={cn("rounded-lg border", className)}>{children}</div>;
}

function CardHeader({ className = "", children }) {
  return <div className={cn("p-4 pb-2", className)}>{children}</div>;
}

function CardTitle({ className = "", children }) {
  return <h3 className={cn("font-semibold tracking-tight", className)}>{children}</h3>;
}

function CardContent({ className = "", children }) {
  return <div className={cn("p-4 pt-0", className)}>{children}</div>;
}

function Button({ className = "", variant = "default", size = "default", ...props }) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border hover:bg-accent hover:text-accent-foreground",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-10 w-10",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
  };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

function Input({ className = "", ...props }) {
  return <input className={cn("flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1", className)} {...props} />;
}

function Label({ className = "", ...props }) {
  return <label className={cn("text-sm font-medium leading-none", className)} {...props} />;
}

function Switch({ id, checked, onCheckedChange }) {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
    </label>
  );
}

function Badge({ className = "", children }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold", className)}>{children}</span>;
}

function SettingsMenu({ ui, setUI, addDashboardCard }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="relative">
      <Button variant="outline" size="icon" aria-label="Settings" onClick={() => setOpen(!open)}>
        <Settings className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background p-1 shadow-md space-y-1">
          <div className="px-2 py-1 text-sm font-semibold">Settings</div>
          <button
            className="w-full text-left px-2 py-1 text-sm hover:bg-accent"
            onClick={() => {
              setUI({ ...ui, dark: false });
              close();
            }}
          >
            Light mode
          </button>
          <button
            className="w-full text-left px-2 py-1 text-sm hover:bg-accent"
            onClick={() => {
              setUI({ ...ui, dark: true });
              close();
            }}
          >
            Dark mode
          </button>
          <button
            className="w-full text-left px-2 py-1 text-sm hover:bg-accent"
            onClick={() => {
              addDashboardCard();
              close();
            }}
          >
            Add card…
          </button>
          <button
            className="w-full text-left px-2 py-1 text-sm hover:bg-accent"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Reset demo data
          </button>
        </div>
      )}
    </div>
  );
}

function SidebarMenu({ ui, setUI, addDashboardCard }) {
  const [open, setOpen] = useState(false);
  const nav = (t) => (
    <Button
      key={t}
      variant={ui.tab === t ? "default" : "ghost"}
      className="w-full justify-start"
      onClick={() => {
        setUI({ ...ui, tab: t });
        setOpen(false);
      }}
    >
      {t}
    </Button>
  );
  return (
    <div>
      <Button variant="ghost" size="icon" aria-label="Menu" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-background p-6 space-y-2">
            {['Home', 'File Upload', 'Messages'].map(nav)}
            {nav('Dashboard')}
            <Button
              className="w-full justify-start"
              onClick={() => {
                addDashboardCard();
                setOpen(false);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />+ Dashboard Card
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip } from "recharts";

const STORAGE_KEY = "briefly_cards_v1";
const INFO_KEY = "briefly_case_info_v1";
const UI_KEY = "briefly_ui_prefs_v1";

const usd = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n || 0));

const DEFAULT_CARDS = {
  repc: { id: "repc", title: "REPC Contract cost", chart: "donut", categories: { land: { label: "Land", value: 235000, on: true }, slab: { label: "Slab", value: 18000, on: true }, fence: { label: "Fence wall", value: 12000, on: false }, pool: { label: "Pool", value: 0, on: false }, furniture: { label: "Furniture", value: 20000, on: false }, upgrades: { label: "Upgrades", value: 15000, on: false }, contingency: { label: "Contingency", value: 0, on: false } } },
  budget2: { id: "budget2", title: "Budget 2 cost", chart: "donut", categories: { land: { label: "Land", value: 235000, on: true }, slab: { label: "Slab", value: 19000, on: true }, fence: { label: "Fence wall", value: 14000, on: true }, pool: { label: "Pool", value: 0, on: false }, furniture: { label: "Furniture", value: 22000, on: false }, upgrades: { label: "Upgrades", value: 23000, on: true }, contingency: { label: "Contingency", value: 0, on: false } } },
  budget3: { id: "budget3", title: "Budget 3 cost", chart: "donut", categories: { land: { label: "Land", value: 235000, on: true }, slab: { label: "Slab", value: 17000, on: true }, fence: { label: "Fence wall", value: 8000, on: false }, pool: { label: "Pool", value: 0, on: false }, furniture: { label: "Furniture", value: 12000, on: true }, upgrades: { label: "Upgrades", value: 10000, on: true }, contingency: { label: "Contingency", value: 0, on: false } } }
};

const DEFAULT_INFO = { clientName: "Client Name", role: "Plaintiff", attorneys: "Attorney(s)", caseId: "CASE-0000" };
const DEFAULT_UI = { dark: false, tab: "Dashboard", edit: true };
const KEY_ORDER = ["land", "slab", "fence", "pool", "furniture", "upgrades", "contingency"];
const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#fb7185"];

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

function ChartSwitcher({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant={value === "donut" ? "default" : "secondary"} size="icon" onClick={() => onChange("donut")} aria-label="Donut chart">
        <PieIcon className="h-4 w-4" />
      </Button>
      <Button variant={value === "bar" ? "default" : "secondary"} size="icon" onClick={() => onChange("bar")} aria-label="Bar chart">
        <BarChart3 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function CategoryRow({ id, label, value, enabled, onToggle, onChange, color }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center py-1">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex items-center gap-3">
        <Label htmlFor={`${id}-switch`} className="text-sm text-muted-foreground min-w-[90px]">{label}</Label>
        <Input id={`${id}-value`} type="number" inputMode="numeric" className="h-8 w-32" value={value} onChange={(e) => onChange(Number(e.target.value || 0))} />
      </div>
      <Switch id={`${id}-switch`} checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}

function BudgetCard({ card, onUpdate, globalEdit }) {
  const categoriesArr = useMemo(() => KEY_ORDER.filter((k) => card.categories[k]).map((key) => ({ key, ...card.categories[key] })), [card]);
  const colorMap = useMemo(() => {
    const m = {};
    categoriesArr.forEach((c, idx) => (m[c.key] = COLORS[idx % COLORS.length]));
    return m;
  }, [categoriesArr]);
  const active = categoriesArr.filter((c) => c.on);
  const total = active.reduce((sum, c) => sum + Number(c.value || 0), 0);
  const chartData = active.map((c) => ({ key: c.key, name: c.label, value: Number(c.value || 0), color: colorMap[c.key] }));
  const update = (next) => onUpdate({ ...card, ...next });
  const toggleKey = (k) => update({ categories: { ...card.categories, [k]: { ...card.categories[k], on: !card.categories[k].on } } });

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base md:text-lg">{card.title}</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Interactive chart and legend">
            <Info className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-base font-semibold px-3 py-1">{usd(total)}</Badge>
          <ChartSwitcher value={card.chart} onChange={(v) => update({ chart: v })} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            {card.chart === "donut" ? (
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} onClick={() => toggleKey(entry.key)} />
                  ))}
                </Pie>
                <ReTooltip formatter={(value, name) => [usd(value), name]} />
              </PieChart>
            ) : (
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => usd(v)} />
                <ReTooltip formatter={(value, name) => [usd(value), name]} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} onClick={() => toggleKey(entry.key)} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-lg font-semibold">{usd(total)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-3">
          {categoriesArr.map((c) => (
            <CategoryRow
              key={c.key}
              id={`${card.id}-${c.key}`}
              label={c.label}
              value={c.value}
              enabled={c.on}
              color={colorMap[c.key]}
              onToggle={() => toggleKey(c.key)}
              onChange={(v) => update({ categories: { ...card.categories, [c.key]: { ...card.categories[c.key], value: v } } })}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrieflyDashboard() {
  const [cards, setCards] = useLocalState(STORAGE_KEY, DEFAULT_CARDS);
  const [info, setInfo] = useLocalState(INFO_KEY, DEFAULT_INFO);
  const [ui, setUI] = useLocalState(UI_KEY, DEFAULT_UI);

  useEffect(() => {
    const root = document.documentElement;
    if (ui.dark) root.classList.add("dark"); else root.classList.remove("dark");
  }, [ui.dark]);

  const updateCard = (id, next) => setCards({ ...cards, [id]: next });
  const addDashboardCard = () => {
    const id = `card_${Date.now()}`;
    const template = JSON.parse(JSON.stringify(DEFAULT_CARDS.repc));
    template.id = id;
    template.title = "Dashboard card";
    setCards({ ...cards, [id]: template });
    setUI({ ...ui, tab: "Dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarMenu ui={ui} setUI={setUI} addDashboardCard={addDashboardCard} />
            <h1 className="text-xl font-semibold tracking-tight">Briefly Dashboard</h1>
            <Badge variant="outline" className="ml-2">MVP</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 pr-2 border-r">
              <Label htmlFor="edit-switch" className="text-sm">Edit</Label>
              <Switch id="edit-switch" checked={ui.edit} onCheckedChange={(v) => setUI({ ...ui, edit: v })} />
            </div>
            <SettingsMenu ui={ui} setUI={setUI} addDashboardCard={addDashboardCard} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Client</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-xs">Name</Label>
                <Input className="col-span-2 h-8" value={info.clientName} onChange={(e) => setInfo({ ...info, clientName: e.target.value })} disabled={!ui.edit} />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-xs">Role</Label>
                <Input className="col-span-2 h-8" value={info.role} onChange={(e) => setInfo({ ...info, role: e.target.value })} disabled={!ui.edit} />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-xs">Attorney(s)</Label>
                <Input className="col-span-2 h-8" value={info.attorneys} onChange={(e) => setInfo({ ...info, attorneys: e.target.value })} disabled={!ui.edit} />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-xs">Case ID</Label>
                <Input className="col-span-2 h-8" value={info.caseId} onChange={(e) => setInfo({ ...info, caseId: e.target.value })} disabled={!ui.edit} />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Placeholder</CardTitle></CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">Not sure what to put here.</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {Object.values(cards).map((c) => (
            <BudgetCard key={c.id} card={c} onUpdate={(next) => updateCard(c.id, next)} globalEdit={ui.edit} />
          ))}
        </div>
      </div>
    </div>
  );
}
