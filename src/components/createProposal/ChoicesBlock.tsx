import React from "react";
import { View } from "react-native";
import i18n from "i18n-js";
import common from "../../styles/common";
import Button from "../Button";
import ChoiceInput from "./ChoiceInput";
import { VOTING_TYPES } from "constants/proposal";

interface ChoicesBlockProps {
  choices: string[];
  setChoices: (choices: string[]) => void;
  scrollRef?: any;
  votingType: string;
}

function ChoicesBlock({
  choices = [],
  setChoices,
  scrollRef,
  votingType,
}: ChoicesBlockProps) {
  return (
    <View
      style={[
        common.containerHorizontalPadding,
        common.containerVerticalPadding,
      ]}
    >
      {choices?.map((choice: string, i: number) => {
        return (
          <ChoiceInput
            choice={choice}
            setChoices={setChoices}
            scrollRef={scrollRef}
            index={i}
            choices={choices}
            showRemove={votingType !== VOTING_TYPES.basic}
            key={i}
          />
        );
      })}
      {votingType !== VOTING_TYPES.basic && (
        <Button
          disabled={choices?.length === 10}
          title={i18n.t("addChoice")}
          onPress={() => {
            setChoices(choices.concat(""));
          }}
        />
      )}
    </View>
  );
}

export default ChoicesBlock;
