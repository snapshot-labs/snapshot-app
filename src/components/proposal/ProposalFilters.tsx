import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import i18n from "i18n-js";
import proposal from "../../constants/proposal";
import colors from "../../constants/colors";

const styles = StyleSheet.create({
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

type ProposalFiltersProps = {
  filter: { key: string; text: string };
  setFilter: (filter: { key: string; text: string }) => void;
  onChangeFilter: (newFilter: string) => void;
  containerStyle?: ViewStyle;
  filterTextStyle?: TextStyle;
  filterContainerStyle?: ViewStyle;
  iconColor?: string;
};

function ProposalFilters({
  filter = { key: "all", text: i18n.t("all") },
  setFilter,
  onChangeFilter,
  containerStyle,
  filterTextStyle = {},
  filterContainerStyle = {},
  iconColor = colors.darkGray,
}: ProposalFiltersProps) {
  const { showActionSheetWithOptions } = useActionSheet();
  return (
    <TouchableOpacity
      style={[{ marginLeft: "auto" }, containerStyle]}
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
        ];

        if (Platform.OS === "ios") {
          options.push(i18n.t("cancel"));
        }

        const cancelButtonIndex = 4;

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
                onChangeFilter(allFilter.key);
              } else if (buttonIndex === 1) {
                setFilter(activeFilter);
                onChangeFilter(activeFilter.key);
              } else if (buttonIndex === 2) {
                setFilter(pendingFilter);
                onChangeFilter(pendingFilter.key);
              } else if (buttonIndex === 3) {
                setFilter(closedFilter);
                onChangeFilter(closedFilter.key);
              }
            }
          }
        );
      }}
    >
      <View style={[styles.filterContainer, filterContainerStyle]}>
        <Text style={[styles.filterText, filterTextStyle]}>{filter.text}</Text>
        <FontAwesome5Icon
          name="caret-down"
          size={16}
          color={iconColor}
          style={{ marginBottom: Platform.OS === "ios" ? 4 : 0 }}
        />
      </View>
    </TouchableOpacity>
  );
}

export default ProposalFilters;
