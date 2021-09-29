import React from "react";
import { View, StyleSheet, Text } from "react-native";
import colors from "../constants/colors";
import common from "../styles/common";

const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    flexDirection: "row",
    alignItems: "center",
  },
  countContainer: {
    backgroundColor: colors.darkGray,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginLeft: 4,
    marginBottom: 4,
    minWidth: 30,
  },
  countText: {
    color: colors.white,
    fontFamily: "Calibre-Medium",
    fontSize: 15,
    marginTop: 4,
  },
});

type BlockProps = {
  title: string;
  Content: React.ReactElement;
  count?: number | string | undefined;
  hideHeaderBorder?: boolean;
};

function Block({ title, Content, count, hideHeaderBorder }: BlockProps) {
  return (
    <View style={styles.block}>
      <View
        style={[
          styles.header,
          hideHeaderBorder ? { borderBottomWidth: 0 } : {},
        ]}
      >
        <Text style={[common.h4]}>{title}</Text>
        {count !== undefined && (
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      {Content}
    </View>
  );
}

export default Block;
