import CustomAlert from '@/components/CustomAlert';
import { setGlobalAlert } from '@/utils/alertHandler';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AlertContextType {
  showAlert: (options: {
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    isSuccess?: boolean; // Add isSuccess
  }) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    isSuccess?: boolean; // Add isSuccess
  }>({
    visible: false,
    title: '',
    message: '',
    isSuccess: false,
  });

  const showAlert = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    showCancel,
    isSuccess,
  }: {
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    isSuccess?: boolean;
  }) => {
    setAlertState({
      visible: true,
      title,
      message,
      onConfirm: () => {
        onConfirm?.();
        setAlertState((prev) => ({ ...prev, visible: false }));
      },
      onCancel: () => {
        onCancel?.();
        setAlertState((prev) => ({ ...prev, visible: false }));
      },
      confirmText,
      cancelText,
      showCancel,
      isSuccess,
    });
  };

  useEffect(() => {
    setGlobalAlert(showAlert);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
        isSuccess={alertState.isSuccess} // Pass isSuccess
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};