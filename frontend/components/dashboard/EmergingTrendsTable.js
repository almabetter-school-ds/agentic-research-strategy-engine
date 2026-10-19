"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select } from "../ui/input";
import { EmptyState } from "../ui/empty-state";

export function EmergingTrendsTable({ industries = [], knowledge = [] }) {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const rows = useMemo(() => {
    const base = industries.map(item => ({
      name: item._id || "Uncategorized",
      category: "Market",
      signal: item.count || 0,
      signalLabel: `${item.count || 0} records`,
      spark: [{ i: 0, value: item.count || 0 }]
    }));
    const insights = knowledge.slice(0, 5).map(item => {
      const confidence = Math.round((item.confidence || 0) * 100);
      return {
        name: item.title,
        category: formatCategory(item.collection),
        signal: confidence,
        signalLabel: `${confidence}% confidence`,
        spark: [{ i: 0, value: confidence }]
      };
    });
    return [...base, ...insights].filter(row => category === "All" || row.category === category).sort((a, b) => b.signal - a.signal).slice(0, 5);
  }, [industries, knowledge, category]);
  const categories = ["All", ...new Set(rows.map(row => row.category))];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Emerging Trends</CardTitle>
        <button className="text-xs text-primary" onClick={() => router.push("/market-intelligence")}>View all</button>
      </CardHeader>
      <CardContent>
        <Select className="mb-3 w-44" value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(item => <option key={item}>{item}</option>)}
        </Select>
        {rows.length ? (
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="py-2">Trend</th><th>Category</th><th>Signal</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.name}-${index}`} className="border-t border-border/70 hover:bg-muted/50">
                  <td className="py-3">
                    <button className="text-left hover:text-primary" onClick={() => router.push(`/market-intelligence?trend=${encodeURIComponent(row.name)}`)}>
                      <span className="mr-2 rounded-full bg-muted px-2 py-0.5 text-xs">{index + 1}</span>{row.name}
                    </button>
                  </td>
                  <td className="text-muted-foreground">{row.category}</td>
                  <td className="text-muted-foreground">{row.signalLabel}</td>
                  <td className="h-8 w-24">
                    <ResponsiveContainer>
                      <LineChart data={row.spark}>
                        <Line dataKey="value" stroke="#22c55e" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <EmptyState title="No trends yet" description="Trends are derived from completed research and knowledge memory." />}
      </CardContent>
    </Card>
  );
}

function formatCategory(value = "") {
  return value.split("_").map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(" ");
}
