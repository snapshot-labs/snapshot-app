import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Text,
  Platform,
  TextStyle,
} from "react-native";
import colors from "../constants/colors";
import IconFont from "./IconFont";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonTitle: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 24,
    marginLeft: 8,
    marginTop: Platform.OS === "ios" ? 6 : 0,
  },
});

type BackButtonProps = {
  containerStyle?: ViewStyle;
  title?: string | undefined;
  onPress?: () => void | undefined;
  titleStyle?: TextStyle;
  iconColor?: string;
  backIcon?: string;
  backIconSize?: number;
  backIconStyle?: object;
};

function BackButton({
  containerStyle,
  title,
  onPress,
  titleStyle,
  iconColor,
  backIcon = "back",
  backIconSize,
  backIconStyle = {},
}: BackButtonProps) {
  const navigation: any = useNavigation();
  let setBackIconSize;

  if (backIconSize === undefined) {
    setBackIconSize = backIconSize;
  }

  return (
    <TouchableOpacity
      onPress={
        onPress
          ? onPress
          : () => {
              navigation.goBack();
            }
      }
    >
      <View style={[styles.backButton, containerStyle ?? {}]}>
        <IconFont
          name={backIcon}
          color={iconColor ? iconColor : colors.textColor}
          size={
            backIcon === "close" ? setBackIconSize ?? 20 : setBackIconSize ?? 30
          }
          style={backIconStyle}
        />
        <Text style={[styles.backButtonTitle, titleStyle]}>{title ?? ""}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default BackButton;
