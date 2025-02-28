import NextAuth from "next-auth/next"
import { authConfig } from "./auth.config"

export const { auth, signIn, signOut } = NextAuth(authConfig)
