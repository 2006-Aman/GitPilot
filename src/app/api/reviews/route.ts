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

    const cacheKey = `reviews:${session.user.id}`;
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

    const reviews: any[] = [];
    await Promise.all(repos.slice(0, 10).map(async (repo) => {
      try {
        const [owner, name] = repo.fullName.split("/");
        const { data: repoPulls } = await octokit.rest.pulls.list({
          owner, repo: name, state: "open", per_page: 3, sort: "updated",
        });
        
        await Promise.all(repoPulls.map(async (pr) => {
          try {
            const { data: prReviews } = await octokit.rest.pulls.listReviews({
              owner, repo: name, pull_number: pr.number, per_page: 3,
            });
            for (const r of prReviews) {
              reviews.push({
                id: r.id,
                prTitle: pr.title,
                prNumber: pr.number,
                repo: repo.name,
                repoFull: repo.fullName,
                state: r.state,
                author: r.user?.login || "unknown",
                body: r.body?.slice(0, 200) || "",
                submittedAt: r.submitted_at,
                htmlUrl: r.html_url,
              });
            }
          } catch (err: any) {
            if (err.status === 403) console.warn("GitHub API rate limit hit in reviews (listReviews) API!");
          }
        }));
      } catch (err: any) {
        if (err.status === 403) console.warn("GitHub API rate limit hit in reviews (listPulls) API!");
      }
    }));

    reviews.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    const result = reviews.slice(0, 30);
    setCachedData(cacheKey, result, 300000);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
