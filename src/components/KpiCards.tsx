"use client";

import { useEffect, useState, useRef } from "react";
import {
  GitCommitHorizontal, BookOpen, GitPullRequest, GitMerge,
  Code, Trash2, Users, Flame,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

type StatItem = {
  label: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  color: string;
  raw: number;
  trendData?: number[];
};

function Sparkline({ color, data }: { color: string; data?: number[] }) {
  if (!data || data.length === 0) return null;
  const width = 80;
  const height = 28;
  const max = Math.max(...data, 1);
  const points = data
    .map((v, i) => `${(i / Math.max(data.length - 1, 1)) * width},${height - (v / max) * height}`)
    .join(" ");

  return (
    <svg width={width} height={height} className="opacity-70">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={points + ` ${width},${height} 0,${height}`} fill={color} fillOpacity="0.1" />
    </svg>
  );
}

function AnimatedNumber({ value, prefix }: { value: string; prefix?: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const numeric = parseInt(value.replace(/,/g, ""));
    if (isNaN(numeric)) { setDisplay(value); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const steps = 30;
          const increment = numeric / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= numeric) { setDisplay(value); clearInterval(timer); }
            else setDisplay(Math.floor(current).toLocaleString());
          }, 1000 / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{prefix}{display}</span>;
}

export default function KpiCards() {
  const { stats } = useDashboard();
  const [items, setItems] = useState<StatItem[]>([]);

  useEffect(() => {
    if (!stats) return;
    const dailySlice = stats.dailyArray ? stats.dailyArray.slice(-14) : [];
    const weekSlice = stats.weeksData ? stats.weeksData : [];
    setItems([
      { label: "Total Commits", value: stats.totalCommits.toLocaleString(), trend: Math.round(stats.weekCommits / Math.max(stats.repoCount, 1) * 10), icon: <GitCommitHorizontal className="w-4 h-4" />, color: "#22c55e", raw: stats.totalCommits, trendData: dailySlice },
      { label: "Repositories", value: String(stats.repoCount), trend: 0, icon: <BookOpen className="w-4 h-4" />, color: "#3b82f6", raw: stats.repoCount },
      { label: "Stars", value: stats.totalStars.toLocaleString(), trend: Math.round(stats.totalStars / 10), icon: <GitPullRequest className="w-4 h-4" />, color: "#a855f7", raw: stats.totalStars },
      { label: "Forks", value: stats.totalForks.toLocaleString(), trend: Math.round(stats.totalForks / 5), icon: <GitMerge className="w-4 h-4" />, color: "#06b6d4", raw: stats.totalForks },
      { label: "Week Commits", value: String(stats.weekCommits), trend: Math.round(stats.weekCommits / Math.max(stats.repoCount, 1)) * 5, icon: <Code className="w-4 h-4" />, color: "#10b981", raw: stats.weekCommits, trendData: weekSlice },
      { label: "Followers", value: String(stats.followers), trend: 2, icon: <Users className="w-4 h-4" />, color: "#f59e0b", raw: stats.followers },
      { label: "Best Streak", value: String(stats.bestStreak), trend: Math.round(stats.bestStreak / 10), icon: <Flame className="w-4 h-4" />, color: "#f97316", raw: stats.bestStreak },
      { label: "Current Streak", value: String(stats.streak), trend: stats.streak > 0 ? 5 : 0, icon: <Flame className="w-4 h-4" />, color: "#ef4444", raw: stats.streak, trendData: dailySlice },
    ]);
  }, [stats]);

  if (items.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-border rounded w-2/3 mb-3" />
            <div className="h-8 bg-border rounded w-1/2 mb-2" />
            <div className="h-4 bg-border rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((kpi) => (
        <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-all hover:shadow-sm group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted group-hover:text-foreground transition-colors">{kpi.label}</span>
            <span style={{ color: kpi.color }}>{kpi.icon}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold"><AnimatedNumber value={kpi.value} /></div>
              <div className={`flex items-center gap-1 text-xs mt-0.5 ${kpi.trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                {kpi.trend >= 0 ? "+" : ""}{kpi.trend}%
              </div>
            </div>
            <Sparkline color={kpi.color} data={kpi.trendData} />
          </div>
        </div>
      ))}
    </div>
  );
}
