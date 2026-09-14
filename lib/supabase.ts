import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const supabaseUrl = "https://oacrbiiqjmxcojpiujdc.supabase.co";
const supabasePublishableKey = "sb_publishable_BNiSnSoyNpjoA8GB5FJJGg_SEr8EK0T";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
