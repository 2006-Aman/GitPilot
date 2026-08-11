import { getGithubToken } from "./getGithubToken";
import { Octokit } from "@octokit/rest";
import { connectDB } from "./mongoose";
import Repository from "@/models/Repository";

export type StatsPayload = {
  totalCommits: number;
  weekCommits: number;
  totalStars: number;
  totalForks: number;
  followers: number;
  streak: number;
  bestStreak: number;
  totalActiveDays: number;
  repoCount: number;
  languages: { name: string; count: number }[];
  weeksData: number[];
  monthsData: number[];
  repoActivity: { name: string; commits: number }[];
  dailyArray: number[];
  dailyArray365: { date: string; count: number }[];
  heatmapGrid: number[][];
};

export async function getStats(userId: string): Promise<StatsPayload> {
  const token = await getGithubToken(userId);
  if (!token) throw new Error("GitHub token not found");

  const octokit = new Octokit({ auth: token });
  await connectDB();
  const repos = await Repository.find({ userId }).lean();

  let totalCommits = 0;
  let weekCommits = 0;
  let totalStars = 0;
  let totalForks = 0;
  let followers = 0;
  const langMap: Record<string, number> = {};
  const repoActivity: { name: string; commits: number }[] = [];

  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString();
  const dailyCommits: Record<string, number> = {};

  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    followers = user.followers;
  } catch {}

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).getTime();

  await Promise.all(repos.map(async (repo) => {
    if (repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    }
    totalStars += repo.stargazersCount || 0;
    totalForks += repo.forksCount || 0;

    try {
      const [owner, name] = repo.fullName.split("/");

      const { data: allCommits } = await octokit.rest.repos.listCommits({
        owner, repo: name, per_page: 100, since: oneYearAgo,
      });

      totalCommits += allCommits.length;
      repoActivity.push({ name: repo.name, commits: allCommits.length });

      for (const c of allCommits) {
        const commitDateStr = c.commit?.committer?.date;
        if (!commitDateStr) continue;
        const dateStr = commitDateStr.split("T")[0];
        dailyCommits[dateStr] = (dailyCommits[dateStr] || 0) + 1;
        if (new Date(commitDateStr).getTime() >= sevenDaysAgo) {
          weekCommits++;
        }
      }
    } catch (err: any) {
      if (err.status === 403) {
        console.warn("GitHub API rate limit hit in stats!");
      } else {
        console.warn(`Could not fetch commits for ${repo.name}`);
      }
    }
  }));

  repoActivity.sort((a, b) => b.commits - a.commits);

  const weeksData: number[] = [];
  const monthsData: number[] = new Array(12).fill(0);
  const today = new Date();

  for (let w = 0; w < 8; w++) {
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(today);
      day.setDate(day.getDate() - (w * 7 + d));
      const key = day.toISOString().split("T")[0];
      count += dailyCommits[key] || 0;
    }
    weeksData.unshift(count);
  }

  for (const [dateStr, count] of Object.entries(dailyCommits)) {
    const m = new Date(dateStr).getMonth();
    monthsData[m] += count;
  }

  const dailyArray365: { date: string; count: number }[] = [];
  let totalActiveDays = 0;

  for (let d = 364; d >= 0; d--) {
    const day = new Date(today);
    day.setDate(day.getDate() - d);
    const key = day.toISOString().split("T")[0];
    const count = dailyCommits[key] || 0;
    if (count > 0) totalActiveDays++;
    dailyArray365.push({ date: key, count });
  }

  const dailyArray: number[] = dailyArray365.map((d) => d.count);

  let streak = 0;
  let bestStreak = 0;
  let currentRun = 0;
  for (const item of dailyArray365) {
    if (item.count > 0) {
      currentRun++;
      bestStreak = Math.max(bestStreak, currentRun);
    } else {
      bestStreak = Math.max(bestStreak, currentRun);
      currentRun = 0;
    }
  }
  streak = currentRun;

  const heatmapGrid: number[][] = [];
  for (let w = 0; w < 12; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const idx = dailyArray.length - 1 - (w * 7 + d);
      week.push(idx >= 0 ? dailyArray[idx] : 0);
    }
    heatmapGrid.unshift(week);
  }

  return {
    totalCommits,
    weekCommits,
    totalStars,
    totalForks,
    followers,
    streak,
    bestStreak,
    totalActiveDays,
    repoCount: repos.length,
    languages: Object.entries(langMap).map(([name, count]) => ({ name, count })),
    weeksData,
    monthsData,
    repoActivity,
    dailyArray,
    dailyArray365,
    heatmapGrid,
  };
}
