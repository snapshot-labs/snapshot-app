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
  backIcon?: string;
  backIconSize?: number;
};

function BackButton({
  containerStyle,
  title,
  onPress,
  titleStyle,
  iconColor,
  backIcon = "long-arrow-alt-left",
  backIconSize = 20,
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
          name={backIcon}
          color={iconColor ? iconColor : colors.darkGray}
          size={backIconSize}
        />
        <Text style={[styles.backButtonTitle, titleStyle]}>{title ?? ""}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default BackButton;
