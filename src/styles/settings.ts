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
    fontSize: 22,
  },
  rowValue: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    fontSize: 22,
    marginLeft: "auto",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.settingsIconBgColor,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Platform.OS === "ios" ? 4 : 0,
  },
});

export const ICON_SIZE = 28;

export default styles;
