import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export interface ChatMessage { id: string; text: string; senderId: "me" | "partner"; timestamp: number }
const localKey = (roomId: string) => `closer_app:chat_messages:${roomId}`;

async function fetchMessages(uid: string, roomId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase.from("messages").select("id,body,sender_id,created_at")
    .eq("couple_id", roomId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, text: row.body,
    senderId: row.sender_id === uid ? "me" : "partner", timestamp: new Date(row.created_at).getTime() }));
}

export async function clearChatMessages(roomId: string): Promise<void> {
  const { error } = await supabase.from("messages").delete().eq("couple_id", roomId);
  if (error) throw error;
  await AsyncStorage.removeItem(localKey(roomId));
}

export async function sendMessage(text: string, uid: string, roomId: string): Promise<void> {
  const body = text.trim();
  if (!body) return;
  const { error } = await supabase.from("messages").insert({ couple_id: roomId, sender_id: uid, body });
  if (error) throw error;
}

export function subscribeMessages(uid: string, roomId: string, callback: (messages: ChatMessage[]) => void): () => void {
  let active = true;
  const refresh = async () => {
    try {
      const messages = await fetchMessages(uid, roomId);
      if (active) callback(messages);
      await AsyncStorage.setItem(localKey(roomId), JSON.stringify(messages));
    } catch {
      const raw = await AsyncStorage.getItem(localKey(roomId));
      if (active && raw) callback(JSON.parse(raw));
    }
  };
  refresh();
  const channel = supabase.channel(`messages:${roomId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `couple_id=eq.${roomId}` }, refresh)
    .subscribe();
  return () => { active = false; supabase.removeChannel(channel); };
}
