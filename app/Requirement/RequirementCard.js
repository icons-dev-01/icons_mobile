import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { createClient } from "@supabase/supabase-js";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Button,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ⚡️ клиент Supabase
const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkyNjYwOSwiZXhwIjoyMDcxNTAyNjA5fQ.xfq3j9C3Cl3oUxUQ1HpND_IBPYHltr_YKiZKeDIzUn4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let docCounter = 1; // авто-счётчик документов

export default function RequirementForm() {
  const router = useRouter();

  // 📌 состояния
  const [dateDoc, setDateDoc] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [geo, setGeo] = useState({ x: "", y: "" });
  const [work, setWork] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [justification, setJustification] = useState("");
  const [executor, setExecutor] = useState("");
  const [scheme, setScheme] = useState("");
  const [placeDesc, setPlaceDesc] = useState(""); // ❗️не мапим в БД
  const [photos, setPhotos] = useState([]); // ❗️не мапим в БД пока

  // ⚡️ твой обязательный project_id (uuid)
  const projectId = "00000000-0000-0000-0000-000000000000";

  useEffect(() => {
    // 📌 Дата документа = сегодняшняя
    setDateDoc(new Date().toISOString().split("T")[0]);
    setDocNumber(generateDocNumber());

    // 📌 Авто гео-координаты
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("❌ Нет доступа к геолокации");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setGeo({
        x: location.coords.latitude.toString(),
        y: location.coords.longitude.toString(),
      });
    })();
  }, []);

  const generateDocNumber = () => {
    const num = String(docCounter).padStart(3, "0");
    docCounter++;
    return `№${num}`;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleSave = async () => {
    try {
      const newRequirement = {
        Project_id: projectId, // ⚡️ обязательное поле
        Date: dateDoc,
        Number: docNumber,
        Plane_x: geo.x,
        Plane_y: geo.y,
        Job_id: work,
        Date_End: deadline.toISOString().split("T")[0],
        Priority_id: priority,
        Description: description,
        Justification: justification,
        Counterparty_id: executor,
        Plane_info: scheme,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("Requirements")
        .insert([newRequirement])
        .select()
        .single();

      if (error) throw error;
      console.log("✅ Новое требование создано:", data);

      // очистка формы
      setDocNumber(generateDocNumber());
      setWork("");
      setDeadline(new Date());
      setPriority("");
      setDescription("");
      setJustification("");
      setExecutor("");
      setScheme("");
      setPlaceDesc("");
      setPhotos([]);

      router.back();
    } catch (err) {
      console.error("❌ Ошибка сохранения:", err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* верхняя панель */}
      <View style={styles.topBar}>
        <Button title="Назад" onPress={() => router.back()} />
        <Button title="Сохранить в BD" onPress={handleSave} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.label}>Дата документа</Text>
        <TextInput style={styles.input} value={dateDoc} editable={false} />

        <Text style={styles.label}>Номер документа</Text>
        <TextInput style={styles.input} value={docNumber} editable={false} />

        <Text style={styles.label}>Гео координаты</Text>
        <TextInput
          style={styles.input}
          value={`${geo.x}, ${geo.y}`}
          editable={false}
        />

        <Text style={styles.label}>Выбрать работу</Text>
        <Picker
          selectedValue={work}
          onValueChange={(val) => setWork(val)}
          style={styles.input}
        >
          <Picker.Item label="Выберите работу" value="" />
          <Picker.Item label="Асфальтирование" value="job-uuid-1" />
          <Picker.Item label="Электрика" value="job-uuid-2" />
          <Picker.Item label="Водопровод" value="job-uuid-3" />
        </Picker>

        <Text style={styles.label}>Срок до...</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{deadline.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDeadline(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Приоритет</Text>
        <Picker
          selectedValue={priority}
          onValueChange={(val) => setPriority(val)}
          style={styles.input}
        >
          <Picker.Item label="Выберите приоритет" value="" />
          <Picker.Item label="Низкий" value="priority-uuid-1" />
          <Picker.Item label="Средний" value="priority-uuid-2" />
          <Picker.Item label="Высокий" value="priority-uuid-3" />
        </Picker>

        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Введите описание"
        />

        <Text style={styles.label}>Обоснование</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={justification}
          onChangeText={setJustification}
          placeholder="Введите обоснование"
        />

        <Text style={styles.label}>Исполнитель</Text>
        <Picker
          selectedValue={executor}
          onValueChange={(val) => setExecutor(val)}
          style={styles.input}
        >
          <Picker.Item label="Выберите исполнителя" value="" />
          <Picker.Item label="Бригада №1" value="counterparty-uuid-1" />
          <Picker.Item label="Бригада №2" value="counterparty-uuid-2" />
        </Picker>

        <Text style={styles.label}>Схемы-план</Text>
        <TextInput
          style={styles.input}
          value={scheme}
          onChangeText={setScheme}
          placeholder="Введите данные по схеме"
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
