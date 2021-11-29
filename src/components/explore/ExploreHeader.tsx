import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import i18n from "i18n-js";
import IconFont from "../IconFont";
import common from "../../styles/common";
import SearchInput from "../SearchInput";
import { n } from "../../helpers/miscUtils";
import { useAuthState } from "context/authContext";
import CategoriesScrollView from "components/CategoriesScrollView";

type ExploreHeaderProps = {
  searchValue: string;
  onChangeText: (text: string) => void;
  currentExplore: { key: string; text: string };
  setCurrentExplore: (explore: { key: string; text: string }) => void;
  filteredExplore: any[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
};

function getCurrentExploreText(currentExplore: { key: string; text: string }) {
  switch (currentExplore.key) {
    case "networks":
      return i18n.t("networksPlural");
    case "skins":
      return i18n.t("skinsPlural");
    case "plugins":
      return i18n.t("pluginsPlural");
    case "strategies":
      return i18n.t("strategiesPlural");
    case "spaces":
    default:
      return i18n.t("spacesPlural");
  }
}

function ExploreHeader({
  searchValue,
  onChangeText,
  currentExplore,
  filteredExplore,
  selectedCategory,
  setSelectedCategory,
}: ExploreHeaderProps) {
  const { colors } = useAuthState();
  const [showSearch, setShowSearch] = useState(false);
  const currentExploreText = getCurrentExploreText(currentExplore);
  const searchRef: any = useRef(null);

  useEffect(() => {
    if (showSearch) {
      searchRef?.current?.focus();
    }
  }, [showSearch]);

  return (
    <View style={{ backgroundColor: colors.bgDefault, paddingBottom: 8 }}>
      {showSearch ? (
        <SearchInput
          onChangeText={onChangeText}
          value={searchValue}
          searchRef={searchRef}
          RightComponent={() => {
            return (
              <TouchableOpacity
                onPress={() => {
                  setShowSearch(false);
                  onChangeText("");
                }}
              >
                <IconFont
                  name="close"
                  size={16}
                  color={colors.textColor}
                  style={{ marginBottom: Platform.OS === "ios" ? 4 : 0 }}
                />
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View
          style={{
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "baseline",
            paddingTop: 12,
            height: 41.1,
          }}
        >
          <Text
            style={{
              color: colors.textColor,
              fontSize: 18,
              fontFamily: "Calibre-Semibold",
            }}
          >
            {i18n.t("explore")}
          </Text>
          <Text
            style={[
              common.subTitle,
              { marginLeft: "auto", fontSize: 18, marginRight: 6 },
            ]}
          >
            {n(filteredExplore.length)} {currentExploreText}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowSearch(true);
            }}
          >
            <IconFont name="search" size={20} color={colors.textColor} />
          </TouchableOpacity>
        </View>
      )}
      <CategoriesScrollView
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </View>
  );
}

export default ExploreHeader;
