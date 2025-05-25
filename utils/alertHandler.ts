type ShowAlertFunction = (options: {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  isSuccess?: boolean;
}) => void;

let showAlert: ShowAlertFunction | null = null;

export const setGlobalAlert = (alertFn: ShowAlertFunction) => {
  showAlert = alertFn;
};

export const triggerAlert = (options: Parameters<ShowAlertFunction>[0]) => {
  // Enhanced logging with stack trace to identify caller
  console.log("triggerAlert called with options:", options, "Stack:", new Error().stack);
  if (showAlert) {
    showAlert(options);
  } else {
    console.warn("Alert function not initialized. Falling back to console.");
    console.error(`Alert: ${options.title} - ${options.message}`);
  }
};