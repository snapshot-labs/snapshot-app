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
import IconFont from "../IconFont";
import i18n from "i18n-js";
import colors from "../../constants/colors";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 40,
  },
  filterText: {
    color: colors.textColor,
    fontSize: 14,
    fontFamily: "Calibre-Medium",
    marginRight: 4,
  },
});

interface ProposalFiltersProps {
  filter: { key: string; text: string };
  containerStyle?: ViewStyle;
  filterTextStyle?: TextStyle;
  filterContainerStyle?: ViewStyle;
  iconColor?: string;
  showBottomSheetModal: (showBottomSheetModal: boolean) => void;
}

function ProposalFilters({
  filter = { key: "all", text: i18n.t("all") },
  containerStyle,
  filterTextStyle = {},
  filterContainerStyle = {},
  iconColor,
  showBottomSheetModal,
}: ProposalFiltersProps) {
  const { colors } = useAuthState();
  const setIconColor = iconColor ? iconColor : colors.textColor;

  return (
    <TouchableOpacity
      style={[{ marginLeft: "auto" }, containerStyle]}
      onPress={() => {
        showBottomSheetModal(true);
      }}
    >
      <View
        style={[
          styles.filterContainer,
          { backgroundColor: colors.navBarBg },
          filterContainerStyle,
        ]}
      >
        <Text
          style={[
            styles.filterText,
            { color: colors.textColor },
            filterTextStyle,
          ]}
        >
          {filter.text}
        </Text>
        <IconFont
          name="filter-3-fill"
          size={14}
          color={setIconColor}
          style={{ marginBottom: Platform.OS === "ios" ? 4 : 0 }}
        />
      </View>
    </TouchableOpacity>
  );
}

export default ProposalFilters;
