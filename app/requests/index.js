import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { ProjectContext } from "../_layout";
import { supabase } from "../projects/index";

const Tab = createMaterialTopTabNavigator();

export default function RequirementsPage() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Авторский надзор" component={AuthorTab} />
            <Tab.Screen name="Тех надзор" component={TechTab} />
            <Tab.Screen name="Предписания" component={RequirementsTab} />
        </Tab.Navigator>
    );
}

// --- Пустые вкладки ---
function AuthorTab() {
    return (
        <View style={styles.center}>
            <Text>Добавим позже 👷‍♂️</Text>
        </View>
    );
}

function TechTab() {
    return (
        <View style={styles.center}>
            <Text>Добавим позже 🏗️</Text>
        </View>
    );
}

// --- Вкладка с предписаниями ---
function RequirementsTab() {
    const { selectedProjectId } = useContext(ProjectContext);
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchRequirements = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("Requirements")
                .select("*")
                .eq("Project_id", selectedProjectId);

            if (error) {
                console.error("Ошибка загрузки предписаний:", error);
            } else {
                setRequirements(data);
            }
            setLoading(false);
        };

        fetchRequirements();
    }, [selectedProjectId]);

    if (!selectedProjectId) {
        return <Text style={styles.center}>❌ Проект не выбран</Text>;
    }

    if (loading) {
        return <Text style={styles.center}>Загрузка...</Text>;
    }

    return (
        <FlatList
            data={requirements}
            keyExtractor={(item) => item.Id.toString()}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <Text style={styles.title}>{item.Number}</Text>
                    <Text style={styles.description}>{item.Justification}</Text>
                    <Text style={styles.date}>
                        {new Date(item.Date).toLocaleDateString()}
                    </Text>
                </View>
            )}
            ListEmptyComponent={
                <Text style={styles.center}>Нет предписаний для этого проекта</Text>
            }
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        margin: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    description: { fontSize: 14, color: "#555" },
    date: { fontSize: 12, color: "#888", marginTop: 6 },
});
