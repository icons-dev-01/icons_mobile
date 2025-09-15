import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../../supabaseClient";

export default function TaskCard() {
  const router = useRouter();
  const { id, projectId: projectParam } = useLocalSearchParams(); // ✅ берём projectId тоже

  // состояния
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [authorId, setAuthorId] = useState(null);
  const [projectId, setProjectId] = useState(null); // 🔽 сюда будем класть из параметров
  const [nextJobId, setNextJobId] = useState(null);
  const [prevJobId, setPrevJobId] = useState(null);
  const [isGroup, setIsGroup] = useState(false);
  const [value, setValue] = useState(0);
  const [sectionId, setSectionId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

// если создаём новый таск — сразу выставляем projectId из параметров
useEffect(() => {
  if (id === "new" && projectParam) {
    setProjectId(String(projectParam)); // 👈 всегда строка
  }
}, [id, projectParam]);

  // загрузка данных из БД
  useEffect(() => {
    if (id && id !== "new") {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);

      const { data: task, error } = await supabase
        .from("PlanJobs")
        .select("*")
        .eq("Id", id)
        .single();

      if (error) throw error;

      const { data: files } = await supabase
        .from("PlanJobsFiles")
        .select("File, isPhoto, Author_id, Date")
        .eq("Jobs_id", id);

      setName(task.Name || "");
      if (task?.StartDate) setStartDate(new Date(task.StartDate));
      if (task?.EndDate) setEndDate(new Date(task.EndDate));
      setParentId(task.Parent_id);
      setAuthorId(task.Author_id);
      setProjectId(task.Project_id); // 🔽 подгружаем из БД, если редактируем
      setNextJobId(task.Next_job_id);
      setPrevJobId(task.Prev_job_id);
      setIsGroup(!!task.isGroup);
      setValue(task.value != null ? String(task.value) : "");
      setDescription(task.Description!= null ? String(task.Description) : "");
      setSectionId(task.Section_id);
      if (files && files.length > 0) {
        setPhotos(files.map(file => file.File));
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
      selectionLimit: 0,
    });
    if (!result.canceled) {
      setPhotos(prevPhotos => [...prevPhotos, ...result.assets.map(asset => asset.uri)]);
    }
  };

  // удаление фото
  const removePhoto = (index) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  // сохранение задачи
  const saveTask = async () => {
    try {
      setLoading(true);

      let jobId = id;

      if (id !== "new") {
        // обновляем задачу
        const { error } = await supabase
          .from("PlanJobs")
          .update({
            Name: name,
            StartDate: startDate.toISOString().split("T")[0],
            EndDate: endDate.toISOString().split("T")[0],
            Parent_id: parentId,
            Author_id: authorId,
            Project_id: projectId, // ✅ сохраняем с projectId
            Next_job_id: nextJobId,
            Prev_job_id: prevJobId,
            isGroup,
            value: value === "" ? null : Number(value),
            Section_id: sectionId,
            Description: description === "" ? null : description,
          })
          .eq("Id", id);

        if (error) throw error;

        await supabase
          .from("PlanJobsFiles")
          .delete()
          .eq("Jobs_id", id);
      } else {
        // создаем новую задачу
        const { data: newJob, error } = await supabase
          .from("PlanJobs")
          .insert([
            {
              Name: name,
              StartDate: startDate.toISOString().split("T")[0],
              EndDate: endDate.toISOString().split("T")[0],
              Parent_id: parentId,
              Author_id: authorId,
              Project_id: projectId || projectParam, // 👈 подстраховка
              Next_job_id: nextJobId,
              Prev_job_id: prevJobId,
              isGroup,
              value: value === "" ? null : Number(value),
              Section_id: sectionId,
              Description: description === "" ? null : description,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        jobId = newJob.Id;
      }

      if (photos.length > 0) {
        const filesToInsert = photos.map(photo => ({
          Jobs_id: jobId,
          File: photo,
          isPhoto: true,
          Author_id: authorId,
          Date: new Date().toISOString(),
        }));
        await supabase.from("PlanJobsFiles").insert(filesToInsert);
      }

      setModalVisible(true);
    } catch (err) {
      console.error("Ошибка сохранения:", err.message);
      alert("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
      try {
        const { error } = await supabase.from("Actions").insert([
          {
            Job_id: id, // айди текущего таска
            StartDate: startDate,
            EndDate: endDate,
          },
        ]);

        if (error) throw error;

        alert("✅ Активность создана");
      } catch (err) {
        console.error("Ошибка при создании активности:", err.message);
        alert("❌ Ошибка: " + err.message);
      }
    };


  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* верхняя панель */}
      <View style={styles.topBar}>
        <Button title="Назад" onPress={() => router.back()} />
        <Button title="Начать" onPress={handleStart} />
        <Button title="Сохранить" onPress={saveTask} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <Text style={styles.label}>Название</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          
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

            {/* 🔽 Группа (dropdown вместо TextInput) */}
            <Text style={styles.label}>Группа</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={parentId}
                    onValueChange={(value) => setParentId(value)}
                >
                    <Picker.Item label="Выберите группу" value={null} />
                    <Picker.Item label="Группа 1" value={1} />
                    <Picker.Item label="Группа 2" value={2} />
                    <Picker.Item label="Группа 3" value={3} />
                </Picker>
            </View>

            {/* 🔽 Объем работ */}
            <Text style={styles.label}>Объем работ</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
            />

            {/* 🔽 Предыдущая работа (dropdown) */}
            <Text style={styles.label}>Предыдущая работа</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={prevJobId}
                    onValueChange={(value) => setPrevJobId(value)}
                >
                    <Picker.Item label="Выберите работу" value={null} />
                    <Picker.Item label="Работа А" value={101} />
                    <Picker.Item label="Работа B" value={102} />
                    <Picker.Item label="Работа C" value={103} />
                </Picker>
            </View>

            {/* 🔽 Описание */}
            <Text style={styles.label}>Описание</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                value={description}
                onChangeText={(text) => setDescription(text)}
                multiline
            />


            {/* 🔽 Фото материалы */}
            <Text style={styles.label}>Фото материалы</Text>
            <Button title="Загрузить фото" onPress={pickImage} />
            {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.image} />
                    <Button title="Удалить" onPress={() => removePhoto(index)} color="red" />
                </View>
            ))}
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
  photoContainer: { marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
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
