import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 90, // Set minimum height to 90
    maxWidth: '90%', // Prevent toast from being too wide on large screens
  },
  toastTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    flexWrap: 'wrap', // Allow title to wrap if needed
  },
  toastDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 2,
    flexWrap: 'wrap', // Ensure description wraps to multiple lines
  },
});

export const getToastConfig = (colorScheme: 'light' | 'dark'): ToastConfig => ({
  success: ({ text1, text2, ...rest }) => (
    <BaseToast
      {...rest}
      style={[styles.toastContainer, { backgroundColor: Colors[colorScheme].background, borderLeftWidth: 4, borderLeftColor: Colors[colorScheme].success }]}
      contentContainerStyle={{ padding: 0 }}
      text1Style={[styles.toastTitle, { color: Colors[colorScheme].blackText }]}
      text2Style={[styles.toastDescription, { color: Colors[colorScheme].text }]}
      text1={text1}
      text2={text2}
      text1Props={{ numberOfLines: 0 }} // Allow unlimited lines for title
      text2Props={{ numberOfLines: 0 }} // Allow unlimited lines for description
    />
  ),
  error: ({ text1, text2, ...rest }) => (
    <ErrorToast
      {...rest}
      style={[styles.toastContainer, { backgroundColor: Colors[colorScheme].background, borderLeftWidth: 4, borderLeftColor: Colors[colorScheme].error }]}
      contentContainerStyle={{ padding: 0 }}
      text1Style={[styles.toastTitle, { color: Colors[colorScheme].blackText }]}
      text2Style={[styles.toastDescription, { color: Colors[colorScheme].text }]}
      text1={text1}
      text2={text2}
      text1Props={{ numberOfLines: 0 }} // Allow unlimited lines for title
      text2Props={{ numberOfLines: 0 }} // Allow unlimited lines for description
    />
  ),
  info: ({ text1, text2, ...rest }) => (
    <View
      style={[styles.toastContainer, { backgroundColor: Colors[colorScheme].background, borderLeftWidth: 4, borderLeftColor: Colors[colorScheme].tint }]}
    >
      <View style={styles.toastTextContainer}>
        {text1 && (
          <Text style={[styles.toastTitle, { color: Colors[colorScheme].blackText }]} numberOfLines={0}>
            {text1}
          </Text>
        )}
        {text2 && (
          <Text style={[styles.toastDescription, { color: Colors[colorScheme].text }]} numberOfLines={0}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
});