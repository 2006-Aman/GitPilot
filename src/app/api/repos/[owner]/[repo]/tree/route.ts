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
    const branch = searchParams.get("branch") || "main";

    const { data: tree } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "1",
    });

    return NextResponse.json(tree.tree);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch file tree";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
