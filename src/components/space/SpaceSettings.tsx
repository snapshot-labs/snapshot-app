import React from "react";
import { Space } from "types/explore";
import { View, StyleSheet, Text } from "react-native";
import common from "styles/common";
import SpaceInfoRow from "components/space/SpaceInfoRow";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";
import InputRound from "components/InputRound";

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
    textTransform: "uppercase",
    paddingBottom: 14,
  },
  separator: {
    width: 100,
    height: 14,
  },
});

interface SpaceSettingsProps {
  space: Space;
}

function SpaceSettings({ space }: SpaceSettingsProps) {
  const { colors } = useAuthState();

  return (
    <View
      style={[
        common.contentContainer,
        {
          borderColor: colors.borderColor,
          marginTop: 22,
          marginHorizontal: 14,
        },
      ]}
    >
      <SpaceInfoRow
        icon="gear"
        title={i18n.t("spaceSettings")}
        BottomComponent={() => {
          return (
            <View>
              <Text style={[styles.subtitle, { color: colors.textColor }]}>
                {i18n.t("profile")}
              </Text>
              <InputRound title={i18n.t("name")} value={space.name} />
              <View style={styles.separator} />
              <InputRound title={i18n.t("about")} value={space.about ?? ""} />
              <View style={styles.separator} />
              <InputRound title={i18n.t("avatar")} value={space.avatar ?? ""} />
              <View style={styles.separator} />
              <InputRound
                title={`${i18n.t("symbol")} *`}
                value={space.symbol ?? ""}
              />
              <View style={styles.separator} />
              <InputRound
                title={i18n.t("twitter")}
                value={space.twitter ?? ""}
              />
              <View style={styles.separator} />
              <InputRound title={i18n.t("github")} value={space.github ?? ""} />
              <View style={styles.separator} />
              <InputRound title={i18n.t("terms")} value={space.terms ?? ""} />
              <Text
                style={[
                  styles.subtitle,
                  { color: colors.textColor, marginTop: 22 },
                ]}
              >
                {i18n.t("voting")}
              </Text>
              <InputRound
                title={i18n.t("votingDelay")}
                value={`${space?.voting?.delay ?? 0}`}
              />
              <View style={styles.separator} />
              <InputRound
                title={i18n.t("votingPeriod")}
                value={`${space?.voting?.period ?? 0}`}
              />
              <View style={styles.separator} />
              <InputRound
                title={i18n.t("type")}
                value={`${space?.voting?.period ?? 0}`}
              />
              <View style={styles.separator} />
              <InputRound
                title={i18n.t("quorum")}
                value={`${space?.voting?.quorum ?? 0} `}
              />
            </View>
          );
        }}
      />
    </View>
  );
}

export default SpaceSettings;
