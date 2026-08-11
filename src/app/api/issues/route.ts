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

    const cacheKey = `issues:${session.user.id}`;
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

    const issues: any[] = [];
    await Promise.all(repos.slice(0, 10).map(async (repo) => {
      try {
        const [owner, name] = repo.fullName.split("/");
        const { data } = await octokit.rest.issues.listForRepo({
          owner, repo: name, state: "open", per_page: 5, sort: "updated", direction: "desc",
          filter: "all",
        });
        for (const issue of data) {
          if (!issue.pull_request) {
            const priority = (issue.labels as any[])?.find((l: any) =>
              ["critical", "high", "medium", "low"].includes((l.name || "").toLowerCase())
            )?.name || "medium";
            issues.push({
              id: issue.id,
              title: issue.title,
              repo: repo.name,
              repoFull: repo.fullName,
              status: issue.state,
              priority: priority.toLowerCase(),
              comments: issue.comments,
              updated: issue.updated_at,
              author: issue.user?.login || "unknown",
              labels: issue.labels?.map((l: any) => l.name) || [],
              htmlUrl: issue.html_url,
            });
          }
        }
      } catch (err: any) {
        if (err.status === 403) console.warn("GitHub API rate limit hit in issues API!");
      }
    }));

    issues.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
    const result = issues.slice(0, 30);
    setCachedData(cacheKey, result, 300000);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
