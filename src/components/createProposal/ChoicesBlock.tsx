import React from "react";
import { View } from "react-native";
import i18n from "i18n-js";
import Block from "../Block";
import common from "../../styles/common";
import Button from "../Button";
import ChoiceInput from "./ChoiceInput";

interface ChoicesBlockProps {
  choices: string[];
  setChoices: (choices: string[]) => void;
}

function ChoicesBlock({ choices, setChoices }: ChoicesBlockProps) {
  return (
    <>
      <Block
        title={i18n.t("choices")}
        Content={
          <View
            style={[
              common.containerHorizontalPadding,
              common.containerVerticalPadding,
            ]}
          >
            {choices.map((choice: string, i: number) => {
              return (
                <ChoiceInput
                  choice={choice}
                  setChoices={setChoices}
                  index={i}
                  choices={choices}
                  key={i}
                />
              );
            })}
            <Button
              title={i18n.t("addChoice")}
              onPress={() => {
                setChoices(choices.concat(""));
              }}
            />
          </View>
        }
      />
    </>
  );
}

export default ChoicesBlock;
