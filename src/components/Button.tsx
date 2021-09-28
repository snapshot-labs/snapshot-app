import React from "react";
import {
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
} from "react-native";
import colors from "../constants/colors";
import { TouchableOpacity } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  button: {
    padding: 16,
    backgroundColor: colors.black,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    backgroundColor: colors.bgGray,
  },
  buttonTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Calibre-Semibold",
  },
});

type ButtonProps = {
  onPress: () => void;
  title: string;
  buttonContainerStyle?: ViewStyle;
  buttonTitleStyle?: TextStyle;
  disabled?: boolean;
};

function Button({
  onPress,
  title,
  buttonTitleStyle,
  buttonContainerStyle,
  disabled = false,
}: ButtonProps) {
  const ButtonContainerComponent = disabled
    ? TouchableWithoutFeedback
    : TouchableOpacity;

  return (
    <ButtonContainerComponent onPress={disabled ? () => {} : onPress}>
      <View
        style={[
          styles.button,
          disabled ? styles.disabled : {},
          buttonContainerStyle,
        ]}
      >
        <Text style={[styles.buttonTitle, buttonTitleStyle]}>{title}</Text>
      </View>
    </ButtonContainerComponent>
  );
}

export default Button;
