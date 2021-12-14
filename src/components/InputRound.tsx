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
    padding: 16,
    borderRadius: 60,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.borderColor,
    alignItems: "center",
    height: 55,
  },
  title: {
    fontFamily: "Calibre-Medium",
    color: colors.darkGray,
    fontSize: 18,
    zIndex: 100,
  },
  inputStyle: {
    borderLeftWidth: 0,
    borderRadius: 0,
    borderTopWidth: 0,
    borderWidth: 0,
    paddingLeft: 0,
    marginBottom: 0,
    marginTop: 0,
    marginLeft: 6,
    fontSize: 18,
    maxWidth: "89%",
    minWidth: 100,
  },
  rightValue: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    color: colors.darkGray,
  },
  rightValueContainer: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
});

interface InputRoundProps {
  title: string;
  icon?: string;
  value: string;
  onChangeText: (text: string) => void;
  rightValue?: string;
  onChangeRightValue?: (text: string) => void;
  rightValueOptions?: string[];
  keyboardType?: KeyboardType;
}

function InputRound({
  title,
  icon = undefined,
  value,
  onChangeText,
  rightValue,
  keyboardType = "default",
  rightValueOptions = [],
  onChangeRightValue = () => {},
}: InputRoundProps) {
  const { colors } = useAuthState();
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef<any>(null);
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        textInputRef?.current?.focus();
      }}
    >
      <View
        style={[
          styles.container,
          isFocused ? { borderColor: colors.textColor } : {},
        ]}
      >
        {icon === undefined ? (
          <Text style={[styles.title, { color: colors.darkGray }]}>
            {title}
          </Text>
        ) : (
          <IconFont name={icon} size={16} color={colors.darkGray} />
        )}
        <Input
          setRef={textInputRef}
          style={[
            styles.inputStyle,
            rightValue !== undefined ? { minWidth: 200, maxWidth: 200 } : {},
          ]}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
        {rightValue !== undefined && (
          <TouchableWithoutFeedback
            onPress={() => {
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  options: rightValueOptions,
                  snapPoints: [10, 150],
                  show: true,
                  initialIndex: 1,
                  onPressOption: (index: number) => {
                    const value = rightValueOptions[index];
                    onChangeRightValue(value);
                    bottomSheetModalRef?.current?.close();
                  },
                },
              });
            }}
          >
            <View style={styles.rightValueContainer}>
              <Text style={styles.rightValue}>{rightValue}</Text>
              <IconFont
                name="arrow-up"
                size={18}
                color={colors.darkGray}
                style={{ marginTop: Platform.OS === "android" ? 4 : -4 }}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

export default InputRound;
