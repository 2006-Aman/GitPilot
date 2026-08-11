"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Code2,
  FolderGit2,
  Globe,
  Lock,
  Star,
  GitFork,
} from "lucide-react";
import GithubIcon from "@/components/GithubIcon";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GithubIcon className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold">GitPilot</span>
          </div>
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-medium px-5 py-2 rounded-lg transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
            Continue with GitHub
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Your GitHub Universe,
            <span className="text-accent"> One Dashboard</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
            See all your GitHub repos, code, and live deployments in one
            dashboard. Sync, explore, and manage your projects — all in one
            place.
          </p>
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            <GithubIcon className="w-6 h-6" />
            Continue with GitHub
          </button>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <FolderGit2 className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Real-time Repo Sync</h3>
              <p className="text-muted text-sm">
                One-click sync brings all your GitHub repositories into your
                dashboard instantly.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <Code2 className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Code Viewer</h3>
              <p className="text-muted text-sm">
                Browse and read any file from any repo with syntax highlighting
                and markdown rendering.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <Globe className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Deployment Tracking</h3>
              <p className="text-muted text-sm">
                Automatically detect live deployment URLs from homepage or
                GitHub Deployments.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <Lock className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Private Repo Support</h3>
              <p className="text-muted text-sm">
                Full support for private repositories with your authenticated
                GitHub access.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="bg-card border border-border rounded-2xl p-10">
            <h2 className="text-3xl font-bold mb-4">
              Ready to take control?
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Connect your GitHub account and start managing all your
              repositories from one place.
            </p>
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
            >
              <GithubIcon className="w-6 h-6" />
              Get Started Free
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-muted text-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-1">
          Built with <Star className="w-3 h-3 text-warning" /> using Next.js,
          MongoDB Atlas, and GitHub API
        </div>
      </footer>
    </div>
  );
}
