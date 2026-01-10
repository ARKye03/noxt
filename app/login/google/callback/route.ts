import { google } from "@/lib/oauth";
import { lucia } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { generateIdFromEntropySize } from "lucia";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;

  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    const googleUser: GoogleUser = await response.json();

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: googleUser.email },
    });

    if (existingUser) {
      // Check if OAuth account is linked
      const existingOAuthAccount = await db.oAuthAccount.findUnique({
        where: {
          providerId_providerUserId: {
            providerId: "google",
            providerUserId: googleUser.sub,
          },
        },
      });

      // Link OAuth account if not already linked
      if (!existingOAuthAccount) {
        await db.oAuthAccount.create({
          data: {
            providerId: "google",
            providerUserId: googleUser.sub,
            userId: existingUser.id,
          },
        });
      }

      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    // Create new user
    const userId = generateIdFromEntropySize(10);

    await db.user.create({
      data: {
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        oauthAccounts: {
          create: {
            providerId: "google",
            providerUserId: googleUser.sub,
          },
        },
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(null, {
      status: 500,
    });
  }
}

interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
}
