import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip } from "recharts";

const STORAGE_KEY = "briefly_cards_v1";
const INFO_KEY = "briefly_case_info_v1";
const UI_KEY = "briefly_ui_prefs_v1";

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n || 0));

const DEFAULT_CARDS = {
  repc: { id: "repc", title: "REPC Contract cost", chart: "donut", categories: { land: { label: "Land", value: 235000, on: true }, slab: { label: "Slab", value: 18000, on: true }, fence: { label: "Fence wall", value: 12000, on: false }, pool: { label: "Pool", value: 0, on: false }, furniture: { label: "Furniture", value: 20000, on: false }, upgrades: { label: "Upgrades", value: 15000, on: false }, contingency: { label: "Contingency", value: 0, on: false } } },
  budget2: { id: "budget2", title: "Budget 2 cost", chart: "donut", categories: { land: { label: "Land", value: 235000, on: true }, slab: { label: "Slab", value: 19000, on: true }, fence: { label: "Fence wall", value: 14000, on: true }, pool: { label: "Pool", value: 0, on: false }, furniture: { label: "Furniture", value: 22000, on: false }, upgrades: { label: "Upgrades", value: 23000, on: true }, contingency: { label: "Contingency", value: 0, on: false } } },
  budget3: { id: "budget3", title: "Budget 3 cost", chart: "donut", categories: { land: { label: "Land", value: 235000, on: true }, slab: { label: "Slab", value: 17000, on: true }, fence: { label: "Fence wall", value: 8000, on: false }, pool: { label: "Pool", value: 0, on: false }, furniture: { label: "Furniture", value: 12000, on: true }, upgrades: { label: "Upgrades", value: 10000, on: true }, contingency: { label: "Contingency", value: 0, on: false } } }
};

const DEFAULT_INFO = { clientName: "Client Name", role: "Plaintiff", attorneys: "Attorney(s)", caseId: "CASE-0000" };
const DEFAULT_UI = { dark: false, tab: "Dashboard", edit: true } as { dark: boolean; tab: string; edit: boolean; };
const KEY_ORDER = ["land", "slab", "fence", "pool", "furniture", "upgrades", "contingency"] as const;
const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#fb7185"];

function useLocalState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : initial; } catch { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState] as const;
}

type RowProps = {
  color: string;
  label: string;
  value: number;
  enabled: boolean;
  onValue: (n: number) => void;
  onToggle: (on: boolean) => void;
};

const Row: React.FC<RowProps> = ({ color, label, value, enabled, onValue, onToggle }) => (
  <div className="legend-row">
    <span className="dot" style={{ backgroundColor: color }} />
    <div className="flex items-center gap-3">
      <label className="text-sm text-slate-500 min-w-[90px]">{label}</label>
      <input type="number" value={value} onChange={(e) => onValue(Number(e.target.value || 0))} className="h-8 w-32 rounded-lg border border-slate-300 px-2" />
    </div>
    <button aria-label="toggle" onClick={() => onToggle(!enabled)} className={`switch ${enabled ? "switch-on" : ""}`}><span className="switch-dot" /></button>
  </div>
);

function ChartSwitcher({ value, onChange }: { value: "donut" | "bar"; onChange: (v: "donut" | "bar") => void; }) {
  return (
    <div className="flex items-center gap-2">
      <button className={`btn ${value === "donut" ? "btn-primary" : ""}`} onClick={() => onChange("donut")}>Donut</button>
      <button className={`btn ${value === "bar" ? "btn-primary" : ""}`} onClick={() => onChange("bar")}>Bar</button>
    </div>
  );
}

type CardType = (typeof DEFAULT_CARDS)["repc"];
type CardsState = Record<string, CardType>;

const BudgetCard: React.FC<{ card: CardType; onUpdate: (next: CardType) => void; }> = ({ card, onUpdate }) => {
  const categories = useMemo(() => KEY_ORDER.filter((k) => (card.categories as any)[k]).map((k) => ({ key: k, ...(card.categories as any)[k] })), [card]);
  const colorMap = useMemo(() => { const m: Record<string, string> = {}; categories.forEach((c, i) => (m[c.key] = COLORS[i % COLORS.length])); return m; }, [categories]);
  const active = categories.filter((c) => c.on);
  const total = active.reduce((s, c) => s + Number(c.value || 0), 0);
  const data = active.map((c) => ({ key: c.key, name: c.label, value: Number(c.value || 0), color: colorMap[c.key] }));
  const update = (next: Partial<CardType>) => onUpdate({ ...card, ...(next as any) });
  const toggle = (k: string) => update({ categories: { ...(card.categories as any), [k]: { ...(card.categories as any)[k], on: !(card.categories as any)[k].on } } });
  const setVal = (k: string, v: number) => update({ categories: { ...(card.categories as any), [k]: { ...(card.categories as any)[k], value: v } } });

  return (
    <div className="card">
      <div className="card-h">
        <div className="card-t">{card.title}</div>
        <div className="flex items-center gap-3">
          <span className="total-pill">{usd(total)}</span>
          <ChartSwitcher value={card.chart as "donut" | "bar"} onChange={(v) => update({ chart: v } as any)} />
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="relative h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            {card.chart === "donut" ? (
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80}>
                  {data.map((e, i) => (<Cell key={i} fill={e.color} onClick={() => toggle(e.key)} cursor="pointer" />))}
                </Pie>
                <ReTooltip formatter={(v: number, n: string) => [usd(v), n]} />
              </PieChart>
            ) : (
              <BarChart data={data}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => usd(v)} />
                <ReTooltip formatter={(v: number, n: string) => [usd(v), n]} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.map((e, i) => (<Cell key={i} fill={e.color} onClick={() => toggle(e.key)} cursor="pointer" />))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-lg font-semibold">{usd(total)}</div>
            </div>
          </div>
        </div>
        <div className="legend">
          {categories.map((c) => (
            <Row key={c.key as string} color={colorMap[c.key as string]} label={c.label} value={c.value} enabled={c.on} onValue={(v) => setVal(c.key as string, v)} onToggle={() => toggle(c.key as string)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function BrieflyDashboard() {
  const [cards, setCards] = useLocalState<CardsState>(STORAGE_KEY, DEFAULT_CARDS as CardsState);
  const [info, setInfo] = useLocalState<typeof DEFAULT_INFO>(INFO_KEY, DEFAULT_INFO);
  const [ui, setUI] = useLocalState<typeof DEFAULT_UI>(UI_KEY, DEFAULT_UI);

  useEffect(() => { const root = document.documentElement; ui.dark ? root.classList.add("dark") : root.classList.remove("dark"); }, [ui.dark]);

  const updateCard = (id: string, next: CardType) => setCards({ ...(cards as any), [id]: next });
  const addCard = () => { const id = `card_${Date.now()}`; const t = JSON.parse(JSON.stringify(DEFAULT_CARDS.repc)) as CardType; (t as any).id = id; (t as any).title = "Dashboard card"; setCards({ ...(cards as any), [id]: t }); };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Briefly Dashboard</h1>
            <span className="badge">MVP</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => setUI({ ...ui, dark: false })}>Light</button>
            <button className="btn" onClick={() => setUI({ ...ui, dark: true })}>Dark</button>
            <button className="btn" onClick={addCard}>+ Dashboard card</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="card-h"><div className="card-t">Client</div></div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 items-center gap-2"><label className="text-xs text-slate-500">Name</label><input className="col-span-2 h-8 rounded-lg border border-slate-300 px-2" value={info.clientName} onChange={(e) => setInfo({ ...info, clientName: e.target.value })} /></div>
              <div className="grid grid-cols-3 items-center gap-2"><label className="text-xs text-slate-500">Role</label><input className="col-span-2 h-8 rounded-lg border border-slate-300 px-2" value={info.role} onChange={(e) => setInfo({ ...info, role: e.target.value })} /></div>
              <div className="grid grid-cols-3 items-center gap-2"><label className="text-xs text-slate-500">Attorney(s)</label><input className="col-span-2 h-8 rounded-lg border border-slate-300 px-2" value={info.attorneys} onChange={(e) => setInfo({ ...info, attorneys: e.target.value })} /></div>
              <div className="grid grid-cols-3 items-center gap-2"><label className="text-xs text-slate-500">Case ID</label><input className="col-span-2 h-8 rounded-lg border border-slate-300 px-2" value={info.caseId} onChange={(e) => setInfo({ ...info, caseId: e.target.value })} /></div>
            </div>
          </div>
          {(Object.values(cards) as CardType[]).map((card) => (
            <BudgetCard key={card.id} card={card} onUpdate={(next) => updateCard(card.id, next)} />
          ))}
        </div>
      </div>
    </div>
  );
}
