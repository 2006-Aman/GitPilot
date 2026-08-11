"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, MessageSquare, Clock, Tag } from "lucide-react";

type Issue = {
  id: number;
  title: string;
  repo: string;
  repoFull: string;
  status: string;
  priority: string;
  comments: number;
  updated: string;
  author: string;
  labels: string[];
  htmlUrl: string;
};

import { useDashboard } from "@/context/DashboardContext";

export default function IssuesPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { issues, loading } = useDashboard();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/"); return; }
  }, [authStatus, router]);

  if (authStatus === "loading") return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>;

  const filtered = filter === "all" ? issues : issues.filter((i) => i.status === filter);
  const priorityColor = (p: string) => p === "critical" ? "text-red-500" : p === "high" ? "text-orange-500" : p === "medium" ? "text-yellow-500" : "text-green-500";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Issues</h1>
        <p className="text-sm text-muted">Track bugs and features across your repositories</p>
      </div>

      <div className="flex gap-1.5 bg-card border border-border rounded-lg p-1 w-fit">
        {["all", "open", "closed"].map((f) => (
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
          <p>No issues found.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          {filtered.map((issue) => (
            <a key={issue.id} href={issue.htmlUrl} target="_blank" rel="noopener noreferrer" className="p-4 hover:bg-border/20 transition-colors block">
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 shrink-0 ${issue.status === "open" ? "text-green-500" : "text-muted"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{issue.title}</span>
                    <span className={`text-[10px] font-medium ${priorityColor(issue.priority)}`}>{issue.priority}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted flex-wrap">
                    <span>{issue.repo}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{issue.comments}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(issue.updated).toLocaleDateString()}</span>
                    <span>@{issue.author}</span>
                    {issue.labels.length > 0 && (
                      <div className="flex gap-1">
                        {issue.labels.slice(0, 3).map((l: string) => (
                          <span key={l} className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">{l}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
