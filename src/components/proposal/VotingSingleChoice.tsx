import React from "react";
import { View } from "react-native";
import Button from "../Button";
import { OPTION_BORDER_RADIUS } from "styles/values";

interface VotingSingleChoiceProps {
  proposal: any;
  selectedChoices: number[];
  setSelectedChoices: (selectedChoices: number[]) => void;
}

function VotingSingleChoice({
  proposal,
  selectedChoices,
  setSelectedChoices,
}: VotingSingleChoiceProps) {
  return (
    <View>
      {proposal?.choices.map((choice: any, i: number) => {
        return (
          <View style={{ paddingBottom: 10 }} key={`${i}`}>
            <Button
              onPress={() => {
                setSelectedChoices([i + 1]);
              }}
              title={choice}
              selected={selectedChoices[0] === i + 1}
              buttonContainerStyle={{
                borderRadius: OPTION_BORDER_RADIUS,
                justifyContent: "flex-start",
                paddingVertical: 14,
                paddingHorizontal: 9,
              }}
              nativeFeedbackContainerStyle={{
                borderRadius: OPTION_BORDER_RADIUS,
              }}
              buttonTitleStyle={{
                fontFamily: "Calibre-Semibold",
                fontSize: 18,
              }}
              onlyOneLine
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingSingleChoice;
