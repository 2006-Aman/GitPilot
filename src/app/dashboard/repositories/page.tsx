"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, GitFork, Eye, Lock, Globe, ExternalLink, Calendar, Plus, BookOpen, ChevronDown } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

type Repo = {
  _id: string;
  name: string;
  fullName: string;
  description?: string;
  language?: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
};

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572a5", Go: "#00add8",
  Rust: "#dea584", Java: "#b07219", Kotlin: "#a97bff", Swift: "#f05138",
  Ruby: "#cc342d", PHP: "#4f5d95", C: "#555555", "C++": "#f34b7d",
  "C#": "#178600", Shell: "#89e051", HTML: "#e34c26", CSS: "#563d7c",
};

const LANGUAGES = ["All", "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "Kotlin", "Swift", "Ruby", "PHP", "C", "C++", "C#", "Shell", "HTML", "CSS", "Dart", "Solidity", "Other"];

import { useDashboard } from "@/context/DashboardContext";

export default function RepositoriesPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { repos, loading } = useDashboard();
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("All");

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/"); return; }
  }, [authStatus, router]);

  const filtered = repos.filter((r) => {
    const ms = r.name.toLowerCase().includes(search.toLowerCase());
    const ml = langFilter === "All" || (r.language || "Other") === langFilter;
    return ms && ml;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Repositories</h1>
        <p className="text-sm text-muted">Browse all your GitHub repositories</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full relative">
          <SearchBar 
            placeholder="Search repositories..."
            value={search}
            onChange={setSearch}
          />
        </div>
        {/* Custom Language Dropdown */}
        <div className="relative group/dropdown z-50">
          <button className="flex items-center justify-between gap-2 bg-card border border-border rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-accent cursor-pointer min-w-[150px] hover:border-accent/30 transition-colors">
            <span className="truncate">{langFilter === "All" ? "🌐 All Languages" : langFilter}</span>
            <ChevronDown className="w-4 h-4 text-muted opacity-70 group-hover/dropdown:text-accent transition-colors" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-full min-w-[150px] max-h-60 overflow-y-auto custom-scrollbar bg-[#12151B]/95 backdrop-blur-xl border border-[#232733] rounded-xl shadow-2xl py-1 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all ring-1 ring-white/5 transform translate-y-1 group-hover/dropdown:translate-y-0">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLangFilter(l)}
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                  langFilter === l ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-[#232733]/50"
                }`}
              >
                {l === "All" ? "🌐 All Languages" : l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-border rounded w-3/4 mb-3" />
              <div className="h-4 bg-border rounded w-full mb-2" />
              <div className="h-4 bg-border rounded w-1/2 mb-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((repo) => (
            <Link key={repo._id} href={`/dashboard/repo/${repo.fullName}`} className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="w-4 h-4 text-accent shrink-0" />
                  <span className="font-medium truncate group-hover:text-accent transition-colors">{repo.name}</span>
                </div>
                {repo.isPrivate ? <Lock className="w-3.5 h-3.5 text-muted shrink-0" /> : <Globe className="w-3.5 h-3.5 text-green-500 shrink-0" />}
              </div>
              {repo.description && <p className="text-xs text-muted line-clamp-2 mb-3">{repo.description}</p>}
              <div className="flex items-center gap-3 text-xs text-muted">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: languageColors[repo.language] || "#8b8b8b" }} />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stargazersCount}</span>
                <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forksCount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
