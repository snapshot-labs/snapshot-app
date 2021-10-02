import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import common from "../../styles/common";
import i18n from "i18n-js";
import colors from "../../constants/colors";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { useActionSheet } from "@expo/react-native-action-sheet";
import proposal from "../../constants/proposal";
import { useAuthState } from "../../context/authContext";

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
  const { showActionSheetWithOptions } = useActionSheet();
  return (
    <View style={styles.container}>
      <Text style={common.headerTitle}>{i18n.t("timeline")}</Text>
      {followedSpaces.length > 0 && (
        <TouchableOpacity
          style={{ marginLeft: "auto" }}
          onPress={() => {
            const stateFilters = proposal.getStateFilters();
            const allFilter = stateFilters[0];
            const activeFilter = stateFilters[1];
            const pendingFilter = stateFilters[2];
            const closedFilter = stateFilters[3];
            const options = [
              allFilter.text,
              activeFilter.text,
              pendingFilter.text,
              closedFilter.text,
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
                if (buttonIndex !== 4) {
                  if (buttonIndex === 0) {
                    setFilter(allFilter);
                    onChangeFilter(allFilter.text);
                  } else if (buttonIndex === 1) {
                    setFilter(activeFilter);
                    onChangeFilter(activeFilter.text);
                  } else if (buttonIndex === 2) {
                    setFilter(pendingFilter);
                    onChangeFilter(pendingFilter.text);
                  } else if (buttonIndex === 3) {
                    setFilter(closedFilter);
                    onChangeFilter(closedFilter.text);
                  }
                }
              }
            );
          }}
        >
          <View style={styles.filterContainer}>
            <Text style={styles.filterText}>{filter.text}</Text>
            <FontAwesome5Icon
              name="caret-down"
              size={16}
              color={colors.darkGray}
              style={{ marginBottom: Platform.OS === "ios" ? 4 : 0 }}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default TimelineHeader;
