import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getStats } from "@/lib/getStats";
import { getCachedData, setCachedData } from "@/lib/cache";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `ai-insights:${session.user.id}`;
    const cached = getCachedData(cacheKey);
    if (cached) return NextResponse.json(cached);

    const stats = await getStats(session.user.id);

    const {
      totalCommits, weekCommits, streak, bestStreak, totalActiveDays,
      repoCount, weeksData = [], monthsData = [],
      repoActivity = [], languages = [], dailyArray365 = [],
    } = stats;

    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (const item of dailyArray365) {
      const d = new Date(item.date + "T00:00:00");
      const day = d.getDay();
      dayTotals[day] += item.count;
      if (item.count > 0) dayCounts[day]++;
    }

    const avgByDay = dayTotals.map((t, i) => dayCounts[i] > 0 ? t / dayCounts[i] : 0);
    const bestDayIdx = avgByDay.indexOf(Math.max(...avgByDay));
    const worstDayIdx = avgByDay.indexOf(Math.min(...avgByDay.filter(Boolean)));

    const weeklyTrend = weeksData.length >= 2
      ? weeksData[weeksData.length - 1] > weeksData[0] ? "increasing" : weeksData[weeksData.length - 1] < weeksData[0] ? "decreasing" : "stable"
      : "stable";

    const activeMonths = monthsData.filter((m: number) => m > 0).length;
    const monthlyAvg = activeMonths > 0 ? Math.round(totalCommits / activeMonths) : 0;
    const currentMonthCommits = monthsData[new Date().getMonth()] || 0;

    const activeRepos = repoActivity.length;
    const topRepo = repoActivity[0]?.name || null;
    const topRepos = repoActivity.slice(0, 3).map((r: any) => r.name);
    const langCount = languages.length;
    const topLang = languages[0]?.name || null;

    const consistencyScore = bestStreak > 0 ? Math.min(100, Math.round((streak / Math.max(bestStreak, 1)) * 100)) : 0;
    const activityScore = Math.min(100, Math.round((totalActiveDays / 365) * 100));
    const weeklyMomentum = weeksData.length > 4
      ? Math.min(100, Math.round((weeksData.slice(-4).reduce((a: number, b: number) => a + b, 0) / Math.max(...weeksData, 1)) * 100))
      : 50;
    const diversityBonus = Math.min(20, langCount * 3 + Math.min(activeRepos, 5) * 2);
    const overallHealth = Math.min(100, Math.round((consistencyScore * 0.3 + activityScore * 0.3 + weeklyMomentum * 0.25 + diversityBonus)));

    const strengths: string[] = [];
    if (streak >= 7) strengths.push(`Consistent contributor with a ${streak}-day active streak`);
    if (totalCommits >= 50) strengths.push(`Strong total output of ${totalCommits} commits in the past year`);
    if (activeRepos >= 3) strengths.push(`Active across ${activeRepos} different repositories`);
    if (langCount >= 3) strengths.push(`Multi-language developer using ${langCount} different languages`);
    if (weeklyTrend === "increasing") strengths.push(`Commit frequency is trending upward — great momentum`);
    if (bestStreak >= 30) strengths.push(`Impressive best streak of ${bestStreak} days`);
    if (strengths.length === 0) strengths.push("Building your GitHub presence — every commit counts");

    const weaknesses: string[] = [];
    if (streak < 3) weaknesses.push("Short current streak — try committing daily to build consistency");
    if (weekCommits < 5) weaknesses.push(`Only ${weekCommits} commits this week — aim for at least 5`);
    if (activeRepos <= 1) weaknesses.push("Activity is limited to a single repository");
    if (langCount <= 1) weaknesses.push("Using only one language — explore others to grow");
    if (weeklyTrend === "decreasing") weaknesses.push("Commit frequency has been declining recently");
    if (activeMonths <= 6) weaknesses.push(`Only active in ${activeMonths} months this year — aim for monthly contributions`);
    if (weaknesses.length === 0) weaknesses.push("No significant weaknesses detected — keep up the great work!");

    const recommendations: string[] = [];
    if (streak < 7) recommendations.push("Commit at least once daily for a week to build a solid streak");
    if (streak >= 7 && streak < 30) recommendations.push(`You're on a ${streak}-day streak! Push to 30 for the Consistent badge`);
    if (bestStreak >= 30 && streak < bestStreak) recommendations.push(`Your best streak is ${bestStreak} days — try to beat it`);
    if (weeklyTrend === "decreasing") recommendations.push("Reverse the decline by setting a minimum of 3 commits per week");
    if (activeRepos <= 1) recommendations.push("Create or contribute to another repository for diversity");
    if (langCount <= 1) recommendations.push("Try a new language in your next project to broaden your skills");
    if (dayTotals[0] + dayTotals[6] < Math.max(...dayTotals)) recommendations.push("Weekend commits are low — try to contribute on Saturdays");
    if (repoActivity.length > 1) {
      const inactive = repoActivity.filter((r: any) => r.commits < 3).length;
      if (inactive > 0) recommendations.push(`${inactive} repo(s) have minimal recent activity — consider archiving or reviving them`);
    }
    if (monthlyAvg > 0 && currentMonthCommits < monthlyAvg) recommendations.push(`This month (${currentMonthCommits} commits) is below your monthly average (${monthlyAvg})`);
    if (recommendations.length < 3) recommendations.push("Review your issue tracker and contribute to open issues");
    if (recommendations.length < 3) recommendations.push("Set up a GitHub Actions workflow to automate routine tasks");

    const payload = {
      overallHealth,
      strengths: strengths.slice(0, 5),
      weaknesses: weaknesses.slice(0, 5),
      recommendations: recommendations.slice(0, 6),
      bestDay: { name: dayNames[bestDayIdx], avgCommits: Math.round(avgByDay[bestDayIdx] * 10) / 10 },
      worstDay: { name: dayNames[worstDayIdx], avgCommits: Math.round(avgByDay[worstDayIdx] * 10) / 10 },
      weeklyTrend,
      topRepo,
      topRepos: topRepos.slice(0, 3),
      topLang,
      consistencyScore,
      activityScore,
      weeklyMomentum,
      activeMonths,
      monthlyAvg,
      currentMonthCommits,
      activeRepos,
      langCount,
    };

    setCachedData(cacheKey, payload, 300000);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
