import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function ProjectCard() {
  const router = useRouter();
  const { id, prefix, name, parent, cadastral, description } = useLocalSearchParams();

  const [prefixValue, setPrefixValue] = useState(prefix || "");
  const [parentValue, setParentValue] = useState(parent || "");
  const [objectValue, setObjectValue] = useState(name || "");
  const [cadastralValue, setCadastralValue] = useState(cadastral || "");
  const [descriptionValue, setDescriptionValue] = useState(description || "");

  const handleSave = () => {
    alert(`Проект ${id} сохранен ✅`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* верхняя панель */}
      <View style={styles.topBar}>
        <Button title="Назад" onPress={() => router.back()} />
        <Button title="Сохранить" onPress={handleSave} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.label}>Префикс</Text>
        <TextInput style={styles.input} value={prefixValue} onChangeText={setPrefixValue} />

        <Text style={styles.label}>Родительский проект</Text>
        <TextInput style={styles.input} value={parentValue} onChangeText={setParentValue} />

        <Text style={styles.label}>Объект</Text>
        <TextInput style={styles.input} value={objectValue} onChangeText={setObjectValue} />

        <Text style={styles.label}>Кадастровый номер</Text>
        <TextInput style={styles.input} value={cadastralValue} onChangeText={setCadastralValue} />

        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={descriptionValue}
          onChangeText={setDescriptionValue}
          multiline
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f8f8f8",
  },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
});
