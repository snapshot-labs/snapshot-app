import React from "react";
import { Text, View, StyleSheet } from "react-native";
import i18n from "i18n-js";
import colors from "constants/colors";
import { useAuthState } from "context/authContext";
import ProposalFilters from "../proposal/ProposalFilters";
import common from "styles/common";
import JoinedSpacesScrollView from "components/timeline/JoinedSpacesScrollView";

type TimelineHeaderProps = {
  joinedSpacesFilter: { key: string; text: string };
  showBottomSheetModal: (showBottomSheetModal: boolean) => void;
};

function TimelineHeader({
  joinedSpacesFilter,
  showBottomSheetModal,
}: TimelineHeaderProps) {
  const { followedSpaces, colors } = useAuthState();
  return (
    <View
      style={{
        backgroundColor: colors.bgDefault,
      }}
    >
      <View
        style={[
          common.headerContainer,
          {
            borderBottomColor: colors.borderColor,
            backgroundColor: colors.bgDefault,
          },
        ]}
      >
        <Text style={[common.screenHeaderTitle, { color: colors.textColor }]}>
          {i18n.t("timeline")}
        </Text>
      </View>
      {followedSpaces.length > 0 && <JoinedSpacesScrollView />}
      {followedSpaces.length > 0 ? (
        <View
          style={{
            paddingRight: 16,
            paddingTop: 6,
            paddingBottom: 6,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
            backgroundColor: colors.bgDefault,
          }}
        >
          <ProposalFilters
            filter={joinedSpacesFilter}
            showBottomSheetModal={showBottomSheetModal}
          />
        </View>
      ) : (
        <View />
      )}
    </View>
  );
}

export default TimelineHeader;
