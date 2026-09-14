import { File } from "expo-file-system";
import { supabase } from "./supabase";

function fileType(uri: string) {
  const lower = uri.toLowerCase();
  if (lower.includes(".png")) return { mime: "image/png", ext: "png" };
  if (lower.includes(".webp")) return { mime: "image/webp", ext: "webp" };
  return { mime: "image/jpeg", ext: "jpg" };
}

export async function sendPartnerWidgetPhoto({ uri, coupleId, senderId, caption }:
  { uri: string; coupleId: string; senderId: string; caption: string }) {
  const { mime, ext } = fileType(uri);
  const file = new File(uri);
  if (!file.exists) throw new Error("PHOTO_NOT_FOUND");
  if (file.size > 10 * 1024 * 1024) throw new Error("PHOTO_TOO_LARGE");
  const storagePath = `${coupleId}/${Date.now()}-${senderId}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("partner-photos")
    .upload(storagePath, await file.arrayBuffer(), { contentType: mime, upsert: false });
  if (uploadError) throw uploadError;
  const { error: recordError } = await supabase.from("widget_photos").insert({
    couple_id: coupleId, sender_id: senderId, storage_path: storagePath, caption: caption.trim().slice(0, 100),
  });
  if (recordError) {
    await supabase.storage.from("partner-photos").remove([storagePath]);
    throw recordError;
  }
  return storagePath;
}

export async function getLatestPartnerWidgetPhoto(coupleId: string, myUid: string) {
  const { data, error } = await supabase.from("widget_photos")
    .select("storage_path,caption,created_at,sender_id").eq("couple_id", coupleId)
    .neq("sender_id", myUid).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: signed, error: signedError } = await supabase.storage.from("partner-photos")
    .createSignedUrl(data.storage_path, 3600);
  if (signedError) throw signedError;
  return { ...data, url: signed.signedUrl };
}
