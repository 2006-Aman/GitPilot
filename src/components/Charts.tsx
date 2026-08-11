"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContributionHeatmapFull from "@/components/ContributionHeatmapFull";
import { useDashboard } from "@/context/DashboardContext";
import { BookOpen, Code2, Cpu, ExternalLink, Flame, Sparkles, Trophy } from "lucide-react";

type Stats = {
  totalCommits: number;
  weekCommits: number;
  streak: number;
  bestStreak?: number;
  totalActiveDays?: number;
  languages: { name: string; count: number }[];
  repoActivity: { name: string; commits: number }[];
  weeksData: number[];
  monthsData: number[];
  dailyArray: number[];
  dailyArray365?: { date: string; count: number }[];
  heatmapGrid: number[][];
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ContributionHeatmap({ stats }: { stats: Stats }) {
  return (
    <ContributionHeatmapFull
      dailyData={stats.dailyArray365}
      totalCommits={stats.totalCommits}
      totalActiveDays={stats.totalActiveDays}
      maxStreak={stats.bestStreak}
      currentStreak={stats.streak}
    />
  );
}

// 🍩 Interactive SVG Donut / Pie Chart for Monthly Progress
function MonthlyPieChart({ stats }: { stats: Stats }) {
  const data = stats.monthsData || new Array(12).fill(0);
  const total = data.reduce((a, b) => a + b, 0) || 1;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const sliceColors = [
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0284c7", "#3b82f6",
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
  ];

  let cumulativePercent = 0;
  const slices = data.map((count, i) => {
    const percent = count / total;
    const startAngle = cumulativePercent * 360;
    cumulativePercent += percent;
    const endAngle = cumulativePercent * 360;
    return {
      month: monthLabels[i],
      count,
      percent: Math.round(percent * 100),
      color: sliceColors[i % sliceColors.length],
      startAngle,
      endAngle,
    };
  });

  const getSlicePath = (startAngle: number, endAngle: number) => {
    if (endAngle - startAngle >= 359.9) {
      return "M 100 20 A 80 80 0 1 1 99.99 20 Z";
    }
    const rad = (angle: number) => ((angle - 90) * Math.PI) / 180;
    const x1 = 100 + 80 * Math.cos(rad(startAngle));
    const y1 = 100 + 80 * Math.sin(rad(startAngle));
    const x2 = 100 + 80 * Math.cos(rad(endAngle));
    const y2 = 100 + 80 * Math.sin(rad(endAngle));
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-md dark:shadow-xl dark:shadow-black/20 relative overflow-hidden flex flex-col justify-between group hover:border-accent/30 transition-all duration-300">
      {/* Ambient Soft Glow & Dot Grid */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-accent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/10 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(100,100,100,0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Monthly Breakdown (Pie Chart)</h3>
          <p className="text-xs text-muted mt-0.5 font-medium">Commit proportion across 12 months</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
          {total} Total
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut / Pie */}
        <div className="relative w-44 h-44 shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            {slices.map((slice, i) => {
              if (slice.count === 0) return null;
              const isHovered = hoveredIdx === i;
              return (
                <path
                  key={i}
                  d={getSlicePath(slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    transform: isHovered ? "scale(1.04)" : "scale(1)",
                    transformOrigin: "100px 100px",
                    opacity: hoveredIdx === null || isHovered ? 1 : 0.4,
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
            {/* Center Hole for Donut */}
            <circle cx="100" cy="100" r="54" className="fill-card" />
          </svg>

          {/* Center Summary Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
            <span className="text-xs text-muted font-medium">
              {activeSlice ? activeSlice.month : "Total"}
            </span>
            <span className="text-lg font-bold text-foreground">
              {activeSlice ? `${activeSlice.count}` : total}
            </span>
            <span className="text-[10px] text-accent font-semibold">
              {activeSlice ? `${activeSlice.percent}%` : "Commits"}
            </span>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 flex-1 w-full text-xs max-h-48 overflow-y-auto pr-1">
          {slices.map((slice, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                hoveredIdx === i ? "bg-accent/10 border border-accent/20" : "hover:bg-border/30"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: slice.color }} />
                <span className="font-medium truncate text-foreground">{slice.month}</span>
              </div>
              <span className="text-muted font-semibold ml-1">{slice.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ⚡ Speedometer Velocity Gauge & 8-Week Cadence for Weekly Momentum
function WeeklyMomentumMeter({ stats }: { stats: Stats }) {
  const weeksData = stats.weeksData || [0, 0, 0, 0, 0, 0, 0, 0];
  const thisWeek = stats.weekCommits || 0;
  const maxW = Math.max(...weeksData, 1);
  const weekLabels = ["8w", "7w", "6w", "5w", "4w", "3w", "Last", "This"];
  const targetGoal = 25;
  const pct = Math.min(100, Math.round((thisWeek / targetGoal) * 100));

  const r = 70;
  const c = Math.PI * r;
  const strokeDashoffset = c - (pct / 100) * c;

  const statusLabel =
    pct >= 90 ? "High Velocity 🚀" : pct >= 50 ? "Optimal Cadence ⚡" : "Building Momentum 🌱";

  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-md dark:shadow-xl dark:shadow-black/20 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300">
      {/* Ambient Soft Glow & Dot Grid */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(100,100,100,0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-foreground">Weekly Momentum</h3>
          <p className="text-xs text-muted mt-0.5 font-medium">Velocity speed gauge & 8-week cadence</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {statusLabel}
        </span>
      </div>

      {/* Speedometer Semi-Circle Gauge */}
      <div className="flex flex-col items-center justify-center my-2 relative">
        <div className="relative w-56 h-28 overflow-hidden flex justify-center items-end">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* Background Arc */}
            <path
              d="M 20 95 A 70 70 0 0 1 180 95"
              fill="none"
              stroke="currentColor"
              className="text-muted/20"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Gradient Arc Fill */}
            <path
              d="M 20 95 A 70 70 0 0 1 180 95"
              fill="none"
              stroke="url(#speedoGrad)"
              strokeWidth="14"
              strokeDasharray={c}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="speedoGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Readout Text */}
          <div className="absolute bottom-1 flex flex-col items-center text-center">
            <span className="text-2xl font-extrabold text-foreground">{thisWeek}</span>
            <span className="text-[11px] font-semibold text-muted">Commits / Week</span>
          </div>
        </div>

        <div className="flex justify-between w-full max-w-[220px] text-[10px] text-muted font-medium px-2 mt-1">
          <span>0 Goal</span>
          <span>{pct}% Target ({targetGoal})</span>
        </div>
      </div>

      {/* 8-Week Cadence Pills */}
      <div className="pt-2 border-t border-border/40">
        <div className="flex justify-between text-[11px] text-muted mb-1.5 font-medium">
          <span>8-Week Cadence</span>
          <span className="text-foreground font-semibold">Peak: {maxW} commits</span>
        </div>

        <div className="grid grid-cols-8 gap-1.5">
          {weeksData.map((count, i) => {
            const isCurrent = i === weeksData.length - 1;
            const level = count === 0 ? "bg-muted/15 text-muted" : count < 5 ? "bg-emerald-900/60 dark:bg-emerald-950/80 text-emerald-400" : count < 15 ? "bg-emerald-600 dark:bg-emerald-700/80 text-white" : "bg-emerald-500 text-black font-bold";
            return (
              <div
                key={i}
                title={`${weekLabels[i]}: ${count} commits`}
                className={`flex flex-col items-center justify-between p-1.5 rounded-lg border border-border/30 transition-all ${
                  isCurrent ? "border-accent ring-1 ring-accent/40" : ""
                }`}
              >
                <span className="text-[9px] text-muted font-medium">{weekLabels[i]}</span>
                <span className={`text-[10px] font-bold mt-1 px-1 py-0.5 rounded ${level}`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 🪐 BRAND NEW ORBITAL SATELLITE GALAXY CLUSTER FOR ACTIVE REPOSITORIES
function RepoActivity({ stats }: { stats: Stats }) {
  const { repos: allRepos } = useDashboard();
  const router = useRouter();
  const allActiveRepos = (stats.repoActivity && stats.repoActivity.length > 0)
    ? stats.repoActivity
    : allRepos.map((r) => ({ name: r.name, commits: 0 }));
  const totalActiveCount = allActiveRepos.length || allRepos.length;
  const repos = allActiveRepos.slice(0, 5);
  const totalCommits30 = repos.reduce((a, b) => a + b.commits, 0) || 1;
  const [hoveredRepo, setHoveredRepo] = useState<string | null>(null);

  const handleRepoClick = (repoName: string) => {
    const fullRepo = allRepos.find(
      (item) => item.name === repoName || item.fullName.endsWith(`/${repoName}`)
    );
    if (fullRepo) {
      router.push(`/dashboard/repo/${fullRepo.fullName}`);
    } else {
      router.push("/dashboard/repositories");
    }
  };

  const colors = [
    { bg: "#f59e0b", border: "#fbbf24" },
    { bg: "#94a3b8", border: "#cbd5e1" },
    { bg: "#d97706", border: "#f59e0b" },
    { bg: "#06b6d4", border: "#22d3ee" },
    { bg: "#a855f7", border: "#c084fc" },
  ];

  const centerX = 220;
  const centerY = 130;
  const radiusX = 150;
  const radiusY = 90;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-md dark:shadow-xl dark:shadow-black/20 relative overflow-hidden flex flex-col justify-between group hover:border-accent/30 transition-all duration-300">
      {/* Ambient Soft Glow & Dot Grid */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(100,100,100,0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            Active Repos Galaxy Cluster
          </h3>
          <p className="text-xs text-muted mt-0.5 font-medium">Click any repo to open repository details</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
          {totalActiveCount} Active Repos
        </span>
      </div>

      {repos.length === 0 ? (
        <p className="text-xs text-muted py-12 text-center">No recent repository activity found.</p>
      ) : (
        <div className="relative w-full h-[240px] flex items-center justify-center">
          <svg viewBox="0 0 440 260" className="w-full h-full">
            {/* Concentric Orbital Rings */}
            <ellipse cx={centerX} cy={centerY} rx={radiusX * 0.75} ry={radiusY * 0.75} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="1.5" strokeDasharray="3 3" />
            <ellipse cx={centerX} cy={centerY} rx={radiusX * 0.88} ry={radiusY * 0.88} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="1.5" strokeDasharray="4 4" />
            <ellipse cx={centerX} cy={centerY} rx={radiusX} ry={radiusY} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="1.5" strokeDasharray="5 5" />

            {/* Connecting Rays from Central Sun to Repos */}
            {repos.map((r, i) => {
              const angle = (i / repos.length) * 2 * Math.PI - Math.PI / 4;
              const scale = 0.75 + (i / Math.max(repos.length - 1, 1)) * 0.25;
              const x = centerX + radiusX * scale * Math.cos(angle);
              const y = centerY + radiusY * scale * Math.sin(angle);
              const isHovered = hoveredRepo === r.name;
              const color = colors[i % colors.length];

              return (
                <g key={r.name} onClick={() => handleRepoClick(r.name)} className="cursor-pointer">
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={color.bg}
                    strokeWidth={isHovered ? "2.5" : "1.2"}
                    opacity={hoveredRepo === null || isHovered ? (isHovered ? 0.9 : 0.4) : 0.15}
                    strokeDasharray={isHovered ? "none" : "3 3"}
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "16" : "11"}
                    fill={color.bg}
                    fillOpacity="0.25"
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "8" : "6"}
                    fill={color.bg}
                    stroke={color.border}
                    strokeWidth="2"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredRepo(r.name)}
                    onMouseLeave={() => setHoveredRepo(null)}
                  />
                </g>
              );
            })}

            {/* Central Sun Node */}
            <g onClick={() => router.push("/dashboard/repositories")} className="cursor-pointer">
              <circle cx={centerX} cy={centerY} r="38" className="fill-background stroke-accent/40 hover:stroke-accent transition-colors" strokeWidth="2" />
              <circle cx={centerX} cy={centerY} r="30" className="fill-accent/10" />
              <text x={centerX} y={centerY - 4} textAnchor="middle" className="fill-foreground font-extrabold text-[11px]">Repo Hub</text>
              <text x={centerX} y={centerY + 10} textAnchor="middle" className="fill-accent font-semibold text-[9px]">{totalActiveCount} Repos</text>
            </g>
          </svg>

          {/* HTML Overlay Orbital Planet Glass Cards */}
          <div className="absolute inset-0 pointer-events-none">
            {repos.map((r, i) => {
              const angle = (i / repos.length) * 2 * Math.PI - Math.PI / 4;
              const scale = 0.75 + (i / Math.max(repos.length - 1, 1)) * 0.25;
              const xPct = ((centerX + radiusX * scale * Math.cos(angle)) / 440) * 100;
              const yPct = ((centerY + radiusY * scale * Math.sin(angle)) / 260) * 100;
              const isHovered = hoveredRepo === r.name;
              const color = colors[i % colors.length];
              const share = Math.round((r.commits / totalCommits30) * 100);

              return (
                <div
                  key={r.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-200"
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  onMouseEnter={() => setHoveredRepo(r.name)}
                  onMouseLeave={() => setHoveredRepo(null)}
                  onClick={() => handleRepoClick(r.name)}
                >
                  <div
                    className={`bg-card/95 backdrop-blur-md border rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all duration-200 ${
                      isHovered
                        ? "scale-110 border-accent shadow-lg ring-2 ring-accent/30 z-30"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color.bg }} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-foreground max-w-[100px] truncate">{r.name}</span>
                        <span className="text-[10px] font-extrabold text-accent bg-accent/10 px-1 py-0.2 rounded">
                          #{i + 1}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted hover:text-accent shrink-0 ml-0.5" />
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-muted font-medium">
                        <span className="text-foreground font-semibold">{r.commits} commits</span>
                        <span>({share}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 20+ Active Repos Footer Bar */}
      {totalActiveCount > 5 && (
        <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between text-xs">
          <span className="text-muted font-medium">
            +<span className="text-accent font-bold">{totalActiveCount - 5}</span> more active repositories
          </span>
          <button
            onClick={() => router.push("/dashboard/repositories")}
            className="text-accent hover:underline font-bold flex items-center gap-1 group/link"
          >
            View All {totalActiveCount} Repos
            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}

// 🧠 INTERACTIVE MIND MAP NODE NETWORK FOR LANGUAGES TECH MATRIX
function LanguageDistribution({ stats }: { stats: Stats }) {
  const total = stats.languages?.reduce((s, l) => s + l.count, 0) || 1;
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);

  const colors: Record<string, string> = {
    TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572a5", Go: "#00add8",
    Rust: "#dea584", Java: "#b07219", Kotlin: "#a97bff", Swift: "#f05138",
    Ruby: "#cc342d", PHP: "#4f5d95", C: "#555555", "C++": "#f34b7d",
    "C#": "#178600", Shell: "#89e051", HTML: "#e34c26", CSS: "#563d7c",
  };

  const langs = (stats.languages || []).slice(0, 6).map((l) => ({
    name: l.name,
    count: l.count,
    pct: Math.round((l.count / total) * 100),
    color: colors[l.name] || "#8b8b8b",
  }));

  const centerX = 220;
  const centerY = 130;
  const radiusX = 145;
  const radiusY = 85;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-md dark:shadow-xl dark:shadow-black/20 relative overflow-hidden flex flex-col justify-between group hover:border-accent/30 transition-all duration-300">
      {/* Ambient Soft Glow & Dot Grid */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(100,100,100,0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent" />
            Tech Stack Mind Map
          </h3>
          <p className="text-xs text-muted mt-0.5 font-medium">Interactive language node network</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
          {langs.length} Tech Nodes
        </span>
      </div>

      {langs.length === 0 ? (
        <p className="text-xs text-muted py-12 text-center">No language data available.</p>
      ) : (
        <div className="relative w-full h-[250px] flex items-center justify-center">
          <svg viewBox="0 0 440 260" className="w-full h-full">
            <defs>
              <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Branch Lines to Nodes */}
            {langs.map((l, i) => {
              const angle = (i / langs.length) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + radiusX * Math.cos(angle);
              const y = centerY + radiusY * Math.sin(angle);
              const isHovered = hoveredLang === l.name;

              const cpX = (centerX + x) / 2;
              const cpY = (centerY + y) / 2;

              return (
                <g key={l.name}>
                  <path
                    d={`M ${centerX} ${centerY} Q ${cpX} ${cpY} ${x} ${y}`}
                    fill="none"
                    stroke={l.color}
                    strokeWidth={isHovered ? "3.5" : "1.8"}
                    strokeDasharray={isHovered ? "none" : "4 3"}
                    opacity={hoveredLang === null || isHovered ? (isHovered ? 1 : 0.6) : 0.25}
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "14" : "10"}
                    fill={l.color}
                    fillOpacity="0.2"
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "7" : "5"}
                    fill={l.color}
                    filter={isHovered ? "url(#nodeGlow)" : undefined}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredLang(l.name)}
                    onMouseLeave={() => setHoveredLang(null)}
                  />
                </g>
              );
            })}

            {/* Central Engine Node */}
            <g className="cursor-pointer">
              <circle
                cx={centerX}
                cy={centerY}
                r="36"
                className="fill-background stroke-accent/40"
                strokeWidth="2"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r="30"
                className="fill-accent/10"
              />
              <text
                x={centerX}
                y={centerY - 4}
                textAnchor="middle"
                className="fill-foreground font-bold text-[11px]"
              >
                Codebase
              </text>
              <text
                x={centerX}
                y={centerY + 10}
                textAnchor="middle"
                className="fill-accent font-semibold text-[9px]"
              >
                Engine
              </text>
            </g>
          </svg>

          {/* Floating Mind Map Glass Node Cards */}
          <div className="absolute inset-0 pointer-events-none">
            {langs.map((l, i) => {
              const angle = (i / langs.length) * 2 * Math.PI - Math.PI / 2;
              const xPct = ((centerX + radiusX * Math.cos(angle)) / 440) * 100;
              const yPct = ((centerY + radiusY * Math.sin(angle)) / 260) * 100;
              const isHovered = hoveredLang === l.name;

              return (
                <div
                  key={l.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-200"
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  onMouseEnter={() => setHoveredLang(l.name)}
                  onMouseLeave={() => setHoveredLang(null)}
                >
                  <div
                    className={`bg-card/95 backdrop-blur-md border rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all duration-200 ${
                      isHovered
                        ? "scale-110 border-accent shadow-lg ring-2 ring-accent/30 z-30"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-foreground">{l.name}</span>
                        <span className="text-[10px] font-extrabold text-accent bg-accent/10 px-1 py-0.2 rounded">
                          {l.pct}%
                        </span>
                      </div>
                      <span className="text-[9px] text-muted font-medium">{l.count} repo{l.count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Charts() {
  const [activeTab, setActiveTab] = useState("overview");
  const { stats } = useDashboard();

  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
            <div className="h-4 bg-border rounded w-1/3 mb-4" />
            <div className="h-24 bg-border rounded" />
          </div>
        ))}
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <Sparkles className="w-4 h-4" /> },
    { id: "contribution", label: "Contribution Heatmap", icon: <Flame className="w-4 h-4" /> },
    { id: "languages", label: "Languages", icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-card/30 p-2 border border-border/50 rounded-2xl w-fit backdrop-blur-md">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl transition-all font-semibold ${
              activeTab === t.id
                ? "bg-gradient-to-r from-accent to-accent-hover text-black shadow-lg shadow-accent/20 scale-105 ring-2 ring-accent/30"
                : "bg-background/50 border border-border text-muted hover:text-foreground hover:bg-card hover:border-border hover:shadow-md"
            }`}
          >
            <span className={activeTab === t.id ? "text-black" : "text-muted"}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-4">
          <ContributionHeatmap stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RepoActivity stats={stats} />
            <WeeklyMomentumMeter stats={stats} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MonthlyPieChart stats={stats} />
            <LanguageDistribution stats={stats} />
          </div>
        </div>
      )}

      {activeTab === "contribution" && (
        <div className="space-y-4">
          <ContributionHeatmap stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeeklyMomentumMeter stats={stats} />
            <MonthlyPieChart stats={stats} />
          </div>
        </div>
      )}

      {activeTab === "languages" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LanguageDistribution stats={stats} />
          <RepoActivity stats={stats} />
        </div>
      )}
    </div>
  );
}
