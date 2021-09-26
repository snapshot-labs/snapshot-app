import React, { useEffect, useState } from "react";
import { FlatList, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useExploreState } from "../context/exploreContext";
import orderBy from "lodash/orderBy";
import common from "../styles/common";
import SpacePreview from "../components/SpacePreview";
import i18n from "i18n-js";
import { Space } from "../types/explore";

function orderedSpaces(spaces) {
  const list = Object.keys(spaces)
    .map((key) => {
      return {
        id: key,
        ...spaces[key],
        followers: spaces[key].followers ?? 0,
        private: spaces[key].private ?? false,
      };
    })
    .filter((space) => !space.private);

  return orderBy(list, ["following", "followers"], ["desc", "desc"]);
}

function ExploreScreen() {
  const { spaces } = useExploreState();
  const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setFilteredSpaces(orderedSpaces(spaces));
  }, [spaces]);

  return (
    <View style={[common.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={filteredSpaces}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, paddingTop: 30 }}>
            <Text style={common.headerTitle}>{i18n.t("explore")}</Text>
          </View>
        }
        renderItem={(data) => {
          return <SpacePreview space={data.item} />;
        }}
        keyExtractor={(item) => `${item.id}`}
        onEndReachedThreshold={0.45}
        onEndReached={() => {}}
      />
    </View>
  );
}

export default ExploreScreen;
