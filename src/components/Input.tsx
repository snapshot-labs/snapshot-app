import React from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
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

const Input = (
  props: TextInputProps & {
    setRef?: any;
    Icon?: React.FC;
    textInputContainerStyle?: ViewStyle;
  }
) => {
  const { colors } = useAuthState();
  let inputProps = { ...props };
  delete inputProps.setRef;

  if (props.Icon) {
    return (
      <View
        style={[
          {
            borderColor: colors.borderColor,
            borderWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            width: "100%",
          },
          props.textInputContainerStyle,
        ]}
      >
        <TextInput
          {...inputProps}
          style={{
            fontFamily: "Calibre-Medium",
            width: "90%",
            fontSize: 18,
            color: colors.textColor,
          }}
          {...(props.setRef ? { ref: props.setRef } : {})}
        />
        {<props.Icon />}
      </View>
    );
  }

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
