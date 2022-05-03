import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardType,
  Platform,
} from "react-native";
import Input from "components/Input";
import colors from "constants/colors";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  container: {
    padding: 9,
    borderRadius: 9,
    height: 59,
  },
  title: {
    fontFamily: "Calibre-Medium",
    color: colors.secondaryGray,
    fontSize: 14,
  },
  inputStyle: {
    borderLeftWidth: 0,
    borderRadius: 0,
    borderTopWidth: 0,
    borderWidth: 0,
    paddingLeft: 0,
    marginBottom: 0,
    fontSize: 18,
    maxWidth: "89%",
    minWidth: 100,
    marginLeft: 0,
    paddingBottom: 0,
    paddingTop: 0,
    lineHeight: 18,
    height: 20,
    marginTop: 6,
  },
  display: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
    marginTop: 4,
    maxWidth: "100%",
    marginRight: 14,
  },
});

interface InputRoundProps {
  title: string;
  icon?: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardType;
  editable?: boolean;
  displayMode?: boolean;
}

function InputRound({
  title,
  icon = undefined,
  value,
  onChangeText,
  keyboardType = "default",
  editable = false,
  displayMode = true,
}: InputRoundProps) {
  const { colors } = useAuthState();
  const textInputRef = useRef<any>(null);
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        textInputRef?.current?.focus();
      }}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.votingPowerBgColor },
        ]}
      >
        {icon === undefined ? (
          <Text
            style={[styles.title, { color: colors.secondaryGray }]}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        ) : (
          <IconFont name={icon} size={16} color={colors.darkGray} />
        )}
        {displayMode ? (
          <Text
            style={[styles.display, { color: colors.textColor }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        ) : (
          <Input
            setRef={textInputRef}
            style={styles.inputStyle}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            editable={editable}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

export default InputRound;
