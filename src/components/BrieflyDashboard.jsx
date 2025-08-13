import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#fb7185"
];

const initial = {
  land: { label: "Land", value: 235000, on: true },
  slab: { label: "Slab", value: 18000, on: true },
  fence: { label: "Fence wall", value: 12000, on: false },
  pool: { label: "Pool", value: 0, on: false },
  furniture: { label: "Furniture", value: 20000, on: false },
  upgrades: { label: "Upgrades", value: 15000, on: false },
  contingency: { label: "Contingency", value: 0, on: false }
};

export default function BrieflyDashboard() {
  const [categories, setCategories] = useState(initial);
  const [chart, setChart] = useState("donut");

  const data = useMemo(() => {
    return Object.keys(categories)
      .filter((k) => categories[k].on)
      .map((k, idx) => ({
        key: k,
        name: categories[k].label,
        value: Number(categories[k].value || 0),
        color: COLORS[idx % COLORS.length]
      }));
  }, [categories]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const updateValue = (key, value) => {
    setCategories({
      ...categories,
      [key]: { ...categories[key], value }
    });
  };

  const toggleCategory = (key, on) => {
    setCategories({
      ...categories,
      [key]: { ...categories[key], on }
    });
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>Briefly Dashboard</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setChart("donut")} disabled={chart === "donut"}>Donut</button>
        <button onClick={() => setChart("bar")} disabled={chart === "bar"} style={{ marginLeft: "0.5rem" }}>Bar</button>
        <span style={{ marginLeft: "1rem", fontWeight: "bold" }}>
          Total: ${total.toLocaleString()}
        </span>
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          {chart === "donut" ? (
            <PieChart>
              <Pie dataKey="value" data={data} outerRadius={100} innerRadius={60}>
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: "1rem" }}>
        {Object.keys(categories).map((key, idx) => (
          <div key={key} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <span
              style={{
                width: 12,
                height: 12,
                backgroundColor: COLORS[idx % COLORS.length],
                display: "inline-block",
                marginRight: 8
              }}
            />
            <label style={{ width: 110 }}>{categories[key].label}</label>
            <input
              type="number"
              value={categories[key].value}
              onChange={(e) => updateValue(key, Number(e.target.value))}
              style={{ marginRight: 8 }}
            />
            <input
              type="checkbox"
              checked={categories[key].on}
              onChange={(e) => toggleCategory(key, e.target.checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

