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
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: { scope: "read:user user:email repo" },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.login || profile.name || "GitHub User",
          email: profile.email || `${profile.id}+${profile.login}@users.noreply.github.com`,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email && profile && typeof profile === "object") {
        const p = profile as Record<string, any>;
        user.email = `${p.id || Date.now()}+${p.login || "user"}@users.noreply.github.com`;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = account.providerAccountId;
      }
      if (profile && typeof profile === "object" && "login" in profile) {
        token.githubUsername = profile.login as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as Record<string, unknown>).githubId = token.githubId || "";
        (session.user as Record<string, unknown>).githubUsername = token.githubUsername || "";

        if (token.githubId) {
          try {
            await connectDB();
            await User.findOneAndUpdate(
              { githubId: token.githubId as string },
              {
                $set: {
                  githubId: token.githubId as string,
                  githubUsername: (token.githubUsername as string) || "",
                  name: session.user.name,
                  email: session.user.email,
                  image: session.user.image,
                },
              },
              { upsert: true, new: true }
            );
          } catch {
            /* non-blocking */
          }
        }
      }
      return session;
    },
  },
};
