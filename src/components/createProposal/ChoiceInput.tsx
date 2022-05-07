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
import IconFont from "../IconFont";
import { useAuthState } from "context/authContext";

const { width } = Dimensions.get("screen");

interface ChoiceInputProps {
  choices: string[];
  choice: string;
  index: number;
  setChoices: (choices: string[]) => void;
  scrollRef: any;
  showRemove: boolean;
}

function ChoiceInput({
  choices,
  choice,
  index,
  setChoices,
  scrollRef,
  showRemove = true,
}: ChoiceInputProps) {
  const { colors } = useAuthState();
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
          {
            marginBottom: 9,
            justifyContent: "space-between",
            backgroundColor: colors.bgDefault,
            borderRadius: 9,
          },
          common.containerHorizontalPadding,
          isFocused
            ? { borderColor: colors.blueButtonBg }
            : { borderColor: colors.borderColor },
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
            backgroundColor: colors.bgDefault,
          }}
          value={choice}
          onChangeText={(text) => {
            const newChoices = [...choices];
            newChoices[index] = text;
            setChoices(newChoices);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (scrollRef.current?.scrollTo) {
              scrollRef.current?.scrollTo({ y: index * 350 });
            }
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
        />

        <TouchableOpacity
          onPress={() => {
            if (showRemove) {
              const newChoices = [...choices];
              newChoices.splice(index, 1);
              setChoices(newChoices);
            }
          }}
        >
          <IconFont
            name="close"
            size={18}
            color={showRemove ? colors.textColor : "transparent"}
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
