import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { createContext, useState } from "react";

export const ProjectContext = createContext();

export default function Layout() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      <Tabs screenOptions={{ headerShown: true }}>
        <Tabs.Screen
          name="projects"
          options={{
            title: "Проекты",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="business" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="gpr"
          options={{
            title: "ГПР",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="requests"
          options={{
            title: "Запросы",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" color={color} size={size} />
            ),
          }}
        />
        {/* скрываем логин из нижней панели */}
        <Tabs.Screen name="login" options={{ href: null }} />
      </Tabs>
    </ProjectContext.Provider>
  );
}
