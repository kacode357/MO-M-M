import Introduction from '@/components/Introduction';
import Search from '@/components/Search';
import SnackPlace from '@/components/SnackPlace';
import { ThemedView } from '@/components/ThemedView';
import { Keyboard, Platform, StyleSheet, TouchableWithoutFeedback } from 'react-native';

export default function HomeScreen() {
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ThemedView style={styles.container}>
        <Search />
        <Introduction />
        <SnackPlace />
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.select({ ios: 50, android: 50, web: 30 }),
  },
});