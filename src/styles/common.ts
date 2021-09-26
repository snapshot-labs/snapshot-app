import { StyleSheet } from "react-native";
import colors from "../constants/colors";

const common = StyleSheet.create({
  headerTitle: {
    color: colors.headingColor,
    fontSize: 30,
    fontFamily: "Calibre-Semibold",
  },
  subTitle: {
    color: colors.darkGray,
    fontSize: 20,
    fontFamily: "Calibre-Medium",
  },
});

export default common;
