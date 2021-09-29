import React, { useEffect, useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { useExploreState } from "../context/exploreContext";
import { CollapsibleHeaderFlatList } from "react-native-collapsible-header-views";
import orderBy from "lodash/orderBy";
import common from "../styles/common";
import SpacePreview from "../components/SpacePreview";
import i18n from "i18n-js";
import ExploreHeader from "../components/explore/ExploreHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFilteredSpaces,
  getFilteredSkins,
  getFilteredStrategies,
} from "../util/searchUtils";
import Skin from "../components/explore/Skin";
import Strategy from "../components/explore/Strategy";

function ExploreScreen() {
  const { spaces, skins, strategies, fullStrategies } = useExploreState();
  const [filteredExplore, setFilteredExplore] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentExplore, setCurrentExplore] = useState<{
    key: string;
    text: string;
  }>({
    key: "spaces",
    text: i18n.t("spaces"),
  });
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
  const minifiedSkinsArray = useMemo(() => {
    return Object.keys(skins).map((s) => ({
      key: s,
      spaces: skins[s] ?? 0,
    }));
  }, [skins]);
  const minifiedStrategiesArray = useMemo(() => {
    return Object.keys(fullStrategies).map((s) => ({
      //@ts-ignore
      spaces: strategies[s] ?? 0,
      ...(fullStrategies[s] ?? {}),
    }));
  }, [strategies, fullStrategies]);

  useEffect(() => {
    if (currentExplore.key === "spaces") {
      setFilteredExplore(getFilteredSpaces(orderedSpaces, searchValue));
    } else if (currentExplore.key === "skins") {
      setFilteredExplore(getFilteredSkins(minifiedSkinsArray, searchValue));
    } else if (currentExplore.key === "strategies") {
      setFilteredExplore(
        getFilteredStrategies(minifiedStrategiesArray, searchValue)
      );
    }
  }, [spaces, skins, currentExplore, searchValue]);

  return (
    <SafeAreaView style={common.screen}>
      <View style={[common.screen]}>
        <CollapsibleHeaderFlatList
          data={filteredExplore}
          headerHeight={100}
          CollapsibleHeaderComponent={
            <ExploreHeader
              searchValue={searchValue}
              onChangeText={(text: string) => {
                setSearchValue(text);
              }}
              currentExplore={currentExplore}
              setCurrentExplore={setCurrentExplore}
              filteredExplore={filteredExplore}
            />
          }
          renderItem={(data) => {
            if (currentExplore.key === "spaces") {
              return <SpacePreview space={data.item} />;
            } else if (currentExplore.key === "skins") {
              return <Skin skin={data.item} />;
            } else if (currentExplore.key === "strategies") {
              return <Strategy strategy={data.item} />;
            } else {
              return <View />;
            }
          }}
          keyExtractor={(item, i) => `${item.id}${i}`}
          onEndReachedThreshold={0.45}
          onEndReached={() => {}}
          clipHeader
        />
      </View>
    </SafeAreaView>
  );
}

export default ExploreScreen;
