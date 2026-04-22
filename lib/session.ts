"use server";

import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionUser } from "./_types";
import { NextRequest, NextResponse } from "next/server";

export type SessionPayload = {
  user: SessionUser;
  expires: Date;
};

const EXPIRE_TIME = process.env.EXPIRE_TIME
  ? parseInt(process.env.EXPIRE_TIME)
  : 24 * 60 * 60 * 1000;
const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expires)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log(error);
    }

    console.log("Failed to verify session");
  }
}

/**
 * Read the session payload from cookies.
 *
 * Supports being called with an optional NextRequest (middleware or edge)
 * or without (server component / server action) where it will read cookies()
 * from next/headers.
 *
 * Returns the decoded SessionPayload or null when missing/invalid.
 */
export async function getSessionPayload(req?: NextRequest | null) {
  const session = req
    ? req.cookies.get("session")?.value
    : (await cookies()).get("session")?.value;

  const decrypted = await decrypt(session);

  if (!session || !decrypted) {
    return null;
  }

  return decrypted as SessionPayload;
}

/**
 * Helper: returns the SessionUser (user) from the session, or null.
 * Accepts an optional NextRequest so it can be used in middleware or other
 * server contexts that provide the request object.
 */
export async function getSessionUser(req?: NextRequest | null) {
  const payload = await getSessionPayload(req);
  if (!payload) return null;
  return (payload as SessionPayload).user;
}

/**
 * Backwards-compatible useSession: returns the full payload (SessionPayload | null)
 * by delegating to getSessionPayload.
 */
export async function useSession() {
  return await getSessionPayload();
}

export async function createSession(user: SessionUser) {
  const expires = new Date(Date.now() + EXPIRE_TIME);
  const session = await encrypt({ user, expires });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function updateSession(req: NextRequest) {
  const session = req.cookies.get("session")?.value;

  const payload = await decrypt(session);
  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + EXPIRE_TIME);
  payload.expires = expires;

  const res = NextResponse.next();
  res.cookies.set("session", await encrypt(payload as SessionPayload), {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
  });

  return res;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
