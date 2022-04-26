import React, { FunctionComponent } from "react";
import { Animated, StyleSheet, ViewProps } from "react-native";
import { useAuthState } from "context/authContext";
import Device from "helpers/device";
import { tabBarOffset } from "components/tabBar/AnimatedTabBar";

export interface AnimatedHeaderProps extends Omit<ViewProps, "style"> {
  scrollY: Animated.AnimatedValue;
  headerHeight: number;
}

export const AnimatedHeader: FunctionComponent<AnimatedHeaderProps> = ({
  scrollY,
  children,
  headerHeight,
  ...otherProps
}) => {
  const { colors } = useAuthState();
  const tabViewOffset = Device.isIos() ? -headerHeight + tabBarOffset : 0;
  const translateY = scrollY.interpolate({
    inputRange: [tabViewOffset, tabViewOffset + headerHeight],
    outputRange: [0, -headerHeight],
    extrapolateLeft: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.header,
        {
          transform: [{ translateY }],
          height: headerHeight,
          backgroundColor: colors.bgDefault,
        },
      ]}
      {...otherProps}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    top: 0,
    width: "100%",
    position: "absolute",
    zIndex: 2,
    justifyContent: "center",
  },
});

export default AnimatedHeader;
