"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, MessageSquare, Code } from "lucide-react";

type Review = {
  id: number;
  prTitle: string;
  prNumber: number;
  repo: string;
  repoFull: string;
  state: string;
  author: string;
  body: string;
  submittedAt: string;
  htmlUrl: string;
};

import { useDashboard } from "@/context/DashboardContext";

export default function CodeReviewsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { reviews, loading, fetchReviews } = useDashboard();

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/"); return; }
    if (authStatus === "authenticated" && reviews.length === 0) { fetchReviews(); }
  }, [authStatus, router]);

  if (authStatus === "loading") return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>;

  const statusIcon = (s: string) => {
    if (s === "approved") return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (s === "changes_requested") return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const statusLabel = (s: string) => {
    if (s === "approved") return "Approved";
    if (s === "changes_requested") return "Changes Requested";
    if (s === "commented") return "Commented";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const approved = reviews.filter((r) => r.state === "approved").length;
  const changes = reviews.filter((r) => r.state === "changes_requested").length;
  const pending = reviews.filter((r) => r.state === "commented" || r.state === "pending").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Code Reviews</h1>
        <p className="text-sm text-muted">Reviews from your pull requests across all repositories</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className={`text-2xl font-bold ${pending > 0 ? "text-yellow-500" : "text-muted"}`}>{(reviews.length - approved - changes) || 0}</div>
          <p className="text-xs text-muted mt-1">Pending</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{approved}</div>
          <p className="text-xs text-muted mt-1">Approved</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{changes}</div>
          <p className="text-xs text-muted mt-1">Changes Requested</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
          {[1,2,3].map((i) => (
            <div key={i} className="p-4 animate-pulse"><div className="h-4 bg-border rounded w-3/4 mb-2" /><div className="h-3 bg-border rounded w-1/2" /></div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-muted bg-card border border-border rounded-xl">
          <p>No reviews found.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          {reviews.map((r) => (
            <a key={r.id} href={r.htmlUrl} target="_blank" rel="noopener noreferrer" className="p-4 hover:bg-border/20 transition-colors block">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{statusIcon(r.state)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{r.prTitle} (#{r.prNumber})</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      r.state === "approved" ? "bg-green-500/20 text-green-500"
                        : r.state === "changes_requested" ? "bg-red-500/20 text-red-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}>{statusLabel(r.state)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted flex-wrap">
                    <span>{r.repo}</span>
                    <span>@{r.author}</span>
                    {r.submittedAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(r.submittedAt).toLocaleDateString()}</span>}
                  </div>
                  {r.body && <p className="text-xs text-muted mt-1 line-clamp-2">{r.body}</p>}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
