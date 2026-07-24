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
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("tabHome"), tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: t("tabChat"), tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="photo"
        options={{ title: t("tabPhoto"), tabBarIcon: ({ color, size }) => <Camera color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="us"
        options={{ title: t("tabUs"), tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
    </Tabs>
  );
}
