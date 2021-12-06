import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Text,
  Platform,
  TextStyle,
  Animated,
} from "react-native";
import colors from "../constants/colors";
import IconFont from "./IconFont";
import { useNavigation } from "@react-navigation/native";
import { useAuthState } from "context/authContext";

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
    fontSize: 21,
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
  isAnimated?: boolean;
  animatedProps?: any;
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
  isAnimated,
  animatedProps,
}: BackButtonProps) {
  const { colors } = useAuthState();
  const navigation: any = useNavigation();
  let setBackIconSize;
  let TitleComponent = (
    <Text
      style={[styles.backButtonTitle, { color: colors.textColor }, titleStyle]}
    >
      {title ?? ""}
    </Text>
  );

  if (backIconSize === undefined) {
    setBackIconSize = backIconSize;
  }

  if (isAnimated) {
    TitleComponent = (
      <Animated.View {...animatedProps}>
        <Text
          style={[
            styles.backButtonTitle,
            { color: colors.textColor },
            titleStyle,
          ]}
        >
          {title ?? ""}
        </Text>
      </Animated.View>
    );
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
        {TitleComponent}
      </View>
    </TouchableOpacity>
  );
}

export default BackButton;
