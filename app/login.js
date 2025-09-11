import { useRouter } from "expo-router"
import { useState } from "react"
import { Button, StyleSheet, Text, TextInput, View, Alert, TouchableOpacity } from "react-native"
import { supabase } from "../supabaseClient"
import * as Crypto from "expo-crypto"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isRegister, setIsRegister] = useState(false)
    const router = useRouter()

    // хэширование пароля
    const hashPassword = async (password) => {
        return await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            password
        )
    }

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Ошибка", "Введите логин и пароль")
            return
        }

        const { data: user, error } = await supabase
            .from("Users")
            .select("Id, username, password_hash")
            .eq("username", username)
            .maybeSingle()

        if (error) {
            Alert.alert("Ошибка", "Проблема при запросе")
            console.error("Supabase select error:", error)
            return
        }

        if (!user) {
            Alert.alert("Ошибка", "Неверный логин или пароль")
            return
        }

        const password_hash = await hashPassword(password)

        if (password_hash === user.password_hash) {
            await AsyncStorage.setItem("userId", user.Id)
            router.replace("/projects") // переход на главную
        } else {
            Alert.alert("Ошибка", "Неверный логин или пароль")
        }
    }

    const handleRegister = async () => {
        if (!username || !password) {
            Alert.alert("Ошибка", "Введите логин и пароль")
            return
        }

        const { data: existingUser, error: checkError } = await supabase
            .from("Users")
            .select("Id")
            .eq("username", username)
            .maybeSingle()

        if (checkError) {
            Alert.alert("Ошибка", "Не удалось проверить пользователя")
            console.error("Supabase select error:", checkError)
            return
        }

        if (existingUser) {
            Alert.alert("Ошибка", "Пользователь с таким логином уже существует")
            return
        }

        const password_hash = await hashPassword(password)

        const { error } = await supabase
            .from("Users")
            .insert([{ username, password_hash }])

        if (error) {
            Alert.alert("Ошибка", error.message)
            console.error("Supabase insert error:", error)
            return
        }

        Alert.alert("Успех", "Пользователь создан, теперь войдите")
        setIsRegister(false)
        setUsername("")
        setPassword("")
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {isRegister ? "Регистрация" : "Авторизация"}
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Логин"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Пароль"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {isRegister ? (
                <Button title="Зарегистрироваться" onPress={handleRegister} />
            ) : (
                <Button title="Войти" onPress={handleLogin} />
            )}

            <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
                <Text style={styles.toggle}>
                    {isRegister
                        ? "Уже есть аккаунт? Войти"
                        : "Нет аккаунта? Зарегистрироваться"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
    toggle: { marginTop: 15, color: "blue", textAlign: "center" },
})
