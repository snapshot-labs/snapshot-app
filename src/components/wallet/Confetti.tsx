import React, { useEffect } from "react";
import { Platform } from "react-native";
import Device from "helpers/device";
import ConfettiNormal from "react-native-confetti";
import ConfettiCannon from "react-native-confetti-cannon";

const isAndroid = Platform.OS === "android";
const ORIGIN = { x: Device.getDeviceWidth() / 2, y: 0 };

const Confetti = (props: any) => {
  let confettiView: any = false;

  useEffect(() => {
    if (isAndroid && confettiView) {
      confettiView?.startConfetti();
    }
  }, [confettiView]);

  return isAndroid ? (
    <ConfettiNormal ref={(node: any) => (confettiView = node)} {...props} />
  ) : (
    <ConfettiCannon fadeOut count={300} origin={ORIGIN} {...props} />
  );
};

export default Confetti;
