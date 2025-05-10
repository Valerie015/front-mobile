import React from "react";
import { Snackbar, Text } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";

interface SnackbarComponentProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

const SnackbarComponent: React.FC<SnackbarComponentProps> = ({
  visible,
  message,
  onDismiss,
}) => {
  const { colors } = useTheme();

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={3000}
      style={{ backgroundColor: colors.surface }}
    >
      <Text style={{ color: colors.text }}>{message}</Text>
    </Snackbar>
  );
};

export default SnackbarComponent;