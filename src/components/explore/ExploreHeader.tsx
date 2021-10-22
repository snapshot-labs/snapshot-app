import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import i18n from "i18n-js";
import IconFont from "../IconFont";
import common from "../../styles/common";
import SearchInput from "../SearchInput";
import { n } from "../../helpers/miscUtils";
import { useAuthState } from "context/authContext";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";

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
  const { colors } = useAuthState();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const currentExploreText = getCurrentExploreText(currentExplore);
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  return (
    <View style={{ backgroundColor: colors.bgDefault, paddingBottom: 8 }}>
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
                ];
                bottomSheetModalDispatch({
                  type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                  payload: {
                    options,
                    snapPoints: ["10%", 275, "50%"],
                    show: true,
                    initialIndex: 1,
                    onPressOption: (index: number) => {
                      if (index === 0) {
                        setCurrentExplore({
                          key: "spaces",
                          text: i18n.t("spaces"),
                        });
                      } else if (index === 1) {
                        setCurrentExplore({
                          key: "networks",
                          text: i18n.t("networks"),
                        });
                      } else if (index === 2) {
                        setCurrentExplore({
                          key: "strategies",
                          text: i18n.t("strategiess"),
                        });
                      } else if (index === 3) {
                        setCurrentExplore({
                          key: "plugins",
                          text: i18n.t("plugins"),
                        });
                      }
                      bottomSheetModalRef?.current?.close();
                    },
                  },
                });
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 18,
                    fontFamily: "Calibre-Medium",
                  }}
                >
                  {currentExplore.text}
                </Text>
                <IconFont
                  name="arrow-up"
                  size={16}
                  color={colors.textColor}
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
        <Text style={[common.headerTitle, { color: colors.textColor }]}>
          {i18n.t("explore")}
        </Text>
        <Text style={[{ marginLeft: "auto" }, common.subTitle]}>
          {n(filteredExplore.length)} {currentExploreText}
        </Text>
      </View>
    </View>
  );
}

export default ExploreHeader;
