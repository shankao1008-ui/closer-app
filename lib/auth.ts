import { supabase } from "./supabase";

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
