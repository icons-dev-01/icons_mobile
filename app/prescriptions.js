import { View, Text, StyleSheet } from 'react-native';

export default function Prescriptions() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Предписания</Text>
      <Text>Здесь будут технические предписания по строительству</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
