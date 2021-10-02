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
    paddingTop: 30,
    flexDirection: "row",
    alignItems: "center",
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
});

type TimelineHeaderProps = {
  filter: { key: string; text: string };
  setFilter: (filter: { key: string; text: string }) => void;
  onChangeFilter: (newFilter: string) => void;
};

function TimelineHeader({
  filter,
  setFilter,
  onChangeFilter,
}: TimelineHeaderProps) {
  const { followedSpaces } = useAuthState();
  return (
    <View style={styles.container}>
      <Text style={common.headerTitle}>{i18n.t("timeline")}</Text>
      {followedSpaces.length > 0 && (
        <ProposalFilters
          filter={filter}
          setFilter={setFilter}
          onChangeFilter={onChangeFilter}
        />
      )}
    </View>
  );
}

export default TimelineHeader;
