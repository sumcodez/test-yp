import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import LinkedIn from "next-auth/providers/linkedin"
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL;
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, LinkedIn],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          console.error("No email provided");
          return false;
        }

        // const cookieStore = await cookies();
        // const source = cookieStore.get('action')?.value;

        // console.log('User signing in from:', source);

        // First, try to login
        const loginRes = await fetch(`${BACKEND}/api/mobile/social-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            // full_name: user.name || profile?.name || "User",
            // provider: account?.provider,
          }),
        });

        const loginData = await loginRes.json();

        // If login successful, store tokens in HTTP-only cookies
        if (loginRes.ok && loginData?.access) {
          const cookieStore = await cookies();
          
          cookieStore.set("access", loginData.access, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
          });

          if (loginData.refresh) {
            cookieStore.set("refresh", loginData.refresh, {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              secure: process.env.NODE_ENV === "production",
            });
          }

          // Don't store in user object, only in cookies
          return true;
        }

        // If user doesn't exist, try to signup
        if (loginRes.status === 404 || loginData?.status === "USER_NOT_FOUND") {
          const signupRes = await fetch(`${BACKEND}/api/mobile/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              full_name: user.name || profile?.name || "User",
            }),
          });

          const signupData = await signupRes.json();

          if (!signupRes.ok) {
            console.error("Signup failed:", signupData);
            return false;
          }

          // After successful signup, login again
          const loginAfterSignupRes = await fetch(`${BACKEND}/api/mobile/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              full_name: user.name || profile?.name || "User",
              provider: account?.provider,
            }),
          });

          const loginAfterSignupData = await loginAfterSignupRes.json();

          if (loginAfterSignupRes.ok && loginAfterSignupData?.access) {
            const cookieStore = await cookies();
            
            cookieStore.set("access", loginAfterSignupData.access, {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              secure: process.env.NODE_ENV === "production",
            });

            if (loginAfterSignupData.refresh) {
              cookieStore.set("refresh", loginAfterSignupData.refresh, {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
              });
            }
            return true;
          }
        }

        console.error("Authentication failed");
        return false;
        
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
  },
})