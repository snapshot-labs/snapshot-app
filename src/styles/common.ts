import { StyleSheet } from "react-native";
import colors from "../constants/colors";

const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDefault,
  },
  screenHeaderTitle: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 24,
    paddingLeft: 16,
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
    width: "100%",
  },
  buttonContainer: {
    borderRadius: 25,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: colors.white,
    borderColor: colors.borderColor,
    borderWidth: 1,
    width: "100%",
    marginBottom: 20,
    height: 50,
  },
  containerHorizontalPadding: {
    paddingHorizontal: 16,
  },
  containerVerticalPadding: {
    paddingVertical: 16,
  },
  fullScreenModal: {
    height: "100%",
    width: "100%",
    justifyContent: "flex-start",
    margin: 0,
  },
  row: {
    flexDirection: "row",
  },
  flex1: {
    flex: 1,
  },
  justifySpaceBetween: {
    justifyContent: "space-between",
  },
  justifyCenter: {
    justifyContent: "center"
  },
  alignItemsCenter: {
    alignItems: "center"
  }
});

export default common;
