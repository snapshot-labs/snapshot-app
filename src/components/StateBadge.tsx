import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import i18n from "i18n-js";
import colors from "../constants/colors";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  badgeTitle: {
    fontSize: 16,
    fontFamily: "Calibre-Medium",
    lineHeight: 30,
    color: colors.white,
    textTransform: "capitalize",
    marginTop: Platform.OS === "ios" ? 1 : 0,
    marginBottom: Platform.OS === "android" ? 4 : 0,
  },
  purpleBg: {
    color: colors.bgPurple,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    textTransform: "capitalize",
  },
  greenBg: {
    color: colors.bgGreen,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    textTransform: "capitalize",
  },
  grayBg: {
    color: colors.bgGray,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    textTransform: "capitalize",
  },
});

type StateBadgeProps = {
  state: string;
};

function getStateStyle(state: string) {
  if (state === "closed") return styles.purpleBg;
  if (state === "active") return styles.greenBg;
  return styles.grayBg;
}

function StateBadge({ state }: StateBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={getStateStyle(state)}>{state}</Text>
    </View>
  );
}

export default StateBadge;
