import React from "react";
import { StyleSheet, View, Text } from "react-native";
import i18n from "i18n-js";
import colors from "../../constants/colors";
import { n } from "../../util/miscUtils";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: "Calibre-Semibold",
    color: colors.darkGray,
    fontSize: 18,
  },
});

type SkinProps = {
  skin: { key: string; spaces: number };
};

function Skin({ skin }: SkinProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{skin.key}</Text>
      <Text style={styles.title}>
        {i18n.t("inSpaces", { spaceCount: n(skin.spaces) })}
      </Text>
    </View>
  );
}

export default Skin;
