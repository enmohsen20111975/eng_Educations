import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * NextAuth v4 — real multi-user auth for the SaaS.
 * - Credentials (email + password, bcrypt-hashed) — works without OAuth setup.
 * - Google OAuth — enabled when GOOGLE_CLIENT_ID/SECRET are set (SaaS production).
 * - JWT session strategy (stateless, fast, edge-friendly — no DB session reads).
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: "/auth/signin" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.emailVerified) return null;
        // Password stored as bcrypt hash in User.image? No — store in a separate
        // field. We use User.name for display; password hash goes in a dedicated
        // column added below (passwordHash). Verify:
        const ok = await bcrypt.compare(password, (user as any).passwordHash || "");
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name || undefined, image: user.image || undefined, role: (user as any).role || "learner", tier: (user as any).tier || "free" } as any;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role || "learner";
        token.tier = (user as any).tier || "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).tier = token.tier;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "production" ? undefined : "eng-edu-dev-local-only-not-for-prod"),
};
