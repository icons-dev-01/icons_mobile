import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, ScrollView, StyleSheet, View } from "react-native";
import { List } from "react-native-paper";

const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkyNjYwOSwiZXhwIjoyMDcxNTAyNjA5fQ.xfq3j9C3Cl3oUxUQ1HpND_IBPYHltr_YKiZKeDIzUn4";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Tab = createMaterialTopTabNavigator();
const router = useRouter();

const TaskTree = ({ status, openType }) => {
  const [expanded, setExpanded] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // загрузка задач из PlanJobs2
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("PlanJobs")
          .select("*")
          .eq("status", status); // поле value используем как статус

        if (error) throw error;

        // группировка по Parent_id
        const parentTasks = data.filter((t) => !t.Parent_id);
        const tasksWithChildren = parentTasks.map((parent) => ({
          ...parent,
          children: data.filter((t) => t.Parent_id === parent.Id),
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
            key={task.Id}
            title={task.Name}
            expanded={!!expanded[task.Id]}
            onPress={() => toggleExpand(task.Id)}
          >
            {task.children.map((child) => (
              <List.Item
                key={child.Id}
                title={child.Name}
                left={(props) => <List.Icon {...props} icon="file-document" />}
                onPress={() =>
                  router.push({
                    pathname: openType === "action" ? "/gpr/actionCard" : "/gpr/taskCard",
                    params: { id: child.Id },
                  })
                }
              />
            ))}
          </List.Accordion>
        ) : (
          <List.Item
            key={task.Id}
            title={task.Name}
            left={(props) => <List.Icon {...props} icon="check" />}
            onPress={() =>
              router.push({
                pathname: openType === "action" ? "/gpr/actionCard" : "/gpr/taskCard",
                params: { id: task.Id },
              })
            }
          />
        )
      )}
    </ScrollView>
  );
};

// вкладка Новые → добавляем кнопку
const NewTasks = () => (
  <View style={{ flex: 1 }}>
    <Button
      title="Добавить"
      onPress={() => router.push({ pathname: "/gpr/taskCard", params: { id: "new" } })}
    />
    <TaskTree status="new" openType="task" />
  </View>
);

const InProgressTasks = () => <TaskTree status="start" openType="action" />;
const DoneTasks = () => <TaskTree status="done" openType="task" />;

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
