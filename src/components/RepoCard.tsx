import Link from "next/link";
import {
  Star,
  GitFork,
  Lock,
  Globe,
  ExternalLink,
} from "lucide-react";

type Repo = {
  _id: string;
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
};

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dart: "#00B4AB",
  Solidity: "#AA6746",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export default function RepoCard({ repo }: { repo: Repo }) {
  const [owner, name] = repo.fullName ? repo.fullName.split("/") : ["", repo.name];

  return (
    <Link
      href={`/dashboard/repo/${owner}/${name}`}
      className="bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all block group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {repo.isPrivate ? (
            <Lock className="w-4 h-4 text-muted shrink-0" />
          ) : (
            <Globe className="w-4 h-4 text-success shrink-0" />
          )}
          <h3 className="font-semibold truncate group-hover:text-accent transition-colors">
            {repo.name}
          </h3>
        </div>
      </div>

      {repo.description && (
        <p className="text-sm text-muted mb-3 line-clamp-2">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted mb-3">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor:
                  LANGUAGE_COLORS[repo.language] || "#8b949e",
              }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          {repo.stargazersCount}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3 h-3" />
          {repo.forksCount}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        {repo.updatedAtGithub && (
          <span>Updated {timeAgo(repo.updatedAtGithub)}</span>
        )}
        <span className="text-xs bg-border px-2 py-0.5 rounded-full">
          {repo.isPrivate ? "Private" : "Public"}
        </span>
      </div>

      {repo.deployedUrl && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1">
          <span className="text-xs text-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            Live
          </span>
          <span className="text-xs text-muted truncate ml-1">
            {repo.deploymentStatus || "deployed"}
          </span>
        </div>
      )}
    </Link>
  );
}
