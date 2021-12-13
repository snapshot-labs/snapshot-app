import React, { useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  Platform,
} from "react-native";
import common from "../../styles/common";
import Input from "../Input";
import colors from "../../constants/colors";
import IconFont from "../IconFont";

const { width } = Dimensions.get("screen");

interface ChoiceInputProps {
  choices: string[];
  choice: string;
  index: number;
  setChoices: (choices: string[]) => void;
}

function ChoiceInput({ choices, choice, index, setChoices }: ChoiceInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef<any>(null);
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        textInputRef?.current?.focus();
      }}
    >
      <View
        style={[
          common.buttonContainer,
          { marginBottom: 20, justifyContent: "space-between" },
          common.containerHorizontalPadding,
          isFocused ? { borderColor: colors.textColor } : {},
        ]}
        key={index}
      >
        <Text style={common.defaultText}>{index + 1}</Text>
        <Input
          setRef={textInputRef}
          style={{
            borderLeftWidth: 0,
            borderRadius: 0,
            borderTopWidth: 0,
            borderWidth: 0,
            fontSize: 18,
            color: colors.textColor,
            alignSelf: "center",
            maxWidth: width - 120,
          }}
          value={choice}
          onChangeText={(text) => {
            const newChoices = [...choices];
            newChoices[index] = text;
            setChoices(newChoices);
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
        />
        <TouchableOpacity
          onPress={() => {
            const newChoices = [...choices];
            newChoices.splice(index, 1);
            setChoices(newChoices);
          }}
        >
          <IconFont
            name="close"
            size={18}
            color={colors.textColor}
            style={{
              marginBottom: Platform.OS === "ios" ? 4 : 0,
            }}
          />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default ChoiceInput;
