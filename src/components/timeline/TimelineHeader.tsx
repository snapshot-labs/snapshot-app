import React from "react";
import { Text, View, StyleSheet } from "react-native";
import common from "../../styles/common";
import i18n from "i18n-js";
import colors from "../../constants/colors";
import { useAuthState } from "../../context/authContext";
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
  setJoinedSpacesFilter: (filter: { key: string; text: string }) => void;
  setAllSpacesFilter: (filter: { key: string; text: string }) => void;
  onChangeJoinedSpacesFilter: (newFilter: string) => void;
  onChangeAllSpacesFilter: (newFilter: string) => void;
  useFollowedSpaces: boolean;
  currentIndex: number;
};

function TimelineHeader({
  onChangeJoinedSpacesFilter,
  onChangeAllSpacesFilter,
  setJoinedSpacesFilter,
  setAllSpacesFilter,
  joinedSpacesFilter,
  allSpacesFilter,
  currentIndex,
}: TimelineHeaderProps) {
  const { followedSpaces } = useAuthState();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t("timeline")}</Text>
      {currentIndex === 0 ? (
        followedSpaces.length > 0 ? (
          <ProposalFilters
            filter={joinedSpacesFilter}
            setFilter={setJoinedSpacesFilter}
            onChangeFilter={onChangeJoinedSpacesFilter}
          />
        ) : (
          <View />
        )
      ) : (
        <ProposalFilters
          filter={allSpacesFilter}
          setFilter={setAllSpacesFilter}
          onChangeFilter={onChangeAllSpacesFilter}
        />
      )}
    </View>
  );
}

export default TimelineHeader;
