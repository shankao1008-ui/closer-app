import { supabase } from "./supabase";

import { ensureDeviceSession } from "./deviceSession";

export async function createPairingCode(_uid?: string): Promise<string> {
  await ensureDeviceSession();
  const { data, error } = await supabase.rpc("create_pairing_code");
  if (error) throw error;
  return String(data);
}

export async function redeemPairingCode(code: string, _uid?: string): Promise<string> {
  await ensureDeviceSession();
  const { data, error } = await supabase.rpc("join_with_pairing_code", { input_code: code.trim().toUpperCase() });
  if (error) throw error;
  return String(data);
}

export async function unpairCouple(_uid?: string, _coupleId?: string): Promise<void> {
  await ensureDeviceSession();
  const { error } = await supabase.rpc("unpair_current_user");
  if (error) throw error;
}
