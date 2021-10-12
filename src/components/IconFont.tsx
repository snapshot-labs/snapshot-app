import React from "react";
import { createIconSet } from "@expo/vector-icons";
import iconfont from "../constants/iconfont.json";
import colors from "../constants/colors";

const CustomIcon = createIconSet(
  iconfont,
  "IconFont",
  require("../styles/iconfont.ttf")
);

type IconFontProps = {
  name: string;
  size: number;
  color: string;
};
function IconFont({ name, size, color = colors.textColor }: IconFontProps) {
  return <CustomIcon name={name} size={size} color={color} />;
}

export default IconFont;
