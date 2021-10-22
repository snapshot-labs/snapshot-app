import { Platform, StyleSheet } from "react-native";
import colors from "constants/colors";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    textAlignVertical: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowTitle: {
    color: colors.textColor,
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  rowValue: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: "auto",
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.settingsIconBgColor,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Platform.OS === "ios" ? 4 : 0,
  },
});

export default styles;
