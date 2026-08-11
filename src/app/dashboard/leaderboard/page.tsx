"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Medal, Award, TrendingUp, GitCommitHorizontal, BookOpen, Star, Cpu } from "lucide-react";

type Leader = {
  rank: number;
  login: string;
  avatarUrl: string;
  commits: number;
  repos: number;
  score: number;
};

export default function LeaderboardPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/"); return; }
    fetch("/api/leaderboard")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setLeaders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [authStatus, router]);

  if (authStatus === "loading") return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>;

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return null;
  };

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-sm text-muted">Top contributors ranked by impact score from real GitHub data</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl p-8 animate-pulse space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-border rounded-lg" />)}
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-20 text-muted bg-card border border-border rounded-xl">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No contributor data yet. Sync your repositories.</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[top3[1], top3[0], top3[2]].map((l, idx) => {
              if (!l) return <div key={idx} />;
              const isFirst = l.rank === 1;
              const isSecond = l.rank === 2;
              return (
                <div key={l.login} className={`bg-card border border-border rounded-xl p-5 text-center transition-all hover:border-accent/30 ${isFirst ? "ring-2 ring-yellow-500/30 sm:-mt-3" : ""}`}>
                  <div className="flex justify-center mb-2">
                    {isFirst ? <Trophy className="w-8 h-8 text-yellow-500" /> : isSecond ? <Medal className="w-7 h-7 text-gray-400" /> : <Award className="w-7 h-7 text-amber-700" />}
                  </div>
                  <img src={l.avatarUrl} alt={l.login} className={`w-14 h-14 rounded-full mx-auto mb-2 ring-2 ${isFirst ? "ring-yellow-500" : "ring-border"}`} />
                  <p className="font-semibold">{l.login}</p>
                  <p className="text-2xl font-bold text-accent mt-1">{l.score}</p>
                  <p className="text-xs text-muted">points</p>
                  <div className="flex justify-center gap-3 mt-3 text-[10px] text-muted">
                    <span className="flex items-center gap-1"><GitCommitHorizontal className="w-3 h-3" />{l.commits}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{l.repos}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rank Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-border/20">
                    <th className="text-left px-4 py-3 text-xs text-muted font-medium w-12">Rank</th>
                    <th className="text-left px-4 py-3 text-xs text-muted font-medium">Developer</th>
                    <th className="text-right px-4 py-3 text-xs text-muted font-medium">Score</th>
                    <th className="text-right px-4 py-3 text-xs text-muted font-medium"><GitCommitHorizontal className="w-3 h-3 inline" /> Commits</th>
                    <th className="text-right px-4 py-3 text-xs text-muted font-medium"><BookOpen className="w-3 h-3 inline" /> Repos</th>
                    <th className="text-right px-4 py-3 text-xs text-muted font-medium">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((l) => (
                    <tr key={l.login} className={`border-b border-border/30 hover:bg-border/10 transition-colors ${l.rank <= 3 ? "bg-accent/5" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border/50 text-xs font-bold">
                          {rankIcon(l.rank) || <span className="text-muted">{l.rank}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={l.avatarUrl} alt={l.login} className="w-9 h-9 rounded-full ring-2 ring-border" />
                          <div>
                            <p className="font-medium text-sm">{l.login}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-accent text-base">{l.score}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted">{l.commits}</td>
                      <td className="px-4 py-3 text-right text-muted">{l.repos}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="bg-border/30 rounded-full h-1.5 w-16 overflow-hidden">
                            <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.min(100, Math.round((l.score / leaders[0]?.score) * 100))}%` }} />
                          </div>
                          <span className="text-[10px] text-muted w-8 text-right">{Math.round((l.score / leaders[0]?.score) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
