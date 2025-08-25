import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";

const Tab = createMaterialTopTabNavigator();

const initialRequests = {
  RFI: [
    { id: "1", title: "Запрос на изменение проекта", description: "Подробное описание RFI-1" },
    { id: "2", title: "Запрос на уточнение чертежа", description: "Подробное описание RFI-2" },
  ],
  STQ: [
    { id: "3", title: "Решение по бетонным работам", description: "Описание STQ-3" },
    { id: "4", title: "Решение по монтажу", description: "Описание STQ-4" },
  ],
  NCR: [
    { id: "5", title: "Предписание: исправить дефект", description: "Описание NCR-5" },
    { id: "6", title: "Предписание: заменить материал", description: "Описание NCR-6" },
  ],
};

function RequestList({ type }) {
  const [requests] = useState(initialRequests[type]);
  const router = useRouter();

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/requests/RequestCard",
              params: { id: item.id, title: item.title, description: item.description },
            })
          }
        >
          <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

export default function RequestsScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="RFI">{() => <RequestList type="RFI" />}</Tab.Screen>
      <Tab.Screen name="STQ">{() => <RequestList type="STQ" />}</Tab.Screen>
      <Tab.Screen name="NCR">{() => <RequestList type="NCR" />}</Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: "bold" },
});
