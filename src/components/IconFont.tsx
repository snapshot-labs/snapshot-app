import React from "react";
import { createIconSet } from "@expo/vector-icons";
import iconfont from "../constants/iconfont.json";
import colors from "../constants/colors";

const CustomIcon = createIconSet(
  //@ts-ignore
  iconfont,
  "IconFont",
  require("../styles/iconfont.ttf")
);

interface IconFontProps {
  name: string | any;
  size: number;
  color: string;
  style?: any;
}

function IconFont({
  name,
  size,
  color = colors.textColor,
  style = {},
}: IconFontProps) {
  return <CustomIcon name={name} size={size} color={color} style={style} />;
}

export default IconFont;
