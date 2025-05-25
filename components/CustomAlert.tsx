import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  isSuccess?: boolean; // Add isSuccess prop
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Hủy',
  showCancel = false,
  isSuccess = false,
}) => {
  const colorScheme = useColorScheme() ?? 'light';

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alertContainer: {
      width: '80%',
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    title: {
      fontFamily: Fonts.Comfortaa.Bold,
      fontSize: 20,
      color: Colors[colorScheme].text,
      marginBottom: 10,
      textAlign: 'center',
    },
    messageContainer: {
      marginBottom: 20,
      width: '100%',
    },
    message: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 16,
      color: Colors[colorScheme].blackText,
      textAlign: isSuccess ? 'center' : 'left', // Center for success, left for errors
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: showCancel ? 'space-between' : 'center',
      width: '100%',
    },
    button: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 5,
      borderRadius: 10,
      alignItems: 'center',
    },
    confirmButton: {
      backgroundColor: isSuccess
        ? '#28a745' // Green for success
        : Colors[colorScheme].primaryText, // Default for errors
    },
    cancelButton: {
      backgroundColor: Colors[colorScheme].icon,
    },
    buttonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].whiteText,
    },
  });

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.messageContainer}>
            {isSuccess ? (
              <Text style={styles.message}>{message}</Text>
            ) : (
              message.split('\n').map((line, index) => (
                <Text key={index} style={styles.message}>
                  {line}
                </Text>
              ))
            )}
          </View>
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.buttonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;