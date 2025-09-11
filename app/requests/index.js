import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity,View  } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { ProjectContext } from "../_layout";
import RequestCard from "./RequestCard";



export default function RequestsScreen() {
  const { selectedProjectId } = useContext(ProjectContext);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!selectedProjectId) return;

    fetch(`https://your-api/requests?project_id=${selectedProjectId}`)
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error(err));
  }, [selectedProjectId]);

  if (!selectedProjectId) {
    return <Text className="p-4">❌ Проект не выбран</Text>;
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <RequestCard request={item} />}
    />
  );
}

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
