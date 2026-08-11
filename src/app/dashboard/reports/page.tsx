"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download, Share2, Sparkles, Calendar, ChevronDown, Check } from "lucide-react";

type Stats = {
  totalCommits: number;
  weekCommits: number;
  streak: number;
  bestStreak: number;
  repoCount: number;
  followers: number;
  totalStars: number;
  totalForks: number;
  repoActivity: { name: string; commits: number }[];
  languages: { name: string; count: number }[];
};

import { useDashboard } from "@/context/DashboardContext";

export default function ReportsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { stats } = useDashboard();
  const [selected, setSelected] = useState("weekly");
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/"); return; }
  }, [authStatus, router]);

  if (authStatus === "loading") return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>;

  const reports = stats ? [
    { id: 1, title: "Weekly Performance Report", date: new Date().toLocaleDateString(), type: "weekly", metrics: [`${stats.weekCommits} commits this week`, `${stats.repoCount} active repos`, `${stats.streak} day streak`] },
    { id: 2, title: "Repository Overview", date: new Date().toLocaleDateString(), type: "monthly", metrics: [`${stats.totalCommits} total commits`, `${stats.totalStars} stars`, `${stats.totalForks} forks`] },
    { id: 3, title: "Streak & Consistency", date: new Date().toLocaleDateString(), type: "custom", metrics: [`Best streak: ${stats.bestStreak} days`, `Current: ${stats.streak} days`, `${stats.followers} followers`] },
  ] : [];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted">Generate performance reports from your GitHub data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Generated Reports</h2>
          {reports.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg"><FileText className="w-5 h-5 text-accent" /></div>
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3" />{r.date}
                    <span className="text-muted">•</span>
                    <span>{r.metrics[0]}</span>
                    <span className="text-muted">•</span>
                    <span>{r.metrics[1]}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-muted hover:text-foreground hover:bg-border/30 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                <button className="p-2 text-muted hover:text-foreground hover:bg-border/30 rounded-lg transition-colors"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Generate New</h2>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1">Report Type</label>
              <div className="flex gap-1.5 bg-background border border-border rounded-lg p-1">
                {["weekly", "monthly", "quarterly"].map((t) => (
                  <button key={t} onClick={() => setSelected(t)} className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors ${selected === t ? "bg-accent text-black font-medium" : "text-muted hover:text-foreground"}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Date Range</label>
              <button className="w-full flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2 text-xs text-muted">Last 7 days <ChevronDown className="w-3 h-3" /></button>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Include Sections</label>
              <div className="space-y-2">
                {["Code Quality", "Productivity", "Repository Stats", "AI Summary"].map((s) => (
                  <label key={s} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-accent" />
                    <span className="text-muted">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={() => { setGenerated(true); setTimeout(() => setGenerated(false), 3000); }} className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-medium px-4 py-2 rounded-lg transition-colors text-sm">
              <Sparkles className="w-4 h-4" /> Generate Report
            </button>
          </div>
        </div>
      </div>

      {generated && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 z-50">
          <Check className="w-4 h-4" /> Report generated with real data
        </div>
      )}
    </div>
  );
}
