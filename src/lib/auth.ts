// ============================================================
// NextAuth Configuration v5 (Beta)
// ============================================================

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";

// Gmail Scopes Required for the App
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
].join(" ");

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: GMAIL_SCOPES,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email || !account) return false;

      // Upsert User to database to store access & refresh tokens
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          image: user.image,
          googleAccessToken: account.access_token,
          googleRefreshToken: account.refresh_token,
          tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
        },
        create: {
          email: user.email,
          name: user.name,
          image: user.image,
          googleAccessToken: account.access_token,
          googleRefreshToken: account.refresh_token,
          tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
          settings: {},
        },
      });

      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Find user ID from database
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: { id: true, googleAccessToken: true },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          // Inject access token for client-side use (if needed for direct Gmail API calls)
          // For security, usually this is kept server-side only, but we put it here for the orchestrator endpoints
          (session as any).accessToken = dbUser.googleAccessToken;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
});
