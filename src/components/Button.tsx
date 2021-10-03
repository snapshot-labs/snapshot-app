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

export const styles = StyleSheet.create({
  button: {
    padding: 16,
    backgroundColor: colors.black,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  lightButton: {
    backgroundColor: colors.white,
    borderColor: colors.borderColor,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.3,
  },
  buttonTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Calibre-Semibold",
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
}: ButtonProps) {
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
          light ? styles.lightButton : {},
          disabled ? styles.disabled : {},
          buttonContainerStyle,
        ]}
      >
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
