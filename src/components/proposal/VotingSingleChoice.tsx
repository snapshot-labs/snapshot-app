import React from "react";
import { View } from "react-native";
import Button from "../Button";

type VotingSingleChoiceProps = {
  proposal: any;
  selectedChoices: number[];
  setSelectedChoices: (selectedChoices: number[]) => void;
};

function VotingSingleChoice({
  proposal,
  selectedChoices,
  setSelectedChoices,
}: VotingSingleChoiceProps) {
  return (
    <View>
      {proposal?.choices.map((choice: any, i: number) => {
        return (
          <View style={{ paddingBottom: 20 }}>
            <Button
              onPress={() => {
                setSelectedChoices([i + 1]);
              }}
              title={choice}
              light={selectedChoices[0] !== i + 1}
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingSingleChoice;
