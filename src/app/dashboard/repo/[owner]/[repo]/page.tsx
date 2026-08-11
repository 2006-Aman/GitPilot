"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Folder,
  FileCode,
  ExternalLink,
  AlertCircle,
  Star,
  GitFork,
  Bug,
  GitBranch,
  Users,
  GitCommitHorizontal,
  Globe,
  Lock,
  Download,
  Search,
  ChevronRight,
  Eye,
  HardDrive,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type TreeItem = {
  path: string;
  mode: string;
  type: "tree" | "blob";
  sha: string;
  size?: number;
  url: string;
};

type RepoMeta = {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  homepage: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  owner: { login: string; avatar_url: string };
  private: boolean;
  watchers_count?: number;
  size?: number;
  subscribers_count?: number;
};

type CommitInfo = {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getFileIcon(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  const name = path.split("/").pop()?.toLowerCase() || "";
  if (["md", "mdx"].includes(ext || "") || name === "readme" || name === "readme.md") return "📝";
  if (["js", "ts", "tsx", "jsx", "mjs"].includes(ext || "")) return "🟨";
  if (["py"].includes(ext || "")) return "🐍";
  if (["json", "yaml", "yml", "toml"].includes(ext || "")) return "⚙️";
  if (["css", "scss", "less", "html"].includes(ext || "")) return "🎨";
  if (["go"].includes(ext || "")) return "🔵";
  if (["rs"].includes(ext || "")) return "🦀";
  if (["java", "kt", "swift"].includes(ext || "")) return "☕";
  if (["png", "jpg", "jpeg", "gif", "svg", "ico", "webp"].includes(ext || "")) return "🖼️";
  return "📄";
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function RepoDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const { data: session } = useSession();

  const [repoMeta, setRepoMeta] = useState<RepoMeta | null>(null);
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileRawUrl, setFileRawUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"files" | "readme" | "deploy" | "commits">("files");
  const [readme, setReadme] = useState("");
  const [deployment, setDeployment] = useState<{ deployedUrl: string | null; deploymentStatus: string | null } | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [latestCommit, setLatestCommit] = useState<CommitInfo | null>(null);
  const [contributorsCount, setContributorsCount] = useState(0);
  const [treeSearch, setTreeSearch] = useState("");

  useEffect(() => {
    if (!owner || !repo) return;
    fetchRepoData();
  }, [owner, repo]);

  const fetchRepoData = async () => {
    setLoading(true);
    setError("");
    try {
      const [metaRes, treeRes, readmeRes, deployRes, commitsRes, ghRepoRes] = await Promise.all([
        fetch(`/api/repos/sync`),
        fetch(`/api/repos/${owner}/${repo}/tree?branch=main`),
        fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers: { Accept: "application/vnd.github.v3.raw" } }),
        fetch(`/api/repos/${owner}/${repo}/deployment`),
        fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers: { Accept: "application/vnd.github.v3+json" } }),
        fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: { Accept: "application/vnd.github.v3+json" } }),
      ]);

      const metaData = await metaRes.json();
      if (Array.isArray(metaData)) {
        const found = metaData.find((r: any) => r.fullName === `${owner}/${repo}`);
        if (found) {
          setRepoMeta({
            name: found.name, full_name: found.fullName, description: found.description || "",
            html_url: found.htmlUrl, homepage: found.homepageUrl || "", language: found.language,
            stargazers_count: found.stargazersCount, forks_count: found.forksCount,
            open_issues_count: found.openIssuesCount, default_branch: found.defaultBranch,
            owner: { login: owner, avatar_url: "" }, private: found.isPrivate,
          });
        }
      }

      if (ghRepoRes.ok) {
        const ghData = await ghRepoRes.json();
        setRepoMeta((prev) => prev ? { ...prev, watchers_count: ghData.subscribers_count, size: ghData.size, subscribers_count: ghData.subscribers_count, owner: { ...prev.owner, avatar_url: ghData.owner?.avatar_url || "" } } : {
          name: ghData.name, full_name: ghData.full_name, description: ghData.description || "",
          html_url: ghData.html_url, homepage: ghData.homepage || "", language: ghData.language,
          stargazers_count: ghData.stargazers_count, forks_count: ghData.forks_count,
          open_issues_count: ghData.open_issues_count, default_branch: ghData.default_branch || "main",
          owner: { login: ghData.owner?.login || owner, avatar_url: ghData.owner?.avatar_url || "" },
          private: ghData.private, watchers_count: ghData.subscribers_count, size: ghData.size,
        });
      }

      const treeData = await treeRes.json();
      if (Array.isArray(treeData)) {
        setTree(treeData);
        const dirs = new Set<string>();
        treeData.forEach((item: TreeItem) => {
          const parts = item.path.split("/");
          if (parts.length > 1) for (let i = 0; i < parts.length - 1; i++) dirs.add(parts.slice(0, i + 1).join("/"));
        });
        setExpandedDirs(dirs);
        const readmeItem = treeData.find((item: TreeItem) => item.path.toLowerCase() === "readme.md" || item.path.toLowerCase() === "readme");
        if (readmeItem) setActiveTab("readme");
      }

      try { setReadme(await readmeRes.text()); } catch {}
      try { setDeployment(await deployRes.json()); } catch {}

      try {
        const commitsData: CommitInfo[] = await commitsRes.json();
        if (commitsData.length > 0) setLatestCommit(commitsData[0]);
      } catch {}

      try {
        const contribRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`, { headers: { Accept: "application/vnd.github.v3+json" } });
        if (contribRes.ok) {
          const link = contribRes.headers.get("link") || "";
          const match = link.match(/page=(\d+)>; rel="last"/);
          setContributorsCount(match ? parseInt(match[1]) : (await contribRes.json().catch(() => [])).length || 0);
        }
      } catch {}

      if (!metaRes.ok && !repoMeta) {
        const fallbackRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: { Accept: "application/vnd.github.v3+json" } });
        if (fallbackRes.ok) setRepoMeta(await fallbackRes.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repository");
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (path: string) => {
    setSelectedFile(path);
    setFileContent("");
    try {
      const res = await fetch(`/api/repos/${owner}/${repo}/content?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.type === "file") { setFileContent(data.content); setFileSize(data.size); setFileRawUrl(data.download_url || ""); }
      } else {
        const fallbackRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, { headers: { Accept: "application/vnd.github.v3+json" } });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (data.type === "file" && data.content) { setFileContent(atob(data.content)); setFileSize(data.size); setFileRawUrl(data.download_url || ""); }
        }
      }
    } catch { setFileContent("// Error loading file"); }
  };

  const filteredTree = useMemo(() => {
    if (!treeSearch) return tree;
    return tree.filter((item) => item.path.toLowerCase().includes(treeSearch.toLowerCase()));
  }, [tree, treeSearch]);

  const renderFileTree = () => {
    const rootItems = filteredTree.filter((item) => {
      const parts = item.path.split("/");
      return parts.length === 1 || !expandedDirs.has(parts.slice(0, -1).join("/"));
    });

    const renderItem = (item: TreeItem) => {
      const isDir = item.type === "tree";
      const parts = item.path.split("/");
      const displayName = parts[parts.length - 1];
      const indent = parts.length - 1;
      const isExpanded = expandedDirs.has(item.path);

      if (isDir) {
        const children = filteredTree.filter((t) => {
          const tp = t.path.split("/");
          return t.path.startsWith(item.path + "/") && tp.slice(0, -1).join("/") === item.path;
        });

        return (
          <div key={item.path}>
            <button onClick={() => { const next = new Set(expandedDirs); isExpanded ? next.delete(item.path) : next.add(item.path); setExpandedDirs(next); }}
              className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-border/40 rounded-lg text-sm w-full text-left transition-colors group"
              style={{ paddingLeft: `${indent * 14 + 8}px` }}
            >
              <ChevronRight className={`w-3 h-3 text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              <Folder className="w-4 h-4 text-accent shrink-0" />
              <span className="truncate text-xs font-medium">{displayName}</span>
            </button>
            {isExpanded && children.map((child) => renderItem(child))}
          </div>
        );
      }

      return (
        <button key={item.path} onClick={() => loadFile(item.path)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm w-full text-left transition-colors ${selectedFile === item.path ? "bg-accent/10 text-accent border-l-[3px] border-accent" : "hover:bg-border/40 border-l-[3px] border-transparent"}`}
          style={{ paddingLeft: `${indent * 14 + 8}px` }}
        >
          <span className="text-xs shrink-0">{getFileIcon(item.path)}</span>
          <span className="truncate text-xs">{displayName}</span>
        </button>
      );
    };

    return (
      <div className="space-y-0.5">
        {rootItems.map((item) => renderItem(item))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-border rounded w-64" />
          <div className="h-8 bg-border rounded w-96" />
          <div className="flex gap-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-16 w-24 bg-border rounded-lg" />)}</div>
          <div className="h-10 bg-border rounded w-full" />
          <div className="grid grid-cols-12 gap-4"><div className="col-span-3 h-96 bg-border rounded-lg" /><div className="col-span-9 h-96 bg-border rounded-lg" /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-card border border-danger/30 rounded-xl p-6 flex items-start gap-3 max-w-md">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-danger font-medium mb-1">Error</p>
            <p className="text-sm text-muted">{error}</p>
            <a href="/dashboard" className="text-accent text-sm mt-2 inline-block hover:underline">Back to Dashboard</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {repoMeta && (
        <>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted">
            <a href="/dashboard/repositories" className="hover:text-foreground transition-colors">Repositories</a>
            <span>/</span>
            <span className="text-foreground font-medium">{owner}</span>
            <span>/</span>
            <span className="text-foreground font-medium">{repo}</span>
          </nav>

          {/* Header Band */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {repoMeta.owner?.avatar_url && (
                  <img src={repoMeta.owner.avatar_url} alt={owner} className="w-10 h-10 rounded-full ring-2 ring-border shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold">{owner}/{repo}</h1>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${repoMeta.private ? "bg-orange-500/20 text-orange-500 border border-orange-500/30" : "bg-green-500/20 text-green-500 border border-green-500/30"}`}>
                      {repoMeta.private ? "Private" : "Public"}
                    </span>
                    {repoMeta.language && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{repoMeta.language}</span>
                    )}
                  </div>
                  {repoMeta.description && <p className="text-xs text-muted mt-1">{repoMeta.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {repoMeta.homepage && (
                  <a href={repoMeta.homepage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
                <a href={repoMeta.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-background border border-border rounded-lg hover:bg-border/30 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> GitHub
                </a>
                <a href={`${repoMeta.html_url}/archive/refs/heads/${repoMeta.default_branch}.zip`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-background border border-border rounded-lg hover:bg-border/30 transition-colors">
                  <Download className="w-3.5 h-3.5" /> ZIP
                </a>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { icon: <Star className="w-3.5 h-3.5 text-yellow-500" />, label: "Stars", value: repoMeta.stargazers_count },
                { icon: <GitFork className="w-3.5 h-3.5 text-accent" />, label: "Forks", value: repoMeta.forks_count },
                { icon: <Bug className="w-3.5 h-3.5 text-red-500" />, label: "Issues", value: repoMeta.open_issues_count },
                { icon: <Eye className="w-3.5 h-3.5 text-green-500" />, label: "Watchers", value: repoMeta.subscribers_count ?? repoMeta.watchers_count ?? 0 },
                { icon: <Users className="w-3.5 h-3.5 text-purple-500" />, label: "Contributors", value: contributorsCount },
                { icon: <HardDrive className="w-3.5 h-3.5 text-blue-500" />, label: "Size", value: repoMeta.size ? `${(repoMeta.size / 1024).toFixed(1)} MB` : "-" },
              ].map((s) => (
                <div key={s.label} className="bg-background border border-border/50 rounded-lg p-2.5 text-center hover:border-accent/20 transition-colors">
                  <div className="flex justify-center mb-0.5">{s.icon}</div>
                  <p className="text-sm font-bold">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
                  <p className="text-[9px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Latest Commit */}
            {latestCommit && (
              <div className="flex items-center gap-2 text-xs text-muted bg-background border border-border/50 rounded-lg px-3 py-2 flex-wrap">
                <GitCommitHorizontal className="w-3.5 h-3.5 shrink-0 text-accent" />
                <span className="truncate max-w-[300px] sm:max-w-[500px]">{latestCommit.commit.message.split("\n")[0]}</span>
                <span className="shrink-0 text-foreground/70">{latestCommit.commit.author.name}</span>
                <span className="shrink-0">· {timeAgo(latestCommit.commit.author.date)}</span>
                <span className="shrink-0 font-mono text-[10px] bg-border/50 px-1.5 py-0.5 rounded">{latestCommit.sha.slice(0, 7)}</span>
                <span className="shrink-0 flex items-center gap-1"><GitBranch className="w-3 h-3" />{repoMeta.default_branch}</span>
              </div>
            )}
          </div>

          {/* Animated Underline Tabs */}
          <div className="flex gap-1 border-b border-border">
            {[
              { id: "files" as const, label: "Files & Code" },
              { id: "readme" as const, label: "README" },
              { id: "deploy" as const, label: "Deployment" },
              { id: "commits" as const, label: "Commits" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "text-accent" : "text-muted hover:text-foreground"}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full shadow-[0_0_6px_1px_rgba(88,166,255,0.5)]" />
                )}
              </button>
            ))}
          </div>

          {/* Files Tab */}
          {activeTab === "files" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 border-b border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold">EXPLORER</p>
                    <div className="flex gap-1">
                      <button onClick={() => { const all = new Set(tree.filter(t => t.type === "tree").map(t => t.path)); setExpandedDirs(all); }}
                        className="text-[10px] px-1.5 py-0.5 text-muted hover:text-foreground hover:bg-border/30 rounded transition-colors">All</button>
                      <button onClick={() => setExpandedDirs(new Set())}
                        className="text-[10px] px-1.5 py-0.5 text-muted hover:text-foreground hover:bg-border/30 rounded transition-colors">Min</button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted" />
                    <input type="text" placeholder="Search files..." value={treeSearch} onChange={(e) => setTreeSearch(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-7 pr-2 py-1.5 text-xs focus:outline-none focus:border-accent transition-colors" />
                    {treeSearch && <button onClick={() => setTreeSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs">✕</button>}
                  </div>
                  <p className="text-[10px] text-muted">{filteredTree.filter(t => t.type === "blob").length} files · {filteredTree.filter(t => t.type === "tree").length} folders</p>
                </div>
                <div className="max-h-[65vh] overflow-y-auto p-2">
                  {filteredTree.length === 0 ? (
                    <p className="text-xs text-muted text-center py-8">No files match your search</p>
                  ) : renderFileTree()}
                </div>
              </div>
              <div className="md:col-span-8 lg:col-span-9 bg-card border border-border rounded-xl overflow-hidden">
                {selectedFile && fileContent ? (
                  <div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-black/10">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs">{getFileIcon(selectedFile)}</span>
                        <span className="text-sm font-medium truncate">{selectedFile}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted shrink-0">
                        <span>{fileSize} bytes</span>
                        {fileRawUrl && (
                          <a href={fileRawUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1">
                            Raw <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm leading-relaxed max-h-[65vh] overflow-y-auto"><code>{fileContent}</code></pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted">
                    <div className="text-center">
                      <FileCode className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Select a file to view its contents</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* README Tab */}
          {activeTab === "readme" && (
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 max-w-none">
              {readme ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted text-center py-10">No README found for this repository.</p>
              )}
            </div>
          )}

          {/* Deploy Tab */}
          {activeTab === "deploy" && (
            <div className="bg-card border border-border rounded-xl p-6">
              {deployment?.deployedUrl ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-success inline-block" />
                    <span className="font-semibold">Live Deployment</span>
                    <span className="text-xs text-muted">({deployment.deploymentStatus})</span>
                  </div>
                  <a href={deployment.deployedUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-medium px-5 py-2.5 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" /> Open Live Deployment
                  </a>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-muted inline-block" />
                    <span className="font-semibold">No Deployment Found</span>
                  </div>
                  <p className="text-muted text-sm">No live deployment linked for this repository. Deploy your project and set the homepage URL in your GitHub repo settings.</p>
                </div>
              )}
            </div>
          )}

          {/* Commits Tab */}
          {activeTab === "commits" && (
            <div className="bg-card border border-border rounded-xl p-6 text-center text-muted">
              <GitCommitHorizontal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Commit history loaded from GitHub API</p>
              {latestCommit && (
                <div className="mt-3 text-xs text-left bg-background border border-border/50 rounded-lg px-4 py-3 max-w-lg mx-auto">
                  <p className="font-medium">{latestCommit.commit.message.split("\n")[0]}</p>
                  <p className="text-muted mt-1">{latestCommit.commit.author.name} · {timeAgo(latestCommit.commit.author.date)} · <span className="font-mono">{latestCommit.sha.slice(0, 7)}</span></p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
