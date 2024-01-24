import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import db from "@/backend/config/db";
import User, { IUser } from "@/backend/models/user";
import { NextApiRequest, NextApiResponse } from "next";

type Credentials = {
  email: string;
  password: string;
};

async function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    session: {
      strategy: "jwt",
    },
    providers: [
      CredentialsProvider({
        //@ts-ignore
        async authorize(credentials: Credentials) {
          db();
          const { email, password } = credentials;

          const user = await User.findOne({ email }).select("+password");

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isPasswordMatched = await bcrypt.compare(
            password,
            user.password
          );
          if (!isPasswordMatched) {
            throw new Error("Invalid email or password");
          }

          return user;
        },
      }),
    ],
    callbacks: {
      jwt: async ({ token, user }) => {
        user && (token.user = user);

        // TODO - update session when user is updated

        return token;
      },
      session: async ({ session, token }) => {
        session.user = token.user as IUser;

        //@ts-ignore
        delete session?.user?.password;
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  });
}

export { auth as GET, auth as POST };
