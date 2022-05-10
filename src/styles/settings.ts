import { Platform, StyleSheet } from "react-native";
import Device from "helpers/device";
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
    marginBottom: Device.isIos() ? 4 : 0,
  },
  rowValue: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    fontSize: 22,
    marginLeft: "auto",
    marginBottom: Device.isIos() ? 4 : 0,
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
  separator: {
    width: "100%",
    height: 1,
  },
});

export const ICON_SIZE = 28;

export default styles;
