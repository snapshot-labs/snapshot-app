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

const LOAD_COUNT = 10;

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
          ...spaces[key],
          id: key,
          followers: spaces[key].followers ?? 0,
          private: spaces[key].private ?? false,
        };
      })
      .filter((space) => !space.private);
    return orderBy(list, ["following", "followers"], ["desc", "desc"]);
  }, [spaces]);
  const [displayedSpaces, setDisplayedSpaces] = useState<any[]>([]);
  const [displayIndex, setDisplayIndex] = useState(LOAD_COUNT);

  useEffect(() => {
    const filteredSpaces = getFilteredSpaces(
      orderedSpaces,
      searchValue,
      selectedCategory
    );
    setFilteredExplore(filteredSpaces);
    const newDisplayedSpaces = filteredSpaces?.slice(0, LOAD_COUNT);
    setDisplayedSpaces(newDisplayedSpaces);
    setDisplayIndex(LOAD_COUNT * 2);
  }, [spaces, searchValue, selectedCategory]);

  return (
    <View
      style={[
        common.screen,
        { backgroundColor: colors.bgDefault, paddingTop: insets.top },
      ]}
    >
      <FlatList
        ListHeaderComponent={
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
        }
        showsVerticalScrollIndicator={false}
        data={displayedSpaces}
        renderItem={(data) => {
          return (
            <SpacePreview
              space={data.item}
              lastItem={data.index === displayedSpaces.length - 1}
              firstItem={data.index === 0}
            />
          );
        }}
        keyExtractor={(item) => `${item.id}${item.name}`}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.borderColor,
              marginHorizontal: 14,
              borderRadius: 9,
              marginTop: 16,
            }}
          >
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
          </View>
        }
        onEndReached={() => {
          if (filteredExplore.length > displayedSpaces.length) {
            const newDisplayedSpaces = displayedSpaces.concat(
              filteredExplore?.slice(displayedSpaces.length, displayIndex)
            );
            setDisplayIndex(displayIndex + LOAD_COUNT);
            setDisplayedSpaces(newDisplayedSpaces);
          }
        }}
        onEndReachedThreshold={0.7}
      />
    </View>
  );
}

export default ExploreScreen;
