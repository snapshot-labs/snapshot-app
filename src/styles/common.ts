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
  h1: {
    fontSize: 36,
    fontWeight: "500",
    fontFamily: "Calibre-Semibold",
  },
  h3: {
    fontSize: 26,
    fontFamily: "Calibre-Semibold",
  },
  h4: {
    fontSize: 20,
    fontFamily: "Calibre-Semibold",
  },
  headerContainer: {
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
    height: 60,
    alignItems: "center",
    flexDirection: "row",
  }
});

export default common;
