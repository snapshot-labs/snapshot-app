import React from "react";
import {
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import colors from "../constants/colors";
import { useAuthState } from "context/authContext";

export const styles = StyleSheet.create({
  button: {
    padding: 16,
    backgroundColor: "transparent",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  lightButton: {
    backgroundColor: colors.bgDefault,
    borderColor: colors.borderColor,
    borderWidth: 1,
  },
  disabled: {
    backgroundColor: colors.disabledButtonBg,
  },
  buttonTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Calibre-Medium",
  },
  label: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    color: colors.darkGray,
  },
  lightButtonTitle: {
    color: colors.textColor,
  },
  nativeFeedbackContainer: {
    borderRadius: 60,
    overflow: "hidden",
  },
});

interface ButtonProps {
  onPress: () => void;
  title: string;
  primary?: boolean;
  buttonContainerStyle?: ViewStyle | ViewStyle[];
  nativeFeedbackContainerStyle?: ViewStyle;
  buttonTitleStyle?: TextStyle;
  disabled?: boolean;
  light?: boolean;
  Icon?: React.FC | undefined;
  loading?: boolean;
  onlyOneLine?: boolean;
  selected?: boolean;
  label?: string;
  loadingColor?: string;
}

function Button({
  onPress,
  title,
  buttonTitleStyle,
  buttonContainerStyle,
  nativeFeedbackContainerStyle,
  disabled = false,
  light = false,
  Icon = undefined,
  loading = false,
  onlyOneLine = false,
  selected = false,
  label = undefined,
  primary = false,
  loadingColor = undefined,
}: ButtonProps) {
  const { colors } = useAuthState();
  const ButtonContainerComponent = TouchableWithoutFeedback;
  const activityLoadingColor =
    loadingColor === undefined
      ? primary
        ? colors.white
        : colors.textColor
      : loadingColor;

  return (
    <ButtonContainerComponent
      onPress={disabled || loading ? () => {} : onPress}
    >
      <View
        style={[
          styles.button,
          light ? styles.lightButton : {},
          disabled ? styles.disabled : {},
          primary
            ? {
                backgroundColor: disabled
                  ? colors.disabledButtonBg
                  : colors.blueButtonBg,
                borderColor: disabled ? colors.disabledButtonBg : "transparent",
              }
            : { borderColor: colors.borderColor },
          selected ? { borderColor: colors.blueButtonBg } : {},
          label !== undefined ? { justifyContent: "flex-start" } : {},
          buttonContainerStyle,
        ]}
      >
        {label !== undefined && <Text style={styles.label}>{label}</Text>}
        {loading ? (
          <ActivityIndicator size="small" color={activityLoadingColor} />
        ) : (
          <>
            {Icon !== undefined && <Icon />}
            <Text
              {...(onlyOneLine
                ? { numberOfLines: 1, ellipsizeMode: "tail" }
                : {})}
              style={[
                styles.buttonTitle,
                { color: colors.textColor },
                light ? styles.lightButtonTitle : {},
                primary ? { color: colors.white } : {},
                buttonTitleStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </ButtonContainerComponent>
  );
}

export default Button;
