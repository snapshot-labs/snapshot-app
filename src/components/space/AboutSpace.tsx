import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import i18n from "i18n-js";
import map from "lodash/map";
import get from "lodash/get";
import { Space } from "../../types/explore";
import common from "../../styles/common";
import colors from "../../constants/colors";
import networksJson from "@snapshot-labs/snapshot.js/src/networks.json";
import { n, shorten } from "../../util/miscUtils";
import {
  useExploreDispatch,
  useExploreState,
} from "../../context/exploreContext";
import { setProfiles } from "../../util/profile";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const styles = StyleSheet.create({
  label: {
    fontSize: 20,
    fontFamily: "Calibre-Semibold",
    color: colors.textColor,
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    color: colors.darkGray,
  },
  content: {
    padding: 16,
  },
  labelValueContainer: {
    marginBottom: 16,
  },
});

type AboutSpaceProps = {
  routeSpace: Space;
  scrollProps: any;
  headerHeight: number;
};

function AboutSpace({
  routeSpace,
  scrollProps,
  headerHeight,
}: AboutSpaceProps) {
  const { spaces, profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const space = Object.assign(routeSpace, get(spaces, routeSpace.id ?? "", {}));
  //@ts-ignore
  const network = networksJson[space.network] ?? {};
  const networkName = network.name ?? undefined;
  const pluginsArray = Object.keys(space.plugins || {});

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = [...(space.admins ?? []), ...(space.members ?? [])];
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [space]);

  return (
    <AnimatedScrollView
      style={[common.screen, { paddingTop: headerHeight + 60 }]}
      {...scrollProps}
    >
      <View style={styles.content}>
        {networkName && (
          <View style={styles.labelValueContainer}>
            <Text style={styles.label}>{i18n.t("network")}</Text>
            <Text style={styles.value}>{networkName}</Text>
          </View>
        )}
        <View style={styles.labelValueContainer}>
          <Text style={styles.label}>{i18n.t("proposalValidation")}</Text>
          <Text style={styles.value}>{space.validation?.name || "basic"}</Text>
        </View>
        {(!space.validation || space.validation?.name === "basic") &&
        space.filters?.minScore ? (
          <View style={styles.labelValueContainer}>
            <Text style={styles.label}>{i18n.t("proposalThreshold")}</Text>
            <Text style={styles.value}>
              {n(space.filters?.minScore ?? 0)} {space.symbol}
            </Text>
          </View>
        ) : (
          <View />
        )}
        {space.terms && (
          <View style={styles.labelValueContainer}>
            <Text style={styles.label}>{i18n.t("terms")}</Text>
            <TouchableOpacity
              onPress={() => {
                if (space.terms) {
                  Linking.openURL(space.terms);
                }
              }}
            >
              <View>
                <Text style={styles.value}>{space.terms}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {space.strategies ? (
          <View style={styles.labelValueContainer}>
            <Text style={styles.label}>{i18n.t("strategies")}</Text>
            {map(space.strategies, (strategy: any, i: number) => (
              <Text
                key={`${i}`}
                style={[
                  styles.value,
                  { marginBottom: i === space.strategies.length - 1 ? 0 : 4 },
                ]}
              >
                {strategy.name}
              </Text>
            ))}
          </View>
        ) : (
          <View />
        )}
        {pluginsArray.length ? (
          <View style={styles.labelValueContainer}>
            <Text style={styles.label}>{i18n.t("plugins")}</Text>
            {pluginsArray.map((plugin, i) => {
              return (
                <Text
                  style={[
                    styles.value,
                    { marginBottom: i === space.strategies.length - 1 ? 0 : 4 },
                  ]}
                  key={`${i}`}
                >
                  {plugin}
                </Text>
              );
            })}
          </View>
        ) : (
          <View />
        )}
        {space.admins?.length ? (
          <View style={[styles.labelValueContainer, { marginTop: 24 }]}>
            <Text style={styles.label}>{i18n.t("admins")}</Text>
            {space.admins.map((admin: string, i: number) => {
              const adminProfile = profiles[admin];
              const adminName =
                adminProfile && adminProfile.ens
                  ? adminProfile.ens
                  : shorten(admin);
              return (
                <Text
                  style={[
                    styles.value,
                    { marginBottom: i === space.strategies.length - 1 ? 0 : 4 },
                  ]}
                  key={`${i}`}
                >
                  {adminName}
                </Text>
              );
            })}
          </View>
        ) : (
          <View />
        )}
        {space.members?.length ? (
          <View style={[styles.labelValueContainer, { marginTop: 24 }]}>
            <Text style={styles.label}>{i18n.t("admins")}</Text>
            {space.members.map((member: string, i: number) => {
              const memberProfile = profiles[member];
              const memberName =
                memberProfile && memberProfile.ens
                  ? memberProfile.ens
                  : shorten(member);
              return (
                <Text
                  style={[
                    styles.value,
                    { marginBottom: i === space.strategies.length - 1 ? 0 : 4 },
                  ]}
                  key={`${i}`}
                >
                  {memberName}
                </Text>
              );
            })}
          </View>
        ) : (
          <View />
        )}
        <View style={{ width: "100%", height: 200 }} />
      </View>
    </AnimatedScrollView>
  );
}

export default AboutSpace;
