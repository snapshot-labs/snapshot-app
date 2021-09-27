import React from "react";
import { Text, View, StyleSheet, ViewStyle, TextStyle } from "react-native";
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
};

function Button({
  onPress,
  title,
  buttonTitleStyle,
  buttonContainerStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.button, buttonContainerStyle]}>
        <Text style={[styles.buttonTitle, buttonTitleStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default Button;
