type ShowAlertFunction = (options: {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  isSuccess?: boolean; // Add isSuccess flag
}) => void;

let showAlert: ShowAlertFunction | null = null;

export const setGlobalAlert = (alertFn: ShowAlertFunction) => {
  showAlert = alertFn;
};

export const triggerAlert = (options: Parameters<ShowAlertFunction>[0]) => {
  console.log("triggerAlert called with options:", options); // For debugging
  if (showAlert) {
    showAlert(options);
  } else {
    console.warn("Alert function not initialized. Falling back to console.");
    console.error(`Alert: ${options.title} - ${options.message}`);
  }
};