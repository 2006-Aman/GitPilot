"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Medal, Award, Star, Zap, Flame, Target, Code, BookOpen, Users, GitCommitHorizontal, GitBranch, Lock, Unlock } from "lucide-react";

type Achievement = {
  _id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
};

type Stats = {
  streak: number;
  bestStreak: number;
  totalCommits: number;
  repoActivity: { name: string; commits: number }[];
  repoCount: number;
};

export default function AchievementsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/"); return; }
    Promise.all([
      fetch("/api/achievements").then((r) => r.ok ? r.json() : []),
      fetch("/api/stats").then((r) => r.ok ? r.json() : null),
    ]).then(([achs, st]) => {
      setAchievements(achs);
      setStats(st);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [authStatus, router]);

  if (authStatus === "loading" || loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500" /></div>;

  const generateCards = () => {
    const cards: any[] = [];
    let idCounter = 1;

    const getTheme = (index: number) => {
      const themes = [
        { color: "text-gray-400", bg: "from-gray-900/40 to-gray-500/10", border: "border-gray-500/50", shadow: "shadow-gray-500/20", glow: "bg-gray-500", rarity: "Common" },
        { color: "text-green-400", bg: "from-green-900/40 to-green-500/10", border: "border-green-500/50", shadow: "shadow-green-500/20", glow: "bg-green-500", rarity: "Uncommon" },
        { color: "text-blue-400", bg: "from-blue-900/40 to-blue-500/10", border: "border-blue-500/50", shadow: "shadow-blue-500/20", glow: "bg-blue-500", rarity: "Rare" },
        { color: "text-purple-400", bg: "from-purple-900/40 to-purple-500/10", border: "border-purple-500/50", shadow: "shadow-purple-500/20", glow: "bg-purple-500", rarity: "Epic" },
        { color: "text-yellow-400", bg: "from-yellow-900/40 to-yellow-500/10", border: "border-yellow-500/50", shadow: "shadow-yellow-500/20", glow: "bg-yellow-500", rarity: "Legendary" },
        { color: "text-red-500", bg: "from-red-900/40 to-red-500/10", border: "border-red-500/50", shadow: "shadow-red-500/20", glow: "bg-red-500", rarity: "Mythic" },
        { color: "text-cyan-400", bg: "from-cyan-900/40 to-cyan-500/10", border: "border-cyan-500/50", shadow: "shadow-cyan-500/20", glow: "bg-cyan-500", rarity: "Cosmic" },
        { color: "text-pink-400", bg: "from-pink-900/40 to-pink-500/10", border: "border-pink-500/50", shadow: "shadow-pink-500/20", glow: "bg-pink-500", rarity: "Radiant" },
        { color: "text-emerald-400", bg: "from-emerald-900/40 to-emerald-500/10", border: "border-emerald-500/50", shadow: "shadow-emerald-500/20", glow: "bg-emerald-500", rarity: "Divine" },
      ];
      return themes[Math.min(index, themes.length - 1)];
    };

    const commitTiers = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    const commitTitles = ["Code Pioneer", "Bug Hunter", "Centurion", "Master", "Grandmaster", "Godlike", "Titan", "Legend", "Ascended"];
    for (let i = 0; i < commitTiers.length; i++) {
      const req = commitTiers[i];
      const val = stats?.totalCommits ?? 0;
      const earned = val >= req;
      
      cards.push({
        id: idCounter++,
        title: commitTitles[i] || `Commit Tier ${i+1}`,
        desc: `Push ${req.toLocaleString()} total commits to your repositories.`,
        icon: <GitCommitHorizontal className="w-10 h-10" />,
        progress: Math.min(100, Math.round((val / req) * 100)),
        req, val, earned, ...getTheme(i)
      });
      if (!earned) break;
    }

    const streakTiers = [7, 30, 60, 100, 200, 365, 500, 1000];
    const streakTitles = ["Weekly Warrior", "Consistent Coder", "Dedicated", "Streak Master", "Unstoppable", "Year of Code", "Immortal", "Timeless"];
    for (let i = 0; i < streakTiers.length; i++) {
      const req = streakTiers[i];
      const val = stats?.streak ?? 0;
      const earned = val >= req;
      
      cards.push({
        id: idCounter++,
        title: streakTitles[i] || `Streak Tier ${i+1}`,
        desc: `Maintain a ${req}-day contribution streak.`,
        icon: <Flame className="w-10 h-10" />,
        progress: Math.min(100, Math.round((val / req) * 100)),
        req, val, earned, ...getTheme(i)
      });
      if (!earned) break;
    }

    const repoTiers = [1, 3, 5, 10, 25, 50, 100];
    const repoTitles = ["Starter", "Team Player", "Multi-Repo", "Open Source", "Hoarder", "Mogul", "Empire"];
    for (let i = 0; i < repoTiers.length; i++) {
      const req = repoTiers[i];
      const val = stats?.repoActivity?.length ?? 0;
      const earned = val >= req;
      
      cards.push({
        id: idCounter++,
        title: repoTitles[i] || `Repo Tier ${i+1}`,
        desc: `Contribute to ${req} different repositories.`,
        icon: <BookOpen className="w-10 h-10" />,
        progress: Math.min(100, Math.round((val / req) * 100)),
        req, val, earned, ...getTheme(i)
      });
      if (!earned) break;
    }

    return cards;
  };

  const allCards = generateCards();

  const earnedCount = allCards.filter(c => c.earned).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 bg-[#0C101A] border border-[#1A1F2D] p-6 md:p-10 rounded-3xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-500 tracking-tight flex items-center justify-center md:justify-start gap-4 mb-2">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Trophy Room
          </h1>
          <p className="text-[#9BA2B4] text-lg font-medium">Collect badges, hit milestones, and level up your profile.</p>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center bg-black/40 border border-[#2A3143] rounded-2xl p-6 min-w-[200px]">
          <p className="text-sm font-bold text-[#5E6577] uppercase tracking-widest mb-1">Collection</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{earnedCount}</span>
            <span className="text-xl font-bold text-[#5E6577]">/ {allCards.length}</span>
          </div>
          <div className="w-full bg-[#1A1F2D] h-2 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${(earnedCount / allCards.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Collectible Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {allCards.map((card) => (
          <div 
            key={card.id} 
            className={`group relative h-[420px] rounded-2xl perspective-1000 transition-all duration-500 ${card.earned ? "cursor-pointer hover:-translate-y-4 hover:scale-[1.02]" : "grayscale-[0.8] opacity-60 hover:grayscale-0 hover:opacity-100 cursor-not-allowed"}`}
          >
            {/* The Card Itself */}
            <div className={`w-full h-full relative preserve-3d bg-gradient-to-b ${card.earned ? card.bg : "from-[#0C101A] to-[#12151B]"} border-2 ${card.earned ? card.border : "border-[#1A1F2D]"} rounded-2xl p-6 flex flex-col items-center text-center overflow-hidden shadow-2xl ${card.earned ? card.shadow : ""}`}>
              
              {/* Shine effect on hover (only for earned) */}
              {card.earned && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 z-20 pointer-events-none" />
              )}

              {/* Rarity Tag */}
              <div className="absolute top-4 w-full flex justify-between px-6 z-10">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${card.earned ? `${card.color} ${card.border} bg-black/50` : "text-[#5E6577] border-[#2A3143] bg-[#0C101A]"}`}>
                  {card.rarity}
                </span>
                {card.earned ? (
                  <Unlock className={`w-4 h-4 ${card.color}`} />
                ) : (
                  <Lock className="w-4 h-4 text-[#5E6577]" />
                )}
              </div>

              {/* Holographic Glowing Icon */}
              <div className="relative mt-12 mb-6 w-32 h-32 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 ${card.earned ? card.glow : "bg-transparent"}`} />
                <div className={`relative z-10 w-24 h-24 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 shadow-xl backdrop-blur-sm ${card.earned ? card.color : "text-[#5E6577]"}`}>
                  {card.icon}
                </div>
              </div>

              {/* Card Title & Desc */}
              <h2 className={`text-2xl font-black mb-2 ${card.earned ? "text-white" : "text-[#9BA2B4]"}`}>{card.title}</h2>
              <p className="text-sm text-[#9BA2B4] font-medium leading-relaxed mb-auto px-2">
                {card.desc}
              </p>

              {/* Progress Bar (Bottom) */}
              <div className="w-full mt-6 bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className={card.earned ? card.color : "text-[#5E6577]"}>{card.earned ? "UNLOCKED" : "PROGRESS"}</span>
                  <span className="text-white">{Math.min(card.val, card.req)} / {card.req}</span>
                </div>
                <div className="w-full bg-[#0C101A] h-2.5 rounded-full overflow-hidden border border-[#1A1F2D]">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${card.earned ? card.glow : "bg-[#2A3143]"}`} 
                    style={{ width: `${card.progress}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .preserve-3d { transform-style: preserve-3d; }
        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
}
