import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    fontFamily: "Calibre-Medium",
  },
});

const Input = (props: TextInputProps & { setRef?: any }) => {
  const { colors } = useAuthState();
  let inputProps = { ...props };
  delete inputProps.setRef;

  return (
    <TextInput
      {...inputProps}
      style={[
        styles.input,
        { color: colors.textColor, borderColor: colors.borderColor },
        props.style ?? {},
      ]}
      {...(props.setRef ? { ref: props.setRef } : {})}
    />
  );
};

export default Input;
