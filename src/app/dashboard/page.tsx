"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertCircle } from "lucide-react";
import DashboardHero from "@/components/DashboardHero";
import KpiCards from "@/components/KpiCards";
import Charts from "@/components/Charts";
import RepoTable from "@/components/RepoTable";
import { useDashboard } from "@/context/DashboardContext";

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const { repos, loading, syncing, error, refreshAll, fetchRepos } = useDashboard();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <DashboardHero />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Performance Metrics</h2>
        <button
          onClick={() => refreshAll()}
          disabled={syncing}
          className="flex items-center gap-2 text-xs text-muted hover:text-foreground bg-card border border-border px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Refresh Data"}
        </button>
      </div>
      <KpiCards />

      <Charts />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Repositories</h2>
      </div>

      {error && (
        <div className="bg-card border border-danger/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border rounded w-1/3" />
            <div className="h-12 bg-border rounded" />
            <div className="h-12 bg-border rounded" />
            <div className="h-12 bg-border rounded" />
          </div>
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center py-16 text-muted bg-card border border-border rounded-xl">
          <p>No repositories found.</p>
          <button
            onClick={() => fetchRepos(true)}
            className="mt-3 text-accent text-sm hover:underline"
          >
            Sync your GitHub repos
          </button>
        </div>
      ) : (
        <RepoTable repos={repos} />
      )}
    </div>
  );
}
