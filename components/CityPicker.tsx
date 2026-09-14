// components/CityPicker.tsx
import { Search, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useApp } from "../context/AppContext";
import { City, localizeCityName, localizeCountryName, searchGlobalCities } from "../lib/cities";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
  currentCity?: City;
};

export default function CityPicker({ visible, onClose, onSelect, currentCity }: Props) {
  const { colors, t, lang } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchId = useRef(0);
  const emptyText = lang === "zh-Hant"
    ? (query.length >= 1 ? "找不到符合的城市" : "輸入城市名稱搜尋")
    : (query.length >= 1 ? "No matching cities found" : "Type a city name to search");

  useEffect(() => {
    const currentSearch = ++searchId.current;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const cities = await searchGlobalCities(trimmed, lang);
      if (currentSearch === searchId.current) {
        setResults(cities);
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, lang]);

  const handleSearch = (text: string) => setQuery(text);

  const handleSelect = (city: City) => {
    onSelect(city);
    setQuery("");
    setResults([]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.cardBg }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.ink }]}>{t("myCity")}</Text>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.hairline }]}>
              <X size={16} color={colors.ink} />
            </Pressable>
          </View>

          {currentCity && (
            <View style={[styles.currentCity, { backgroundColor: colors.chipBg, borderColor: colors.hairline }]}>
              <Text style={{ fontSize: 12, color: colors.inkSoft }}>{t("selectedCity")}</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}>
                {currentCity.emoji} {localizeCityName(currentCity.name, lang)}, {localizeCountryName(currentCity.country, lang)}
              </Text>
            </View>
          )}

          <View style={[styles.searchBox, { borderColor: colors.hairline, backgroundColor: colors.inputBg }]}>
            <Search size={16} color={colors.inkSoft} />
            <TextInput
              value={query}
              onChangeText={handleSearch}
              placeholder={t("searchCity")}
              placeholderTextColor={colors.inkSoft}
              style={[styles.input, { color: colors.ink }]}
            />
            {query.length > 0 && (
              <Pressable onPress={() => handleSearch("")}>
                <X size={14} color={colors.inkSoft} />
              </Pressable>
            )}
            {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => `${item.name}-${item.lat}-${item.lon}`}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={[styles.resultItem, { borderBottomColor: colors.hairline }]}
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>{item.emoji}</Text>
                <View style={styles.resultText}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.ink }}>{localizeCityName(item.name, lang)}</Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft }}>{localizeCountryName(item.country, lang)}</Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.inkSoft, marginLeft: "auto" }}>{item.tz.split("/")[1]}</Text>
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: "center", color: colors.inkSoft, fontSize: 13, padding: 20 }}>
                {emptyText}
              </Text>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(20,14,20,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxHeight: "80%", borderRadius: 22, padding: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontWeight: "700", fontSize: 16 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  currentCity: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12, alignItems: "center" },
  searchBox: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 14 },
  list: { maxHeight: 300, marginTop: 8 },
  resultItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  resultText: { flex: 1 },
});
