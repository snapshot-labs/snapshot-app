import React from "react";
import { View } from "react-native";
import Button from "../Button";

type VotingApprovalProps = {
  proposal: any;
  selectedChoices: number[];
  setSelectedChoices: (selectedChoices: number[]) => void;
};

function selectChoice(
  i: number,
  oldSelectedChoices: number[],
  setSelectedChoices: (selectedChoices: number[]) => void
) {
  const selectedChoices = [...oldSelectedChoices];

  if (selectedChoices.includes(i))
    selectedChoices.splice(selectedChoices.indexOf(i), 1);
  else selectedChoices.push(i);
  setSelectedChoices(selectedChoices);
}

function VotingApproval({
  proposal,
  selectedChoices,
  setSelectedChoices,
}: VotingApprovalProps) {
  return (
    <View>
      {proposal.choices.map((choice: any, i: number) => {
        return (
          <View style={{ paddingBottom: 20 }} key={`${i}`}>
            <Button
              onPress={() => {
                selectChoice(i + 1, selectedChoices, setSelectedChoices);
              }}
              title={choice}
              light={!selectedChoices.includes(i + 1)}
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingApproval;
