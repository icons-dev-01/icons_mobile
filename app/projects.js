import { View, Text, StyleSheet } from 'react-native';

export default function Projects() {
  const projects = ['Проект 1', 'Проект 2', 'Проект 3'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Доступные проекты</Text>
      {projects.map((p, idx) => (
        <Text key={idx}>• {p}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
