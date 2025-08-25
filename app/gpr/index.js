import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { List } from "react-native-paper";

const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co";   // замени на свой URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjY2MDksImV4cCI6MjA3MTUwMjYwOX0.NBqBjM3cqE14Erri9MysjoFL0AkkDhs65Q_OlcaANEw";          // замени на свой ключ

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Tab = createMaterialTopTabNavigator();
const router = useRouter();

// 🔹 Компонент для отображения дерева задач
const TaskTree = ({ status }) => {
  const [expanded, setExpanded] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // загрузка задач по статусу
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("gpr_tasks")
          .select("*")
          .eq("status", status);

        if (error) throw error;

        // группируем по parent_id
        const parentTasks = data.filter((t) => !t.parent_id);
        const tasksWithChildren = parentTasks.map((parent) => ({
          ...parent,
          children: data.filter((t) => t.parent_id === parent.id),
        }));

        setTasks(tasksWithChildren);
      } catch (err) {
        console.error("Ошибка загрузки:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [status]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {tasks.map((task) =>
        task.children && task.children.length > 0 ? (
          <List.Accordion
            key={task.id}
            title={task.title}
            expanded={!!expanded[task.id]}
            onPress={() => toggleExpand(task.id)}
          >
            {task.children.map((child) => (
              <List.Item
                key={child.id}
                title={child.title}
                left={(props) => <List.Icon {...props} icon="file-document" />}
                onPress={() =>
                  router.push({ pathname: "/gpr/taskCard", params: { id: child.id } })
                }
              />
            ))}
          </List.Accordion>
        ) : (
          <List.Item
            key={task.id}
            title={task.title}
            left={(props) => <List.Icon {...props} icon="check" />}
            onPress={() =>
              router.push({ pathname: "/gpr/taskCard", params: { id: task.id } })
            }
          />
        )
      )}
    </ScrollView>
  );
};

// 🔹 Вкладки
const NewTasks = () => <TaskTree status="new" />;
const InProgressTasks = () => <TaskTree status="inProgress" />;
const DoneTasks = () => <TaskTree status="done" />;

export default function GPRScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Новые" component={NewTasks} />
      <Tab.Screen name="В работе" component={InProgressTasks} />
      <Tab.Screen name="Завершенные" component={DoneTasks} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
