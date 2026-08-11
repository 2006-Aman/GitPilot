import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getStats } from "@/lib/getStats";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const stats = await getStats(session.user.id);

    const {
      totalCommits, weekCommits, streak, bestStreak, totalActiveDays,
      repoCount, followers, totalStars, totalForks,
      weeksData = [], monthsData = [],
      repoActivity = [], languages = [], dailyArray365 = [],
    } = stats;

    const userName = session.user.name || "Developer";
    const topRepo = repoActivity[0]?.name || null;
    const topLang = languages[0]?.name || null;
    const activeRepos = repoActivity.length;
    const langCount = languages.length;

    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (const item of dailyArray365) {
      const d = new Date(item.date + "T00:00:00");
      const day = d.getDay();
      dayTotals[day] += item.count;
      if (item.count > 0) dayCounts[day]++;
    }
    const avgByDay = dayTotals.map((t, i) => dayCounts[i] > 0 ? t / dayCounts[i] : 0);
    const bestDayIdx = avgByDay.indexOf(Math.max(...avgByDay));
    const bestDay = dayNames[bestDayIdx];

    const weeklyTrend = weeksData.length >= 2
      ? weeksData[weeksData.length - 1] > weeksData[0] ? "increasing" : weeksData[weeksData.length - 1] < weeksData[0] ? "decreasing" : "stable"
      : "stable";

    const activeMonths = monthsData.filter((m: number) => m > 0).length;
    const monthlyAvg = activeMonths > 0 ? Math.round(totalCommits / activeMonths) : 0;

    const consistencyScore = bestStreak > 0 ? Math.min(100, Math.round((streak / Math.max(bestStreak, 1)) * 100)) : 0;
    const activityScore = Math.min(100, Math.round((totalActiveDays / 365) * 100));
    const overallHealth = Math.min(100, Math.round((consistencyScore * 0.3 + activityScore * 0.3 + 50 * 0.25 + Math.min(20, langCount * 3 + Math.min(activeRepos, 5) * 2))));

    const q = message.toLowerCase().trim();

    let reply = "";

    if (q.includes("productivity") || q.includes("performance") || q.includes("how am i doing") || q.includes("progress")) {
      reply = [
        `**Productivity Report for ${userName}**\n`,
        `📊 **Overall Health Score:** ${overallHealth}/100`,
        `📈 **Total Commits (1 year):** ${totalCommits}`,
        `🔥 **This Week:** ${weekCommits} commits across ${activeRepos} repos`,
        `⛓️ **Streak:** ${streak} days (best: ${bestStreak})`,
        `📅 **Most Productive Day:** ${bestDay}`,
        `📆 **Active Months:** ${activeMonths}/12`,
        ``,
        weeklyTrend === "increasing" ? "📈 **Trend:** Your commit frequency is increasing — great momentum!" :
        weeklyTrend === "decreasing" ? "📉 **Trend:** Your commits have slowed down recently. Time to pick up!" :
        "📊 **Trend:** Your commit frequency is stable.",
        streak >= 7 ? `✅ Solid ${streak}-day streak! Keep it going!` : `💡 A 7-day streak would unlock the Consistency milestone.`,
      ].join("\n");
    }
    else if (q.includes("improve") || q.includes("advice") || q.includes("tip") || q.includes("suggestion") || q.includes("better") || q.includes("grow")) {
      const tips: string[] = [];
      if (streak < 7) tips.push("**Build a streak** — Commit at least once daily for 7 days. This alone boosts your health score significantly.");
      if (weekCommits < 5) tips.push(`**Increase weekly output** — You made ${weekCommits} commits this week. Aim for 5+ to stay consistent.`);
      if (activeRepos <= 1) tips.push("**Expand your horizons** — You're active in only 1 repo. Contributing to another project builds diversity.");
      if (langCount <= 1) tips.push("**Learn a new language** — You're using just 1 language. Try exploring something new for your next project.");
      if (weeklyTrend === "decreasing") tips.push("**Reverse the decline** — Your commit trend is downward. Set a goal of 3 commits per week to get back on track.");
      if (streak < 30 && streak >= 7) tips.push(`**Push to 30 days** — You're on a ${streak}-day streak. The Consistent badge awaits at 30!`);
      if (bestStreak > 0 && streak < bestStreak) tips.push(`**Beat your record** — Your best streak is ${bestStreak} days. Can you surpass it?`);
      if (activeMonths < 12) tips.push(`**Monthly consistency** — You were active in ${activeMonths} months this year. Try to contribute every month.`);
      if (totalStars > 0) tips.push(`**Leverage your stars** — Your repos have ${totalStars} total stars. Engage with your stargazers by responding to issues.`);
      if (tips.length === 0) tips.push("You're doing great! Keep maintaining your current momentum.");
      if (tips.length < 3) tips.push("Review your repo issues and contribute to open source for broader impact.");

      reply = [
        `**Personalized Advice for ${userName}**\n`,
        `Based on your GitHub data (${totalCommits} commits, ${streak}-day streak, ${repoCount} repos), here's how to level up:\n`,
        ...tips.map((t, i) => `${i + 1}. ${t}`),
      ].join("\n");
    }
    else if (q.includes("summarise") || q.includes("summarize") || q.includes("summary") || q.includes("overview") || q.includes("repo") || q.includes("repository")) {
      const lines: string[] = [
        `**GitHub Overview for ${userName}**\n`,
        `📁 **Repositories:** ${repoCount} total`,
        `⭐ **Stars:** ${totalStars}  |  🍴 **Forks:** ${totalForks}  |  👥 **Followers:** ${followers}`,
        `📝 **Commits (1 year):** ${totalCommits}`,
        `🔥 **Current Streak:** ${streak} days  |  🏆 **Best Streak:** ${bestStreak} days`,
        `🎯 **Active Days:** ${totalActiveDays} out of 365`,
      ];
      if (topRepo) lines.push(`📌 **Top Repo:** \`${topRepo}\` (${repoActivity[0].commits} commits)`);
      if (topLang) lines.push(`🔤 **Primary Language:** ${topLang}`);
      if (languages.length > 1) {
        const others = languages.slice(1, 4).map((l: any) => l.name).join(", ");
        lines.push(`🌐 **Also uses:** ${others}`);
      }
      if (repoActivity.length > 0) {
        const activeList = repoActivity.slice(0, 5).map((r: any) => `  • \`${r.name}\` — ${r.commits} commits`).join("\n");
        lines.push(`\n**Active Repositories:**\n${activeList}`);
      }
      reply = lines.join("\n");
    }
    else if (q.includes("habit") || q.includes("review") || q.includes("analyze") || q.includes("pattern")) {
      const strengths: string[] = [];
      const improvements: string[] = [];
      if (streak >= 7) strengths.push(`Consistent ${streak}-day streak`);
      else improvements.push(`Short streak (${streak} days) — aim for 7+`);
      if (totalCommits >= 50) strengths.push(`High total output (${totalCommits} commits)`);
      else improvements.push(`Only ${totalCommits} total commits this year`);
      if (activeRepos >= 3) strengths.push(`Active across ${activeRepos} repos`);
      else improvements.push(`Activity limited to ${activeRepos} repo(s)`);
      if (langCount >= 3) strengths.push(`Multi-language (${langCount} languages)`);
      else if (langCount <= 1) improvements.push(`Only using ${langCount} language`);
      if (weeklyTrend === "increasing") strengths.push(`Commit frequency is trending up`);
      else if (weeklyTrend === "decreasing") improvements.push(`Commit frequency is declining`);
      if (totalStars > 0) strengths.push(`${totalStars} stars across repos — community认可`);

      reply = [
        `**Coding Habits Analysis for ${userName}**\n`,
        `**⏱️ Best Day:** ${bestDay} (${Math.round(avgByDay[bestDayIdx] * 10) / 10} avg commits/active day)`,
        `**📊 Weekly Trend:** ${weeklyTrend.charAt(0).toUpperCase() + weeklyTrend.slice(1)}`,
        `\n**✅ Strengths**\n${strengths.map((s) => `  • ${s}`).join("\n")}`,
        `\n**🔧 Areas to Improve**\n${improvements.length > 0 ? improvements.map((s) => `  • ${s}`).join("\n") : "  None — you're crushing it!"}`,
        `\n💡 **Tip:** ${bestDay} is your most productive day. Try scheduling important commits then!`,
      ].join("\n");
    }
    else if (q.includes("career") || q.includes("job") || q.includes("portfolio") || q.includes("growth")) {
      reply = [
        `**Career Insights for ${userName}**\n`,
        `📈 **Profile Strength:** ${overallHealth}/100`,
        `📁 **Portfolio:** ${repoCount} repositories showcase your work`,
        `⭐ **Community Impact:** ${totalStars} stars across your projects`,
        `🔤 **Tech Stack:** ${langCount > 0 ? languages.map((l: any) => l.name).slice(0, 4).join(", ") : "Building it!"}`,
        `🔥 **Consistency:** ${streak}-day streak shows dedication`,
        `\n💡 **Recommendations:**`,
        topRepo ? `  • Feature \`${topRepo}\` prominently on your resume` : "",
        totalCommits > 0 ? `  • Your ${totalCommits} commits demonstrate active development` : "",
        followers > 0 ? `  • ${followers} followers — engaging with your audience builds reputation` : "  • Engage with the community to grow your following",
        `  • Keep your GitHub activity public and consistent`,
      ].filter(Boolean).join("\n");
    }
    else if (q.includes("streak") || q.includes("consistency")) {
      reply = [
        `**Streak Analysis for ${userName}**\n`,
        `🔥 **Current Streak:** ${streak} days`,
        `🏆 **Best Streak:** ${bestStreak} days`,
        `📅 **Active Days:** ${totalActiveDays} out of 365 (${Math.round((totalActiveDays / 365) * 100)}%)`,
        `📊 **Consistency Score:** ${consistencyScore}%`,
        `\n${streak === 0 ? "Start your streak today with a single commit!" :
          streak < 7 ? `You're on a ${streak}-day streak! Reach 7 for the first milestone.` :
          streak < 30 ? `Nice ${streak}-day streak! Next goal: 30 days for the Consistent badge.` :
          streak < 100 ? `Impressive ${streak}-day streak! Can you reach 100?` :
          `Legendary ${streak}-day streak! You're a machine!`}`,
        bestStreak > streak && streak > 0 ? `\n🎯 **Challenge:** Your best is ${bestStreak} days — try to beat it!` : "",
      ].join("\n");
    }
    else if (q.includes("top repo") || q.includes("most active") || q.includes("popular")) {
      const sorted = [...repoActivity].sort((a: any, b: any) => b.commits - a.commits);
      if (sorted.length === 0) {
        reply = "No repository activity data available yet. Sync your repos to get started!";
      } else {
        reply = [
          `**Repository Activity Report**\n`,
          ...sorted.slice(0, 5).map((r: any, i: number) =>
            `**${i + 1}. \`${r.name}\`** — ${r.commits} commits${i === 0 ? " ⭐ (most active)" : ""}`
          ),
          `\nTotal: ${repoCount} repositories, ${totalCommits} total commits across all repos.`,
        ].join("\n");
      }
    }
    else if (q.includes("language") || q.includes("tech") || q.includes("stack")) {
      if (languages.length === 0) {
        reply = "No language data detected yet. Push code to your repos to generate language insights.";
      } else {
        const total = languages.reduce((a: number, l: any) => a + l.count, 0);
        reply = [
          `**Language Breakdown for ${userName}**\n`,
          ...languages.map((l: any) => {
            const pct = Math.round((l.count / total) * 100);
            return `  • **${l.name}** — ${pct}% (${l.count} repo${l.count > 1 ? "s" : ""})`;
          }),
          `\n🔤 **Primary:** ${topLang || "N/A"}`,
          langCount > 1 ? `🌐 **You work in ${langCount} different languages**` : `💡 Try exploring another language for broader skills`,
        ].join("\n");
      }
    }
    else if (q.includes("stats") || q.includes("numbers") || q.includes("data") || q.includes("metrics")) {
      reply = [
        `**GitHub Stats for ${userName}**\n`,
        `📝 **Total Commits (1 year):** ${totalCommits}`,
        `📅 **This Week:** ${weekCommits} commits`,
        `🔥 **Streak:** ${streak} days (best: ${bestStreak})`,
        `🎯 **Active Days:** ${totalActiveDays}/365`,
        `📁 **Repositories:** ${repoCount}`,
        `⭐ **Stars:** ${totalStars}`,
        `🍴 **Forks:** ${totalForks}`,
        `👥 **Followers:** ${followers}`,
        `🔤 **Languages:** ${langCount}`,
        `📆 **Active Months:** ${activeMonths}/12`,
        `📊 **Health Score:** ${overallHealth}/100`,
      ].join("\n");
    }
    else if (q.includes("hello") || q.includes("hi ") || q.includes("hey") || q === "hi") {
      reply = [
        `Hey ${userName}! 👋`,
        `I'm your AI copilot. I can tell you about your **productivity**, **coding habits**, **repository summary**, **career insights**, and more.`,
        `\nTry asking:`,
        `  • "How is my productivity?"`,
        `  • "Give me advice"`,
        `  • "Summarize my repos"`,
        `  • "Review my coding habits"`,
        `  • "Career tips"`,
      ].join("\n");
    }
    else {
      reply = [
        `I'm analyzing your GitHub in real-time. Here's what I know:\n`,
        `📁 ${repoCount} repos  |  📝 ${totalCommits} commits  |  🔥 ${streak}-day streak`,
        `📊 Health Score: ${overallHealth}/100  |  🎯 Best Day: ${bestDay}`,
        `\nYou can ask me about:`,
        `  • **Productivity** — overall performance & trends`,
        `  • **Advice** — personalized tips to improve`,
        `  • **Summary** — overview of all repos`,
        `  • **Habits** — coding pattern analysis`,
        `  • **Career** — portfolio & growth insights`,
        `  • **Streaks** — detailed streak breakdown`,
        `  • **Languages** — tech stack breakdown`,
        `  • **Stats** — raw numbers & metrics`,
      ].join("\n");
    }

    return NextResponse.json({ reply });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
