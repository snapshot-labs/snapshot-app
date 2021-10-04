import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import colors from "../constants/colors";

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    borderColor: colors.borderColor,
    fontFamily: "Calibre-Medium",
  },
});

function Input(props: TextInputProps) {
  return <TextInput {...props} style={[styles.input, props.style ?? {}]} />;
}

export default Input;
