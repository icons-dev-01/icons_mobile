import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createClient } from "@supabase/supabase-js";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker'
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjY2MDksImV4cCI6MjA3MTUwMjYwOX0.NBqBjM3cqE14Erri9MysjoFL0AkkDhs65Q_OlcaANEw";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ActivityPage() {
    const router = useRouter();
    const { id, Job_id } = useLocalSearchParams();
    // public.Activities
    // Основные данные активности
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [planStartDate, setPlanStartDate] = useState(new Date());
    const [planEndDate, setPlanEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showPlanStartPicker, setShowPlanStartPicker] = useState(false);
    const [showPlanEndPicker, setShowPlanEndPicker] = useState(false);

    // Гео-координаты
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    // Журнал работ
    const [workLog, setWorkLog] = useState([]);
    const [newComment, setNewComment] = useState('');

    // Ресурсы
    const [resources, setResources] = useState([]);
    const [newResource, setNewResource] = useState({ name: '', count: '', userName: '', date: new Date() });

    // Машины и механизмы
    const [equipment, setEquipment] = useState([]);
    const [newEquipment, setNewEquipment] = useState({ name: '', status: 'Выполняется', phone: '', dateStart: new Date() });
    const materialId = "some_material_id"; // Заменить на реальный ID материала"
    // Фотоматериалы
    const [photos, setPhotos] = useState([]);

    // Запросы на приёмку
    const [acceptanceRequests, setAcceptanceRequests] = useState([]);

    const [loading, setLoading] = useState(false);

    // Модальные окна
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');

    // Временные состояния для форм
    const [tempComment, setTempComment] = useState('');
    const [tempResource, setTempResource] = useState({ name: '', count: '', userName: '', date: new Date() });
    const [tempEquipment, setTempEquipment] = useState({ name: '', status: 'Выполняется', phone: '', dateStart: new Date() });
    const [tempPhoto, setTempPhoto] = useState({ description: '', latitude: '', longitude: '', userName: '', file: null, date: new Date().toISOString() });
    const [showTempResourceDate, setShowTempResourceDate] = useState(false);
    const [showTempEquipmentDate, setShowTempEquipmentDate] = useState(false);

    useEffect(() => {
        if (id && id !== 'new') {
            loadActivityData();
        }
    }, [id]);

    useEffect(() => {
        if (Job_id) {
            fetchJobDates();
        }
    }, [Job_id]);

    const fetchJobDates = async () => {
        try {
            const { data: actions, error } = await supabase
                .from("Actions")
                .select(`
                    Id,
                    Job_id,
                    PlanJobs ( StartDate, EndDate )
                  `);

            if (error) throw error;
        } catch (err) {
            console.error("Ошибка загрузки плановых дат:", err.message);
        }
    };

    const loadActivityData = async () => {
        setLoading(true);
        try {
            // Загружаем основные данные активности
            const { data: activity, error } = await supabase
                .from('Actions')
                .select('*')
                .eq('Id', id)
                .single();

            if (error) throw error;

            if (activity) {
                setStartDate(new Date(activity.start_date || new Date()));
                setEndDate(new Date(activity.end_date || new Date()));
                setPlanStartDate(new Date(activity.plan_start_date || new Date()));
                setPlanEndDate(new Date(activity.plan_end_date || new Date()));
                setLatitude(activity.latitude || '');
                setLongitude(activity.longitude || '');
            }

            // Загружаем связанные данные
            loadWorkLog();
            loadResources();
            loadEquipment();
            loadPhotos();
            loadAcceptanceRequests();
            fetchJobDates();

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadWorkLog = async () => {
        try {
            const { data, error } = await supabase
                .from('ActionComments')
                .select('*')
                .eq('Action_Id', id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setWorkLog(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки журнала работ:', error);
        }
    };

    const loadResources = async () => {
        try {
            const { data, error } = await supabase
                .from('ActionMaterials')
                .select('*')
                .eq('Action_Id', id);

            if (!error && data) {
                setResources(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки ресурсов:', error);
        }
    };

    const loadEquipment = async () => {
        try {
            const { data, error } = await supabase
                .from('MachineSessions')
                .select('*')
                .eq('Action_Id', id)

            if (!error && data) {
                setEquipment(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки оборудования:', error);
        }
    };

    const loadPhotos = async () => {
        try {
            const { data, error } = await supabase
                .from('ActionFiles')
                .select('*')
                .eq('Action_id', id);

            if (!error && data) {
                setPhotos(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки фотографий:', error);
        }
    };

    const loadAcceptanceRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('AcceptanceRequests')
                .select('*')
                .eq('Action_id', id);

            if (!error && data) {
                setAcceptanceRequests(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки запросов на приёмку:', error);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);

        // Сброс временных состояний
        setTempComment('');
        setTempResource({ name: '', count: '', userName: '', date: new Date() });
        setTempEquipment({ name: '', status: 'Выполняется', phone: '', dateStart: new Date() });
        setTempPhoto({ description: '', latitude: '', longitude: '', userName: '' });
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalType('');
    };

    const addComment = async () => {
        if (!tempComment.trim()) return;

        try {
            const { error } = await supabase
                .from('ActionComments')
                .insert([{
                    Action_Id: id,
                    Author_id: null,
                    Comment: tempComment,
                    Date: new Date().toISOString(),
                    created_at: new Date().toISOString()
                }]);
                closeModal();
                loadWorkLog();
        } catch (error) {
            console.error('Ошибка добавления комментария:', error);
        }
    };

    const addResource = async () => {
        if (!tempResource.name.trim()) return;

        try {
            const { error } = await supabase
                .from('ActionMaterials')
                .insert([{
                    Action_Id: id,
                    Material_id: null,
                    Author_id: null,
                    name: tempResource.name,
                    counts: tempResource.count,
                    Date: tempResource.date.toISOString()
                }]);
                closeModal();
                loadResources();

        } catch (error) {
            console.error('Ошибка добавления ресурса:', error);
        }
    };

    const addEquipment = async () => {
        if (!tempEquipment.name.trim()) return;

        try {
            const { error } = await supabase
                .from('MachineSessions')
                .insert([{
                    Action_Id: id,
                    Material_Id: null,
                    Session_Id: null,
                    name: tempEquipment.name,
                    Phone: tempEquipment.phone,
                    Date_start: tempEquipment.status === "Выполняется"
                        ? tempEquipment.dateStart.toISOString()
                        : null,
                    Date_end: tempEquipment.status === "Завершен"
                        ? tempEquipment.dateStart.toISOString()
                        : null,
                    isStart: tempEquipment.status === "Выполняется",
                    isEnd: tempEquipment.status === "Завершен"
                }]);

                closeModal();
                loadEquipment();
            
        } catch (error) {
            console.error('Ошибка добавления оборудования:', error);
        }
    };

    // 1. выбрать фото
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Нужен доступ к галерее!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            const selected = result.assets[0];
            setTempPhoto(prev => ({
                ...prev,
                file: selected.uri // сохраним только путь
            }));
        }
    };

    // 2. сохранить в Supabase
    const addPhoto = async () => {
        if (!tempPhoto.description.trim() || !tempPhoto.file) {
            alert("Заполните описание и выберите фото");
            return;
        }

        try {
            const fileExt = tempPhoto.file.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;

            // загрузка в bucket "photos"
            const { error: uploadError } = await supabase.storage
                .from('photos')
                .upload(fileName, {
                    uri: tempPhoto.file,
                    type: 'image/jpeg',
                    name: fileName,
                });

            if (uploadError) throw uploadError;

            // получаем публичный URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('photos')
                .getPublicUrl(fileName);

            // вставка в таблицу
            const { error: insertError } = await supabase
                .from('ActionFiles')
                .insert([{
                    Action_id: id,
                    Description: tempPhoto.description,
                    Date: tempPhoto.date,
                    File: publicUrl,
                    isPhoto: true
                }]);

            if (insertError) throw insertError;

            closeModal();
            loadPhotos();

        } catch (error) {
            console.error('Ошибка добавления фото:', error);
        }
    };


    const formatDate = (date) => {
        return date.toLocaleDateString('ru-RU');
    };

    const SectionHeader = ({ title, onAdd, modalType }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {onAdd && (
                <TouchableOpacity onPress={() => openModal(modalType)} style={styles.addButton}>
                    <Ionicons name="add" size={20} color="#007AFF" />
                    <Text style={styles.addButtonText}>Добавить</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const DateSection = ({
        action,
        startDate, setStartDate,
        endDate, setEndDate,
        showStartPicker, setShowStartPicker,
        showEndPicker, setShowEndPicker
    }) => (
        <View style={styles.section}>
            <Text style={styles.sectionMainTitle}>Активность</Text>

            {/* Фактические даты */}
            <View style={styles.dateRow}>
                <View style={styles.dateColumn}>
                    <Text style={styles.label}>Дата начала</Text>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <Text>{startDate ? formatDate(startDate) : "--.--.--"}</Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                setShowStartPicker(false);
                                if (date) setStartDate(date);
                            }}
                        />
                    )}
                </View>

                <View style={styles.dateColumn}>
                    <Text style={styles.label}>Дата окончания</Text>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <Text>{endDate ? formatDate(endDate) : "--.--.--"}</Text>
                    </TouchableOpacity>
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                setShowEndPicker(false);
                                if (date) setEndDate(date);
                            }}
                        />
                    )}
                </View>
            </View>

            {/* Плановые даты */}
            <View style={styles.dateRow}>
                <View style={styles.dateColumn}>
                    <Text style={styles.label}>План. дата начала</Text>
                    <Text style={styles.dateValue}>
                        {action?.PlanJobs?.StartDate ? formatDate(new Date(action.PlanJobs.StartDate)) : "--.--.--"}
                    </Text>
                </View>
                <View style={styles.dateColumn}>
                    <Text style={styles.label}>План. дата окончания</Text>
                    <Text style={styles.dateValue}>
                        {action?.PlanJobs?.EndDate ? formatDate(new Date(action.PlanJobs.EndDate)) : "--.--.--"}
                    </Text>
                </View>
            </View>
        </View>
    );


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Раздел дат */}
                <DateSection />

                {/* Гео-координаты */}
                <View style={styles.section}>
                    <Text style={styles.sectionMainTitle}>Гео-координаты</Text>
                    <View style={styles.coordRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 8 }]}
                            placeholder="Широта"
                            value={latitude}
                            onChangeText={setLatitude}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Долгота"
                            value={longitude}
                            onChangeText={setLongitude}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Журнал работ */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Журнал работ"
                        onAdd={true}
                        modalType="comment"
                    />

                    {workLog.map((item, index) => (
                        <View key={index} style={styles.logItem}>
                            <View style={styles.logHeader}>
                                <Text style={styles.logUser}>{item.user_name}</Text>
                                <Text style={styles.logDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            </View>
                            <Text style={styles.logComment}>{item.comment}</Text>
                        </View>
                    ))}
                </View>

                {/* Ресурсы */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Ресурсы"
                        onAdd={true}
                        modalType="resource"
                    />

                    {resources.map((item, index) => (
                        <View key={index} style={styles.resourceItem}>
                            <View style={styles.resourceHeader}>
                                <Text style={styles.resourceName}>{item.name}</Text>
                                <Text style={styles.resourceCount}>{item.count}</Text>
                            </View>
                            <View style={styles.resourceFooter}>
                                <Text style={styles.resourceUser}>({item.user_name})</Text>
                                <Text style={styles.resourceDate}>{new Date(item.date).toLocaleDateString()}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Машины и механизмы */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Машины  и механизмы"
                        onAdd={true}
                        modalType="equipment"
                    />

                    {equipment.map((item, index) => (
                        <View key={index} style={styles.equipmentItem}>
                            <View style={styles.equipmentHeader}>
                                <Text style={styles.equipmentName}>{item.name}</Text>
                                <Text style={[
                                    styles.equipmentStatus,
                                    { color: item.status === 'Завершен' ? '#4CAF50' : '#FF9800' }
                                ]}>
                                    {item.status}
                                </Text>
                            </View>
                            {item.phone && (
                                <View style={styles.equipmentPhone}>
                                    <Ionicons name="call" size={16} color="#007AFF" />
                                    <Text style={styles.phoneText}>{item.phone}</Text>
                                </View>
                            )}
                            <Text style={styles.equipmentDate}>
                                {new Date(item.dateStart).toLocaleDateString()}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Фотоматериалы */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Фотоматериалы"
                        onAdd={true}
                        modalType="photo"
                    />

                    {photos.map((item, index) => (
                        <View key={index} style={styles.photoItem}>
                            <Image source={{ uri: item.url }} style={styles.photoImage} />
                            <View style={styles.photoInfo}>
                                <Text style={styles.photoDescription}>{item.description}</Text>
                                <Text style={styles.photoCoords}>
                                    Широта:geo_x ; Долгота: geo_y
                                </Text>
                                <View style={styles.photoMeta}>
                                    <Text style={styles.photoUser}>{item.user_name}</Text>
                                    <Text style={styles.photoDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Запросы на приёмку */}
                <View style={styles.section}>
                    <SectionHeader title="Запросы на приёмку" />

                    <View style={styles.acceptanceHeader}>
                        <Text>Запросы на приёмку Number от Date</Text>
                    </View>

                    <View style={styles.acceptanceButtons}>
                        <TouchableOpacity style={styles.acceptanceButton}>
                            <Text style={styles.acceptanceButtonText}>Тех надзор</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptanceButton}>
                            <Text style={styles.acceptanceButtonText}>Авторский надзор</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* Модальные окна */}
            {renderModal()}
        </View>
    );

    function renderModal() {
        if (!modalVisible) return null;

        const handleSubmit = () => {
            switch (modalType) {
                case "comment":
                    addComment();
                    break;
                case "resource":
                    addResource();
                    break;
                case "equipment":
                    addEquipment();
                    break;
                case "photo":
                    addPhoto();
                    break;
                default:
                    closeModal();
            }
        };

        return (
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* --- Header --- */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {modalType === "comment" && "Добавить комментарий"}
                                {modalType === "resource" && "Добавить ресурс"}
                                {modalType === "equipment" && "Добавить оборудование"}
                                {modalType === "photo" && "Добавить фотоматериал"}
                            </Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* --- Content --- */}
                        <ScrollView
                            style={styles.modalContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {modalType === "comment" && (
                                <View>
                                    <Text style={styles.modalLabel}>Комментарий</Text>
                                    <TextInput
                                        style={[styles.modalInput, { height: 100, textAlignVertical: "top" }]}
                                        value={tempComment}
                                        onChangeText={setTempComment}
                                        placeholder="Введите комментарий"
                                        multiline
                                    />
                                </View>
                            )}

                            {modalType === "resource" && (
                                <View>
                                    <Text style={styles.modalLabel}>Название материала</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={tempResource.name}
                                        onChangeText={(text) =>
                                            setTempResource({ ...tempResource, name: text })
                                        }
                                        placeholder="Введите название"
                                    />

                                    <Text style={styles.modalLabel}>Количество</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={tempResource.count}
                                        onChangeText={(text) =>
                                            setTempResource({ ...tempResource, count: text })
                                        }
                                        placeholder="Введите кол-во материала"
                                        keyboardType="numeric"
                                    />

                                    <Text style={styles.modalLabel}>Дата</Text>
                                    <TouchableOpacity
                                        style={styles.modalDateButton}
                                        onPress={() => setShowTempResourceDate(true)}
                                    >
                                        <Text>{tempResource.date.toLocaleDateString("ru-RU")}</Text>
                                    </TouchableOpacity>
                                    {showTempResourceDate && (
                                        <DateTimePicker
                                            value={tempResource.date}
                                            mode="date"
                                            display="default"
                                            onChange={(event, date) => {
                                                setShowTempResourceDate(false);
                                                if (date) {
                                                    setTempResource({ ...tempResource, date });
                                                }
                                            }}
                                        />
                                    )}
                                </View>
                            )}

                            {modalType === "equipment" && (
                                <View>
                                    <Text style={styles.modalLabel}>Название</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={tempEquipment.name}
                                        onChangeText={(text) =>
                                            setTempEquipment({ ...tempEquipment, name: text })
                                        }
                                        placeholder="Введите название оборудования"
                                    />

                                    <Text style={styles.modalLabel}>Статус</Text>
                                    <View style={styles.statusButtons}>
                                        {["Выполняется", "Завершен"].map((status) => (
                                            <TouchableOpacity
                                                key={status}
                                                style={[
                                                    styles.statusButton,
                                                    tempEquipment.status === status && styles.statusButtonActive,
                                                ]}
                                                onPress={() =>
                                                    setTempEquipment({ ...tempEquipment, status })
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.statusButtonText,
                                                        tempEquipment.status === status &&
                                                        styles.statusButtonTextActive,
                                                    ]}
                                                >
                                                    {status}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.modalLabel}>Телефон</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={tempEquipment.phone}
                                        onChangeText={(text) =>
                                            setTempEquipment({ ...tempEquipment, phone: text })
                                        }
                                        placeholder="Ведите номер телефона"
                                        keyboardType="phone-pad"
                                    />

                                    <Text style={styles.modalLabel}>Дата начала/завершения использования</Text>
                                    <TouchableOpacity
                                        style={styles.modalDateButton}
                                        onPress={() => setShowTempEquipmentDate(true)}
                                    >
                                        <Text>{tempEquipment.dateStart.toLocaleDateString("ru-RU")}</Text>
                                    </TouchableOpacity>
                                    {showTempEquipmentDate && (
                                        <DateTimePicker
                                            value={tempEquipment.dateStart}
                                            mode="date"
                                            display="default"
                                            onChange={(event, date) => {
                                                setShowTempEquipmentDate(false);
                                                if (date) {
                                                    setTempEquipment({ ...tempEquipment, dateStart: date });
                                                }
                                            }}
                                        />
                                    )}
                                </View>
                            )}

                            {modalType === "photo" && (
                                <View>
                                    <Text style={styles.modalLabel}>Описание</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={tempPhoto.description}
                                        onChangeText={(text) =>
                                            setTempPhoto({ ...tempPhoto, description: text })
                                        }
                                        placeholder="Введите описание"
                                    />

                                    <TouchableOpacity
                                        style={styles.photoPickerButton}
                                        onPress={pickImage} // <-- функция для выбора фото
                                    >
                                        <Ionicons name="camera" size={24} color="#007AFF" />
                                        <Text style={styles.photoPickerText}>
                                            {tempPhoto.file ? "Фото выбрано" : "Выбрать фото"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>

                        {/* --- Footer --- */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={closeModal}
                            >
                                <Text style={styles.modalCancelButtonText}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.modalSubmitButtonText}>Добавить</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        maxHeight: "85%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalTitle: { fontSize: 18, fontWeight: "600" },
    closeButton: { padding: 4 },
    modalContent: { padding: 16 },
    modalLabel: { fontSize: 14, marginBottom: 6, fontWeight: "500" },
    modalInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    modalDateButton: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 12,
    },
    statusButtons: { flexDirection: "row", marginBottom: 12 },
    statusButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        alignItems: "center",
        marginRight: 8,
    },
    statusButtonActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
    statusButtonText: { color: "#333" },
    statusButtonTextActive: { color: "#fff", fontWeight: "600" },
    coordRow: { flexDirection: "row", justifyContent: 'space-between', marginBottom: 12 },
    photoPickerButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderColor: "#007AFF",
        borderRadius: 8,
        marginTop: 8,
    },
    photoPickerText: { marginLeft: 8, color: "#007AFF", fontWeight: "500" },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    modalCancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        marginRight: 8,
    },
    modalCancelButtonText: { color: "#333" },
    modalSubmitButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "green",
    },
    modalSubmitButtonText: { color: "#fff", fontWeight: "600" },

    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionMainTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginBottom: 12,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#007AFF',
        marginLeft: 4,
        fontSize: 14,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dateColumn: {
        flex: 1,
        marginHorizontal: 4,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    subLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 12,
        backgroundColor: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 12,
        backgroundColor: '#fff',
    },
    logItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    logUser: {
        fontWeight: 'bold',
        color: '#333',
    },
    logDate: {
        color: '#666',
        fontSize: 12,
    },
    logComment: {
        color: '#333',
        fontSize: 14,
    },
    resourceItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
    },
    resourceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    resourceName: {
        fontWeight: 'bold',
        color: '#333',
    },
    resourceCount: {
        color: '#333',
        fontSize: 14,
    },
    resourceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resourceUser: {
        color: '#666',
        fontSize: 12,
    },
    resourceDate: {
        color: '#666',
        fontSize: 12,
    },
    equipmentItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
    },
    equipmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    equipmentName: {
        fontWeight: 'bold',
        color: '#333',
    },
    equipmentStatus: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    equipmentPhone: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    phoneText: {
        color: '#007AFF',
        marginLeft: 4,
    },
    equipmentDate: {
        color: '#666',
        fontSize: 12,
    },
    photoItem: {
        flexDirection: 'row',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    photoImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    photoInfo: {
        flex: 1,
        marginLeft: 12,
    },
    photoDescription: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    photoCoords: {
        color: '#007AFF',
        fontSize: 12,
        marginBottom: 4,
    },
    photoMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    photoUser: {
        color: '#666',
        fontSize: 12,
    },
    photoDate: {
        color: '#666',
        fontSize: 12,
    },
    acceptanceHeader: {
        marginBottom: 12,
    },
    acceptanceButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    acceptanceButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    acceptanceButtonText: {
        color: '#fff',
        fontSize: 14,
    },
});