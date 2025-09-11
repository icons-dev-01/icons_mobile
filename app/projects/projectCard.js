import { Picker } from "@react-native-picker/picker"; // ⚡️ библиотека для dropdown
import { createClient } from "@supabase/supabase-js";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useContext,  useEffect, useState} from "react";
import { ProjectContext } from "../_layout";

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
  const [prefixValue, setPrefixValue] = useState(""); // ⚡️ новое поле "Префикс"
  const [parentIdValue, setParentIdValue] = useState(Parent_id || null);
  const [objectIdValue, setObjectIdValue] = useState(Object_Id || null);
  const [descriptionValue, setDescriptionValue] = useState(Description || "");

  // ⚡️ список проектов для выбора Parent_id
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("Projects")
        .select("Id, Name")
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
    // ⚡️ достаём userId из AsyncStorage
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) throw new Error("Пользователь не найден (не залогинен)");

    if (id) {
      // обновляем проект
      const { error } = await supabase
        .from("Projects")
        .update({
          Name: nameValue,
          Prefix: prefixValue || null,
          Description: descriptionValue,
          Parent_id: parentIdValue || null,
          Object_Id: objectIdValue || null,
          updated_at: new Date().toISOString(),
        })
        .eq("Id", id);

      if (error) throw error;
      console.log("✅ Проект обновлен");
    } else {
      // создаём проект
      const { data: newProject, error } = await supabase
        .from("Projects")
        .insert([
          {
            Name: nameValue,
            Prefix: prefixValue || null,
            Description: descriptionValue,
            Parent_id: parentIdValue || null,
            Object_Id: objectIdValue || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      console.log("✅ Новый проект создан:", newProject);

      // ⚡️ создаём связь UserProjects
      const { error: linkError } = await supabase
        .from("UserProjects")
        .insert([{ user_id: userId, project_id: newProject.Id }]);

      if (linkError) throw linkError;
      console.log("🔗 Связь UserProject создана");
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
        <Text style={styles.label}>Наименование</Text>
        <TextInput
            style={styles.input}
            value={nameValue}
            onChangeText={setNameValue}
        />

        <Text style={styles.label}>Префикс</Text>
        <TextInput
            style={styles.input}
            value={prefixValue}
            onChangeText={setPrefixValue}
        />

        <Text style={styles.label}>Родительский проект</Text>
        <View style={styles.pickerWrapper}>
            <Picker
                selectedValue={parentIdValue}
                onValueChange={(itemValue) => setParentIdValue(itemValue)}
            >
                <Picker.Item label="Выберите проект верхнего уровня" value={null} />
                {projectsList.map((proj) => (
                    <Picker.Item key={proj.id} label={proj.Name} value={proj.id} />
                ))}
            </Picker>
        </View>

        <Text style={styles.label}>Объект</Text>
        <View style={styles.pickerWrapper}>
            <Picker
                selectedValue={objectIdValue}
                onValueChange={(itemValue) => setObjectIdValue(itemValue)}
            >
                <Picker.Item label="Выберите объект" value={null} />
                {/* пока тестовый список, можно заменить */}
                <Picker.Item label="Объект 1" value="1" />
                <Picker.Item label="Объект 2" value="2" />
            </Picker>
        </View>

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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
  },
});
