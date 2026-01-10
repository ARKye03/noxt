"use server";

import { lucia, validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateIdFromEntropySize } from "lucia";
import { Argon2id } from "oslo/password";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  // Basic validation
  if (!email || !password || password.length < 6) {
    redirect("/signup?error=Invalid email or password (minimum 6 characters)");
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    redirect("/signup?error=User with this email already exists");
  }

  // Hash password
  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateIdFromEntropySize(10);

  // Create user
  await db.user.create({
    data: {
      id: userId,
      email,
      name: name || null,
      hashedPassword,
    },
  });

  // Create session
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  redirect("/");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=Invalid email or password");
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login?error=Invalid email or password");
  }

  // Verify password
  const validPassword = await new Argon2id().verify(user.hashedPassword, password);

  if (!validPassword) {
    redirect("/login?error=Invalid email or password");
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  redirect("/");
}

export async function logout() {
  const { session } = await validateRequest();

  if (!session) {
    redirect("/login");
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  redirect("/login");
}
