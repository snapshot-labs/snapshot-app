import { StyleSheet, Dimensions } from "react-native";
import colors from "../constants/colors";

const { width: deviceWidth } = Dimensions.get("screen");

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black,
    width: deviceWidth,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  successContainer: { backgroundColor: colors.bgGreen },
  errorContainer: { backgroundColor: colors.red },
  text: {
    fontFamily: "Calibre-Medium",
    color: colors.white,
    fontSize: 18,
  },
});

export default styles;
