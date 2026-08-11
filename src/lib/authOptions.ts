import { ObjectId } from "mongodb";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import getClientPromise from "./mongodb";
import { connectDB } from "./mongoose";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(getClientPromise()),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
        params: { scope: "read:user user:email repo" },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      const client = await getClientPromise();
      const db = client.db();
      const account = await db.collection("accounts").findOne({
        userId: new ObjectId(user.id),
        provider: "github",
      });

      const githubId = account?.providerAccountId as string | undefined;
      const githubUsername = user.name || "";

      if (session.user) {
        (session.user as Record<string, unknown>).githubId = githubId || "";
        (session.user as Record<string, unknown>).githubUsername =
          githubUsername;
      }

      try {
        await connectDB();
        await User.findOneAndUpdate(
          { githubId },
          {
            $set: {
              githubId,
              githubUsername,
              name: user.name,
              email: user.email,
              image: user.image,
            },
          },
          { upsert: true, new: true }
        );
      } catch {
        /* non-blocking */
      }

      return session;
    },
  },
};
