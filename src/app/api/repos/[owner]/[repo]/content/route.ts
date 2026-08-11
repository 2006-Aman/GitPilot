import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGithubToken } from "@/lib/getGithubToken";
import { Octokit } from "@octokit/rest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getGithubToken(session.user.id);
    if (!token) {
      return NextResponse.json(
        { error: "GitHub token not found" },
        { status: 401 }
      );
    }

    const octokit = new Octokit({ auth: token });
    const searchParams = _req.nextUrl.searchParams;
    const path = searchParams.get("path");
    const branch = searchParams.get("branch") || "main";

    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (Array.isArray(data)) {
      return NextResponse.json({ type: "dir", entries: data });
    }

    if (data.type === "file" && "content" in data) {
      const decoded = Buffer.from(data.content, "base64").toString("utf-8");
      return NextResponse.json({
        type: "file",
        content: decoded,
        size: data.size,
        sha: data.sha,
        html_url: data.html_url,
        download_url: data.download_url,
        name: data.name,
      });
    }

    return NextResponse.json({ type: "unknown", data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
