"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Flame, Brain, Calendar, Target, AlertTriangle, Sparkles, Trophy } from "lucide-react";
import ContributionHeatmapFull from "@/components/ContributionHeatmapFull";

import { useDashboard } from "@/context/DashboardContext";

type Stats = {
  totalCommits: number;
  weekCommits: number;
  streak: number;
  bestStreak: number;
  totalActiveDays?: number;
  repoCount: number;
  repoActivity: { name: string; commits: number }[];
  dailyArray365?: { date: string; count: number }[];
};

export default function ProductivityPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { stats } = useDashboard();

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/");
  }, [authStatus, router]);

  if (authStatus === "loading") return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>;

  const focusScore = stats ? Math.min(100, Math.round((stats.weekCommits / Math.max(stats.repoCount, 1)) * 20 + 50)) : 0;
  const consistency = stats ? Math.min(100, Math.round((stats.streak / Math.max(stats.bestStreak || 1, 1)) * 100)) : 0;

  const keyMetricsList = [
    {
      label: "Coding Streak",
      value: `${stats?.streak ?? 0} days`,
      status: (stats?.streak ?? 0) > 7 ? "On Fire 🔥" : "Active",
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      pct: stats ? Math.min(100, Math.round(((stats.streak || 0) / 30) * 100)) : 0,
      color: "from-orange-500 to-amber-500",
      glow: "shadow-sm",
    },
    {
      label: "Total Commits (30d)",
      value: `${stats?.totalCommits ?? 0}`,
      status: "High Output",
      icon: <Target className="w-4 h-4 text-cyan-400" />,
      pct: stats ? Math.min(100, Math.round(((stats.totalCommits || 0) / 150) * 100)) : 0,
      color: "from-cyan-500 to-blue-500",
      glow: "shadow-sm",
    },
    {
      label: "Active Repositories",
      value: `${stats?.repoActivity?.length ?? 0} / ${stats?.repoCount ?? 0}`,
      status: "Optimal",
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      pct: stats && stats.repoCount ? Math.round(((stats.repoActivity?.length || 0) / stats.repoCount) * 100) : 0,
      color: "from-purple-500 to-pink-500",
      glow: "shadow-sm",
    },
    {
      label: "Weekly Momentum",
      value: `${stats?.weekCommits ?? 0} commits`,
      status: "On Track",
      icon: <AlertTriangle className="w-4 h-4 text-emerald-400" />,
      pct: stats ? Math.min(100, Math.round(((stats.weekCommits || 0) / 25) * 100)) : 0,
      color: "from-emerald-500 to-teal-400",
      glow: "shadow-sm",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Productivity</h1>
        <p className="text-sm text-muted">Track your coding efficiency from real GitHub data</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2"><Zap className="w-5 h-5 text-accent" /></div>
          <div className="text-2xl font-bold">{stats ? focusScore : "--"}</div>
          <p className="text-xs text-muted">Focus Score</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2"><Flame className="w-5 h-5 text-orange-500" /></div>
          <div className="text-2xl font-bold">{consistency}%</div>
          <p className="text-xs text-muted">Consistency</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2"><Brain className="w-5 h-5 text-purple-500" /></div>
          <div className="text-2xl font-bold">{stats?.totalCommits ?? "--"}</div>
          <p className="text-xs text-muted">Total Commits (30d)</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2"><Calendar className="w-5 h-5 text-green-500" /></div>
          <div className="text-2xl font-bold">{stats?.weekCommits ?? "--"}</div>
          <p className="text-xs text-muted">This Week</p>
        </div>
      </div>

      {/* High-end Contribution Overview Heatmap with Days on Left & Months on Top */}
      <ContributionHeatmapFull
        dailyData={stats?.dailyArray365}
        totalCommits={stats?.totalCommits}
        totalActiveDays={stats?.totalActiveDays}
        maxStreak={stats?.bestStreak}
        currentStreak={stats?.streak}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Key Metrics Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Key Metrics Overview
            </h2>
            <span className="text-xs text-muted bg-background border border-border px-2.5 py-1 rounded-full font-medium">
              Real-time Analytics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {keyMetricsList.map((item) => (
              <div
                key={item.label}
                className="bg-background/60 border border-border/80 rounded-xl p-4 hover:border-accent/40 transition-all duration-200 hover:shadow-md group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-card border border-border/60">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-foreground/80">
                    {item.status}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-muted font-medium">{item.label}</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{item.value}</p>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-muted mb-1 font-medium">
                    <span>Target Progress</span>
                    <span className="text-foreground font-semibold">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-card/80 border border-border/40 rounded-full h-2 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} ${item.glow} transition-all duration-500`}
                      style={{ width: `${Math.max(item.pct, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-semibold text-foreground">Achievements & Milestones</h2>
            </div>
            <span className="text-xs text-muted">
              {(stats?.streak ?? 0) >= 1 ? "In Progress" : "Locked"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {[
              { title: "Streak Starter", desc: `${Math.max(stats?.streak ?? 0, 1)} day streak`, icon: <Trophy className="w-4 h-4" />, earned: (stats?.streak ?? 0) >= 1 },
              { title: "Consistent", desc: `${stats?.totalCommits ?? 0} total commits`, icon: <Trophy className="w-4 h-4" />, earned: (stats?.totalCommits ?? 0) >= 10 },
              { title: "Multi-Repo", desc: `${stats?.repoActivity?.length ?? 0} active repos`, icon: <Trophy className="w-4 h-4" />, earned: (stats?.repoActivity?.length ?? 0) >= 2 },
              { title: "Weekly Warrior", desc: `${stats?.weekCommits ?? 0} weekly commits`, icon: <Trophy className="w-4 h-4" />, earned: (stats?.weekCommits ?? 0) >= 5 },
            ].map((a) => (
              <div key={a.title} className={`border rounded-xl p-4 text-center transition-all ${a.earned ? "bg-accent/5 border-accent/30 shadow-sm" : "bg-card/40 border-border/40 opacity-50"}`}>
                <div className={`flex justify-center mb-1.5 ${a.earned ? "text-yellow-400" : "text-muted"}`}>{a.icon}</div>
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted mt-0.5">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
