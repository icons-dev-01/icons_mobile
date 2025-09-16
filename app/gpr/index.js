import React, { useContext, useEffect, useState, useCallback} from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { ProjectContext } from "../_layout";
import { supabase } from "../projects/index";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const Tab = createMaterialTopTabNavigator();

export default function GprScreen() {
  const { selectedProjectId } = useContext(ProjectContext);

  if (!selectedProjectId) {
    return <Text style={{ padding: 16 }}>❌ Проект не выбран</Text>;
  }

  return (
    <Tab.Navigator>
      <Tab.Screen name="Tasks" component={TasksTab} />
      <Tab.Screen name="Actions" component={ActionsTab} />
    </Tab.Navigator>
  );
}


// --- Tasks tab ---
function TasksTab() {
  const { selectedProjectId } = useContext(ProjectContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchTasks = async () => {
    if (!selectedProjectId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("PlanJobs")
        .select("Id, Name, Description, created_at")
        .eq("Project_id", selectedProjectId);

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Ошибка загрузки задач:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
useFocusEffect(
  useCallback(() => {
    fetchTasks();
  }, [selectedProjectId])
);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Ошибка: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchTasks}>
          <Text style={styles.buttonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TouchableOpacity
              key={task.Id}
              style={styles.card}
              onPress={() => router.push(`/gpr/taskCard?id=${task.Id}`)}
            >
              <Text style={styles.title}>{task.Name}</Text>
              {task.Description ? (
                <Text style={styles.desc}>{task.Description}</Text>
              ) : null}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Задач пока нет</Text>
        )}
      </ScrollView>

      {/* 🔹 Кнопка добавления задачи */}
      <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/gpr/taskCard",
              params: { id: "new", projectId: selectedProjectId }, // 👈 сюда кидаем
            })
          }
        >
          <Text style={styles.buttonText}>➕ Добавить задачу</Text>
       </TouchableOpacity>
    </View>
  );
}

// --- Actions tab (заглушка пока) ---

function ActionsTab() {
  const { selectedProjectId } = useContext(ProjectContext);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const fetchActions = async () => {
      if (!selectedProjectId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("Actions")
          .select(`
            Id,
            Job_id,
            PlanJobs!inner (
              Id,
              Project_id,
              Name,
              Description
            )
          `)
          .eq("PlanJobs.Project_id", selectedProjectId); // фильтруем по проекту

        if (error) throw error;

        setActions(data || []);
      } catch (err) {
        console.error("Ошибка загрузки активностей:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };


    useFocusEffect(
      useCallback(() => {
        fetchActions();
      }, [selectedProjectId])
    );

      if (loading) return <ActivityIndicator size="large" color="#007bff" />;
      if (error) return <Text style={{ color: "red" }}>Ошибка: {error}</Text>;

        return (
          <ScrollView style={{ padding: 16 }}>
            {actions.length > 0 ? (
              actions.map((action) => (
                <TouchableOpacity
                  key={action.Id}
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/gpr/actionCard",
                      params: { id: action.Id, Job_id: action.Job_id }, // 👈 открываем задачу по её Id
                    })
                  }
                >
                  <Text style={styles.title}>{action.PlanJobs?.Name}</Text>
                  {action.PlanJobs?.Description ? (
                    <Text style={styles.desc}>{action.PlanJobs.Description}</Text>
                  ) : null}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Активностей пока нет</Text>
            )}
          </ScrollView>
        );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "600" },
  desc: { fontSize: 14, color: "#666", marginTop: 4 },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});