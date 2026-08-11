"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Target, CheckCircle, Circle, TrendingUp, Calendar, Plus, X } from "lucide-react";

type Goal = {
  _id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  deadline: string;
  progress: number;
};

export default function GoalsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "General", target: 10, deadline: "" });

  const fetchGoals = () => {
    fetch("/api/goals")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setGoals(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/"); return; }
    fetchGoals();
  }, [authStatus, router]);

  const createGoal = async () => {
    if (!form.title) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, current: 0, progress: 0 }),
    });
    setShowForm(false);
    setForm({ title: "", category: "General", target: 10, deadline: "" });
    fetchGoals();
  };

  if (authStatus === "loading") return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>;

  const active = goals.filter((g) => g.progress < 100);
  const completed = goals.filter((g) => g.progress >= 100);

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-sm text-muted">Track your development objectives</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-medium px-4 py-2 rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Create Goal</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-muted hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" placeholder="e.g. 100 commits this month" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent">
                  {["Consistency", "Collaboration", "Quality", "Documentation", "Community", "General"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Target</label>
                <input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: parseInt(e.target.value) || 1 })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
              </div>
              <button onClick={createGoal} className="w-full bg-accent hover:bg-accent-hover text-black font-medium px-4 py-2 rounded-lg transition-colors text-sm">Create Goal</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse"><div className="h-4 bg-border rounded w-3/4 mb-3" /><div className="h-2 bg-border rounded" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Active Goals</h2>
            {active.length === 0 && <p className="text-sm text-muted">No active goals. Create one!</p>}
            {active.map((g) => (
              <div key={g._id} className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-sm font-medium">{g.title}</p>
                      <p className="text-[10px] text-muted">{g.category}</p>
                    </div>
                  </div>
                  {g.deadline && <span className="text-xs text-muted flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(g.deadline).toLocaleDateString()}</span>}
                </div>
                <div className="bg-border/50 rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${g.progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>{g.current} / {g.target}</span>
                  <span>{g.progress}%</span>
                </div>
              </div>
            ))}

            {completed.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mt-6">Completed</h2>
                {completed.map((g) => (
                  <div key={g._id} className="bg-card border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm line-through text-muted">{g.title}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Summary</h2>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>Active goals</span><span className="text-accent">{active.length}</span></div>
                <div className="flex justify-between"><span>Completed</span><span className="text-green-500">{completed.length}</span></div>
                <div className="flex justify-between"><span>Total</span><span className="text-foreground">{goals.length}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
