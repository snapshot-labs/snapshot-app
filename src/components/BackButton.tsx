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
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import i18n from "i18n-js";
import colors from "../constants/colors";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonTitle: {
    color: colors.darkGray,
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
};

function BackButton({
  containerStyle,
  title,
  onPress,
  titleStyle,
  iconColor,
}: BackButtonProps) {
  const navigation: any = useNavigation();
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
        <FontAwesome5Icon
          name="long-arrow-alt-left"
          color={iconColor ? iconColor : colors.darkGray}
          size={20}
        />
        <Text style={[styles.backButtonTitle, titleStyle]}>{title ?? ""}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default BackButton;
