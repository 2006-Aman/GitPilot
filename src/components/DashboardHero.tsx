"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Flame, TrendingUp, BookOpen, GitPullRequest, GitMerge, Users } from "lucide-react";

type Stats = {
  totalCommits: number;
  weekCommits: number;
  totalStars: number;
  totalForks: number;
  streak: number;
  bestStreak: number;
  repoCount: number;
  followers: number;
};

import { useDashboard } from "@/context/DashboardContext";

export default function DashboardHero() {
  const { data: session } = useSession();
  const { stats } = useDashboard();

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}, {session?.user?.name?.split(" ")[0] || "Developer"}
        </h1>
        <p className="text-muted text-sm mt-1">Here&apos;s your GitHub performance today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="font-bold text-lg">{stats?.streak ?? 0} day streak</span>
              </div>
              <span className="text-xs text-muted bg-accent/10 px-3 py-1 rounded-full">
                Best streak: {stats?.bestStreak ?? 0} days
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 52 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-8 rounded-sm transition-all"
                  style={{
                    background: stats && i < stats.streak
                      ? `hsl(${120 + (i / 52) * 120}, 70%, ${30 + (i / 52) * 30}%)`
                      : "var(--border)",
                    opacity: stats && i < stats.streak ? 0.4 + (i / 52) * 0.6 : 0.3,
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-muted mt-2">52-week contribution streak tracker</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">AI Productivity Score</span>
          </div>
          <div className="text-4xl font-bold text-accent mb-2">
            {stats ? Math.min(100, Math.round((stats.weekCommits / Math.max(stats.repoCount, 1)) * 20 + 50)) : "--"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
              {stats?.weekCommits ?? 0} commits this week
            </span>
          </div>
          <div className="mt-4 bg-border/50 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{ width: `${stats ? Math.min(100, Math.round((stats.weekCommits / Math.max(stats.repoCount, 1)) * 20 + 50)) : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
