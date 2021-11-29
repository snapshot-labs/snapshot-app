import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import i18n from "i18n-js";
import colors from "../constants/colors";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
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
  circle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: Platform.OS === "ios" ? 4 : 0,
  },
});

type StateBadgeProps = {
  state: string;
};

function getStateBg(state: string) {
  if (state === "closed") return colors.bgPurple;
  if (state === "active") return colors.bgGreen;
  return colors.bgGray;
}

function StateBadge({ state }: StateBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: getStateBg(state) }]} />
      <Text style={styles.grayBg}>{state}</Text>
    </View>
  );
}

export default StateBadge;
