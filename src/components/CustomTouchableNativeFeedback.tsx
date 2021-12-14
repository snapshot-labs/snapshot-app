import React from "react";
import { TouchableNativeFeedback } from "react-native-gesture-handler";

interface CustomTouchableNativeFeedbackProps {
  children: React.FC;
  style: any;
}

function CustomTouchableNativeFeedback({
  children,
  style,
  ...props
}: CustomTouchableNativeFeedbackProps) {
  return (
    <TouchableNativeFeedback
      {...props}
      background={TouchableNativeFeedback.Ripple("rgba(0, 0, 0, .32)", false)}
      style={style}
    >
      {children}
    </TouchableNativeFeedback>
  );
}

export default CustomTouchableNativeFeedback;
