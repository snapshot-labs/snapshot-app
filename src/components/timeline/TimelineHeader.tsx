import React from "react";
import { Text, View, StyleSheet } from "react-native";
import i18n from "i18n-js";
import colors from "constants/colors";
import { useAuthState } from "context/authContext";
import ProposalFilters from "../proposal/ProposalFilters";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    height: 35,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  filterText: {
    color: colors.darkGray,
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    marginRight: 6,
  },
  title: {
    color: colors.textColor,
    fontSize: 18,
    fontFamily: "Calibre-Semibold",
  },
});

type TimelineHeaderProps = {
  joinedSpacesFilter: { key: string; text: string };
  allSpacesFilter: { key: string; text: string };
  useFollowedSpaces: boolean;
  currentIndex: number;
  showBottomSheetModal: (showBottomSheetModal: boolean) => void;
};

function TimelineHeader({
  joinedSpacesFilter,
  allSpacesFilter,
  currentIndex,
  showBottomSheetModal,
}: TimelineHeaderProps) {
  const { followedSpaces, colors } = useAuthState();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textColor }]}>
        {i18n.t("timeline")}
      </Text>
      {currentIndex === 0 ? (
        followedSpaces.length > 0 ? (
          <ProposalFilters
            filter={joinedSpacesFilter}
            showBottomSheetModal={showBottomSheetModal}
          />
        ) : (
          <View />
        )
      ) : (
        <ProposalFilters
          filter={allSpacesFilter}
          showBottomSheetModal={showBottomSheetModal}
        />
      )}
    </View>
  );
}

export default TimelineHeader;
