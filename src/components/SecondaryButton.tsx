import React from "react";
import {
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";
import ActivityIndicator from "components/ActivityIndicator";
import { useAuthState } from "context/authContext";
import Device from "helpers/device";

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
          Device.isIos() && loading ? { paddingVertical: 4 } : {},
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={colors.textColor}
            size={Device.isAndroid() ? 18 : "small"}
          />
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
