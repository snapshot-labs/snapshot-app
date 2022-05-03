import React, { useEffect } from "react";
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import get from "lodash/get";
import { Space } from "types/explore";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import { setProfiles } from "helpers/profile";
import AnimatedTabViewFlatList from "components/tabBar/AnimatedTabViewFlatList";
import Device from "helpers/device";
import SpaceMembers from "components/space/SpaceMembers";
import SpaceDetails from "components/space/SpaceDetails";
import SpaceSettings from "components/space/SpaceSettings";

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

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
  const { spaces } = useExploreState();
  const spaceDetails = Object.assign(space, get(spaces, space.id ?? "", {}));
  const exploreDispatch = useExploreDispatch();
  const spaceAboutData = [
    { key: "details" },
    { key: "members" },
    { key: "settings" },
  ];

  useEffect(() => {
    const addressArray = [
      ...(spaceDetails.admins ?? []),
      ...(spaceDetails.members ?? []),
    ];

    if (addressArray.length > 0) {
      setProfiles(addressArray, exploreDispatch);
    }
  }, [spaceDetails]);

  return (
    <AnimatedTabViewFlatList
      data={spaceAboutData}
      renderItem={(data: { item: { key: string } }) => {
        if (data.item.key === "details") {
          return <SpaceDetails space={spaceDetails} />;
        } else if (data.item.key === "members") {
          return <SpaceMembers space={spaceDetails} />;
        } else if (data.item.key === "settings") {
          return <SpaceSettings space={spaceDetails} />;
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
