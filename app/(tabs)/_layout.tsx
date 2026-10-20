import { View } from "react-native";
import { Tabs } from "expo-router";
import { Camera, Home, MessageCircle, Users } from "lucide-react-native";
import { useApp } from "../../context/AppContext";

export default function TabsLayout() {
  const { colors, t } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDeep,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: {
          backgroundColor: colors.navBg,
          borderTopColor: colors.hairline,
          borderTopWidth: 0,
          borderTopLeftRadius: 26, borderTopRightRadius: 26,
          elevation: 8, shadowColor: colors.ink, shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: -4 },
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("tabHome"), tabBarIcon: ({ color, size, focused }) => <View style={{ backgroundColor: focused ? colors.primary + "20" : "transparent", paddingHorizontal: 16, paddingVertical: 5, borderRadius: 16 }}><Home color={color} size={size - 2} strokeWidth={focused ? 2.5 : 1.7} /></View> }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: t("tabChat"), tabBarIcon: ({ color, size, focused }) => <View style={{ backgroundColor: focused ? colors.primary + "20" : "transparent", paddingHorizontal: 16, paddingVertical: 5, borderRadius: 16 }}><MessageCircle color={color} size={size - 2} strokeWidth={focused ? 2.5 : 1.7} /></View> }}
      />
      <Tabs.Screen
        name="photo"
        options={{ title: t("tabPhoto"), tabBarIcon: ({ color, size, focused }) => <View style={{ backgroundColor: focused ? colors.primary + "20" : "transparent", paddingHorizontal: 16, paddingVertical: 5, borderRadius: 16 }}><Camera color={color} size={size - 2} strokeWidth={focused ? 2.5 : 1.7} /></View> }}
      />
      <Tabs.Screen
        name="us"
        options={{ title: t("tabUs"), tabBarIcon: ({ color, size, focused }) => <View style={{ backgroundColor: focused ? colors.primary + "20" : "transparent", paddingHorizontal: 16, paddingVertical: 5, borderRadius: 16 }}><Users color={color} size={size - 2} strokeWidth={focused ? 2.5 : 1.7} /></View> }}
      />
    </Tabs>
  );
}
