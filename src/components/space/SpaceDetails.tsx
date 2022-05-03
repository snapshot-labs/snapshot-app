import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import common from "styles/common";
import networksJson from "@snapshot-labs/snapshot.js/src/networks.json";
import SpaceInfoRow from "components/space/SpaceInfoRow";
import i18n from "i18n-js";
import { n } from "helpers/miscUtils";
import join from "lodash/join";
import map from "lodash/map";
import { useAuthState } from "context/authContext";
import get from "lodash/get";
import { Space } from "types/explore";

const styles = StyleSheet.create({
  separator: {
    width: "100%",
    height: 1,
  },
});

interface SpaceDetailsProps {
  space: Space;
}

function SpaceDetails({ space }: SpaceDetailsProps) {
  const { colors } = useAuthState();
  const network = get(networksJson, space.network, {});
  const networkName = network.name ?? undefined;
  const pluginsArray = Object.keys(space.plugins || {});
  return (
    <View style={[common.containerHorizontalPadding, { marginTop: 22 }]}>
      <View
        style={[common.contentContainer, { borderColor: colors.borderColor }]}
      >
        <SpaceInfoRow
          title={i18n.t("network")}
          value={networkName}
          icon={"feed"}
        />
        <View
          style={[styles.separator, { backgroundColor: colors.borderColor }]}
        />
        <SpaceInfoRow
          title={i18n.t("proposalValidation")}
          value={space.validation?.name || "basic"}
          icon={"receipt-outlined"}
        />
        <View
          style={[styles.separator, { backgroundColor: colors.borderColor }]}
        />
        <SpaceInfoRow
          title={i18n.t("proposalThreshold")}
          value={`${n(space.filters?.minScore ?? 0)} ${space?.symbol}`}
          icon={"check"}
        />
        {space.terms ? (
          <>
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.borderColor },
              ]}
            />
            <SpaceInfoRow
              title={i18n.t("terms")}
              value={space.terms}
              onPress={() => {
                if (space.terms) {
                  Linking.openURL(space.terms);
                }
              }}
              icon={"check"}
            />
          </>
        ) : (
          <View />
        )}
        {space.strategies ? (
          <>
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.borderColor },
              ]}
            />
            <SpaceInfoRow
              title={i18n.t("strategies")}
              value={join(
                map(space.strategies, (strategy) => strategy.name),
                ", "
              )}
              icon={"check"}
            />
          </>
        ) : (
          <View />
        )}
        {pluginsArray.length > 0 ? (
          <>
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.borderColor },
              ]}
            />
            <SpaceInfoRow
              title={i18n.t("plugins")}
              value={pluginsArray.join(", ")}
              icon={"upload"}
            />
          </>
        ) : (
          <View />
        )}
      </View>
    </View>
  );
}

export default SpaceDetails;
