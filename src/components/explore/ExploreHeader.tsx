import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import i18n from "i18n-js";
import IconFont from "../IconFont";
import common from "styles/common";
import SearchInput from "../SearchInput";
import { n } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";
import CategoriesScrollView from "components/CategoriesScrollView";

interface ExploreHeaderProps {
  searchValue: string;
  onChangeText: (text: string) => void;
  filteredExplore: any[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

function ExploreHeader({
  searchValue,
  onChangeText,
  filteredExplore,
  selectedCategory,
  setSelectedCategory,
}: ExploreHeaderProps) {
  const { colors } = useAuthState();
  const searchRef: any = useRef(null);

  return (
    <View
      style={{
        backgroundColor: colors.bgDefault,
      }}
    >
      <View
        style={[common.containerHorizontalPadding, common.screenTitleContainer]}
      >
        <Text style={[common.h1, { color: colors.textColor }]}>
          {i18n.t("discover")}
        </Text>
      </View>
      <View style={[common.containerHorizontalPadding, { marginTop: 22 }]}>
        <SearchInput
          onChangeText={onChangeText}
          value={searchValue}
          searchRef={searchRef}
          placeholder={`${i18n.t("searchForSpaces")} (${n(
            filteredExplore.length
          )})`}
          LeftComponent={() => {
            return (
              <IconFont name="search" size={22} color={colors.secondaryGray} />
            );
          }}
        />
      </View>
      <View>
        <Text
          style={{
            fontFamily: "Calibre-Semibold",
            fontSize: 14,
            color: colors.textColor,
            textTransform: "uppercase",
            marginLeft: 14,
            marginTop: 22,
          }}
        >
          {i18n.t("filterByCategories")}
        </Text>
        <CategoriesScrollView
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </View>
    </View>
  );
}

export default ExploreHeader;
