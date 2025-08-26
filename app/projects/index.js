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

// 🔹 подключение к Supabase
const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co"; // замени на свой
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjY2MDksImV4cCI6MjA3MTUwMjYwOX0.NBqBjM3cqE14Erri9MysjoFL0AkkDhs65Q_OlcaANEw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🔹 рекурсивный компонент дерева проектов
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
                  prefix: project.prefix,
                  name: project.name,
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

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("projects").select("*");

        if (error) throw error;

        // 🔹 формируем дерево: родитель → дети
        const buildTree = (items, parentId = null) =>
          items
            .filter((item) => item.parent_id === parentId)
            .map((item) => ({
              ...item,
              children: buildTree(items, item.id),
            }));

        setProjects(buildTree(data));
      } catch (err) {
        console.error("Ошибка загрузки:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Список проектов</Text>
      <ScrollView>
        <ProjectTree projects={projects} router={router} />
      </ScrollView>

      {/* 🔹 кнопка внизу */}
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
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
