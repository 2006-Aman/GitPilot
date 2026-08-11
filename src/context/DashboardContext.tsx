"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";

type Repo = {
  _id: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  description?: string;
  htmlUrl: string;
  homepageUrl?: string;
  language?: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  isPrivate: boolean;
  defaultBranch: string;
  deployedUrl?: string;
  deploymentStatus?: string;
  updatedAtGithub?: string;
  lastSyncedAt?: string;
};

type DashboardContextType = {
  stats: any | null;
  repos: Repo[];
  issues: any[];
  pulls: any[];
  reviews: any[];
  leaderboard: any[];
  loading: boolean;
  syncing: boolean;
  error: string;
  fetchStats: (force?: boolean) => Promise<void>;
  fetchRepos: (sync?: boolean) => Promise<void>;
  fetchIssues: () => Promise<void>;
  fetchPulls: () => Promise<void>;
  fetchReviews: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  refreshAll: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [stats, setStats] = useState<any | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [pulls, setPulls] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async (force = false) => {
    try {
      const url = force ? "/api/stats?refresh=true" : "/api/stats";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
  };

  const fetchRepos = async (sync = false) => {
    setError("");
    if (sync) setSyncing(true);
    try {
      if (sync) {
        const syncRes = await fetch("/api/repos/sync", { method: "POST" });
        if (!syncRes.ok) {
          const errData = await syncRes.json();
          throw new Error(errData.error || "Sync failed");
        }
      }
      const res = await fetch("/api/repos/sync", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch repos");
      const data = await res.json();
      if (Array.isArray(data) && data.length === 0 && !sync) {
        fetchRepos(true);
        return;
      }
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSyncing(false);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues");
      if (res.ok) setIssues(await res.json());
    } catch {}
  };

  const fetchPulls = async () => {
    try {
      const res = await fetch("/api/pulls");
      if (res.ok) setPulls(await res.json());
    } catch {}
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) setReviews(await res.json());
    } catch {}
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) setLeaderboard(await res.json());
    } catch {}
  };

  const refreshAll = async () => {
    setSyncing(true);
    await Promise.all([
      fetchRepos(true),
      fetchStats(true),
      fetchIssues(),
      fetchPulls(),
      fetchReviews(),
      fetchLeaderboard(),
    ]);
    setSyncing(false);
  };

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      Promise.all([
        fetchStats(),
        fetchRepos(false),
        fetchIssues(),
        fetchPulls(),
      ]).finally(() => setLoading(false));

      // Removed the 15-second aggressive background polling to prevent GitHub API rate limits.
      // Data will only refresh on page load or when the user manually clicks "Sync".
    }
  }, [status]);

  return (
    <DashboardContext.Provider
      value={{
        stats,
        repos,
        issues,
        pulls,
        reviews,
        leaderboard,
        loading,
        syncing,
        error,
        fetchStats,
        fetchRepos,
        fetchIssues,
        fetchPulls,
        fetchReviews,
        fetchLeaderboard,
        refreshAll,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
