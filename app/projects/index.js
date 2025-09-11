import { createClient } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🔹 Подключение к Supabase
const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjY2MDksImV4cCI6MjA3MTUwMjYwOX0.NBqBjM3cqE14Erri9MysjoFL0AkkDhs65Q_OlcaANEw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Получение проектов пользователя
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setError("Не найден пользователь (сначала войдите)");
        return;
      }

      const { data, error } = await supabase
        .from("UserProjects")
        .select(
          `
          project:Projects (
            Id,
            Name,
            Description,
            DateStart,
            DateEnd,
            Parent_id,
            Object_Id,
            nid,
            created_at,
            updated_at,
            Prefix
          )
        `
        )
        .eq("user_id", userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        setProjects([]);
        return;
      }

      // достаём сами проекты
      const projectList = data.map((row) => row.project);
      setProjects(projectList);
    } catch (err) {
      console.error("Ошибка загрузки проектов:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 🔹 Загрузка
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loaderText}>Загрузка проектов...</Text>
      </View>
    );
  }

  // 🔹 Ошибка
  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
          <Text style={styles.buttonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔹 Пусто
  if (projects.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Список проектов</Text>
        <Text style={styles.emptyText}>Проекты отсутствуют</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/projects/projectCard")}
        >
          <Text style={styles.buttonText}>➕ Добавить проект</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔹 Список проектов
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Список проектов</Text>
      <ScrollView>
        {projects.map((project) => (
          <TouchableOpacity
            key={project.Id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/projects/projectCard",
                params: {
                  id: project.Id,
                  name: project.Name || "",
                  description: project.Description || "",
                  prefix: project.Prefix || "",
                  parent: project.Parent_id || "",
                  object: project.Object_Id || "",
                  nid: project.nid || "",
                  dateStart: project.DateStart || "",
                  dateEnd: project.DateEnd || "",
                },
              })
            }
          >
            <Text style={styles.title}>
              {project.Prefix ? `${project.Prefix} - ` : ""}
              {project.Name}
            </Text>
            {project.Description ? (
              <Text style={styles.desc}>{project.Description}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🔹 Добавление проекта */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/projects/projectCard")}
      >
        <Text style={styles.buttonText}>➕ Добавить проект</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "600" },
  desc: { fontSize: 14, color: "#666", marginTop: 4 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 10, fontSize: 16, color: "#666" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
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
  retryButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
