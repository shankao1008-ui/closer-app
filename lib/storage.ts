import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const PREFIX = "closer_app:";

export async function saveJSON(key: string, value: any) {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn("saveJSON failed", key, e);
  }
}

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}

/**
 * expo-image-picker 給的照片網址常常放在暫存快取（cache）資料夾，
 * App 重開或系統清快取時可能會不見。這個函式把照片複製一份到
 * App 自己的永久資料夾（documentDirectory），回傳新的、可長久使用的網址。
 */
export async function persistPhoto(sourceUri: string, filenamePrefix: string) {
  try {
    const dir = FileSystem.documentDirectory + "closer_photos/";
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    const ext = sourceUri.split(".").pop()?.split("?")[0] || "jpg";
    const destUri = `${dir}${filenamePrefix}_${Date.now()}.${ext}`;
    await FileSystem.copyAsync({ from: sourceUri, to: destUri });
    return destUri;
  } catch (e) {
    console.warn("persistPhoto failed", e);
    return sourceUri; // fallback to original if copy fails
  }
}
