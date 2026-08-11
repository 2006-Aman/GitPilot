"use client";

import { useState, useMemo } from "react";
import {
  Star,
  GitFork,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  BookOpen,
  Lock,
  ExternalLink,
  LayoutGrid,
  ListFilter,
  X,
  Sparkles,
  GitBranch,
} from "lucide-react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

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

const healthScore = (repo: Repo) => {
  let score = 50;
  if (repo.description) score += 10;
  if (repo.stargazersCount > 10) score += 10;
  if (repo.forksCount > 5) score += 10;
  if (repo.openIssuesCount < 10) score += 10;
  if (repo.stargazersCount > 100) score += 10;
  return Math.min(score, 100);
};

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  Ruby: "#cc342d",
  PHP: "#4f5d95",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dart: "#00b4ab",
  Solidity: "#363636",
};

const LANGUAGES = [
  "All",
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "Kotlin",
  "Swift",
  "Ruby",
  "PHP",
  "C",
  "C++",
  "C#",
  "Shell",
  "HTML",
  "CSS",
  "Dart",
  "Solidity",
  "Other",
];

export default function RepoTable({ repos }: { repos: Repo[] }) {
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"stars" | "forks" | "name" | "health">("stars");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const filtered = useMemo(() => {
    return repos
      .filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
        const matchesLang = languageFilter === "All" || (r.language || "Other") === languageFilter;
        return matchesSearch && matchesLang;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortBy === "stars") return (a.stargazersCount - b.stargazersCount) * dir;
        if (sortBy === "forks") return (a.forksCount - b.forksCount) * dir;
        if (sortBy === "health") return (healthScore(a) - healthScore(b)) * dir;
        return a.name.localeCompare(b.name) * dir;
      });
  }, [repos, search, languageFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const SortHeader = ({ col, label }: { col: typeof sortBy; label: string }) => (
    <button
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted hover:text-foreground transition-colors group"
    >
      {label}
      <ArrowUpDown
        className={`w-3.5 h-3.5 transition-transform ${
          sortBy === col ? "text-accent scale-110" : "text-muted/60 group-hover:text-muted"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* 🔍 PREMIUM SEARCH BAR & CONTROLS HEADER */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-md dark:shadow-xl dark:shadow-black/10 flex flex-col md:flex-row items-center justify-between gap-3 relative group z-10">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Search Input Box */}
        <div className="relative flex-1 w-full flex items-center">
          <SearchBar 
            placeholder="Search repositories by name, language, or description..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(0);
            }}
          />
        </div>

        {/* Filter Controls & View Toggle */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-between md:justify-end">
          {/* Custom Language Dropdown */}
          <div className="relative group/dropdown">
            <button
              className="flex items-center justify-between gap-2 bg-background border border-border text-foreground text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-accent cursor-pointer min-w-[140px] hover:border-accent/30 transition-colors"
            >
              <span className="truncate">{languageFilter === "All" ? "🌐 All Languages" : languageFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted opacity-70 group-hover/dropdown:text-accent transition-colors" />
            </button>
            <div className="absolute left-0 top-full mt-2 w-full min-w-[140px] max-h-60 overflow-y-auto custom-scrollbar bg-[#12151B]/95 backdrop-blur-xl border border-[#232733] rounded-xl shadow-2xl z-50 py-1.5 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all ring-1 ring-white/5 transform translate-y-1 group-hover/dropdown:translate-y-0">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLanguageFilter(l);
                    setPage(0);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                    languageFilter === l ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-[#232733]/50"
                  }`}
                >
                  {l === "All" ? "🌐 All Languages" : l}
                </button>
              ))}
            </div>
          </div>

          {/* Result Count Badge */}
          <span className="text-xs font-bold px-3 py-2 rounded-xl bg-accent/10 text-accent border border-accent/20 whitespace-nowrap">
            {filtered.length} Repos
          </span>

          {/* View Mode Switcher Buttons */}
          <div className="flex items-center bg-background border border-border rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table" ? "bg-accent text-black font-bold shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              <ListFilter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-accent text-black font-bold shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 📊 REPOSITORY DATA CONTENT */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
          <BookOpen className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
          <p className="text-foreground font-semibold">No matching repositories found</p>
          <p className="text-xs text-muted mt-1">Try resetting your search filter query</p>
          <button
            onClick={() => {
              setSearch("");
              setLanguageFilter("All");
            }}
            className="mt-4 px-4 py-2 bg-accent/10 text-accent text-xs font-bold rounded-xl border border-accent/20 hover:bg-accent hover:text-black transition-all"
          >
            Clear Search Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md dark:shadow-xl dark:shadow-black/20 relative">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-background/40">
                  <th className="text-left px-5 py-4">
                    <SortHeader col="name" label="Repository" />
                  </th>
                  <th className="text-right px-4 py-4">
                    <SortHeader col="stars" label="Stars" />
                  </th>
                  <th className="text-right px-4 py-4">
                    <SortHeader col="forks" label="Forks" />
                  </th>
                  <th className="text-right px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted">Issues</th>
                  <th className="text-right px-4 py-4">
                    <SortHeader col="health" label="Health Score" />
                  </th>
                  <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paged.map((repo) => {
                  const health = healthScore(repo);
                  const langColor = languageColors[repo.language || "Other"] || "#8b8b8b";
                  const healthBadge =
                    health >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : health >= 60 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20";

                  return (
                    <tr
                      key={repo._id}
                      className="hover:bg-accent/5 transition-all duration-200 group"
                    >
                      {/* Repo Info */}
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/repo/${repo.fullName}`} className="flex items-start gap-3 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full shrink-0 mt-1 shadow-sm"
                            style={{ background: langColor }}
                            title={repo.language || "Unknown"}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground truncate group-hover:text-accent transition-colors">
                                {repo.name}
                              </span>
                              {repo.isPrivate ? (
                                <Lock className="w-3 h-3 text-muted shrink-0" />
                              ) : (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white/5 text-muted">
                                  public
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-muted/70 flex items-center gap-0.5">
                                <GitBranch className="w-3 h-3" />
                                {repo.defaultBranch || "main"}
                              </span>
                            </div>

                            {repo.description && (
                              <p className="text-xs text-muted/80 truncate max-w-[320px] mt-0.5">
                                {repo.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      </td>

                      {/* Stars */}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground bg-background/60 px-2.5 py-1 rounded-lg border border-border/40">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {repo.stargazersCount}
                        </div>
                      </td>

                      {/* Forks */}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted bg-background/60 px-2.5 py-1 rounded-lg border border-border/40">
                          <GitFork className="w-3.5 h-3.5" />
                          {repo.forksCount}
                        </div>
                      </td>

                      {/* Issues */}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted bg-background/60 px-2.5 py-1 rounded-lg border border-border/40">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          {repo.openIssuesCount}
                        </div>
                      </td>

                      {/* Health Progress Score */}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2.5">
                          <div className="bg-background/80 border border-border/40 rounded-full h-2 w-20 overflow-hidden p-0.5">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${health}%`,
                                background: health > 75 ? "#22c55e" : health > 50 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${healthBadge}`}>
                            {health}%
                          </span>
                        </div>
                      </td>

                      {/* View Link Action */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/repo/${repo.fullName}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-white bg-accent/10 hover:bg-accent px-3 py-1.5 rounded-xl border border-accent/20 transition-all duration-200"
                        >
                          Details
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 📄 PAGINATION BAR */}
          {filtered.length > perPage && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/70 bg-background/40">
              <span className="text-xs font-semibold text-muted">
                Showing <span className="text-foreground">{page * perPage + 1}</span>-
                <span className="text-foreground">{Math.min((page + 1) * perPage, filtered.length)}</span> of{" "}
                <span className="text-foreground">{filtered.length}</span> repositories
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-7 h-7 text-xs font-extrabold rounded-lg transition-all ${
                      i === page
                        ? "bg-accent text-black shadow-sm"
                        : "text-muted hover:text-foreground hover:bg-border/30"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* GRID VIEW CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((repo) => {
            const health = healthScore(repo);
            const langColor = languageColors[repo.language || "Other"] || "#8b8b8b";

            return (
              <div
                key={repo._id}
                className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-xl shadow-black/10 flex flex-col justify-between group hover:border-accent/40 transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: langColor }} />
                      <span className="font-bold text-base text-foreground truncate group-hover:text-accent transition-colors">
                        {repo.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 shrink-0">
                      {repo.language || "Other"}
                    </span>
                  </div>

                  {repo.description && (
                    <p className="text-xs text-muted line-clamp-2 mb-4 font-medium">
                      {repo.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-bold text-foreground">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {repo.stargazersCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5" />
                        {repo.forksCount}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {health}% Health
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/repo/${repo.fullName}`}
                    className="w-full py-2 bg-accent/10 hover:bg-accent text-accent hover:text-black font-bold text-xs rounded-xl border border-accent/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    Explore Repository
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
