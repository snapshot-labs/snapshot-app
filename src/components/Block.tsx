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
  },
});

type BlockProps = {
  title: string;
  Content: React.ReactElement;
};

function Block({ title, Content }: BlockProps) {
  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <Text style={[common.h4]}>{title}</Text>
      </View>
      {Content}
    </View>
  );
}

export default Block;
