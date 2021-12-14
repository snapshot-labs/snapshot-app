import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import i18n from "i18n-js";
import map from "lodash/map";
import get from "lodash/get";
import { Space } from "types/explore";
import common from "styles/common";
import colors from "constants/colors";
import networksJson from "@snapshot-labs/snapshot.js/src/networks.json";
import { n } from "helpers/miscUtils";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import { getUsername, setProfiles } from "helpers/profile";
import UserAvatar from "../UserAvatar";
import { useAuthState } from "context/authContext";

const { height: deviceHeight } = Dimensions.get("screen");

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

interface AboutSpaceProps {
  routeSpace: Space;
  scrollProps: any;
  headerHeight: number;
  spaceAboutRef: any;
}

function AboutSpace({
  routeSpace,
  scrollProps,
  headerHeight,
  spaceAboutRef,
}: AboutSpaceProps) {
  const { connectedAddress, colors } = useAuthState();
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
      ref={spaceAboutRef}
      bounces={false}
      overScrollMode={"never"}
      scrollEventThrottle={1}
      style={[
        common.screen,
        {
          paddingTop: headerHeight + 45,
          backgroundColor: colors.bgDefault,
        },
      ]}
      {...scrollProps}
    >
      <View style={styles.content}>
        {networkName && (
          <View style={styles.labelValueContainer}>
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("network")}
            </Text>
            <Text style={styles.value}>{networkName}</Text>
          </View>
        )}
        <View style={styles.labelValueContainer}>
          <Text style={[styles.label, { color: colors.textColor }]}>
            {i18n.t("proposalValidation")}
          </Text>
          <Text style={styles.value}>{space.validation?.name || "basic"}</Text>
        </View>
        {(!space.validation || space.validation?.name === "basic") &&
        space.filters?.minScore ? (
          <View style={styles.labelValueContainer}>
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("proposalThreshold")}
            </Text>
            <Text style={styles.value}>
              {n(space.filters?.minScore ?? 0)} {space.symbol}
            </Text>
          </View>
        ) : (
          <View />
        )}
        {space.terms && (
          <View style={styles.labelValueContainer}>
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("terms")}
            </Text>
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
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("strategies")}
            </Text>
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
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("plugins")}
            </Text>
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
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("admins")}
            </Text>
            {space.admins.map((admin: string, i: number) => {
              const adminProfile = profiles[admin];
              const adminName = getUsername(
                admin,
                adminProfile,
                connectedAddress ?? ""
              );
              return (
                <View
                  key={`${i}`}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <UserAvatar
                    size={20}
                    address={admin}
                    imgSrc={adminProfile?.image}
                    key={`${admin}${adminProfile?.image}`}
                  />
                  <Text
                    style={[
                      styles.value,
                      {
                        marginBottom: i === space.strategies.length - 1 ? 0 : 4,
                        marginLeft: 6,
                      },
                    ]}
                  >
                    {adminName}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View />
        )}
        {space.members?.length ? (
          <View style={[styles.labelValueContainer, { marginTop: 24 }]}>
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("authors")}
            </Text>
            {space.members.map((member: string, i: number) => {
              const memberProfile = profiles[member];
              const memberName = getUsername(
                member,
                memberProfile,
                connectedAddress ?? ""
              );

              return (
                <View
                  key={`${i}`}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <UserAvatar
                    address={member}
                    size={20}
                    imgSrc={memberProfile?.image}
                    key={`${member}${memberProfile?.image}`}
                  />
                  <Text
                    style={[
                      styles.value,
                      {
                        marginBottom: i === space.strategies.length - 1 ? 0 : 4,
                        marginLeft: 6,
                      },
                    ]}
                  >
                    {memberName}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View />
        )}
        <View style={{ width: 200, height: deviceHeight / 1.5 }} />
      </View>
    </AnimatedScrollView>
  );
}

export default AboutSpace;
