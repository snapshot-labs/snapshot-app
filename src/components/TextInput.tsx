import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import fontStyles from "styles/fonts";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    height: 50,
    ...fontStyles.normal,
  },
});

function TextInputContainer(props: any) {
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef<any>(null);
  const { colors } = useAuthState();

  useEffect(() => {
    if (props.setRef) {
      props.setRef.current = textInputRef.current;
    }
  }, [textInputRef.current]);

  return (
    <TextInput
      {...props}
      ref={textInputRef}
      style={[
        styles.input,
        {
          color: colors.textColor,
          borderColor: colors.borderColor,
        },
        isFocused
          ? { borderColor: colors.textColor }
          : { borderColor: colors.borderColor },
      ]}
      onFocus={() => {
        setIsFocused(true);
      }}
      onBlur={() => {
        setIsFocused(false);
      }}
    />
  );
}
export default TextInputContainer;
