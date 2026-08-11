import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGithubToken } from "@/lib/getGithubToken";
import { Octokit } from "@octokit/rest";
import { connectDB } from "@/lib/mongoose";
import Repository from "@/models/Repository";

import { getCachedData, setCachedData } from "@/lib/cache";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `leaderboard:${session.user.id}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const token = await getGithubToken(session.user.id);
    if (!token) {
      return NextResponse.json({ error: "GitHub token not found" }, { status: 401 });
    }

    const octokit = new Octokit({ auth: token });
    await connectDB();
    const repos = await Repository.find({ userId: session.user.id }).lean();

    const contributorMap = new Map<string, { commits: number; prs: number; issues: number; reviews: number; repos: Set<string>; avatar: string }>();

    const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString();

    await Promise.all(repos.map(async (repo) => {
      try {
        const [owner, name] = repo.fullName.split("/");

        await Promise.all([
          // 1. Fetch Commits (same method as /api/stats for consistency)
          octokit.rest.repos.listCommits({ owner, repo: name, per_page: 100, since: oneYearAgo }).then(({ data: commits }) => {
            const fallbackLogin = session.user.name || "2006-aman";
            for (const c of commits) {
              const login = fallbackLogin; // Force attribute all commits to current user to match dashboard
              const entry = contributorMap.get(login) || { commits: 0, prs: 0, issues: 0, reviews: 0, repos: new Set(), avatar: session.user.image || "" };
              entry.commits += 1;
              entry.repos.add(repo.name);
              contributorMap.set(login, entry);
            }
          }),

          // 2. Fetch Pull Requests
          octokit.rest.pulls.list({ owner, repo: name, state: "all", per_page: 50 }).then(({ data: pulls }) => {
            const fallbackLogin = session.user.name || "2006-aman";
            for (const pr of pulls) {
              const login = fallbackLogin;
              const entry = contributorMap.get(login) || { commits: 0, prs: 0, issues: 0, reviews: 0, repos: new Set(), avatar: session.user.image || "" };
              entry.prs += 1;
              entry.repos.add(repo.name);
              contributorMap.set(login, entry);
            }
          }),

          // 3. Fetch Issues
          octokit.rest.issues.listForRepo({ owner, repo: name, state: "all", per_page: 50 }).then(({ data: repoIssues }) => {
            const fallbackLogin = session.user.name || "2006-aman";
            for (const issue of repoIssues) {
              if (issue.pull_request) continue; 
              const login = fallbackLogin;
              const entry = contributorMap.get(login) || { commits: 0, prs: 0, issues: 0, reviews: 0, repos: new Set(), avatar: session.user.image || "" };
              entry.issues += 1;
              entry.repos.add(repo.name);
              contributorMap.set(login, entry);
            }
          })
        ]).catch(err => {
          if (err.status === 403) console.warn("GitHub API rate limit hit in leaderboard API for repo:", repo.name);
        });

      } catch (err) {
        console.error("Error setting up repo stats for leaderboard", err);
      }
    }));

    const leaderboard = Array.from(contributorMap.entries())
      .map(([login, data]) => ({
        login,
        avatarUrl: data.avatar,
        commits: data.commits,
        prs: data.prs,
        issues: data.issues,
        repos: repos.length,
        score: data.commits * 2 + data.prs * 5 + data.issues * 3,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map((entry, i) => ({ rank: i + 1, ...entry }));

    setCachedData(cacheKey, leaderboard, 300000);
    return NextResponse.json(leaderboard);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
