import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../constants/colors";

const styles = StyleSheet.create({
  badge: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  badgeTitle: {
    fontSize: 16,
    fontFamily: "Calibre-Medium",
    lineHeight: 30,
    color: colors.white,
    textTransform: "capitalize",
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
