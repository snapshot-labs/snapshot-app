import React from "react";
import { ActivityIndicator } from "react-native-paper";
import { ViewProps } from "react-native";
import Device from "helpers/device";

interface ActivityIndicatorProps {
  animating?: boolean;
  color: string;
  size?: "small" | "large" | number;
  hidesWhenStopped?: boolean;
  style?: ViewProps;
}

function ActivityIndicatorComponent(props: ActivityIndicatorProps) {
  let size = props.size;
  if (size === "small" && Device.isAndroid()) {
    size = 30;
  }
  return <ActivityIndicator {...props} size={size} />;
}

export default ActivityIndicatorComponent;
