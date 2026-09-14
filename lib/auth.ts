import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

export const AUTH_CALLBACK_URL = Constants.executionEnvironment === "storeClient"
  ? Linking.createURL("auth/callback")
  : "closerappnative://auth/callback";

if (__DEV__) console.info("[Closer] Supabase Redirect URL: " + AUTH_CALLBACK_URL);

export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: AUTH_CALLBACK_URL },
  });
  if (error) throw error;
}

export function isAuthCallbackUrl(url: string) {
  const base = url.split(/[?#]/)[0];
  return base === AUTH_CALLBACK_URL || base === "closerappnative://auth/callback";
}

export async function withAuthTimeout<T>(operation: Promise<T>, ms = 15_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("AUTH_TIMEOUT")), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

// Router and Linking can deliver the same one-use link more than once.
let lastUrl: string | null = null;
let lastAttempt: Promise<void> | null = null;
export function createSessionFromUrl(url: string): Promise<void> {
  if (!isAuthCallbackUrl(url)) return Promise.resolve();
  if (url === lastUrl && lastAttempt) return lastAttempt;
  lastUrl = url;
  lastAttempt = establishSession(url);
  return lastAttempt;
}

async function establishSession(url: string): Promise<void> {
  const parsed = Linking.parse(url);
  const query = parsed.queryParams ?? {};
  const hash = new URLSearchParams(url.includes("#") ? url.slice(url.indexOf("#") + 1) : "");
  const param = (key: string) =>
    (typeof query[key] === "string" ? query[key] as string : null) ?? hash.get(key);
  // Do not log the callback URL, access token, or provider error description.
  if (param("error") || param("error_code") || param("error_description")) {
    throw new Error("AUTH_LINK_REJECTED");
  }
  const code = param("code");
  if (code) {
    const { error } = await withAuthTimeout(supabase.auth.exchangeCodeForSession(code));
    if (error) throw new Error("AUTH_LINK_REJECTED");
    return;
  }
  const accessToken = param("access_token");
  const refreshToken = param("refresh_token");
  if (!accessToken || !refreshToken) throw new Error("AUTH_LINK_MISSING_TOKENS");
  const { error } = await withAuthTimeout(supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }));
  if (error) throw new Error("AUTH_LINK_REJECTED");
}

export async function uploadAvatar(userId: string, uri: string) {
  const response = await fetch(uri);
  const body = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `${userId}/profile.${extension}`;
  const { error } = await supabase.storage.from("avatars").upload(path, body, { contentType, upsert: true });
  if (error) throw error;
  return path;
}

export async function getAvatarUrl(path: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
