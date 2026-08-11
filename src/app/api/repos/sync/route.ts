import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGithubToken } from "@/lib/getGithubToken";
import { connectDB } from "@/lib/mongoose";
import Repository from "@/models/Repository";
import { Octokit } from "@octokit/rest";
import { clearUserCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function syncRepositories(userId: string) {
  const token = await getGithubToken(userId);
  if (!token) return null;

  const octokit = new Octokit({ auth: token });
  const allRepos: Awaited<
    ReturnType<typeof octokit.rest.repos.listForAuthenticatedUser>
  >["data"] = [];

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
      page,
    });
    allRepos.push(...data);
    hasMore = data.length === 100;
    page++;
  }

  await connectDB();

  for (const repo of allRepos) {
    await Repository.findOneAndUpdate(
      {
        userId: userId,
        githubRepoId: repo.id,
      },
      {
        $set: {
          userId: userId,
          githubRepoId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || "",
          htmlUrl: repo.html_url,
          homepageUrl: repo.homepage || "",
          language: repo.language || null,
          stargazersCount: repo.stargazers_count ?? 0,
          forksCount: repo.forks_count ?? 0,
          openIssuesCount: repo.open_issues_count ?? 0,
          isPrivate: repo.private ?? false,
          defaultBranch: repo.default_branch || "main",
          updatedAtGithub: repo.updated_at ? new Date(repo.updated_at) : new Date(),
          lastSyncedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  return await Repository.find({ userId }).sort({ updatedAtGithub: -1 }).lean();
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try live sync first so stars/forks/changes on GitHub are immediately live
    try {
      const liveSynced = await syncRepositories(session.user.id);
      if (liveSynced) {
        return NextResponse.json(liveSynced);
      }
    } catch (syncError) {
      console.error("GitHub Sync Error (likely rate limit), falling back to DB...");
    }

    await connectDB();
    const repos = await Repository.find({ userId: session.user.id })
      .sort({ updatedAtGithub: -1 })
      .lean();

    return NextResponse.json(repos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    clearUserCache(session.user.id);
    const repos = await syncRepositories(session.user.id);
    if (!repos) {
      return NextResponse.json({ error: "GitHub token not found" }, { status: 401 });
    }

    return NextResponse.json(repos);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sync repos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
