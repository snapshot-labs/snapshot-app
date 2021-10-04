import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import i18n from "i18n-js";
import { useActionSheet } from "@expo/react-native-action-sheet";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import colors from "../../constants/colors";
import common from "../../styles/common";
import SearchInput from "../SearchInput";
import { n } from "../../util/miscUtils";

type ExploreHeaderProps = {
  searchValue: string;
  onChangeText: (text: string) => void;
  currentExplore: { key: string; text: string };
  setCurrentExplore: (explore: { key: string; text: string }) => void;
  filteredExplore: any[];
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
  setCurrentExplore,
  filteredExplore,
}: ExploreHeaderProps) {
  const { showActionSheetWithOptions } = useActionSheet();
  const currentExploreText = getCurrentExploreText(currentExplore);
  return (
    <View>
      <SearchInput
        onChangeText={onChangeText}
        value={searchValue}
        RightComponent={() => {
          return (
            <TouchableOpacity
              onPress={() => {
                const options = [
                  i18n.t("spaces"),
                  i18n.t("networks"),
                  i18n.t("strategiess"),
                  i18n.t("plugins"),
                  i18n.t("cancel"),
                ];
                const cancelButtonIndex = options.length - 1;

                showActionSheetWithOptions(
                  {
                    options,
                    cancelButtonIndex,
                    textStyle: { fontFamily: "Calibre-Medium", fontSize: 20 },
                  },
                  (buttonIndex) => {
                    if (buttonIndex === 0) {
                      setCurrentExplore({
                        key: "spaces",
                        text: i18n.t("spaces"),
                      });
                    } else if (buttonIndex === 1) {
                      setCurrentExplore({
                        key: "networks",
                        text: i18n.t("networks"),
                      });
                    } else if (buttonIndex === 2) {
                      setCurrentExplore({
                        key: "strategies",
                        text: i18n.t("strategiess"),
                      });
                    } else if (buttonIndex === 3) {
                      setCurrentExplore({
                        key: "plugins",
                        text: i18n.t("plugins"),
                      });
                    }
                  }
                );
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.darkGray,
                    fontSize: 18,
                    fontFamily: "Calibre-Medium",
                    marginRight: 6,
                  }}
                >
                  {currentExplore.text}
                </Text>
                <FontAwesome5Icon
                  name="caret-down"
                  size={16}
                  color={colors.darkGray}
                  style={{ marginBottom: Platform.OS === "ios" ? 4 : 0 }}
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 24,
          flexDirection: "row",
          alignItems: "baseline",
        }}
      >
        <Text style={common.headerTitle}>{i18n.t("explore")}</Text>
        <Text style={[{ marginLeft: "auto" }, common.subTitle]}>
          {n(filteredExplore.length)} {currentExploreText}
        </Text>
      </View>
    </View>
  );
}

export default ExploreHeader;
