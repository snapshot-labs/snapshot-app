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
import { HOME_SCREEN } from "constants/navigation";

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

interface BackButtonProps {
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
}

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
      hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
      onPress={
        onPress
          ? onPress
          : () => {
              if (navigation?.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: HOME_SCREEN }],
                });
              }
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
