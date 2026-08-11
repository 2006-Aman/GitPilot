import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGithubToken } from "@/lib/getGithubToken";
import { connectDB } from "@/lib/mongoose";
import Repository from "@/models/Repository";
import { Octokit } from "@octokit/rest";

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

    let deployedUrl = "";
    let deploymentStatus = "";

    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

    if (repoData.homepage && repoData.homepage.length > 0) {
      deployedUrl = repoData.homepage;
      deploymentStatus = "homepage";
    } else {
      try {
        const { data: deployments } =
          await octokit.rest.repos.listDeployments({
            owner,
            repo,
            per_page: 1,
          });

        if (deployments.length > 0) {
          const { data: statuses } =
            await octokit.rest.repos.listDeploymentStatuses({
              owner,
              repo,
              deployment_id: deployments[0].id,
              per_page: 1,
            });

          if (statuses.length > 0) {
            const envUrl =
              statuses[0].environment_url ||
              statuses[0].log_url ||
              "";
            if (envUrl) {
              deployedUrl = envUrl;
              deploymentStatus = statuses[0].state || "unknown";
            }
          }
        }
      } catch {
        /* no deployments */
      }
    }

    try {
      await connectDB();
      await Repository.findOneAndUpdate(
        {
          userId: session.user.id,
          githubRepoId: repoData.id,
        },
        {
          $set: {
            deployedUrl: deployedUrl || "",
            deploymentStatus: deploymentStatus || "",
          },
        }
      );
    } catch {
      /* non-critical */
    }

    return NextResponse.json({
      deployedUrl: deployedUrl || null,
      deploymentStatus: deploymentStatus || null,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to resolve deployment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
