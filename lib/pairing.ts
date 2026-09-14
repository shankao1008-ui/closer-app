import { supabase } from "./supabase";

async function ensureSession() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (session) return session;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.session) throw new Error("無法建立登入工作階段，請重新開啟 App");
  return data.session;
}

export async function createPairingCode(_uid?: string): Promise<string> {
  await ensureSession();
  const { data, error } = await supabase.rpc("create_pairing_code");
  if (error) throw error;
  return String(data);
}

export async function redeemPairingCode(code: string, _uid?: string): Promise<string> {
  await ensureSession();
  const { data, error } = await supabase.rpc("join_with_pairing_code", { input_code: code.trim().toUpperCase() });
  if (error) throw error;
  return String(data);
}

export async function unpairCouple(_uid?: string, _coupleId?: string): Promise<void> {
  const { error } = await supabase.rpc("unpair_current_user");
  if (error) throw error;
}
