import React, { useEffect, useRef, useState } from "react";
import common from "../styles/common";
import { View, Text } from "react-native";
import { CollapsibleHeaderFlatList } from "react-native-collapsible-header-views";
import SpacePreview from "../components/SpacePreview";
import { SafeAreaView } from "react-native-safe-area-context";
import { Space } from "../types/explore";
import SearchInput from "../components/SearchInput";
import { getFilteredSpaces } from "../util/searchUtils";

type NetworkScreenProps = {
  route: {
    params: {
      networkName: string;
      networkId: string;
      orderedSpaces: Space[];
    };
  };
};

function NetworkScreen({ route }: NetworkScreenProps) {
  const networkId = route.params.networkId;
  const networkName = route.params.networkName;
  const orderedSpaces: Space[] = route.params.orderedSpaces.filter((space) => {
    return `${space.network}` === `${networkId}`;
  });
  const [searchText, setSearchText] = useState<string>("");
  const [filteredSpaces, setFilteredSpaces] = useState(orderedSpaces);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) {
      setFilteredSpaces(getFilteredSpaces(orderedSpaces, searchText));
    } else {
      loaded.current = true;
    }
  }, [searchText]);

  return (
    <SafeAreaView style={common.screen}>
      <View style={[common.screen]}>
        <CollapsibleHeaderFlatList
          data={filteredSpaces}
          headerHeight={100}
          CollapsibleHeaderComponent={
            <View>
              <SearchInput
                onChangeText={(searchText) => {
                  setSearchText(searchText);
                }}
                value={searchText}
              />
              <View style={{ paddingHorizontal: 16, paddingTop: 30 }}>
                <Text style={common.headerTitle}>{networkName}</Text>
              </View>
            </View>
          }
          renderItem={(data) => {
            return <SpacePreview space={data.item} />;
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

export default NetworkScreen;
