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
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingSingleChoice;
