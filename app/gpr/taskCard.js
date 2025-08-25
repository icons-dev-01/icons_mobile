import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button, Image,
  Modal,
  Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co";   // замени на свой URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjY2MDksImV4cCI6MjA3MTUwMjYwOX0.NBqBjM3cqE14Erri9MysjoFL0AkkDhs65Q_OlcaANEw";          // замени на свой ключ

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TaskCard() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // берем id из параметров

  // состояния
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [volume, setVolume] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // загрузка данных из БД
  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);

      // 1. получаем задачу
      const { data: task, error } = await supabase
        .from("gpr_tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // 2. получаем фото
      const { data: photos } = await supabase
        .from("gpr_photos")
        .select("url")
        .eq("task_id", id);

      // 3. подставляем в стейты
      setTitle(task.title);
      setStartDate(new Date(task.planned_start_date));
      setEndDate(new Date(task.planned_end_date));
      setVolume(task.work_volume?.toString() || "");
      setDescription(task.description || "");
      if (photos && photos.length > 0) {
        setPhoto(photos[0].url); // пока берём первое фото
      }

    } catch (err) {
      console.error("Ошибка загрузки задачи:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // выбор фото
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // сохранение задачи
  const saveTask = async () => {
    try {
      setLoading(true);

      let taskId = id;

      if (id) {
        // обновляем задачу
        const { error } = await supabase
          .from("gpr_tasks")
          .update({
            title,
            planned_start_date: startDate.toISOString().split("T")[0],
            planned_end_date: endDate.toISOString().split("T")[0],
            work_volume: volume,
            description,
          })
          .eq("id", id);

        if (error) throw error;
      } else {
        // создаем новую задачу
        const { data: newTask, error } = await supabase
          .from("gpr_tasks")
          .insert([
            {
              title,
              planned_start_date: startDate.toISOString().split("T")[0],
              planned_end_date: endDate.toISOString().split("T")[0],
              work_volume: volume,
              description,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        taskId = newTask.id;
      }

      // фото
      if (photo) {
        await supabase.from("gpr_photos").upsert([
          { task_id: taskId, url: photo }
        ]);
      }

      setModalVisible(true);
    } catch (err) {
      console.error("Ошибка сохранения:", err.message);
      alert("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* верхняя панель */}
      <View style={styles.topBar}>
        <Button title="Назад" onPress={() => router.back()} />
        <Button title="Сохранить" onPress={saveTask} />
        <Button title="Начать" color="green" onPress={() => alert("Старт")} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <Text style={styles.label}>Название</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Планируемая дата начала</Text>
          <Button title={startDate.toLocaleDateString()} onPress={() => setShowStartPicker(true)} />
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(event, date) => {
                setShowStartPicker(Platform.OS === "ios");
                if (date) setStartDate(date);
              }}
            />
          )}

          <Text style={styles.label}>Планируемая дата окончания</Text>
          <Button title={endDate.toLocaleDateString()} onPress={() => setShowEndPicker(true)} />
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(event, date) => {
                setShowEndPicker(Platform.OS === "ios");
                if (date) setEndDate(date);
              }}
            />
          )}

          <Text style={styles.label}>Объём работ</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={volume}
            onChangeText={setVolume}
          />

          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Фото материалы</Text>
          <Button title="Загрузить фото" onPress={pickImage} />
          {photo && <Image source={{ uri: photo }} style={styles.image} />}
        </ScrollView>
      )}

      {/* Модальное окно */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              ✅ Запись сохранена
            </Text>
            <Text style={{ marginBottom: 20 }}>Хотите продолжить или выйти?</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#4caf50" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Продолжить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#f44336" }]}
                onPress={() => {
                  setModalVisible(false);
                  router.back();
                }}
              >
                <Text style={styles.modalBtnText}>Выйти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  image: { width: "100%", height: 200, marginTop: 10, borderRadius: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
