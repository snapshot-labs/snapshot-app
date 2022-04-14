import React from "react";
import { TouchableWithoutFeedback, View, StyleSheet } from "react-native";
import { useAuthState } from "context/authContext";
import IconFont from "components/IconFont";

const styles = StyleSheet.create({
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});

interface IconButtonProps {
  onPress: () => void;
  name: string;
}

function IconButton({ onPress, name }: IconButtonProps) {
  const { colors } = useAuthState();
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.iconContainer, { borderColor: colors.borderColor }]}>
        <IconFont name={name} size={14} color={colors.textColor} />
      </View>
    </TouchableWithoutFeedback>
  );
}

export default IconButton;
