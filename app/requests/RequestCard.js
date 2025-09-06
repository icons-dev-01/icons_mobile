import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, StyleSheet, Text, View, ScrollView } from "react-native";

export default function RequestCard() {
    const router = useRouter();
    const { id, jobName, endDate, techStatus, authorStatus, valueJob, description } = useLocalSearchParams();

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Запрос на приёмку №{id} от {endDate}</Text>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Активность</Text>
                <Text style={styles.value}>{jobName || "—"}</Text>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Дата окончания</Text>
                <Text style={styles.value}>{endDate || "—"}</Text>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Тех.надзор</Text>
                <Text style={styles.value}>{techStatus || "—"}</Text>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Авторский надзор</Text>
                <Text style={styles.value}>{authorStatus || "—"}</Text>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Объем работы</Text>
                <Text style={styles.value}>{valueJob || "—"}</Text>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Описание</Text>
                <Text style={styles.value}>{description || "—"}</Text>
            </View>

            <View style={styles.buttons}>
                <View style={styles.buttonGreen}>
                    <Button title="Согласовать" onPress={() => alert(`Запрос ${id} согласован ✅`)} color="white" />
                </View>
                <View style={styles.buttonRed}>
                    <Button title="Отклонить" onPress={() => alert(`Запрос ${id} отклонён ❌`)} color="white" />
                </View>
            </View>

            <Button title="Назад" onPress={() => router.back()} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
    block: { marginBottom: 12 },
    blockTitle: {
        backgroundColor: "#ddd",
        padding: 6,
        fontWeight: "bold",
        fontSize: 14,
    },
    value: { padding: 6, fontSize: 14 },
    buttons: { flexDirection: "row", justifyContent: "space-between", marginVertical: 20 },
    buttonGreen: { flex: 1, marginRight: 8, backgroundColor: "green", borderRadius: 6 },
    buttonRed: { flex: 1, marginLeft: 8, backgroundColor: "red", borderRadius: 6 },
});
 