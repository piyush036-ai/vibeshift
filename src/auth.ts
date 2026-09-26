import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    login?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo pull_request",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token["accessToken"] = account.access_token;
        token["login"] = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token["accessToken"] as string | undefined;
      session.login = token["login"] as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

