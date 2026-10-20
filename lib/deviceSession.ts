import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// One in-flight request per client: startup and pairing must share an identity.
const pending = new WeakMap<SupabaseClient, Promise<Session>>();
export function ensureDeviceSession(client: SupabaseClient = supabase): Promise<Session> {
  const existing = pending.get(client);
  if (existing) return existing;
  const request = (async () => {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (data.session) return data.session; // Preserve existing email and guest accounts.
    const result = await client.auth.signInAnonymously();
    if (result.error) throw result.error;
    if (!result.data.session) throw new Error("DEVICE_SESSION_MISSING");
    return result.data.session;
  })();
  pending.set(client, request);
  void request.then(() => pending.delete(client), () => pending.delete(client));
  return request;
}
