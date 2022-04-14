import { StyleSheet } from "react-native";
import colors from "../constants/colors";
import fontStyles from "styles/fonts";

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
    lineHeight: 24,
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
    fontSize: 35,
    fontFamily: "Calibre-Semibold",
  },
  h2: {
    fontSize: 28,
    fontFamily: "Calibre-Semibold",
  },
  h3: {
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
  },
  h4: {
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
  },
  headerContainer: {
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
    height: 50,
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
    paddingHorizontal: 14,
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
    justifyContent: "center",
  },
  alignItemsCenter: {
    alignItems: "center",
  },
  modalHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    height: 50,
    ...fontStyles.normal,
  },
  modalTitle: {
    marginTop: 16,
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
    textAlign: "center",
  },
  tabBarContainer: {
    shadowOpacity: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderBottomWidth: 1,
    elevation: 0,
  },
});

export default common;
