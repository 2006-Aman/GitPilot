"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, TrendingDown, Lightbulb, Clock, Star, BarChart3, Activity, Brain, ChevronRight, RefreshCw } from "lucide-react";

type InsightPayload = {
  overallHealth: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  bestDay: { name: string; avgCommits: number };
  worstDay: { name: string; avgCommits: number };
  weeklyTrend: string;
  topRepo: string | null;
  topRepos: string[];
  topLang: string | null;
  consistencyScore: number;
  activityScore: number;
  weeklyMomentum: number;
  activeMonths: number;
  monthlyAvg: number;
  currentMonthCommits: number;
  activeRepos: number;
  langCount: number;
};

const healthColor = (score: number) => {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
};

const healthBar = (score: number) => {
  if (score >= 80) return "bg-gradient-to-r from-green-500 to-emerald-400";
  if (score >= 60) return "bg-gradient-to-r from-yellow-500 to-orange-400";
  if (score >= 40) return "bg-gradient-to-r from-orange-500 to-red-400";
  return "bg-gradient-to-r from-red-500 to-rose-400";
};

export default function AiInsightsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [insights, setInsights] = useState<InsightPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async (refresh = false) => {
    try {
      const res = await fetch(`/api/ai/insights${refresh ? "?refresh=true" : ""}`);
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/"); return; }
    fetchInsights();
  }, [authStatus, router]);

  if (authStatus === "loading" || loading) return (
    <div className="p-6 space-y-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-border rounded w-48" />
        <div className="h-4 bg-border rounded w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-card border border-border rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-card border border-border rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-2xl ring-1 ring-accent/20">
            <Brain className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-sm text-muted">Intelligent analysis computed from your real GitHub data</p>
          </div>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchInsights(true); }}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs text-muted hover:text-foreground bg-card border border-border rounded-xl px-3 py-2 hover:border-accent/30 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Health Score */}
      <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--border)" strokeWidth="5" />
                <circle
                  cx="36" cy="36" r="30" fill="none"
                  stroke="currentColor" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${(insights?.overallHealth || 0) / 100 * 188.5} 188.5`}
                  className={healthColor(insights?.overallHealth || 0)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${healthColor(insights?.overallHealth || 0)}`}>{insights?.overallHealth || 0}</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold">Developer Health Score</p>
              <p className="text-sm text-muted">
                {insights?.overallHealth && insights.overallHealth >= 80 ? "Excellent — you're on fire!" :
                 insights?.overallHealth && insights.overallHealth >= 60 ? "Good — steady progress" :
                 insights?.overallHealth && insights.overallHealth >= 40 ? "Fair — room for improvement" :
                 "Needs attention — time to level up"}
              </p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Consistency", value: insights?.consistencyScore || 0, color: "bg-blue-500" },
              { label: "Activity", value: insights?.activityScore || 0, color: "bg-green-500" },
              { label: "Momentum", value: insights?.weeklyMomentum || 0, color: "bg-purple-500" },
            ].map((m) => (
              <div key={m.label} className="bg-background/60 border border-border/50 rounded-xl p-3">
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider">{m.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-border/30 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${m.color} transition-all duration-700`} style={{ width: `${m.value}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-7 text-right">{m.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Best Day", value: insights?.bestDay?.name || "--", sub: `${insights?.bestDay?.avgCommits || 0} avg commits`, icon: <Star className="w-4 h-4" />, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Weekly Trend", value: (insights?.weeklyTrend || "N/A").charAt(0).toUpperCase() + (insights?.weeklyTrend || "").slice(1), sub: "vs previous period", icon: insights?.weeklyTrend === "increasing" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />, color: insights?.weeklyTrend === "increasing" ? "text-green-400" : insights?.weeklyTrend === "decreasing" ? "text-red-400" : "text-yellow-400", bg: "bg-border/30" },
          { label: "Active Months", value: `${insights?.activeMonths || 0}/12`, sub: `Avg ${insights?.monthlyAvg || 0} commits/month`, icon: <BarChart3 className="w-4 h-4" />, color: "text-accent", bg: "bg-accent/10" },
          { label: "Top Language", value: insights?.topLang || "N/A", sub: `${insights?.langCount || 0} language(s) total`, icon: <Activity className="w-4 h-4" />, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        ].map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4 hover:border-accent/20 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>{card.icon}</div>
            </div>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-muted mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Strengths, Weaknesses, Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Strengths */}
        <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-green-500/20 transition-all">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-green-500/10 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center ring-1 ring-green-500/20">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Strengths</h2>
                <p className="text-[10px] text-muted">{insights?.strengths.length || 0} detected</p>
              </div>
            </div>
            <ul className="space-y-3">
              {insights?.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ChevronRight className="w-3 h-3 text-green-400" />
                  </span>
                  <span className="text-foreground/90">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Weaknesses */}
        <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/20 transition-all">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/10 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center ring-1 ring-red-500/20">
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Areas to Improve</h2>
                <p className="text-[10px] text-muted">{insights?.weaknesses.length || 0} found</p>
              </div>
            </div>
            <ul className="space-y-3">
              {insights?.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ChevronRight className="w-3 h-3 text-red-400" />
                  </span>
                  <span className="text-foreground/90">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-all">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/10 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center ring-1 ring-accent/20">
                <Lightbulb className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Recommendations</h2>
                <p className="text-[10px] text-muted">Prioritized for you</p>
              </div>
            </div>
            <ol className="space-y-3">
              {insights?.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-accent">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90">{r}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Day analysis mini section */}
      {insights?.bestDay && insights?.worstDay && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-sm">Commit Pattern Analysis</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 border border-border/50 rounded-xl p-4">
              <p className="text-xs text-muted font-medium mb-1">Most Productive Day</p>
              <p className="text-xl font-bold text-green-400">{insights.bestDay.name}</p>
              <p className="text-xs text-muted">{insights.bestDay.avgCommits} commits per active day</p>
            </div>
            <div className="bg-background/50 border border-border/50 rounded-xl p-4">
              <p className="text-xs text-muted font-medium mb-1">Least Productive Day</p>
              <p className="text-xl font-bold text-red-400">{insights.worstDay.name}</p>
              <p className="text-xs text-muted">{insights.worstDay.avgCommits} commits per active day</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
