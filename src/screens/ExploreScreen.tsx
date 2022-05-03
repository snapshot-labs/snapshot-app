import React, { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { useExploreState } from "context/exploreContext";
import orderBy from "lodash/orderBy";
import common from "styles/common";
import SpacePreview from "components/SpacePreview";
import i18n from "i18n-js";
import ExploreHeader from "components/explore/ExploreHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFilteredSpaces } from "helpers/searchUtils";
import { useAuthState } from "context/authContext";

function ExploreScreen() {
  const { colors } = useAuthState();
  const insets = useSafeAreaInsets();
  const { spaces } = useExploreState();
  const [filteredExplore, setFilteredExplore] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const orderedSpaces = useMemo(() => {
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
  }, [spaces]);

  useEffect(() => {
    setFilteredExplore(
      getFilteredSpaces(orderedSpaces, searchValue, selectedCategory)
    );
  }, [spaces, searchValue, selectedCategory]);

  return (
    <View
      style={[
        common.screen,
        { backgroundColor: colors.bgDefault, paddingTop: insets.top },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <ExploreHeader
          searchValue={searchValue}
          onChangeText={(text: string) => {
            setSearchValue(text);
          }}
          filteredExplore={
            selectedCategory === "" ? orderedSpaces : filteredExplore
          }
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            borderWidth: 1,
            borderColor: colors.borderColor,
            marginHorizontal: 14,
            borderRadius: 9,
            marginTop: 16,
          }}
          data={filteredExplore}
          renderItem={(data) => {
            return (
              <SpacePreview
                space={data.item}
                lastItem={data.index === filteredExplore.length - 1}
              />
            );
          }}
          keyExtractor={(item, i) => `${item.id}${i}`}
          initialNumToRender={15}
          ListEmptyComponent={
            <View
              style={{
                marginTop: 16,
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}
            >
              <Text style={[common.subTitle, { color: colors.textColor }]}>
                {i18n.t("cantFindAnyResults")}
              </Text>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
}

export default ExploreScreen;
