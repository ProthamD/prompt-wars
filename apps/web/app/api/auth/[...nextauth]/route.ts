export const runtime = 'nodejs';

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
        mode:     { label: "Mode",     type: "text" },   // "login" | "signup"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password.");
        }

        const mode = credentials.mode ?? "login";

        try {
          const client = await clientPromise;
          const db     = client.db("terraprint");
          const users  = db.collection("users");

          const existing = await users.findOne({ email: credentials.email });

          // ── SIGN UP ──────────────────────────────────────────────────────
          if (mode === "signup") {
            if (existing) {
              throw new Error("An account with this email already exists. Please sign in.");
            }
            if (credentials.password.length < 8) {
              throw new Error("Password must be at least 8 characters.");
            }
            const hashed  = await bcrypt.hash(credentials.password, 12);
            const newUser = {
              email:     credentials.email,
              password:  hashed,
              name:      credentials.email.split("@")[0],
              createdAt: new Date(),
            };
            const result = await users.insertOne(newUser);
            return {
              id:    result.insertedId.toString(),
              email: newUser.email,
              name:  newUser.name,
            };
          }

          // ── LOGIN ─────────────────────────────────────────────────────────
          if (!existing) {
            throw new Error("No account found with this email. Please sign up first.");
          }
          if (!existing.password) {
            // Account was created via Google OAuth — no password set
            throw new Error("This account uses Google sign-in. Please continue with Google.");
          }
          const valid = await bcrypt.compare(credentials.password, existing.password);
          if (!valid) {
            throw new Error("Incorrect password.");
          }
          return {
            id:    existing._id.toString(),
            email: existing.email,
            name:  existing.name ?? null,
          };

        } catch (err: any) {
          // Re-throw user-facing errors as-is
          const knownErrors = [
            "Please enter your email and password.",
            "An account with this email already exists. Please sign in.",
            "Password must be at least 8 characters.",
            "No account found with this email. Please sign up first.",
            "This account uses Google sign-in. Please continue with Google.",
            "Incorrect password.",
          ];
          if (knownErrors.includes(err.message)) throw err;

          // Wrap unexpected DB/network errors
          console.error("[Auth] Unexpected error:", err);
          throw new Error("Unable to connect. Please try again in a moment.");
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.id as string;
        session.user.name          = token.name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/"))     return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
