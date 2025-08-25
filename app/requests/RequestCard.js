import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function RequestCard() {
  const router = useRouter();
  const { id, title, description } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Карточка запроса</Text>
      <Text style={styles.label}>ID: {id}</Text>
      <Text style={styles.label}>Название: {title}</Text>
      <Text style={styles.desc}>{description}</Text>

      <View style={styles.buttons}>
        <Button title="Согласовать" onPress={() => alert(`Запрос ${id} согласован ✅`)} />
        <Button title="Отклонить" color="red" onPress={() => alert(`Запрос ${id} отклонён ❌`)} />
      </View>

      <Button title="Назад" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  desc: { fontSize: 14, color: "#444", marginBottom: 20 },
  buttons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
});