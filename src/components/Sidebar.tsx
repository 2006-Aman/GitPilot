"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import GithubIcon from "@/components/GithubIcon";
import {
  LayoutDashboard,
  FolderGit2,
  Brain,
  BarChart3,
  GitPullRequest,
  Bug,
  Code2,
  Trophy,
  Target,
  Medal,
  FileBarChart,
  Settings,
  UserCircle,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Repositories", href: "/dashboard/repositories", icon: FolderGit2 },
  { label: "AI Insights", href: "/dashboard/ai-insights", icon: Brain },
  { label: "Productivity", href: "/dashboard/productivity", icon: BarChart3 },
  { label: "Pull Requests", href: "/dashboard/pull-requests", icon: GitPullRequest },
  { label: "Issues", href: "/dashboard/issues", icon: Bug },
  { label: "Code Reviews", href: "/dashboard/code-reviews", icon: Code2 },
  { label: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { label: "Goals", href: "/dashboard/goals", icon: Target },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Medal },
  { label: "Reports", href: "/dashboard/reports", icon: FileBarChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border bg-card shrink-0 overflow-y-auto">
      <div className="px-5 py-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <GithubIcon className="w-4 h-4 text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            DevMetrics <span className="text-accent">AI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                active
                  ? "text-accent bg-accent/10"
                  : "text-muted hover:text-foreground hover:bg-border/50"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full shadow-[0_0_8px_2px_rgba(88,166,255,0.6)]" />
              )}
              <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? "drop-shadow-[0_0_4px_rgba(88,166,255,0.5)]" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-border/50 transition-all duration-200"
        >
          {isDark ? (
            <Sun className="w-4.5 h-4.5 shrink-0" />
          ) : (
            <Moon className="w-4.5 h-4.5 shrink-0" />
          )}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </aside>
  );
}
