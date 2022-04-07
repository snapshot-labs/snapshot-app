import React from "react";
import { View } from "react-native";
import Button from "../Button";

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
                borderRadius: 12,
                justifyContent: "flex-start",
                paddingVertical: 14,
                paddingHorizontal: 9,
              }}
              nativeFeedbackContainerStyle={{ borderRadius: 12 }}
              buttonTitleStyle={{
                fontFamily: "Calibre-Semibold",
                fontSize: 18,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingSingleChoice;
