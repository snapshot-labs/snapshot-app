import React from "react";
import { FlatList, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import get from "lodash/get";
import i18n from "i18n-js";
import { useAuthState } from "../context/authContext";
import { useExploreState } from "../context/exploreContext";
import common from "../styles/common";
import SpacePreview from "../components/SpacePreview";
import DashboardHeader from "../components/dashboard/DashboardHeader";

function HomeScreen() {
  const { followedSpaces, colors } = useAuthState();
  const { spaces } = useExploreState();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <FlatList
        data={followedSpaces}
        ListHeaderComponent={<DashboardHeader />}
        renderItem={(data) => {
          const currentSpace = data.item.space.id;
          const spaceData = Object.assign(
            get(spaces, currentSpace, {}),
            data.item.space
          );
          return <SpacePreview space={spaceData} />;
        }}
        onEndReachedThreshold={0.45}
        ListEmptyComponent={
          <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
            <Text style={[common.subTitle, { color: colors.textColor }]}>
              {i18n.t("noSpacesJoinedYet")}
            </Text>
          </View>
        }
        onEndReached={() => {}}
        ListFooterComponent={<View style={{ width: "100%", height: 30 }} />}
      />
    </View>
  );
}

export default HomeScreen;
