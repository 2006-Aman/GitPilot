import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGithubToken } from "@/lib/getGithubToken";
import { Octokit } from "@octokit/rest";

export async function GET() {
  try {
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

    try {
      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.rest.users.getAuthenticated();

      return NextResponse.json({
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
      });
    } catch (apiError) {
      console.error("GitHub API Error (likely rate limit), using session fallback:", apiError);
      return NextResponse.json({
        login: session.user.name || "User",
        avatar_url: session.user.image || "",
        name: session.user.name,
        bio: "",
        public_repos: 0,
        followers: 0,
        following: 0,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub user" },
      { status: 500 }
    );
  }
}
