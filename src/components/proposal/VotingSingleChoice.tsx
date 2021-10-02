import React from "react";
import { View } from "react-native";
import Button from "../Button";

type VotingSingleChoiceProps = {
  proposal: any;
  selectedChoice: number;
  setSelectedChoice: (selectedChoice: number) => void;
};

function VotingSingleChoice({
  proposal,
  selectedChoice,
  setSelectedChoice,
}: VotingSingleChoiceProps) {
  return (
    <View>
      {proposal?.choices.map((choice: any, i: number) => {
        return (
          <View style={{ paddingBottom: 20 }}>
            <Button
              onPress={() => {
                setSelectedChoice(i + 1);
              }}
              title={choice}
              light={selectedChoice !== i + 1}
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingSingleChoice;
