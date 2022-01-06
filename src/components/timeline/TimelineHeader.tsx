import React from "react";
import { Text, View, StyleSheet } from "react-native";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";
import ProposalFilters from "../proposal/ProposalFilters";
import common from "styles/common";
import JoinedSpacesScrollView from "components/timeline/JoinedSpacesScrollView";

const styles = StyleSheet.create({
  proposalFiltersContainer: {
    paddingRight: 16,
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
});

interface TimelineHeaderProps {
  joinedSpacesFilter: { key: string; text: string };
  showBottomSheetModal: (showBottomSheetModal: boolean) => void;
  isInitial: boolean;
}

function TimelineHeader({
  joinedSpacesFilter,
  showBottomSheetModal,
  isInitial,
}: TimelineHeaderProps) {
  const { followedSpaces, colors } = useAuthState();
  return (
    <View
      style={{
        backgroundColor: colors.bgDefault,
      }}
    >
      {isInitial ? (
        <>
          <JoinedSpacesScrollView useLoader={true} />
          <View
            style={[
              styles.proposalFiltersContainer,
              {
                borderBottomColor: colors.borderColor,
                backgroundColor: colors.bgDefault,
              },
            ]}
          >
            <ProposalFilters
              filter={joinedSpacesFilter}
              showBottomSheetModal={showBottomSheetModal}
            />
          </View>
        </>
      ) : (
        <>
          {followedSpaces.length > 0 && <JoinedSpacesScrollView />}
          {followedSpaces.length > 0 ? (
            <View
              style={[
                styles.proposalFiltersContainer,
                {
                  borderBottomColor: colors.borderColor,
                  backgroundColor: colors.bgDefault,
                },
              ]}
            >
              <ProposalFilters
                filter={joinedSpacesFilter}
                showBottomSheetModal={showBottomSheetModal}
              />
            </View>
          ) : (
            <View />
          )}
        </>
      )}
    </View>
  );
}

export default TimelineHeader;
