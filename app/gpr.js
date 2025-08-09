import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function GPR() {
  const tasks = [
    { id: 1, title: 'Фундамент', status: 'Новые' },
    { id: 2, title: 'Стены', status: 'В работе' },
    { id: 3, title: 'Крыша', status: 'Завершенные' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>График производства работ</Text>
      {tasks.map(task => (
        <View key={task.id} style={styles.item}>
          <Text>{task.title} — {task.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
});
