import React from "react";
import {
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import colors from "../constants/colors";
import { TouchableOpacity } from "react-native-gesture-handler";
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
    backgroundColor: colors.borderColor,
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
});

type ButtonProps = {
  onPress: () => void;
  title: string;
  buttonContainerStyle?: ViewStyle;
  buttonTitleStyle?: TextStyle;
  disabled?: boolean;
  light?: boolean;
  Icon?: React.FC | undefined;
  loading?: boolean;
  onlyOneLine?: boolean;
  selected?: boolean;
  label?: string;
};

function Button({
  onPress,
  title,
  buttonTitleStyle,
  buttonContainerStyle,
  disabled = false,
  light = false,
  Icon = undefined,
  loading = false,
  onlyOneLine = false,
  selected = false,
  label = undefined,
}: ButtonProps) {
  const { theme, colors } = useAuthState();
  const ButtonContainerComponent = disabled
    ? TouchableWithoutFeedback
    : TouchableOpacity;

  return (
    <ButtonContainerComponent
      onPress={disabled || loading ? () => {} : onPress}
    >
      <View
        style={[
          styles.button,
          theme === "dark"
            ? { borderColor: colors.borderColor, borderWidth: 1 }
            : {},
          light ? styles.lightButton : {},
          disabled ? styles.disabled : {},
          selected ? { borderColor: colors.textColor } : {},
          label !== undefined ? { justifyContent: "flex-start" } : {},
          buttonContainerStyle,
        ]}
      >
        {label !== undefined && <Text style={styles.label}>{label}</Text>}
        {loading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Text
              {...(onlyOneLine
                ? { numberOfLines: 1, ellipsizeMode: "tail" }
                : {})}
              style={[
                styles.buttonTitle,
                { color: colors.textColor },
                light ? styles.lightButtonTitle : {},
                buttonTitleStyle,
              ]}
            >
              {title}
            </Text>
            {Icon !== undefined && <Icon />}
          </>
        )}
      </View>
    </ButtonContainerComponent>
  );
}

export default Button;
