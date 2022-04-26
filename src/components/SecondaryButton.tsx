import React from "react";
import {
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ActivityIndicator } from 'react-native-paper';
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 30,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTitle: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    textTransform: "uppercase",
  },
});

interface SecondaryButtonProps {
  onPress: () => void;
  title: string;
  buttonContainerStyle?: ViewStyle;
  selected?: boolean;
  buttonTitleStyle?: TextStyle;
  loading?: boolean;
}

function SecondaryButton({
  onPress,
  title,
  buttonContainerStyle,
  selected,
  buttonTitleStyle,
  loading = false,
}: SecondaryButtonProps) {
  const { colors } = useAuthState();

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={[
          styles.buttonContainer,
          { borderColor: colors.blueButtonBg },
          selected
            ? {
                backgroundColor: colors.disabledButtonBg,
                borderColor: colors.disabledButtonBg,
              }
            : {},
          buttonContainerStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.textColor} />
        ) : (
          <Text
            style={[
              styles.buttonTitle,
              selected
                ? { color: colors.baseBlue }
                : { color: colors.textColor },
              buttonTitleStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

export default SecondaryButton;
