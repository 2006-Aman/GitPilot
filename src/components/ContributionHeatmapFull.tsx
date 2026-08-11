"use client";

import { useState, useMemo } from "react";
import { Info, ChevronDown } from "lucide-react";

type DayItem = {
  date: string;
  count: number;
};

type Props = {
  dailyData?: DayItem[];
  totalCommits?: number;
  totalActiveDays?: number;
  maxStreak?: number;
  currentStreak?: number;
};

export default function ContributionHeatmapFull({
  dailyData = [],
  totalCommits = 0,
  totalActiveDays = 0,
  maxStreak = 0,
  currentStreak = 0,
}: Props) {
  const [timeframe, setTimeframe] = useState<"1year" | "6months" | "90days">("1year");
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const dataMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of dailyData) {
      map[item.date] = item.count;
    }
    return map;
  }, [dailyData]);

  const numWeeks = timeframe === "1year" ? 52 : timeframe === "6months" ? 26 : 13;

  const { weeks, monthLabels, totalFilterCommits, activeDaysFilter } = useMemo(() => {
    const today = new Date();
    const end = new Date(today);
    const dayOfWeek = end.getDay(); // 0 = Sun, 6 = Sat
    end.setDate(end.getDate() + (6 - dayOfWeek));

    const totalDays = numWeeks * 7;
    const start = new Date(end);
    start.setDate(start.getDate() - (totalDays - 1));

    const weeksArr: { date: string; dateObj: Date; count: number }[][] = [];
    const monthHeader: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    let sumCommits = 0;
    let activeDays = 0;

    let curr = new Date(start);
    for (let w = 0; w < numWeeks; w++) {
      const weekDays: { date: string; dateObj: Date; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateKey = curr.toISOString().split("T")[0];
        const count = dataMap[dateKey] || 0;
        sumCommits += count;
        if (count > 0) activeDays++;

        weekDays.push({
          date: dateKey,
          dateObj: new Date(curr),
          count,
        });

        if (d === 0) {
          const m = curr.getMonth();
          if (m !== lastMonth) {
            monthHeader.push({
              label: curr.toLocaleDateString("en-US", { month: "short" }),
              weekIndex: w,
            });
            lastMonth = m;
          }
        }

        curr.setDate(curr.getDate() + 1);
      }
      weeksArr.push(weekDays);
    }

    return {
      weeks: weeksArr,
      monthLabels: monthHeader,
      totalFilterCommits: sumCommits,
      activeDaysFilter: activeDays,
    };
  }, [dataMap, numWeeks]);

  const maxVal = useMemo(() => {
    let m = 1;
    for (const w of weeks) {
      for (const d of w) {
        if (d.count > m) m = d.count;
      }
    }
    return m;
  }, [weeks]);

  const getCellStyle = (count: number) => {
    if (count === 0) return { backgroundColor: "var(--border)", opacity: 0.5 };
    const ratio = count / maxVal;
    if (ratio < 0.25) return { backgroundColor: "#0e4429" };
    if (ratio < 0.5) return { backgroundColor: "#006d32" };
    if (ratio < 0.75) return { backgroundColor: "#26a641" };
    return {
      backgroundColor: "#39d353",
      boxShadow: "0 0 3px rgba(57, 211, 83, 0.3)",
    };
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-md dark:shadow-xl dark:shadow-black/20 relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
      {/* Ambient Soft Glow & Dot Grid */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-accent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/10 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(100,100,100,0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold text-foreground">
            {totalFilterCommits || totalCommits}
          </span>
          <span className="text-sm md:text-base font-medium text-muted">
            commits in the past {timeframe === "1year" ? "one year" : timeframe === "6months" ? "6 months" : "90 days"}
          </span>
          <Info className="w-4 h-4 text-muted hover:text-accent transition-colors cursor-pointer" />
        </div>

        <div className="flex items-center gap-4 text-xs md:text-sm flex-wrap">
          <div className="text-muted">
            Total active days:{" "}
            <span className="font-semibold text-accent">{activeDaysFilter || totalActiveDays}</span>
          </div>
          <div className="text-muted">
            Max streak:{" "}
            <span className="font-semibold text-foreground">{maxStreak}</span>
          </div>
          <div className="text-muted">
            Current:{" "}
            <span className="font-semibold text-green-500">{currentStreak}</span>
          </div>

          {/* Custom Timeframe Dropdown */}
          <div className="relative group/dropdown">
            <button
              className="flex items-center justify-between gap-2 bg-background border border-border text-foreground text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-accent cursor-pointer min-w-[140px] hover:border-accent/30 transition-colors"
            >
              <span className="truncate">
                {timeframe === "1year" ? "Current (1 Year)" : timeframe === "6months" ? "Last 6 Months" : "Last 90 Days"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted opacity-70 group-hover/dropdown:text-accent transition-colors" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-full min-w-[140px] bg-[#12151B]/95 backdrop-blur-xl border border-[#232733] rounded-xl shadow-2xl z-50 py-1 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all ring-1 ring-white/5 transform translate-y-1 group-hover/dropdown:translate-y-0">
              {[
                { val: "1year", label: "Current (1 Year)" },
                { val: "6months", label: "Last 6 Months" },
                { val: "90days", label: "Last 90 Days" }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setTimeframe(opt.val as any)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                    timeframe === opt.val ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-[#232733]/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Section */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-block min-w-fit">
          {/* Top Month Labels */}
          <div className="flex items-center text-[11px] text-muted mb-1.5 pl-8">
            <div className="relative h-4 w-full">
              {monthLabels.map((m, idx) => {
                // 14px cell + 4px gap = 18px per week index
                const leftPx = m.weekIndex * 18;
                return (
                  <span
                    key={idx}
                    className="absolute font-medium"
                    style={{ left: `${leftPx}px` }}
                  >
                    {m.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Grid Rows (Days) x Columns (Weeks) */}
          <div className="flex gap-2 items-start">
            {/* Left Side Day Labels */}
            <div className="flex flex-col gap-1 text-[10px] text-muted font-medium pr-1 select-none shrink-0">
              {dayLabels.map((d, i) => (
                <div key={i} className="h-3.5 flex items-center justify-end w-6">
                  {i % 2 === 1 ? d : ""}
                </div>
              ))}
            </div>

            {/* Week Columns */}
            <div className="flex gap-1 shrink-0">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1 shrink-0">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className="w-3.5 h-3.5 rounded-[3px] shrink-0 transition-all hover:scale-125 hover:z-20 cursor-pointer"
                      style={getCellStyle(day.count)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({
                          date: day.date,
                          count: day.count,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-150"
          style={{ left: `${hoveredDay.x}px`, top: `${hoveredDay.y}px` }}
        >
          <div className="bg-slate-900/95 border border-border text-foreground text-xs px-3 py-1.5 rounded-lg shadow-2xl backdrop-blur-md whitespace-nowrap">
            <span className="font-semibold text-accent">{hoveredDay.count}</span> commit{hoveredDay.count !== 1 ? "s" : ""} on{" "}
            <span className="text-muted">
              {new Date(hoveredDay.date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Footer Legend */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-xs text-muted">
        <div>
          <span className="text-foreground font-medium">{activeDaysFilter || totalActiveDays}</span> active days in timeframe
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[2px] bg-white/5" />
          <div className="w-3 h-3 rounded-[2px] bg-[#0e4429]" />
          <div className="w-3 h-3 rounded-[2px] bg-[#006d32]" />
          <div className="w-3 h-3 rounded-[2px] bg-[#26a641]" />
          <div className="w-3 h-3 rounded-[2px] bg-[#39d353]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
