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

    const cacheKey = `pulls:${session.user.id}`;
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

    const pulls: any[] = [];
    await Promise.all(repos.slice(0, 10).map(async (repo) => {
      try {
        const [owner, name] = repo.fullName.split("/");
        const { data } = await octokit.rest.pulls.list({
          owner, repo: name, state: "open", per_page: 5, sort: "updated", direction: "desc",
        });
        for (const pr of data as any[]) {
          pulls.push({
            id: pr.id,
            title: pr.title,
            repo: repo.name,
            repoFull: repo.fullName,
            status: pr.state,
            merged: pr.merged_at ? "merged" : null,
            comments: pr.comments,
            updated: pr.updated_at,
            author: pr.user?.login || "unknown",
            branch: pr.head?.ref || "",
            htmlUrl: pr.html_url,
          });
        }
      } catch (err: any) {
        if (err.status === 403) console.warn("GitHub API rate limit hit in pulls API!");
      }
    }));

    pulls.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
    const result = pulls.slice(0, 30);
    setCachedData(cacheKey, result, 300000);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
