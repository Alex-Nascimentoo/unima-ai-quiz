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

export async function useSession() {
  const session = (await cookies()).get("session")?.value;
  const decrypted = await decrypt(session);

  if (!session || !decrypted) {
    return null;
  }

  return decrypted as SessionPayload;
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
