import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import colors from "../constants/colors";

const styles = StyleSheet.create({
  badge: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: colors.bgPurple,
  },
  greenBg: {
    backgroundColor: colors.bgGreen,
  },
  grayBg: {
    backgroundColor: colors.bgGray,
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
    <View style={[styles.badge, getStateStyle(state)]}>
      <Text style={styles.badgeTitle}>{state}</Text>
    </View>
  );
}

export default StateBadge;
