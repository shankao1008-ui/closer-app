import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, AppState, Image, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { getLatestPartnerWidgetPhoto } from "../lib/widgetSync";
import { receivedPhotoText } from "../lib/receivedPhotoText";

// A new identity/pair mounts fresh state: never display the previous pair's photo.
export default function ReceivedPhoto() {
  const { uid, coupleId } = useApp();
  return <PhotoInbox key={JSON.stringify([uid, coupleId])} uid={uid} coupleId={coupleId} />;
}

function PhotoInbox({ uid, coupleId }: { uid: string | null; coupleId: string | null }) {
  const { lang, colors } = useApp();
  const copy = receivedPhotoText(lang);
  const [photo, setPhoto] = useState<Awaited<ReturnType<typeof getLatestPartnerWidgetPhoto>>>(null);
  const [busy, setBusy] = useState(!!uid && !!coupleId);
  const [failed, setFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const cached = useRef<{ photo: Awaited<ReturnType<typeof getLatestPartnerWidgetPhoto>>; at: number }>({ photo: null, at: 0 });
  const [retry, setRetry] = useState(0);

  useFocusEffect(useCallback(() => {
    if (!uid || !coupleId) return;
    let disposed = false;
    let inFlight = false;
    const load = async () => {
      if (disposed || inFlight || AppState.currentState !== "active") return;
      inFlight = true;
      setBusy(true);
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        const result = await Promise.race([
          getLatestPartnerWidgetPhoto(coupleId, uid),
          new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("Timeout")), 12000); }),
        ]);
        if (!disposed) {
          const previous = cached.current;
          const keepUrl = result && previous.photo && result.storage_path === previous.photo.storage_path && Date.now() - previous.at < 30 * 60 * 1000;
          const next = keepUrl ? { ...result, url: previous.photo!.url } : result;
          cached.current = { photo: next, at: keepUrl ? previous.at : Date.now() };
          setPhoto(next); setFailed(false); setImageFailed(false);
        }
      } catch {
        if (!disposed) setFailed(true);
      } finally {
        clearTimeout(timeout);
        inFlight = false;
        if (!disposed) setBusy(false);
      }
    };
    void load();
    const appState = AppState.addEventListener("change", state => { if (state === "active") void load(); });
    // Polling also works when Realtime publication is not enabled on the table.
    const interval = setInterval(() => { void load(); }, 15000);
    const channel = supabase.channel(`photo-inbox-${coupleId}-${uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "widget_photos", filter: `couple_id=eq.${coupleId}` }, () => { void load(); })
      .subscribe();
    return () => {
      disposed = true;
      clearInterval(interval);
      appState.remove();
      void supabase.removeChannel(channel);
    };
  }, [uid, coupleId, retry]));

  return <View style={{ padding: 16, borderRadius: 20, backgroundColor: colors.cardBg, gap: 12 }}>
    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.ink }}>{copy.title}</Text>
    {!uid || !coupleId ? <Text style={{ color: colors.inkSoft }}>{copy.pair}</Text> : <>
      {photo && <>
        <Image key={photo.url} source={{ uri: photo.url }} accessibilityLabel={copy.title}
          onError={() => { cached.current.at = 0; setImageFailed(true); }}
          style={{ width: "100%", aspectRatio: 4 / 5, borderRadius: 16 }} resizeMode="contain" />
        {!!photo.caption && <Text style={{ color: colors.ink, fontSize: 16 }}>{photo.caption}</Text>}
      </>}
      {(failed || imageFailed) && <Text accessibilityRole="alert" style={{ color: colors.ink }}>{copy.error}</Text>}
      {!photo && !failed && <Text style={{ color: colors.inkSoft }}>{busy ? copy.loading : copy.empty}</Text>}
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => { cached.current.at = 0; setRetry(n => n + 1); }}
        style={{ minHeight: 44, justifyContent: "center", alignItems: "center", borderRadius: 12, backgroundColor: colors.hairline }}>
        {busy ? <ActivityIndicator accessibilityLabel={copy.loading} color={colors.primaryDeep} /> : <Text style={{ color: colors.ink }}>{copy.refresh}</Text>}
      </Pressable>
    </>}
  </View>;
}
