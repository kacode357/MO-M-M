import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  isSuccess?: boolean;
  showCancel?: boolean;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm: () => void;
}


const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  isSuccess = false,
  showCancel = false,
  cancelText = 'Hủy',
  confirmText = 'OK',
  onCancel,
  onConfirm,
}) => {
  const colorScheme = useColorScheme() ?? 'light';

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent 
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertContainer: {
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 12,
      width: '80%',
      padding: 20,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    title: {
      fontFamily: Fonts.Baloo2.Bold,
      fontSize: 18,
      color: Colors[colorScheme].text,
      marginBottom: 10,
      textAlign: 'center',
    },
    messageContainer: {
      marginBottom: 20,
      alignItems: 'center',
    },
    message: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: showCancel ? 'space-between' : 'center',
      width: '100%',
    },
    button: {
      flex: showCancel ? 1 : 0,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginHorizontal: showCancel ? 5 : 0,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: Colors[colorScheme].grayBackground,
    },
    confirmButton: {
      backgroundColor: Colors[colorScheme].tabBackground || '#007AFF',
    },
    buttonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].background,
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

export default AlertModal;