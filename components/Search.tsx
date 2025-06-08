import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const Search = () => {
  const colorScheme = useColorScheme() ?? 'light';

  const handleFilterPress = () => {
    console.log('Filter button pressed');
  };

  return (
    <ThemedView style={styles.searchContainer}>
      <View style={[styles.inputWrapper, { backgroundColor: Colors[colorScheme].background }]}>
        <Ionicons
          name="search"
          size={20}
          color={Colors[colorScheme].primaryText}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme].text, borderColor: Colors[colorScheme].blackText }]}
          placeholder="Cần gì đó có mình đây ..."
          placeholderTextColor={Colors[colorScheme].icon}
          returnKeyType="search"
        />
        <Ionicons
          name="camera"
          size={20}
          color={Colors[colorScheme].primaryText}
          style={styles.cameraIcon}
        />
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={handleFilterPress}
      >
        <Ionicons
          name="filter"
          size={20}
          color={Colors[colorScheme].primaryText}
        />
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
  },
  cameraIcon: {
    marginRight: 12,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Search;