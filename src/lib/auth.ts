import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: "jwt",
    },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user || !user.password) {
            return null;
          }

          if (!user.emailVerified) {
            throw new Error('Please verify your email address before signing in');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }
      })
    ],
    callbacks: {
      async signIn({ user, account, profile }) {
        // Only handle OAuth sign-ins (Google)
        if (account?.provider === 'google') {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { accounts: true }
          });

          if (existingUser) {
            // User exists with email/password
            if (existingUser.password && !existingUser.emailVerified) {
              // User hasn't verified their email yet
              throw new Error('Please verify your email address before signing in with Google');
            }

            // Check if Google account is already linked
            const googleAccount = existingUser.accounts.find(
              acc => acc.provider === 'google'
            );

            if (!googleAccount) {
              // Link the Google account to existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                }
              });
            }

            // Update user info if needed
            if (profile?.name && !existingUser.name) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { name: profile.name }
              });
            }

            // Return the existing user
            return true;
          }

          // New user, proceed with normal OAuth flow
          return true;
        }

        // For credentials provider, proceed normally
        return true;
      },
      session: async ({ session, token }) => {
        if (session?.user && token?.sub) {
          session.user.id = token.sub;
        }
        return session;
      }
    },
    pages: {
      signIn: '/auth/signin',
    },
  };