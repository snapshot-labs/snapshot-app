import { StyleSheet } from "react-native";
import colors from "../constants/colors";

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: colors.black,
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
