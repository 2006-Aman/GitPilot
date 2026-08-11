"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GitPullRequest, GitMerge, Clock, MessageSquare } from "lucide-react";

type PR = {
  id: number;
  title: string;
  repo: string;
  repoFull: string;
  status: string;
  merged: string | null;
  comments: number;
  updated: string;
  author: string;
  branch: string;
  htmlUrl: string;
};

import { useDashboard } from "@/context/DashboardContext";

export default function PullRequestsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { pulls, loading } = useDashboard();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/"); return; }
  }, [authStatus, router]);

  if (authStatus === "loading") return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>;

  const filtered = filter === "all" ? pulls : pulls.filter((pr) => {
    if (filter === "open") return pr.status === "open" && !pr.merged;
    if (filter === "merged") return !!pr.merged;
    if (filter === "closed") return pr.status === "closed" && !pr.merged;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pull Requests</h1>
        <p className="text-sm text-muted">Track and manage your pull requests from GitHub</p>
      </div>

      <div className="flex gap-1.5 bg-card border border-border rounded-lg p-1 w-fit">
        {["all", "open", "merged", "closed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${filter === f ? "bg-accent text-black font-medium" : "text-muted hover:text-foreground"}`}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="p-4 animate-pulse"><div className="h-4 bg-border rounded w-3/4 mb-2" /><div className="h-3 bg-border rounded w-1/2" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted bg-card border border-border rounded-xl">
          <p>No pull requests found.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          {filtered.map((pr) => {
            const state = pr.merged ? "merged" : pr.status;
            return (
              <a key={pr.id} href={pr.htmlUrl} target="_blank" rel="noopener noreferrer" className="p-4 hover:bg-border/20 transition-colors block">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${state === "open" ? "bg-green-500/20" : state === "merged" ? "bg-purple-500/20" : "bg-red-500/20"}`}>
                    {state === "merged" ? <GitMerge className="w-4 h-4 text-purple-500" />
                      : <GitPullRequest className={`w-4 h-4 ${state === "open" ? "text-green-500" : "text-red-500"}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{pr.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${state === "open" ? "bg-green-500/20 text-green-500" : state === "merged" ? "bg-purple-500/20 text-purple-500" : "bg-red-500/20 text-red-500"}`}>{state}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted flex-wrap">
                      <span>{pr.repo}</span>
                      <span>{pr.branch}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{pr.comments}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(pr.updated).toLocaleDateString()}</span>
                      <span className="text-accent">@{pr.author}</span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
