import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../constants/colors";
import IconFont from "./IconFont";
import Input from "./Input";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    paddingLeft: 16,
    borderRadius: 40,
  },
  searchInput: {
    flex: 1,
    borderLeftWidth: 0,
    borderRadius: 0,
    borderTopWidth: 0,
    borderWidth: 0,
    paddingLeft: 0,
    marginBottom: 0,
    paddingBottom: 0,
    paddingTop: 0,
    marginLeft: 10,
    marginTop: 0,
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    height: 40,
    lineHeight: 18,
    color: colors.textColor,
    textAlignVertical: "center",
  },
});

interface SearchInputProps {
  onChangeText: (text: string) => void;
  value: string;
  LeftComponent?: React.FC | undefined;
  searchRef: any;
  placeholder: string;
}

function SearchInput({
  LeftComponent = undefined,
  onChangeText,
  value,
  searchRef,
  placeholder = "",
}: SearchInputProps) {
  const { colors } = useAuthState();
  return (
    <View
      style={[
        styles.searchInputContainer,
        { backgroundColor: colors.navBarBg },
      ]}
    >
      {LeftComponent !== undefined && <LeftComponent />}
      <Input
        selectionColor={colors.darkGray}
        style={[styles.searchInput, { color: colors.textColor }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryGray}
        setRef={searchRef}
        textAlign="left"
        textAlignVertical="center"
      />
    </View>
  );
}

export default SearchInput;
