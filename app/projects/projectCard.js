import { Picker } from "@react-native-picker/picker"; // ⚡️ библиотека для dropdown
import { createClient } from "@supabase/supabase-js";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ⚡️ создаём клиент Supabase
const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkyNjYwOSwiZXhwIjoyMDcxNTAyNjA5fQ.xfq3j9C3Cl3oUxUQ1HpND_IBPYHltr_YKiZKeDIzUn4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProjectCard() {
  const router = useRouter();
  const {
    id,
    Name,
    Description,
    DateStart,
    DateEnd,
    Parent_id,
    Object_Id,
    nid,
  } = useLocalSearchParams();

  // 📝 состояния для всех полей
  const [nameValue, setNameValue] = useState(Name || "");
  const [descriptionValue, setDescriptionValue] = useState(Description || "");
  const [dateStartValue, setDateStartValue] = useState(DateStart || "");
  const [dateEndValue, setDateEndValue] = useState(DateEnd || "");
  const [parentIdValue, setParentIdValue] = useState(Parent_id || null);
  const [objectIdValue, setObjectIdValue] = useState(Object_Id || "");
  const [nidValue, setNidValue] = useState(nid || "");

  // ⚡️ список проектов для выбора Parent_id
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("Projects")
        .select("Name")
        .order("Name");

      if (error) {
        console.error("Ошибка загрузки проектов:", error);
      } else {
        setProjectsList(data);
      }
    };

    fetchProjects();
  }, []);

  const handleSave = async () => {
    try {
      if (id) {
        // ⚡️ обновляем запись
        const { error } = await supabase
          .from("Projects")
          .update({
            Name: nameValue,
            Description: descriptionValue,
            DateStart: dateStartValue || null,
            DateEnd: dateEndValue || null,
            Parent_id: parentIdValue || null,
            Object_Id: objectIdValue || null,
            nid: nidValue || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
        console.log("✅ Проект обновлен");
      } else {
        // ⚡️ создаём новую запись
        const { data: newProject, error } = await supabase
          .from("Projects")
          .insert([
            {
              Name: nameValue,
              Description: descriptionValue,
              DateStart: dateStartValue || null,
              DateEnd: dateEndValue || null,
              Parent_id: parentIdValue || null,
              Object_Id: objectIdValue || null,
              nid: nidValue || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        console.log("✅ Новый проект создан:", newProject);
      }

      router.back();
    } catch (err) {
      console.log("❌ Ошибка сохранения");
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* верхняя панель */}
      <View style={styles.topBar}>
        <Button title="Назад" onPress={() => router.back()} />
        <Button title="Сохранить" color="green" onPress={handleSave} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.label}>Название</Text>
        <TextInput
          style={styles.input}
          value={nameValue}
          onChangeText={setNameValue}
        />

        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={descriptionValue}
          onChangeText={setDescriptionValue}
          multiline
        />

        <Text style={styles.label}>Дата начала</Text>
        <TextInput
          style={styles.input}
          value={dateStartValue}
          onChangeText={setDateStartValue}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Дата окончания</Text>
        <TextInput
          style={styles.input}
          value={dateEndValue}
          onChangeText={setDateEndValue}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Parent_id</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={parentIdValue}
            onValueChange={(itemValue) => setParentIdValue(itemValue)}
          >
            <Picker.Item label="Не выбрано" value={null} />
            {projectsList.map((proj) => (
              <Picker.Item key={proj.id} label={proj.Name} value={proj.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Object_Id</Text>
        <TextInput
          style={styles.input}
          value={objectIdValue}
          onChangeText={setObjectIdValue}
        />

        <Text style={styles.label}>nid</Text>
        <TextInput
          style={styles.input}
          value={nidValue}
          onChangeText={setNidValue}
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
  },
});
