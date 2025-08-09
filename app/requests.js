import { View, Text, Button, StyleSheet } from 'react-native';

export default function Requests() {
  const handleApprove = () => alert('Запрос согласован');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Запросы на проверку</Text>
      <Button title="Согласовать запрос" onPress={handleApprove} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
