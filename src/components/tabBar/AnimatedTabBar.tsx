import React, { FunctionComponent, ReactNode } from "react";
import { Animated, StyleSheet, ViewProps } from "react-native";
import Device from "helpers/device";

export interface AnimatedTabBarProps extends Omit<ViewProps, "style"> {
  scrollY: Animated.AnimatedValue;
  children: ReactNode;
  headerHeight: number;
}

export const tabBarOffset = Device.isIos() ? 110 : 65;

const AnimatedTabBar: FunctionComponent<AnimatedTabBarProps> = ({
  children,
  scrollY,
  headerHeight,
  ...otherProps
}) => {
  const tabViewOffset = Device.isIos() ? -headerHeight + tabBarOffset : 0;
  const translateY = scrollY.interpolate({
    inputRange: [tabViewOffset, tabViewOffset + headerHeight - tabBarOffset],
    outputRange: [headerHeight - tabBarOffset, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[styles.tabBar, { transform: [{ translateY }] }]}
      {...otherProps}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    width: "100%",
    zIndex: 10,
    height: 45,
    marginTop: 0,
    paddingTop: 0,
  },
  border: {
    height: 1,
  },
});

export default AnimatedTabBar;
