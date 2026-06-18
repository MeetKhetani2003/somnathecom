import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    // ─── ENV-based Admin Login ───────────────────────────────────────────────
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          credentials.username === adminUsername &&
          credentials.password === adminPassword
        ) {
          // Return a synthetic admin user — no DB involved
          return {
            id: "env-admin",
            name: "Admin",
            email: "admin@saheli.internal",
            isEnvAdmin: true,
          } as any;
        }

        return null; // Wrong credentials
      },
    }),

    // ─── Dev bypass (local testing) ──────────────────────────────────────────
    CredentialsProvider({
      id: "bypass-login",
      name: "Bypass Login",
      credentials: {
        email: { label: "Email", type: "text" },
        name: { label: "Name", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        await dbConnect();
        let dbUser = await User.findOne({ email: credentials.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: credentials.name || "Test User",
            email: credentials.email,
            image: "",
            role: credentials.role || "user",
            addresses: [],
            defaultAddress: "",
          });
        }
        return {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
        };
      }
    })
  ],

  callbacks: {
    async signIn({ user }) {
      // Env-admin: skip DB entirely
      if ((user as any).isEnvAdmin) return true;
      if (!user.email) return false;
      try {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name || "User",
            email: user.email,
            image: user.image || "",
            role: "user",
            addresses: [],
            defaultAddress: "",
          });
        }
        return true;
      } catch (err) {
        console.error("Error during NextAuth sign-in:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      // Persist isEnvAdmin flag into the JWT on first sign-in
      if (user && (user as any).isEnvAdmin) {
        token.isEnvAdmin = true;
        token.role = "admin";
      }
      return token;
    },

    async session({ session, token }) {
      // Env admin: inject flag directly from JWT, skip DB lookup
      if (token.isEnvAdmin) {
        (session.user as any).isEnvAdmin = true;
        (session.user as any).role = "admin";
        (session.user as any).id = "env-admin";
        return session;
      }

      if (session.user?.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            (session.user as any).role = dbUser.role;
            (session.user as any).id = dbUser._id.toString();
            (session.user as any).addresses = dbUser.addresses || [];
            (session.user as any).defaultAddress = dbUser.defaultAddress || "";
            (session.user as any).phone = dbUser.phone || "";
          }
        } catch (err) {
          console.error("Error during session callback:", err);
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
