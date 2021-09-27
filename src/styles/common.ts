import { StyleSheet } from "react-native";
import colors from "../constants/colors";

const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
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
  defaultText: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    color: colors.headingColor,
  },
});

export default common;
