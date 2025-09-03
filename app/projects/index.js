import { createClient } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
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
const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co"; // Убедитесь, что это ваш URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjY2MDksImV4cCI6MjA3MTUwMjYwOX0.NBqBjM3cqE14Erri9MysjoFL0AkkDhs65Q_OlcaANEw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🔹 Рекурсивный компонент для отображения дерева проектов
function ProjectTree({ projects, router }) {
  return (
    <View>
      {projects.map((project) => (
        <View key={project.id} style={styles.node}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/projects/projectCard",
                params: {
                  id: project.id,
                  prefix: project.prefix || "",
                  name: project.name || "",
                  parent: project.parent_id || "",
                  cadastral: project.cadastral || "",
                  description: project.description || "",
                },
              })
            }
          >
            <Text style={styles.title}>
              {project.prefix} - {project.name}
            </Text>
          </TouchableOpacity>

          {project.children && project.children.length > 0 && (
            <View style={styles.children}>
              <ProjectTree projects={project.children} router={router} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // 🔹 Состояние для ошибок

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null); // 🔹 Сбрасываем ошибку перед новым запросом
      try {
        // 🔹 Запрос всех проектов из таблицы projects
        const { data, error } = await supabase.from("Projects").select("*");

        if (error) throw error;

        // 🔹 Проверка на пустые данные
       // if (!data || data.length === 0) {
        //  setProjects([]);
        //  return;
       // }

        // 🔹 Формируем дерево: родитель → дети
        const buildTree = (items, parentId = null) =>
          items
            .filter((item) => item.parent_id === parentId)
            .map((item) => ({
              ...item,
              children: buildTree(items, item.id),
            }));

        setProjects(buildTree(data));
      } catch (err) {
        console.error("Ошибка загрузки проектов:", err.message);
        setError(err.message); // 🔹 Сохраняем ошибку для отображения
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 🔹 Отображение загрузки
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loaderText}>Загрузка проектов...</Text>
      </View>
    );
  }

  // 🔹 Отображение ошибки
  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchProjects()}
        >
          <Text style={styles.buttonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔹 Отображение пустого списка
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

  // 🔹 Основное отображение списка проектов
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Список проектов</Text>
      <ScrollView>
        <ProjectTree projects={projects} router={router} />
      </ScrollView>

      {/* 🔹 Кнопка добавления проекта */}
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
  node: { marginVertical: 5 },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  title: { fontSize: 16 },
  children: { marginLeft: 20, marginTop: 5 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 10, fontSize: 16, color: "#666" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 20 },
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