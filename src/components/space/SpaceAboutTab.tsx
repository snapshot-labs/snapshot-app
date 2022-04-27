import React, { useEffect } from "react";
import {
  Animated,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthState } from "context/authContext";
import SpaceInfoRow from "components/space/SpaceInfoRow";
import networksJson from "@snapshot-labs/snapshot.js/src/networks.json";
import i18n from "i18n-js";
import get from "lodash/get";
import { Space } from "types/explore";
import { n } from "helpers/miscUtils";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import map from "lodash/map";
import join from "lodash/join";
import { getUsername, getUserProfile, setProfiles } from "helpers/profile";
import { USER_PROFILE } from "constants/navigation";
import UserAvatar from "components/UserAvatar";
import common from "styles/common";
import { useNavigation } from "@react-navigation/native";
import AnimatedTabViewFlatList from "components/tabBar/AnimatedTabViewFlatList";
import Device from "helpers/device";

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

const styles = StyleSheet.create({
  contentContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    paddingBottom: 18,
  },
  separator: {
    width: "100%",
    height: 1,
  },
  usernameText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
});

interface SpaceAboutTabProps {
  space: Space;
  isActive: boolean;
  routeKey: string;
  scrollY: Animated.Value;
  trackRef: (key: string, ref: FlatList<any>) => void;
  onMomentumScrollBegin: (e: ScrollEvent) => void;
  onMomentumScrollEnd: (e: ScrollEvent) => void;
  onScrollEndDrag: (e: ScrollEvent) => void;
  headerHeight: number;
}

function SpaceAboutTab({
  space,
  isActive,
  routeKey,
  scrollY,
  trackRef,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  onScrollEndDrag,
  headerHeight,
}: SpaceAboutTabProps) {
  const { colors, connectedAddress } = useAuthState();
  const { spaces, profiles } = useExploreState();
  const network = get(networksJson, space.network, {});
  const networkName = network.name ?? undefined;
  const spaceDetails = Object.assign(space, get(spaces, space.id ?? "", {}));
  const pluginsArray = Object.keys(spaceDetails.plugins || {});
  const navigation: any = useNavigation();
  const exploreDispatch = useExploreDispatch();
  const spaceAboutData = [{ key: "details" }, { key: "members" }];

  useEffect(() => {
    const addressArray = [
      ...(spaceDetails.admins ?? []),
      ...(spaceDetails.members ?? []),
    ];

    if (addressArray.length > 0) {
      setProfiles(addressArray, exploreDispatch);
    }
  }, [spaceDetails]);

  function SpaceDetails() {
    return (
      <View style={[common.containerHorizontalPadding, { marginTop: 22 }]}>
        <View
          style={[styles.contentContainer, { borderColor: colors.borderColor }]}
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
            value={spaceDetails.validation?.name || "basic"}
            icon={"receipt-outlined"}
          />
          <View
            style={[styles.separator, { backgroundColor: colors.borderColor }]}
          />
          <SpaceInfoRow
            title={i18n.t("proposalThreshold")}
            value={`${n(spaceDetails.filters?.minScore ?? 0)} ${
              spaceDetails?.symbol
            }`}
            icon={"check"}
          />
          {spaceDetails.terms ? (
            <>
              <View
                style={[
                  styles.separator,
                  { backgroundColor: colors.borderColor },
                ]}
              />
              <SpaceInfoRow
                title={i18n.t("terms")}
                value={spaceDetails.terms}
                onPress={() => {
                  if (spaceDetails.terms) {
                    Linking.openURL(spaceDetails.terms);
                  }
                }}
                icon={"check"}
              />
            </>
          ) : (
            <View />
          )}
          {spaceDetails.strategies ? (
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
                  map(spaceDetails.strategies, (strategy) => strategy.name),
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

  function SpaceMembers() {
    return (
      <View
        style={[
          styles.contentContainer,
          {
            borderColor: colors.borderColor,
            marginTop: 22,
            marginHorizontal: 14,
          },
        ]}
      >
        <SpaceInfoRow
          title={i18n.t("admins")}
          icon={"user-solid"}
          ValueComponent={() => {
            return (
              <View>
                {spaceDetails?.admins?.map((admin: string, i: number) => {
                  const adminProfile = getUserProfile(admin, profiles);
                  const adminName = getUsername(
                    admin,
                    adminProfile,
                    connectedAddress ?? ""
                  );
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.push(USER_PROFILE, {
                          address: admin,
                        });
                      }}
                      key={`${i}`}
                    >
                      <View
                        style={[
                          common.row,
                          common.alignItemsCenter,
                          { marginTop: 16 },
                        ]}
                      >
                        <UserAvatar size={28} address={admin} key={admin} />
                        <Text
                          style={[
                            styles.usernameText,
                            {
                              color: colors.textColor,
                              marginLeft: 6,
                            },
                          ]}
                        >
                          {adminName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          }}
        />
        <View
          style={[styles.separator, { backgroundColor: colors.borderColor }]}
        />
        <SpaceInfoRow
          title={i18n.t("authors")}
          icon={"user-solid"}
          ValueComponent={() => {
            return (
              <View>
                {spaceDetails?.members?.map((member: string, i: number) => {
                  const memberProfile = getUserProfile(member, profiles);
                  const memberName = getUsername(
                    member,
                    memberProfile,
                    connectedAddress ?? ""
                  );

                  return (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.push(USER_PROFILE, {
                          address: member,
                        });
                      }}
                      key={`${i}`}
                    >
                      <View
                        style={[
                          common.row,
                          common.alignItemsCenter,
                          { marginTop: 16 },
                        ]}
                      >
                        <UserAvatar size={28} address={member} key={member} />
                        <Text
                          style={[
                            styles.usernameText,
                            {
                              color: colors.textColor,
                              marginLeft: 6,
                            },
                          ]}
                        >
                          {memberName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          }}
        />
      </View>
    );
  }

  return (
    <AnimatedTabViewFlatList
      data={spaceAboutData}
      renderItem={(data: { item: { key: string } }) => {
        if (data.item.key === "details") {
          return <SpaceDetails />;
        } else if (data.item.key === "members") {
          return <SpaceMembers />;
        } else {
          return <View />;
        }
      }}
      scrollY={isActive ? scrollY : undefined}
      onRef={(ref: any) => {
        trackRef(routeKey, ref);
      }}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollEndDrag={onScrollEndDrag}
      headerHeight={headerHeight}
      ListFooterComponent={
        <View style={{ width: 100, height: Device.getDeviceHeight() * 0.6 }} />
      }
    />
  );
}

export default SpaceAboutTab;
