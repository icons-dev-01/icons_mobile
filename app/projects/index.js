import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// тестовые проекты
const projectData = [
  {
    id: "1",
    prefix: "PRJ-001",
    name: "Генеральный проект",
    children: [
      {
        id: "2",
        prefix: "SUB-001",
        name: "Жилой комплекс",
        children: [
          { id: "3", prefix: "OBJ-001", name: "Дом №1" },
          { id: "4", prefix: "OBJ-002", name: "Дом №2" },
        ],
      },
    ],
  },
  {
    id: "5",
    prefix: "PRJ-002",
    name: "Проект торгового центра",
  },
];

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
                  parent: project.parent || "",
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

          {project.children && (
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Список проектов</Text>
      <ScrollView>
        <ProjectTree projects={projectData} router={router} />
      </ScrollView>
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
});
