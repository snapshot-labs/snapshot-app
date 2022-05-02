import React from "react";
import { Text, View, StyleSheet } from "react-native";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";
import ProposalFilters from "../proposal/ProposalFilters";
import common from "styles/common";
import JoinedSpacesScrollView from "components/timeline/JoinedSpacesScrollView";

const styles = StyleSheet.create({
  proposalFiltersContainer: {
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  timelineTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 20,
    paddingLeft: 16,
  },
});

interface TimelineHeaderProps {
  joinedSpacesFilter: { key: string; text: string };
  showBottomSheetModal: (showBottomSheetModal: boolean) => void;
  isInitial: boolean;
  RecentActivityComponent?: any;
}

function TimelineHeader({
  joinedSpacesFilter,
  showBottomSheetModal,
  isInitial,
  RecentActivityComponent = null,
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
          <JoinedSpacesScrollView
            useLoader={true}
            followedSpaces={followedSpaces}
          />
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
          {followedSpaces.length > 0 && (
            <JoinedSpacesScrollView followedSpaces={followedSpaces} />
          )}
          {followedSpaces.length > 0 ? (
            <View
              style={[
                styles.proposalFiltersContainer,
                {
                  borderBottomColor: "transparent",
                  backgroundColor: colors.bgDefault,
                },
              ]}
            >
              {RecentActivityComponent}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={[styles.timelineTitle, { color: colors.textColor }]}
                >
                  {i18n.t("timeline")}
                </Text>
                <View
                  style={[
                    common.marginLeftAuto,
                    common.containerHorizontalPadding,
                  ]}
                >
                  <ProposalFilters
                    filter={joinedSpacesFilter}
                    showBottomSheetModal={showBottomSheetModal}
                  />
                </View>
              </View>
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
